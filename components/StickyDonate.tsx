"use client";

import { useEffect, useState } from "react";

/** Phone-only Donate bar; hidden while the hero buttons or the donate form are on screen. */
export function StickyDonate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const targets = ["hero-cta", "donate"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setShow(visible.size === 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-brown/10 bg-paper/95 p-3 backdrop-blur transition-transform duration-200 md:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <a
        href="#donate"
        tabIndex={show ? 0 : -1}
        className="block rounded-full bg-burgundy py-3.5 text-center text-lg font-semibold text-cream shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        Donate now
      </a>
    </div>
  );
}
