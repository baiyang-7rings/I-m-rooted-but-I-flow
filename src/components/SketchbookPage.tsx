"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    p5: any;
    treeImg: any;
    particles: any[];
    branchPoints: { x: number; y: number }[];
    poem: string;
    poemIndex: number;
    isFinished: boolean;
    groundMap: number[];
    currentSway: number;
    mobileShakeTimer: number;
    config: any;
    hasHiddenStaticTree: boolean;
    mousePressed: () => void;
    touchStarted: () => void;
  }
}

export default function SketchbookPage() {
  const p5LoadedRef = useRef(false);

  useEffect(() => {
    const charAnimTimer = setTimeout(() => {
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

    return () => clearTimeout(charAnimTimer);
  }, []);

  const initP5 = () => {
    if (p5LoadedRef.current || !window.p5) return;
    p5LoadedRef.current = true;

    const p5 = window.p5;

    window.particles = [];
    window.branchPoints = [];
    window.poem = "Those hours that with gentle work did frame The lovely gaze where every eye doth dwell, Will play the tyrants to the very same And that unfair which fairly doth excel: For never-resting time leads summer on To hideous winter and confounds him there; Sap check'd with frost and lusty leaves quite gone, Beauty o'ersnow'd and bareness every where: Then, were not summer's distillation left, A liquid prisoner pent in walls of glass, Beauty's effect with beauty were bereft, Nor it, nor no remembrance what it was: But flowers distill'd, though they with winter meet, Leese but their show; their substance still lives sweet.";
    window.poemIndex = 0;
    window.isFinished = false;
    window.groundMap = [];
    window.currentSway = 0;
    window.mobileShakeTimer = 0;
    window.hasHiddenStaticTree = false;

    window.config = {
      fontSize: 15,
      maxFallSpeed: 1.5,
      drag: 0.97,
      spawnIntensity: 12,
      swayAmplitude: 0.03,
      letterSpacing: 20,
      groundY: 0.95,
      driftRange: 0.5,
      rotateSpeed: 0.7,
      margin: 0.2,
    };

    const sketch = (p: any) => {
      let treeImgLocal: any;

      p.preload = () => {
        treeImgLocal = p.loadImage(
          "/images/tree.png",
          () => {
            window.treeImg = treeImgLocal;
          },
          () => {}
        );
      };

      p.setup = () => {
        p.pixelDensity(1);
        const c = p.createCanvas(treeImgLocal.width, treeImgLocal.height);
        c.parent("p5-overlay");

        const baseLine = p.height * window.config.groundY;
        for (let i = 0; i < p.width; i++) window.groundMap[i] = baseLine;

        treeImgLocal.loadPixels();
        for (let x = 0; x < treeImgLocal.width; x += 6) {
          for (let y = 0; y < treeImgLocal.height; y += 6) {
            const idx = (x + y * treeImgLocal.width) * 4;
            if (treeImgLocal.pixels[idx + 3] > 50) {
              window.branchPoints.push({ x, y });
            }
          }
        }

        p.textFont("Georgia");
        p.textSize(window.config.fontSize);
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        p.clear();

        const canvasElem = document.querySelector(
          "#p5-overlay canvas"
        ) as HTMLCanvasElement | null;
        let effectiveMouseX = p.mouseX;
        let effectiveMouseY = p.mouseY;

        if (canvasElem) {
          effectiveMouseX = p.mouseX * (p.width / canvasElem.offsetWidth);
          effectiveMouseY = p.mouseY * (p.height / canvasElem.offsetHeight);
        }

        const m = p.width * window.config.margin;
        const isMouseHovering =
          effectiveMouseX > m &&
          effectiveMouseX < p.width - m &&
          effectiveMouseY > m &&
          effectiveMouseY < p.height - m;

        if (window.mobileShakeTimer > 0) {
          window.mobileShakeTimer--;
        }

        const isHovering = isMouseHovering || window.mobileShakeTimer > 0;

        if (!window.hasHiddenStaticTree && p.frameCount > 5) {
          const staticTree = document.querySelector(".tree") as HTMLImageElement | null;
          if (staticTree) staticTree.style.opacity = "0";
          window.hasHiddenStaticTree = true;
        }

        const targetSway =
          isHovering && !window.isFinished
            ? p.sin(p.frameCount * 0.08) * window.config.swayAmplitude
            : 0;
        window.currentSway = p.lerp(window.currentSway, targetSway, 0.05);

        p.push();
        p.translate(p.width / 2, p.height);
        p.shearX(window.currentSway);
        p.image(treeImgLocal, -p.width / 2, -p.height, p.width, p.height);
        p.pop();

        if (isHovering && !window.isFinished) {
          for (let i = 0; i < window.config.spawnIntensity; i++) {
            if (window.poemIndex < window.poem.length) {
              const pt = p.random(window.branchPoints);
              if (window.poem[window.poemIndex] !== " ") {
                window.particles.push(
                  new LetterClass(p, pt.x, pt.y, window.poem[window.poemIndex])
                );
              }
              window.poemIndex++;
            } else {
              window.isFinished = true;
            }
          }
        }

        for (let i = window.particles.length - 1; i >= 0; i--) {
          window.particles[i].update();
          window.particles[i].display();
        }

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
              const swayX =
                -cssHeight * l.h * Math.tan(window.currentSway);
              const windNoise = p.noise(p.frameCount * 0.01 + l.noiseOff);
              const wind = (windNoise - 0.5) * 0.2;
              const baseSway = window.currentSway * 0.9;
              const rot = baseSway + wind;
              const softSkew = rot * 15;

              elem.style.transformOrigin = "top center";
              elem.style.transform = `translateX(${swayX}px) rotate(${rot}rad) skewX(${softSkew}deg)`;
            }
          }
        }
      };

      p.mousePressed = () => {
        handleInput(p);
      };
      p.touchStarted = () => {
        handleInput(p);
      };
    };

    class LetterClass {
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
        this.vel = p.createVector(
          p.random(-0.5, 0.5),
          p.random(0.1, 0.5)
        );
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
          0,
          1,
          -window.config.driftRange,
          window.config.driftRange
        );
        this.vel.x += breeze * 0.15;
        this.vel.add(this.acc);
        this.vel.mult(window.config.drag);
        if (this.vel.y > window.config.maxFallSpeed) {
          this.vel.y = window.config.maxFallSpeed;
        }
        this.pos.add(this.vel);
        this.angle += this.vel.mag() * 0.08 * window.config.rotateSpeed;

        const xIdx = p.floor(p.constrain(this.pos.x, 0, p.width - 1));
        if (this.pos.y >= window.groundMap[xIdx]) {
          this.pos.y = window.groundMap[xIdx];
          this.isStatic = true;
          const r = window.config.letterSpacing / 2;
          for (let i = -r; i <= r; i++) {
            const checkX = p.floor(p.constrain(xIdx + i, 0, p.width - 1));
            const lift = p.map(
              Math.abs(i),
              0,
              r,
              window.config.fontSize * 0.65,
              0
            );
            window.groundMap[checkX] -= lift;
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

    function handleInput(p: any) {
      const canvasElem = document.querySelector(
        "#p5-overlay canvas"
      ) as HTMLCanvasElement | null;
      if (canvasElem) {
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          window.mobileShakeTimer = 180;
        }
      }
    }

    new p5(sketch);
  };

  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400;500&family=Special+Elite&family=Noto+Sans+HK:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.js"
        onLoad={initP5}
        strategy="afterInteractive"
      />

      <header>
        <nav className="nav code">
          <a className="nav-left" href="#works">
            Works
          </a>
          <a className="nav-center" href="#experience">
            Experience
          </a>
          <a className="nav-right" href="#about">
            About
          </a>
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
            <a
              href="#experience"
              className="label experience cn-serif"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              个人经历 / Experience
            </a>
            <a
              href="#works"
              className="label portfolio cn-serif"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              作品集 / Portfolio
            </a>
            <a
              href="#about"
              className="label introduction cn-serif"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              自我介绍 / Introduction
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner code">
          <div className="footer-item">
            <b>Email</b>
            <span>l118183365@gmail.com</span>
          </div>
          <div className="footer-item">
            <b>LinkedIn</b>
            <a
              href="https://www.linkedin.com/in/jackie-li6699"
              style={{ color: "inherit", textDecoration: "none" }}
            >
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
