"use client"

import type React from "react"
import { useSwipeable } from "react-swipeable"

interface GestureHandlerProps extends React.HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  swipeDistance?: number
  children?: React.ReactNode
}

export default function GestureHandler({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeDistance = 50,
  children,
  ...props
}: GestureHandlerProps) {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    onSwipedUp: onSwipeUp,
    onSwipedDown: onSwipeDown,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: swipeDistance,
  })

  return (
    <div {...handlers} {...props}>
      {children}
    </div>
  )
}
