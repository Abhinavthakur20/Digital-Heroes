"use client";

import { useEffect, useRef } from "react";

interface HeroVideoProps {
  cloudName?: string;
  videoId?: string;
}

export function HeroVideo({
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "lgkythcq",
  videoId = process.env.NEXT_PUBLIC_CLOUDINARY_HERO_VIDEO_ID || "videoplayback_online-video-cutter.com"
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only strip actual video file extensions (.mp4, .webm, etc.), preserving names with dots like .com
  const cleanId = (videoId || "videoplayback_online-video-cutter.com").replace(
    /\.(mp4|webm|mov|mkv|avi|m4v)$/i,
    ""
  );
  const activeCloud = cloudName || "lgkythcq";

  // Cloudinary URLs
  const videoUrl = `https://res.cloudinary.com/${activeCloud}/video/upload/q_auto,f_auto,ac_none/${cleanId}.mp4`;
  const posterUrl = `https://res.cloudinary.com/${activeCloud}/video/upload/q_auto,f_auto,so_0/${cleanId}.jpg`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce muted on the actual DOM node so Chrome/Edge autoplay policy allows playback
    video.muted = true;
    video.defaultMuted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay deferred or prevented:", err);
      });
    }
  }, [videoUrl]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-obsidian-950">
      {/* 1. Fast loading poster image fallback */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
      />

      {/* 2. Direct HTML5 video with src & poster */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}


