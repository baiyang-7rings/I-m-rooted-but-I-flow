"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    p5: any;
  }
}

export default function SketchbookPage() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const initP5 = () => {
      if (initializedRef.current) return;
      if (typeof window === "undefined" || !window.p5) return;
      initializedRef.current = true;

      const p5 = window.p5;

      const poem = "Those hours that with gentle work did frame The lovely gaze where every eye doth dwell, Will play the tyrants to the very same And that unfair which fairly doth excel: For never-resting time leads summer on To hideous winter and confounds him there; Sap check'd with frost and lusty leaves quite gone, Beauty o'ersnow'd and bareness every where: Then, were not summer's distillation left, A liquid prisoner pent in walls of glass, Beauty's effect with beauty were bereft, Nor it, nor no remembrance what it was: But flowers distill'd, though they with winter meet, Leese but their show; their substance still lives sweet.";
      
      const config = {
        fontSize: 15,
        maxFallSpeed: 1.5,
        drag: 0.97,
        spawnIntensity: 12,
        ambientSpawn: 1,
        initialSpawn: 40,
        swayAmplitude: 0.03,
        letterSpacing: 20,
        groundY: 0.95,
        driftRange: 0.5,
        rotateSpeed: 0.7,
        margin: 0.2,
      };

      let poemIndex = 0;
      let isFinished = false;
      let groundMap: number[] = [];
      let currentSway = 0;
      let mobileShakeTimer = 0;
      let hasHiddenStaticTree = false;
      let branchPoints: { x: number; y: number }[] = [];
      let initialSpawned = false;
      let particles: any[] = [];
      let p5Instance: any = null;

      class Letter {
        p: any;
        pos: any;
        vel: any;
        acc: any;
        char: string;
        isStatic: boolean;
        angle: number;
        noiseSeed: number;
        finalAngle: number;

        constructor(p: any, x: number, y: number, char: string) {
          this.p = p;
          this.pos = p.createVector(x, y);
          this.vel = p.createVector(p.random(-0.5, 0.5), p.random(0.1, 0.5));
          this.acc = p.createVector(0, 0.04);
          this.char = char;
          this.isStatic = false;
          this.angle = p.random(p.TWO_PI);
          this.noiseSeed = p.random(1000);
          this.finalAngle = p.random(-0.4, 0.4);
        }

        update() {
          if (this.isStatic) return;
          const p = this.p;
          const breeze = p.map(
            p.noise(this.noiseSeed, p.frameCount * 0.015),
            0, 1,
            -config.driftRange, config.driftRange
          );
          this.vel.x += breeze * 0.15;
          this.vel.add(this.acc);
          this.vel.mult(config.drag);
          if (this.vel.y > config.maxFallSpeed) this.vel.y = config.maxFallSpeed;
          this.pos.add(this.vel);
          this.angle += this.vel.mag() * 0.08 * config.rotateSpeed;

          const xIdx = p.floor(p.constrain(this.pos.x, 0, p.width - 1));
          if (this.pos.y >= groundMap[xIdx]) {
            this.pos.y = groundMap[xIdx];
            this.isStatic = true;
            const r = config.letterSpacing / 2;
            for (let i = -r; i <= r; i++) {
              const checkX = p.floor(p.constrain(xIdx + i, 0, p.width - 1));
              const lift = p.map(Math.abs(i), 0, r, config.fontSize * 0.65, 0);
              groundMap[checkX] -= lift;
            }
          }
        }

        display() {
          const p = this.p;
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.rotate(this.isStatic ? this.finalAngle : this.angle);
          p.fill(70, this.isStatic ? 200 : 160);
          p.noStroke();
          p.text(this.char, 0, 0);
          p.pop();
        }
      }

      const sketch = (p: any) => {
        let treeImg: any = null;
        let imgReady = false;

        // Load image via HTMLImageElement then convert
        const loadTreeImage = () => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            treeImg = p.createImage(img.width, img.height);
            treeImg.drawingContext.drawImage(img, 0, 0);
            treeImg.loadPixels();
            imgReady = true;
            onImageReady(p, treeImg);
          };
          img.src = "/images/tree.png";
        };

        const onImageReady = (p: any, img: any) => {
          p.pixelDensity(1);
          const canvas = p.createCanvas(img.width, img.height);
          canvas.parent("p5-overlay");

          const baseLine = p.height * config.groundY;
          for (let i = 0; i < p.width; i++) groundMap[i] = baseLine;

          for (let x = 0; x < img.width; x += 6) {
            for (let y = 0; y < img.height; y += 6) {
              const idx = (x + y * img.width) * 4;
              if (img.pixels[idx + 3] > 50) {
                branchPoints.push({ x, y });
              }
            }
          }

          p.textFont("Georgia");
          p.textSize(config.fontSize);
          p.textAlign(p.CENTER, p.CENTER);
        };

        p.setup = () => {
          loadTreeImage();
        };

        p.draw = () => {
          if (!imgReady || !treeImg) return;
          p.clear();

          const canvasElem = document.querySelector("#p5-overlay canvas") as HTMLCanvasElement | null;
          let effectiveMouseX = p.mouseX;
          let effectiveMouseY = p.mouseY;

          if (canvasElem && canvasElem.offsetWidth > 0) {
            effectiveMouseX = p.mouseX * (p.width / canvasElem.offsetWidth);
            effectiveMouseY = p.mouseY * (p.height / canvasElem.offsetHeight);
          }

          const m = p.width * config.margin;
          const isMouseHovering =
            effectiveMouseX > m && effectiveMouseX < p.width - m &&
            effectiveMouseY > m && effectiveMouseY < p.height - m;

          if (mobileShakeTimer > 0) mobileShakeTimer--;
          const isHovering = isMouseHovering || mobileShakeTimer > 0;

          if (!hasHiddenStaticTree && p.frameCount > 5) {
            const staticTree = document.querySelector(".tree") as HTMLImageElement | null;
            if (staticTree) staticTree.style.opacity = "0";
            hasHiddenStaticTree = true;
          }

          // Gentle ambient sway always, stronger on hover
          const ambientSway = p.sin(p.frameCount * 0.015) * 0.005;
          const hoverSway = isHovering && !isFinished ? p.sin(p.frameCount * 0.08) * config.swayAmplitude : 0;
          const targetSway = ambientSway + hoverSway;
          currentSway = p.lerp(currentSway, targetSway, 0.05);

          p.push();
          p.translate(p.width / 2, p.height);
          p.shearX(currentSway);
          p.image(treeImg, -p.width / 2, -p.height, p.width, p.height);
          p.pop();

          // Initial batch of falling leaves
          if (!initialSpawned && p.frameCount > 10 && branchPoints.length > 0) {
            for (let i = 0; i < config.initialSpawn; i++) {
              const pt = branchPoints[Math.floor(p.random(branchPoints.length))];
              const ch = poem[poemIndex % poem.length];
              if (ch !== " ") {
                const startY = pt.y + p.random(-20, 20);
                const startX = pt.x + p.random(-10, 10);
                particles.push(new Letter(p, startX, startY, ch));
              }
              poemIndex++;
            }
            initialSpawned = true;
          }

          // Continuous spawn: ambient always, more on hover
          const spawnCount = isHovering ? config.spawnIntensity : config.ambientSpawn;
          for (let i = 0; i < spawnCount; i++) {
            if (branchPoints.length === 0) break;
            const pt = branchPoints[Math.floor(p.random(branchPoints.length))];
            const ch = poem[poemIndex % poem.length];
            if (ch !== " ") {
              particles.push(new Letter(p, pt.x, pt.y, ch));
            }
            if (isHovering) {
              poemIndex++;
              if (poemIndex >= poem.length) {
                isFinished = true;
                break;
              }
            } else {
              poemIndex = (poemIndex + 1) % poem.length;
            }
          }

          for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].display();
          }

          if (particles.length > 800) {
            particles = particles.slice(-600);
          }

          // Update labels
          if (canvasElem) {
            const cssHeight = canvasElem.offsetHeight;
            const labels = [
              { sel: ".label.experience", h: 0.71, noiseOff: 100 },
              { sel: ".label.portfolio", h: 0.46, noiseOff: 200 },
              { sel: ".label.introduction", h: 0.25, noiseOff: 300 },
            ];

            for (const l of labels) {
              const elem = document.querySelector(l.sel) as HTMLElement | null;
              if (elem) {
                const swayX = -cssHeight * l.h * Math.tan(currentSway);
                const windNoise = p.noise(p.frameCount * 0.01 + l.noiseOff);
                const wind = (windNoise - 0.5) * 0.2;
                const baseSway = currentSway * 0.9;
                const rot = baseSway + wind;
                const softSkew = rot * 15;

                elem.style.transformOrigin = "top center";
                elem.style.transform = `translateX(${swayX}px) rotate(${rot}rad) skewX(${softSkew}deg)`;
              }
            }
          }
        };

        p.mousePressed = () => {
          const canvasElem = document.querySelector("#p5-overlay canvas") as HTMLCanvasElement | null;
          if (canvasElem && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            mobileShakeTimer = 180;
            if (isFinished) {
              isFinished = false;
              poemIndex = 0;
            }
          }
        };

        p.touchStarted = () => {
          p.mousePressed();
        };
      };

      p5Instance = new p5(sketch);

      return () => {
        if (p5Instance) {
          p5Instance.remove();
        }
      };
    };

    // Check if p5 is already loaded (from npm bundle), otherwise load from CDN
    if (window.p5) {
      initP5();
    } else {
      // Load p5 from CDN as fallback
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.js";
      script.onload = initP5;
      document.head.appendChild(script);
    }

    // Character animation
    const charTimer = setTimeout(() => {
      const targets = [
        { sel: ".intro-top h1", baseDelay: 0.1 },
        { sel: ".intro-top h2", baseDelay: 0.2 },
        { sel: ".intro-cta p", baseDelay: 2 },
      ];

      targets.forEach((target) => {
        const el = document.querySelector(target.sel) as HTMLElement | null;
        if (!el) return;
        const text = el.textContent || "";
        let html = "";

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const randomDelay = Math.random() * 0.8;
          const indexDelay = i * 0.02;
          const totalDelay = target.baseDelay + randomDelay + indexDelay;

          if (target.sel === ".intro-cta p") {
            const vanishDelay = totalDelay + 1 + 3 + Math.random() * 0.5;
            html += `<span class="char" style="animation-name: floatUpChar, driftAway; animation-duration: 1s, 2s; animation-delay: ${totalDelay}s, ${vanishDelay}s; animation-fill-mode: forwards, forwards;">${char}</span>`;
          } else {
            html += `<span class="char" style="animation-delay: ${totalDelay}s">${char}</span>`;
          }
        }
        el.innerHTML = html;
      });
    }, 100);

    return () => {
      clearTimeout(charTimer);
    };
  }, []);

  return (
    <>
      <header>
        <nav className="nav code">
          <a className="nav-left" href="#works">Works</a>
          <a className="nav-center" href="#experience">Experience</a>
          <a className="nav-right" href="#about">About</a>
        </nav>
      </header>

      <main className="container">
        <section className="intro">
          <div className="intro-top">
            <h1 className="en-special">Hi,</h1>
            <h2 className="en-special">This Is Jackie's Sketchbook.</h2>
          </div>
          <div className="intro-cta">
            <p className="en-special">Let's Flip Through It.</p>
          </div>
        </section>

        <section className="visual">
          <div className="tree-wrap" aria-label="hand-drawn tree illustration">
            <div id="p5-overlay" />
            <img className="tree" src="/images/tree.png" alt="Tree illustration" />
            <a href="#experience" className="label experience cn-serif" style={{ textDecoration: "none", color: "inherit" }}>
              个人经历 / Experience
            </a>
            <a href="#works" className="label portfolio cn-serif" style={{ textDecoration: "none", color: "inherit" }}>
              作品集 / Portfolio
            </a>
            <a href="#about" className="label introduction cn-serif" style={{ textDecoration: "none", color: "inherit" }}>
              自我介绍 / Introduction
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner code">
          <div className="footer-item">
            <b>Email</b>
            <span>l118183365@******</span>
          </div>
          <div className="footer-item">
            <b>LinkedIn</b>
            <a href="https://www.linkedin.com/in/jackie-li6699" style={{ color: "inherit", textDecoration: "none" }}>
              Jackie Li
            </a>
          </div>
          <div className="footer-item">
            <b>More</b>
            <span>Coming soon...</span>
          </div>
          <div className="footer-item">
            <b>Rights</b>
            <span>Sonnet 5 by William Shakespeare</span>
          </div>
        </div>
      </footer>
    </>
  );
}
