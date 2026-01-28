'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import type p5 from 'p5';
import { useP5Canvas } from '@/hooks/use-p5-canvas';

export function TypeScriptAnimation() {
  const [transform, setTransform] = useState({ rotateY: 0, rotateX: 0, scale: 1 });
  const [shinePosition, setShinePosition] = useState(-100);

  const sketch = useCallback((p: p5) => {
    const width = 173;
    const height = 230;

    p.setup = () => {
      p.createCanvas(width, height);
      p.noStroke();
    };

    p.draw = () => {
      p.clear();

      const rotateY = p.sin(p.frameCount * 0.01) * 12;
      const rotateX = p.sin(p.frameCount * 0.008) * 5;
      const scale = 1 + p.sin(p.frameCount * 0.013) * 0.02;

      setTransform({ rotateY, rotateX, scale });

      // Shine sweep (loops every ~180 frames / 3 seconds)
      const shineProgress = (p.frameCount % 180) / 180;
      const shine = shineProgress * 400 - 100;
      setShinePosition(shine);

      const shadowOffset = rotateY * 0.4;
      p.push();
      p.translate(width / 2 + shadowOffset, height / 2 + 4);

      // Shadow gradient effect
      for (let i = 3; i >= 0; i--) {
        const alpha = p.map(i, 0, 3, 30, 5);
        const size = p.map(i, 0, 3, 1, 1.1);
        p.fill(0, 0, 0, alpha);
        p.ellipse(0, 0, 140 * size, 180 * size);
      }
      p.pop();
    };
  }, []);

  const { containerRef } = useP5Canvas(sketch);

  return (
    <div
      className="relative w-43.25 h-57.5"
      style={{ perspective: '500px' }}
    >
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none opacity-30 blur-sm" />

      {/* Main SVG with 3D rotation */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{
          transform: `rotateY(${transform.rotateY}deg) rotateX(${transform.rotateX}deg) scale(${transform.scale})`,
          transformStyle: 'preserve-3d',
        }}
      >
        <Image
          src="/image/Group 21.svg"
          alt="TypeScript"
          width={173}
          height={230}
          priority
        />

        {/* Metallic shine sweep overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              105deg,
              transparent 0%,
              transparent ${shinePosition - 30}%,
              rgba(255, 255, 255, 0.15) ${shinePosition - 15}%,
              rgba(255, 255, 255, 0.4) ${shinePosition}%,
              rgba(255, 255, 255, 0.15) ${shinePosition + 15}%,
              transparent ${shinePosition + 30}%,
              transparent 100%
            )`,
          }}
        />
      </div>
    </div>
  );
}
