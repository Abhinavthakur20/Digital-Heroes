import { SignupForm } from "@/components/signup-form";
import { getCharities } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const charities = await getCharities();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-16 sm:pt-32 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-ink">Create Subscriber Account</h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Join Digital Heroes to log your golf rounds, direct a percentage of your subscription to a vetted charity, and automatically participate in monthly prize pools.
        </p>
      </div>

      <SignupForm charities={charities} />
    </div>
  );
}
