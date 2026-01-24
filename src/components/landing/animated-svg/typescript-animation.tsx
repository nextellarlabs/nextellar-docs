'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function TypeScriptAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateY: 0, rotateX: 0, scale: 1 });
  const [shinePosition, setShinePosition] = useState(-100);

  useEffect(() => {
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;

      // More noticeable 3D rotation
      const rotateY = Math.sin(time * 0.6) * 12;
      const rotateX = Math.sin(time * 0.4) * 5;
      const scale = 1 + Math.sin(time * 0.8) * 0.02;

      setTransform({ rotateY, rotateX, scale });

      // Shine sweep (loops every 3 seconds)
      const shineTime = (time % 3) / 3;
      const shine = shineTime * 400 - 100;
      setShinePosition(shine);

      animationId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate();
        } else {
          cancelAnimationFrame(animationId);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[173px] h-[230px]"
      style={{ perspective: '500px' }}
    >
      {/* Shadow layer */}
      <div
        className="absolute inset-0 opacity-30 blur-sm"
        style={{
          transform: `translateX(${transform.rotateY * 0.4}px) translateY(4px)`,
        }}
      >
        <Image
          src="/image/Group 21.svg"
          alt=""
          width={173}
          height={230}
          aria-hidden="true"
        />
      </div>

      {/* Main SVG with 3D rotation */}
      <div
        className="relative overflow-hidden"
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
