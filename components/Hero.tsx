import Image from "next/image";
import { IMAGES } from "@/lib/assets";

export function Hero() {
  const flyer = IMAGES.flyer;
  return (
    <header>
      <h1 className="sr-only">Safe Haven Foundation — 3rd Edition Food Drive</h1>
      <div className="mx-auto max-w-5xl sm:px-5 sm:pt-6">
        <Image
          src={flyer.src}
          alt={flyer.alt}
          width={flyer.width}
          height={flyer.height}
          priority
          sizes="(min-width: 1024px) 984px, 100vw"
          className="h-auto w-full sm:rounded-2xl sm:shadow-md"
        />
      </div>
      <div
        id="hero-cta"
        className="mx-auto grid max-w-3xl grid-cols-1 gap-3 px-5 py-8 sm:grid-cols-2"
      >
        <a
          href="#donate"
          className="rounded-full bg-burgundy px-8 py-3.5 text-center text-lg font-semibold text-cream shadow-sm transition hover:bg-burgundy-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          Donate now
        </a>
        <a
          href="#provisions"
          className="rounded-full border-2 border-brown px-8 py-3 text-center text-lg font-semibold text-brown transition hover:bg-brown hover:text-cream focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          Donate provisions
        </a>
      </div>
    </header>
  );
}
