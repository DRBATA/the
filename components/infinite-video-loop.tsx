"use client"

import { useEffect, useRef } from "react"

export default function InfiniteVideoLoop() {
  // References to our two video elements
  const videoA = useRef<HTMLVideoElement>(null)
  const videoB = useRef<HTMLVideoElement>(null)

  // Track which video is currently visible
  const videoContainerA = useRef<HTMLDivElement>(null)
  const videoContainerB = useRef<HTMLDivElement>(null)

  // Initialize the videos
  useEffect(() => {
    if (!videoA.current || !videoB.current || !videoContainerA.current || !videoContainerB.current) return

    // Set up video A (starts visible)
    videoA.current.src = "/videos/vid1.mp4"
    videoA.current.muted = true
    videoA.current.playbackRate = 0.2
    videoContainerA.current.style.opacity = "1"
    videoA.current.play()

    // Set up video B (starts hidden)
    videoB.current.src = "/videos/vid2.mp4"
    videoB.current.muted = true
    videoB.current.playbackRate = 0.2
    videoContainerB.current.style.opacity = "0"
    videoB.current.load() // Just load, don't play yet

    const handleVideoATimeUpdate = () => {
      if (!videoA.current || !videoB.current || !videoContainerA.current || !videoContainerB.current) return

      // When video A reaches 80% of its duration
      if (videoA.current.currentTime >= videoA.current.duration * 0.8) {
        // Remove this listener to prevent multiple triggers
        videoA.current.removeEventListener("timeupdate", handleVideoATimeUpdate)

        // Start playing video B
        videoB.current.play()

        // Fade from A to B
        videoContainerA.current.style.opacity = "0"
        videoContainerB.current.style.opacity = "1"

        // Set up listener for video B
        const handleVideoBTimeUpdate = () => {
          if (!videoA.current || !videoB.current || !videoContainerA.current || !videoContainerB.current) return

          // When video B reaches 80% of its duration
          if (videoB.current.currentTime >= videoB.current.duration * 0.8) {
            // Remove this listener
            videoB.current.removeEventListener("timeupdate", handleVideoBTimeUpdate)

            // Reset video A
            videoA.current.currentTime = 0
            videoA.current.play()

            // Fade from B to A
            videoContainerB.current.style.opacity = "0"
            videoContainerA.current.style.opacity = "1"

            // Re-add listener for video A
            videoA.current.addEventListener("timeupdate", handleVideoATimeUpdate)
          }
        }

        videoB.current.addEventListener("timeupdate", handleVideoBTimeUpdate)
      }
    }

    videoA.current.addEventListener("timeupdate", handleVideoATimeUpdate)

    // Cleanup
    return () => {
      if (videoA.current) {
        videoA.current.pause()
        videoA.current.removeEventListener("timeupdate", handleVideoATimeUpdate)
      }
      if (videoB.current) {
        videoB.current.pause()
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Video A */}
      <div ref={videoContainerA} className="absolute inset-0 w-full h-full transition-opacity duration-[4000ms]">
        <video ref={videoA} className="w-full h-full object-cover" playsInline />
      </div>

      {/* Video B */}
      <div ref={videoContainerB} className="absolute inset-0 w-full h-full transition-opacity duration-[4000ms]">
        <video ref={videoB} className="w-full h-full object-cover" playsInline />
      </div>
    </div>
  )
}
