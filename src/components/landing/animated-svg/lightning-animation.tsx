'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function LightningAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowIntensity, setGlowIntensity] = useState(0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 192;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }

    const particles: Particle[] = [];

    const pathPoints = [
      { x: 96, y: 20 },
      { x: 80, y: 60 },
      { x: 100, y: 80 },
      { x: 70, y: 120 },
      { x: 90, y: 140 },
      { x: 60, y: 180 },
    ];

    const createParticle = (): Particle => {
      const pointIndex = Math.floor(Math.random() * pathPoints.length);
      const point = pathPoints[pointIndex];
      return {
        x: point.x + (Math.random() - 0.5) * 20,
        y: point.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        life: 0,
        maxLife: 40 + Math.random() * 40,
        size: 1 + Math.random() * 2,
      };
    };

    for (let i = 0; i < 8; i++) {
      particles.push(createParticle());
    }

    let animationId: number;
    let time = 0;
    let lastFlicker = 0;
    let flickerIntensity = 1;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const baseGlow = 0.4 + Math.sin(time * 2.5) * 0.2;

      if (time - lastFlicker > 1.5 + Math.random() * 2) {
        flickerIntensity = 1.3 + Math.random() * 0.4;
        lastFlicker = time;
      }
      flickerIntensity = flickerIntensity * 0.92 + 1 * 0.08;

      const finalGlow = baseGlow * flickerIntensity;
      setGlowIntensity(finalGlow);

      particles.forEach((p, index) => {
        // Reset particle FIRST if dead
        if (p.life >= p.maxLife) {
          particles[index] = createParticle();
          return;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifeRatio = Math.max(0, 1 - p.life / p.maxLife);
        const alpha = lifeRatio * 0.7;
        const size = Math.max(0.1, p.size * lifeRatio);
        const radius = Math.max(0.1, size * 3);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        gradient.addColorStop(0, `rgba(147, 197, 253, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(96, 165, 250, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(219, 234, 254, ${alpha})`;
        ctx.fill();
      });

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
    <div ref={containerRef} className="relative w-[192px] h-[200px]">
      <div
        className="absolute inset-0 blur-xl transition-opacity duration-100"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(96, 165, 250, ${glowIntensity * 0.3}) 0%, transparent 70%)`,
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        width={192}
        height={200}
      />

      <Image
        src="/image/Vector.svg"
        alt="Lightning bolt"
        width={192}
        height={200}
        className="relative z-20"
        style={{
          filter: `drop-shadow(0 0 ${8 * glowIntensity}px rgba(96, 165, 250, ${glowIntensity * 0.6}))`,
        }}
        priority
      />
    </div>
  );
}
