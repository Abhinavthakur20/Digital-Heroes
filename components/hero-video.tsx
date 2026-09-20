"use client";

export function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* YouTube iframe — autoplays muted, loops, no controls */}
      <iframe
        src="https://www.youtube.com/embed/hol6hS-Es5g?autoplay=1&mute=1&loop=1&playlist=hol6hS-Es5g&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&start=2"
        title="Hero background video"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] sm:w-[200%] sm:h-[200%] lg:w-[180%] lg:h-[180%] border-0 opacity-90"
        style={{ minWidth: "100%", minHeight: "100%" }}
      />
    </div>
  );
}
