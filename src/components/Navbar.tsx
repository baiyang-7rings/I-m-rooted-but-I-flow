"use client";

import Link from "next/link";

const navItems = [
  { label: "Works", href: "#works", emphasized: true },
  { label: "Experience", href: "#experience", emphasized: false },
  { label: "About", href: "#about", emphasized: false },
];

export default function Navbar() {
  return (
    <nav className="w-full max-w-[1200px] mx-auto px-6 pt-8 pb-4 md:px-4 md:pt-6">
      <div className="grid grid-cols-3 items-center">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={item.label === "Works" ? "text-left" : item.label === "Experience" ? "text-center" : "text-right"}
          >
            <Link
              href={item.href}
              className={`nav-link text-[15px] tracking-wide md:text-[12px] ${
                item.emphasized
                  ? "font-medium opacity-90"
                  : "font-normal"
              }`}
              style={{ fontFamily: "var(--font-ar-one-sans), sans-serif" }}
            >
              {item.label}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
