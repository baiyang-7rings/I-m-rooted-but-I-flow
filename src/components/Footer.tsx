"use client";

export default function Footer() {
  return (
    <footer className="w-full max-w-[1200px] mx-auto px-6 mt-auto md:px-4">
      <div
        className="border-t py-8 md:py-6"
        style={{ borderColor: "rgba(0, 0, 0, 0.08)" }}
      >
        <div
          className="grid grid-cols-4 gap-3 md:grid-cols-2"
          style={{ fontFamily: "var(--font-ar-one-sans), sans-serif" }}
        >
          <div>
            <p className="text-[13px] text-[#666666] opacity-70 mb-1 md:text-[12px]">Email</p>
            <a
              href="mailto:l118183365@gmail.com"
              className="text-[13px] text-[#666666] opacity-70 hover:opacity-100 transition-opacity duration-200 md:text-[12px]"
            >
              l118183365@gmail.com
            </a>
          </div>
          <div>
            <p className="text-[13px] text-[#666666] opacity-70 mb-1 md:text-[12px]">LinkedIn</p>
            <a
              href="https://www.linkedin.com/in/jackie-li6699/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#666666] opacity-70 hover:opacity-100 transition-opacity duration-200 md:text-[12px]"
            >
              Jackie Li
            </a>
          </div>
          <div>
            <p className="text-[13px] text-[#666666] opacity-70 mb-1 md:text-[12px]">More</p>
            <span className="text-[13px] text-[#666666] opacity-70 md:text-[12px]">
              Coming soon...
            </span>
          </div>
          <div>
            <p className="text-[13px] text-[#666666] opacity-70 mb-1 md:text-[12px]">Philosophy</p>
            <span
              className="text-[13px] text-[#666666] opacity-70 md:text-[12px]"
              style={{ fontFamily: "var(--font-noto-sans-hk), 'Source Han Sans SC', sans-serif" }}
            >
              意识才是唯一的现实
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
