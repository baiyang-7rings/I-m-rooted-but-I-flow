"use client";

import { useEffect, useRef, useCallback } from "react";

const sonnet5 = `Those hours, that with gentle work did frame
The lovely gaze where every eye doth dwell,
Will play the tyrants to the very same,
And that unfair which fairly doth excel;
For never-resting time leads summer on
To hideous winter and confounds him there;
Sap checked with frost and lusty leaves quite gone,
Beauty o'er-snowed and bareness everywhere.
Then, were not summer's distillation left
A liquid prisoner pent in walls of glass,
Beauty's effect with beauty were bereft,
Nor it nor no remembrance what it was.
But flowers distilled, though they with winter meet,
Leese but their show; their substance still lives sweet.`;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const imageLoadedRef = useRef(false);
  const treeImageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number>(0);

  const createParticle = useCallback((x: number, y: number): Particle => {
    const chars = sonnet5.replace(/\s/g, "").split("");
    const p = {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.5 + Math.random() * 1.0,
      char: chars[Math.floor(Math.random() * chars.length)],
      size: 8 + Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.4,
      life: 0,
      maxLife: 200 + Math.random() * 200,
    };
    return p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();

    // Load tree image to generate spawn points
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      treeImageRef.current = img;
      imageLoadedRef.current = true;

      const rect = parent.getBoundingClientRect();
      const scaleX = rect.width / img.width;
      const scaleY = rect.height / img.height;

      // Create offscreen canvas to read pixel data
      const offCanvas = document.createElement("canvas");
      offCanvas.width = img.width;
      offCanvas.height = img.height;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;
      offCtx.drawImage(img, 0, 0);

      try {
        const imageData = offCtx.getImageData(0, 0, img.width, img.height);
        const pixels = imageData.data;

        for (let y = 0; y < img.height; y += 8) {
          for (let x = 0; x < img.width; x += 8) {
            const index = (x + y * img.width) * 4;
            const alpha = pixels[index + 3];
            if (alpha > 50 && Math.random() < 0.06) {
              particlesRef.current.push(
                createParticle(x * scaleX, y * scaleY)
              );
            }
          }
        }
      } catch {
        // Fallback: spawn particles from random positions in upper half
        for (let i = 0; i < 80; i++) {
          particlesRef.current.push(
            createParticle(
              Math.random() * rect.width,
              Math.random() * rect.height * 0.5
            )
          );
        }
      }
    };
    img.src = "/images/tree.png";

    let frameCount = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      const wind = Math.sin(frameCount * 0.02) * 0.03;

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const part = particlesRef.current[i];

        part.vx += wind + (Math.random() - 0.5) * 0.04;
        part.x += part.vx;
        part.y += part.vy;

        part.life++;
        const fadeIn = Math.min(part.life / 60, 1);
        const fadeOut = Math.max(0, 1 - (part.life - part.maxLife * 0.6) / (part.maxLife * 0.4));
        part.opacity = part.opacity * fadeIn * fadeOut;

        if (part.life > part.maxLife || part.y > canvas.height) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = part.opacity;
        ctx.fillStyle = "#666666";
        ctx.font = `${part.size}px "Special Elite", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(part.char, part.x, part.y);
        ctx.restore();
      }

      // Spawn new particles
      if (particlesRef.current.length < 100 && imageLoadedRef.current) {
        const rect = parent.getBoundingClientRect();
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height * 0.4;
        particlesRef.current.push(createParticle(x, y));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
