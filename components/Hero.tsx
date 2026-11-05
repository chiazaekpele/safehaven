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
        className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 pt-6 pb-10 sm:flex-row sm:justify-center sm:gap-6 sm:pt-8"
      >
        <a
          href="#donate"
          className="w-full rounded-full bg-burgundy px-10 py-3 text-center text-base font-semibold text-cream shadow-sm transition hover:bg-burgundy-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange sm:w-auto sm:text-lg"
        >
          Donate now
        </a>
        <a
          href="#provisions"
          className="rounded-sm font-semibold text-brown underline decoration-brown/30 underline-offset-4 transition hover:decoration-brown focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          Or donate provisions
        </a>
      </div>
    </header>
  );
}
