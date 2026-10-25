/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

export const IndustrialBackground3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Circuit traces & electrical current pulses
    const circuitLines: Array<{
      startX: number;
      startY: number;
      midX: number;
      midY: number;
      endX: number;
      endY: number;
      progress: number;
      speed: number;
    }> = [];

    for (let i = 0; i < 20; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const midX = startX + (Math.random() - 0.5) * 350;
      const midY = startY + (Math.random() - 0.5) * 350;
      const endX = midX + (Math.random() - 0.5) * 250;
      const endY = midY + (Math.random() - 0.5) * 250;
      circuitLines.push({
        startX,
        startY,
        midX,
        midY,
        endX,
        endY,
        progress: Math.random(),
        speed: 0.0015 + Math.random() * 0.0035
      });
    }

    // Floating 3D-style wireframe industrial equipment silhouettes
    const shapes = Array.from({ length: 8 }).map((_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 50 + Math.random() * 70,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      type: i % 4 // 0: Circuit breaker, 1: Transformer hex, 2: Switch/PLC module, 3: Cable reel
    }));

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastTime = performance.now();

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible || !ctx || !canvas) return;

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Smooth mouse parallax interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      const parallaxX = (mouseX - width / 2) * 0.00025;
      const parallaxY = (mouseY - height / 2) * 0.00025;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Technical Engineering Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 70;
      const offsetX = (mouseX * 0.015) % gridSize;
      const offsetY = (mouseY * 0.015) % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Draw Circuit Board Traces & Energy Current Pulses
      circuitLines.forEach(line => {
        line.progress += line.speed;
        if (line.progress > 1) line.progress = 0;

        const pX = line.startX + (line.midX - line.startX) * line.progress + parallaxX * 15;
        const pY = line.startY + (line.midY - line.startY) * line.progress + parallaxY * 15;

        // Trace path
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.09)';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(line.startX + parallaxX * 8, line.startY + parallaxY * 8);
        ctx.lineTo(line.midX + parallaxX * 8, line.midY + parallaxY * 8);
        ctx.lineTo(line.endX + parallaxX * 8, line.endY + parallaxY * 8);
        ctx.stroke();

        // Glowing energy pulse at current head
        const gradient = ctx.createRadialGradient(pX, pY, 0, pX, pY, 10);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.85)');
        gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.3)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pX, pY, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pX, pY, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Floating 3D Wireframe Equipment Silhouettes
      shapes.forEach(shape => {
        shape.x += shape.vx + parallaxX * 0.4;
        shape.y += shape.vy + parallaxY * 0.4;
        shape.angle += shape.rotSpeed;

        if (shape.x < -120) shape.x = width + 120;
        if (shape.x > width + 120) shape.x = -120;
        if (shape.y < -120) shape.y = height + 120;
        if (shape.y > height + 120) shape.y = -120;

        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.angle);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
        ctx.fillStyle = 'rgba(11, 15, 25, 0.35)';
        ctx.lineWidth = 1.2;

        if (shape.type === 0) {
          // Circuit Breaker wireframe
          ctx.strokeRect(-shape.size / 2, -shape.size / 1.5, shape.size, shape.size * 1.3);
          ctx.fillRect(-shape.size / 2, -shape.size / 1.5, shape.size, shape.size * 1.3);
          ctx.strokeRect(-4, -shape.size / 4, 8, shape.size / 2);
        } else if (shape.type === 1) {
          // Transformer / Substation Node Hexagon
          ctx.beginPath();
          const r = shape.size / 2;
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const hx = Math.cos(a) * r;
            const hy = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
        } else if (shape.type === 2) {
          // PLC / Switch Enclosure
          ctx.strokeRect(-shape.size / 1.4, -shape.size / 3, shape.size * 1.25, shape.size / 1.5);
          ctx.fillRect(-shape.size / 1.4, -shape.size / 3, shape.size * 1.25, shape.size / 1.5);
          for (let i = -3; i <= 3; i += 2) {
            ctx.strokeRect(i * 9 - 2, -shape.size / 3 - 6, 4, 6);
          }
        } else {
          // Cable Reel
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-85" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/50 via-transparent to-[#07090e]/75 pointer-events-none" />
    </div>
  );
};
