"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ParticleCanvas from "./ParticleCanvas";

function AnimatedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const chars = text.split("");
  return (
    <span>
      {chars.map((char, i) => (
        <span
          key={i}
          className="char-animate inline-block"
          style={{
            animationDelay: `${delay + i * 0.02 + Math.random() * 0.8}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default function HeroSection() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ctaRef.current) {
        ctaRef.current.classList.add("drift-away");
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-[1200px] mx-auto px-6 lg:px-6 md:px-4">
      <div
        className="grid grid-cols-[1.05fr_1fr] gap-8 items-start
                   lg:grid-cols-[1.05fr_1fr]
                   md:grid-cols-1 md:text-center"
        style={{ marginTop: "-40px" }}
      >
        {/* Left: Intro Text */}
        <div
          className="flex flex-col justify-start md:items-center"
          style={{ paddingTop: "210px" }}
        >
          <h1
            className="text-[18px] font-medium leading-[1.8] mb-6
                       md:text-[15px] md:leading-[1.5] md:pt-0"
            style={{ fontFamily: "var(--font-special-elite), serif", color: "#666666" }}
          >
            <AnimatedText text="Hi," delay={0.3} />
          </h1>
          <h2
            className="text-[18px] font-medium leading-[1.8] mb-8
                       md:text-[15px] md:leading-[1.5]"
            style={{ fontFamily: "var(--font-special-elite), serif", color: "#666666" }}
          >
            <AnimatedText text="This Is Jackie's Sketchbook." delay={0.8} />
          </h2>
          <div
            ref={ctaRef}
            className="self-end md:self-center"
            style={{ paddingLeft: "120px", marginTop: "60px" }}
          >
            <span
              className="text-[18px] font-medium leading-[1.8] md:text-[15px]"
              style={{ fontFamily: "var(--font-special-elite), serif", color: "#666666" }}
            >
              <AnimatedText text="Let's Flip Through It." delay={2.0} />
            </span>
          </div>
        </div>

        {/* Right: Tree with Labels */}
        <div
          className="relative flex justify-center lg:max-w-[520px] md:max-w-[420px]"
          style={{ maxWidth: "520px", margin: "0 auto" }}
        >
          <div className="relative w-full" style={{ aspectRatio: "520/688" }}>
            <Image
              src="/images/tree.png"
              alt="Hand-drawn tree illustration"
              fill
              className="w-full h-full object-contain"
              priority
            />
            <ParticleCanvas />
            {/* Tree Labels */}
            <Link
              href="#experience"
              className="tree-label absolute text-[10px] tracking-[0.5px] md:text-[12px]"
              style={{
                fontFamily: "var(--font-noto-sans-hk), 'Source Han Sans SC', sans-serif",
                color: "#666666",
                top: "18%",
                left: "28%",
              }}
            >
              <span className="vertical-text">个人经历</span>
              <span className="vertical-text ml-1">Experience</span>
            </Link>
            <Link
              href="#works"
              className="tree-label absolute text-[10px] tracking-[0.5px] md:text-[12px]"
              style={{
                fontFamily: "var(--font-noto-sans-hk), 'Source Han Sans SC', sans-serif",
                color: "#666666",
                top: "32%",
                left: "55%",
              }}
            >
              <span className="vertical-text">作品集</span>
              <span className="vertical-text ml-1">Portfolio</span>
            </Link>
            <Link
              href="#about"
              className="tree-label absolute text-[10px] tracking-[0.5px] md:text-[12px]"
              style={{
                fontFamily: "var(--font-noto-sans-hk), 'Source Han Sans SC', sans-serif",
                color: "#666666",
                top: "22%",
                right: "12%",
              }}
            >
              <span className="vertical-text">自我介绍</span>
              <span className="vertical-text ml-1">Introduction</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
