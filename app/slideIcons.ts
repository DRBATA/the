// Icon and info mapping for each slide/moment
// This file exports an object mapping slide keys to icon definitions and info content
import { FaHeart, FaWineGlassAlt, FaCoffee, FaSmile, FaGlasses, FaBolt, FaTint, FaStar, FaLeaf, FaClock, FaTag, FaUsers } from 'react-icons/fa';

export const slideIcons = {
  majlis: [
    {
      key: 'heart',
      icon: FaHeart,
      label: 'The Art of Unwinding',
      content: "The Majlis experience celebrates the importance of taking time to unwind and reset. In our fast-paced world, these moments of pause become sacred—a chance to reconnect with yourself and those around you in an atmosphere of relaxed luxury.",
      footer: "Transform ordinary evenings into extraordinary memories"
    },
    {
      key: 'wine',
      icon: FaWineGlassAlt,
      label: 'Premium Refreshments',
      content: "Featuring Majaus, a premium non-alcoholic pale ale with a radiant, soft gold hue reminiscent of Arabian desert sands. Citra hops bring vibrant citrus notes of lime, mango, and lemon, while the finish offers a subtle, spiced delicate bitterness.",
      footer: "Crafted with mineral-infused magnetic water and premium ingredients"
    },
    {
      key: 'coffee',
      icon: FaCoffee,
      label: 'Curated Comfort',
      content: "Our therapists create a seamless experience, allowing you to fully immerse in the moment. From shoulder massages to refreshing beverages, every element is designed to enhance your evening ritual and create a sense of presence and appreciation.",
      footer: "Personalized service that elevates everyday moments"
    }
  ],
  perrier: [
    {
      key: 'smile',
      icon: FaSmile,
      label: 'The Science of Socializing',
      content: 'Human connection is a wellness super‑tool. Guided conversation and shared stories spark oxytocin and endorphins—nature’s mood‑boosters.',
      footer: 'Boost your mood naturally through authentic connection'
    },
    {
      key: 'glasses',
      icon: FaGlasses,
      label: 'Maison Perrier Chic',
      content: 'Choose Citrus Fizz, Roséllini or Lemonjito—elegant, alcohol‑free cocktails crafted with fruit juices, natural flavors and Perrier’s signature bubbles.',
      footer: 'A blend of fruit juices, natural flavors, and Perrier bubbles'
    },
    {
      key: 'zap',
      icon: FaBolt,
      label: 'Celebration Rituals',
      content: 'Mixology moments, ice‑bath thrills and storytelling prompts turn any gathering into a memory‑making ritual against Dubai’s skyline.',
      footer: 'Create meaningful traditions that energize rather than deplete'
    }
  ],
  chill: [
    {
      key: 'droplet',
      icon: FaTint,
      label: 'Cold Presence',
      content: "Cold therapy isn't just about physical benefits—it's a practice of being fully present with sensation. Our no-ice system creates a sacred container for you to meet yourself in the intensity, guided by practitioners who hold space for your authentic experience.",
      footer: "A journey inward, not just a physical practice"
    },
    {
      key: 'sparkles',
      icon: FaStar,
      label: 'Embodied Touch',
      content: "Our touch therapies aren't about fixing or escaping—they're invitations to remember your body as home. Each session is a dialogue between practitioner and recipient, honoring the wisdom that already lives within you.",
      footer: "Presence-centered, not just technique-driven"
    },
    {
      key: 'leaf',
      icon: FaLeaf,
      label: 'Breath as Anchor',
      content: "Breathwork is the thread that weaves through every experience—not as a performance, but as a return to the most fundamental rhythm of being alive. We guide you back to this innate wisdom that's always been yours.",
      footer: "Your breath as teacher, not just a technique"
    }
  ],
  oasis: [
    {
      key: 'clock',
      icon: FaClock,
      label: 'Easy Booking',
      content: "Our streamlined booking process makes scheduling your in-home wellness session simple. Choose your preferred date, time, and services, and we'll handle the rest. Our team will confirm your booking and provide all the details you need.",
      footer: "Book online or via WhatsApp"
    },
    {
      key: 'tag',
      icon: FaTag,
      label: 'Tea Rituals',
      content: "Experience the ancient tradition of sharing tea with friends in the comfort of your home. Our curated tea ceremonies create a space for connection and mindfulness, allowing you to slow down and savor the moment together with those who matter most.",
      footer: "A timeless ritual reimagined for modern wellness"
    },
    {
      key: 'users',
      icon: FaUsers,
      label: 'Premium Experience',
      content: "Our experienced team handles everything from setup to cleanup, ensuring a seamless and luxurious experience in your home. All equipment is thoroughly sanitized, and our therapists are fully licensed and vetted for your safety and comfort.",
      footer: "Focus on relaxation while we handle the details"
    }
  ]
};
