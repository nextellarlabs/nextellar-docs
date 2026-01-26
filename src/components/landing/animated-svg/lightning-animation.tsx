'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import type p5 from 'p5';
import { useP5Canvas } from '@/hooks/use-p5-canvas';

export function LightningAnimation() {
  const sketch = useCallback((p: p5) => {
    const width = 192;
    const height = 200;

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
      const pointIndex = Math.floor(p.random(pathPoints.length));
      const point = pathPoints[pointIndex];
      return {
        x: point.x + p.random(-10, 10),
        y: point.y + p.random(-10, 10),
        vx: p.random(-1.5, 1.5),
        vy: p.random(-1.5, 1.5),
        life: 0,
        maxLife: p.random(40, 80),
        size: p.random(1, 3),
      };
    };

    p.setup = () => {
      p.createCanvas(width, height);
      p.noStroke();
      for (let i = 0; i < 8; i++) {
        particles.push(createParticle());
      }
    };

    p.draw = () => {
      p.clear();

      // Glow pulse effect
      const glowIntensity = 0.4 + p.sin(p.frameCount * 0.04) * 0.2;

      // Draw background glow
      const gradient = p.drawingContext as CanvasRenderingContext2D;
      const radialGradient = gradient.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, 80
      );
      radialGradient.addColorStop(0, `rgba(96, 165, 250, ${glowIntensity * 0.3})`);
      radialGradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
      gradient.fillStyle = radialGradient;
      gradient.fillRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        if (particle.life >= particle.maxLife) {
          particles[index] = createParticle();
          return;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        const lifeRatio = Math.max(0, 1 - particle.life / particle.maxLife);
        const alpha = lifeRatio * 180;
        const size = Math.max(0.5, particle.size * lifeRatio);

        // Particle glow
        p.fill(147, 197, 253, alpha * 0.5);
        p.ellipse(particle.x, particle.y, size * 4, size * 4);

        // Particle core
        p.fill(219, 234, 254, alpha);
        p.ellipse(particle.x, particle.y, size, size);
      });
    };
  }, []);

  const { containerRef } = useP5Canvas(sketch);

  return (
    <div className="relative w-48 h-50">
      <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none" />

      <Image
        src="/image/Vector.svg"
        alt="Lightning bolt"
        width={192}
        height={200}
        className="relative z-20"
        priority
      />
    </div>
  );
}
