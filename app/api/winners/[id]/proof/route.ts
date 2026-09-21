import { NextResponse } from "next/server";
import { getWinners, uploadWinnerProofDetails } from "@/lib/store";
import { errorResponse, HttpError, requireUser } from "@/lib/access";

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

function parseDataUrl(value: string) {
  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const bytes = Buffer.byteLength(match[2], "base64");
  return { mimeType, bytes };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const proofUrl = String(body.proofUrl || body.proofDataUrl || "").trim();
    const proofFileName = String(body.proofFileName || "score-proof").trim().slice(0, 120);
    let proofMimeType = String(body.proofMimeType || "").trim();
    let proofSize = Number(body.proofSize || 0);

    if (!proofUrl) {
      throw new HttpError(400, "Proof URL or image data is required.");
    }

    const winnerRecord = (await getWinners()).find((winner) => winner.id === id);
    if (!winnerRecord) {
      throw new HttpError(404, "Winner record not found.");
    }
    if (winnerRecord.userId !== user.id && user.role !== "admin") {
      throw new HttpError(403, "You cannot upload proof for another winner.");
    }

    const parsedDataUrl = parseDataUrl(proofUrl);
    if (parsedDataUrl) {
      proofMimeType = parsedDataUrl.mimeType;
      proofSize = parsedDataUrl.bytes;
    } else {
      try {
        const parsedUrl = new URL(proofUrl);
        if (parsedUrl.protocol !== "https:" && !proofUrl.startsWith("/proofs/")) {
          throw new Error("Invalid protocol");
        }
      } catch {
        throw new HttpError(400, "Proof must be a valid HTTPS URL, local proof path, or data URL.");
      }
    }

    if (proofMimeType && !ALLOWED_MIME_TYPES.has(proofMimeType)) {
      throw new HttpError(400, "Proof file type must be PNG, JPEG, WEBP, or PDF.");
    }
    if (proofSize && proofSize > MAX_PROOF_BYTES) {
      throw new HttpError(400, "Proof file must be 5MB or smaller.");
    }

    const winner = await uploadWinnerProofDetails(id, {
      proofUrl,
      proofFileName,
      proofMimeType: proofMimeType || undefined,
      proofSize: proofSize || undefined
    });
    if (!winner) {
      throw new HttpError(404, "Winner record not found.");
    }

    return NextResponse.json({
      success: true,
      message: "Proof screenshot submitted successfully! Admin review is pending.",
      winner
    });
  } catch (error) {
    return errorResponse(error, "Failed to upload proof.", 400);
  }
}
