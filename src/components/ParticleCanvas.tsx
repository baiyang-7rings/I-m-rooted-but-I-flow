"use client";

import { useEffect, useRef, useCallback } from "react";
import p5 from "p5";

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const imageLoadedRef = useRef(false);
  const treeImageRef = useRef<p5.Image | null>(null);

  const createParticle = useCallback((x: number, y: number, p: p5): Particle => {
    const chars = sonnet5.replace(/\s/g, "").split("");
    return {
      x,
      y,
      vx: (p.random(-0.3, 0.3)),
      vy: p.random(0.5, 1.5),
      char: chars[Math.floor(p.random(chars.length))],
      size: p.random(8, 14),
      opacity: p.random(0.3, 0.7),
      life: 0,
      maxLife: p.random(200, 400),
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let sketchInstance: p5 | null = null;
    let animationId: number;

    const setup = (p: p5) => {
      const container = canvasRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const canvas = p.createCanvas(rect.width, rect.height);
      canvas.position(0, 0);
      canvas.style("pointer-events", "none");
      canvas.style("position", "absolute");
      canvas.style("top", "0");
      canvas.style("left", "0");
      
      p.textFont("Special Elite");

      const img = p.loadImage("/images/tree.png", (loadedImg) => {
        treeImageRef.current = loadedImg;
        imageLoadedRef.current = true;
        
        const scaleX = rect.width / loadedImg.width;
        const scaleY = rect.height / loadedImg.height;
        
        loadedImg.loadPixels();
        for (let y = 0; y < loadedImg.height; y += 8) {
          for (let x = 0; x < loadedImg.width; x += 8) {
            const index = (x + y * loadedImg.width) * 4;
            const alpha = loadedImg.pixels[index + 3];
            if (alpha > 50 && p.random() < 0.08) {
              particlesRef.current.push(
                createParticle(x * scaleX, y * scaleY, p)
              );
            }
          }
        }
      });
    };

    const draw = (p: p5) => {
      const container = canvasRef.current;
      if (!container) return;

      p.clear();

      const wind = p.sin(p.frameCount * 0.02) * 0.03;

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const part = particlesRef.current[i];
        
        part.vx += wind + p.random(-0.02, 0.02);
        part.x += part.vx;
        part.y += part.vy;
        
        part.life++;
        part.opacity = p.map(part.life, 0, part.maxLife * 0.5, 0.7, 0.3) * 
                       p.map(part.life, part.maxLife * 0.5, part.maxLife, 1, 0);

        if (part.life > part.maxLife || part.y > p.height) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        p.fill(102, part.opacity * 255);
        p.textSize(part.size);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(part.char, part.x, part.y);
      }

      if (particlesRef.current.length < 150 && imageLoadedRef.current && treeImageRef.current) {
        const img = treeImageRef.current;
        const rect = container.getBoundingClientRect();
        const scaleX = rect.width / img.width;
        const scaleY = rect.height / img.height;
        const x = Math.floor(p.random(img.width)) * scaleX;
        const y = Math.floor(p.random(img.height * 0.5)) * scaleY;
        particlesRef.current.push(createParticle(x, y, p));
      }

      animationId = requestAnimationFrame(() => draw(p));
    };

    const sketch = (p: p5) => {
      sketchInstance = p;
      setup(p);
      p.draw = () => draw(p);
      
      p.windowResized = () => {
        const container = canvasRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        p.resizeCanvas(rect.width, rect.height);
      };
    };

    new p5(sketch, canvasRef.current);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (sketchInstance) {
        sketchInstance.remove();
      }
    };
  }, [createParticle]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
