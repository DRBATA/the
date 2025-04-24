"use client";
import { useEffect, useRef, useState } from "react";

const VIDEO_SOURCES = [
  "/video/turtle1.mp4",
  "/video/turtle2.mp4"
];
const CROSSFADE_DURATION = 4000; // ms

export default function BackgroundVideoLooper() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [crossfade, setCrossfade] = useState(false);
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];

  // Crossfade logic
  useEffect(() => {
    const video = videoRefs[current].current;
    if (!video) return;
    const onTimeUpdate = () => {
      if (video.duration - video.currentTime < CROSSFADE_DURATION / 1000 && !crossfade) {
        setCrossfade(true);
        videoRefs[next].current?.play();
        // Fade in next, fade out current
        let fade = 0;
        const fadeStep = 50;
        const fadeInterval = setInterval(() => {
          fade += fadeStep;
          const opacity = Math.min(fade / CROSSFADE_DURATION, 1);
          if (videoRefs[next].current) videoRefs[next].current.style.opacity = String(opacity);
          if (videoRefs[current].current) videoRefs[current].current.style.opacity = String(1 - opacity);
          // Audio fade (if unmuted)
          if (!isMuted) {
            if (videoRefs[next].current) videoRefs[next].current.volume = opacity;
            if (videoRefs[current].current) videoRefs[current].current.volume = 1 - opacity;
          }
          if (fade >= CROSSFADE_DURATION) {
            clearInterval(fadeInterval);
            setCurrent(next);
            setNext((next + 1) % VIDEO_SOURCES.length);
            setCrossfade(false);
            // Reset opacities and volumes
            if (videoRefs[current].current) {
              videoRefs[current].current.pause();
              videoRefs[current].current.currentTime = 0;
              videoRefs[current].current.style.opacity = "0";
              videoRefs[current].current.volume = 1;
            }
            if (videoRefs[next].current) {
              videoRefs[next].current.style.opacity = "1";
              videoRefs[next].current.volume = 1;
            }
          }
        }, fadeStep);
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [current, next, crossfade, isMuted]);

  // Set initial opacity/volume
  useEffect(() => {
    videoRefs.forEach((ref, idx) => {
      if (ref.current) {
        ref.current.style.opacity = idx === current ? "1" : "0";
        ref.current.volume = 1;
      }
    });
  }, [current]);

  // Mute/unmute logic
  useEffect(() => {
    videoRefs.forEach((ref) => {
      if (ref.current) ref.current.muted = isMuted;
    });
  }, [isMuted]);

  return (
    <div className="fixed inset-0 z-0 w-full h-full pointer-events-none select-none">
      {VIDEO_SOURCES.map((src, idx) => (
        <video
          key={src}
          ref={videoRefs[idx]}
          src={src}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          autoPlay
          muted={isMuted}
          loop={false}
          playsInline
          style={{ opacity: idx === current ? 1 : 0, transition: "opacity 1s" }}
        />
      ))}
      <button
        className="absolute bottom-6 right-6 z-10 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur hover:bg-black/80 pointer-events-auto"
        onClick={() => setIsMuted((m) => !m)}
        aria-label={isMuted ? "Unmute background video" : "Mute background video"}
      >
        {isMuted ? "Unmute" : "Mute"} Background
      </button>
    </div>
  );
}
