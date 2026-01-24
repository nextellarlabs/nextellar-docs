'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function BlocksAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ y: 0, rotate: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;

      // Gentle floating motion
      const floatY = Math.sin(time * 1.2) * 6;

      // Subtle breathing scale
      const breatheScale = 1 + Math.sin(time * 1.8) * 0.02;

      // Rotation on hover
      const targetRotate = isHovered ? 5 : 0;

      setTransform((prev) => ({
        y: floatY,
        rotate: prev.rotate + (targetRotate - prev.rotate) * 0.08,
        scale: breatheScale,
      }));

      animationId = requestAnimationFrame(animate);
    };

    // Intersection observer
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
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className="relative w-[202px] h-[220px] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shadow that moves with float */}
      <div
        className="absolute bottom-0 left-1/2 w-[120px] h-[20px] bg-black/10 dark:bg-white/10 rounded-full blur-md transition-all duration-300"
        style={{
          transform: `translateX(-50%) scaleX(${0.8 + transform.y * 0.01})`,
          opacity: 0.3 - transform.y * 0.01,
        }}
      />

      {/* Animated SVG */}
      <div
        className="transition-shadow duration-300"
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
