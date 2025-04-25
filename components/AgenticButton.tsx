import Image from 'next/image';

export default function AgenticButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-transparent border-none outline-none"
      style={{ boxShadow: '0 4px 24px 0 #009fff55', borderRadius: '50%' }}
      aria-label="Activate Agentic Mode"
    >
      <Image
        src="/logoright.png"
        alt="Agentic Work Mode"
        width={64}
        height={64}
        style={{ borderRadius: '50%', background: 'rgba(0,191,255,0.08)' }}
        priority
      />
    </button>
  );
}
