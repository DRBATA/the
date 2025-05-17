import React, { useEffect, useState } from 'react';
import NeonTriangle from './NeonTriangle';

// This component makes the triangle responsive to its parent/container width
export default function ResponsiveNeonTriangle() {
  const [size, setSize] = useState(80);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      if (ref.current) {
        const width = ref.current.offsetWidth;
        setSize(Math.max(60, Math.min(width, 180)));
      } else {
        // fallback for SSR or initial render
        setSize(Math.max(60, Math.min(window.innerWidth * 0.4, 180)));
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      <NeonTriangle size={size} />
    </div>
  );
}
