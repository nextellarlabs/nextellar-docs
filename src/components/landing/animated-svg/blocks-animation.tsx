'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import type p5 from 'p5';
import { useP5Canvas } from '@/hooks/use-p5-canvas';

export function BlocksAnimation() {
  const [transform, setTransform] = useState({ y: 0, rotate: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);

  const sketch = useCallback((p: p5) => {
    const width = 202;
    const height = 220;
    let hovered = false;

    p.setup = () => {
      p.createCanvas(width, height);
      p.noStroke();
    };

    p.draw = () => {
      p.clear();

      // Gentle floating motion
      const floatY = p.sin(p.frameCount * 0.02) * 6;

      // Subtle breathing scale
      const breatheScale = 1 + p.sin(p.frameCount * 0.03) * 0.02;

      // Rotation on hover
      const targetRotate = hovered ? 5 : 0;

      setTransform(prev => ({
        y: floatY,
        rotate: p.lerp(prev.rotate, targetRotate, 0.08),
        scale: breatheScale,
      }));

      const shadowAlpha = p.map(floatY, -6, 6, 40, 20);
      const shadowScale = p.map(floatY, -6, 6, 0.9, 0.7);

      p.push();
      p.translate(width / 2, height - 10);
      p.scale(shadowScale, 0.3);
      p.fill(0, 0, 0, shadowAlpha);
      p.ellipse(0, 0, 120, 40);
      p.pop();
    };

    (p as any).setHovered = (h: boolean) => {
      hovered = h;
    };
  }, []);

  const { containerRef, p5Instance } = useP5Canvas(sketch);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (p5Instance.current) {
      (p5Instance.current as any).setHovered?.(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (p5Instance.current) {
      (p5Instance.current as any).setHovered?.(false);
    }
  };

  return (
    <div
      className="relative w-50.5 h-55 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Animated SVG */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-shadow duration-300"
        style={{
          transform: `translateY(${transform.y}px) rotate(${transform.rotate}deg) scale(${transform.scale})`,
          filter: isHovered ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' : 'none',
        }}
      >
        <Image
          src="/image/Group 20.svg"
          alt="Modular blocks"
          width={202}
          height={220}
          priority
        />
      </div>
    </div>
  );
}
