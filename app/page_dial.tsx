import InfiniteVideoLoop from "@/components/infinite-video-loop"
import WaterBar from "@/components/water-bar"

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Video Background */}
      <InfiniteVideoLoop />

      {/* Water Bar with Frosted UI */}
      <WaterBar />
    </main>
  )
}
