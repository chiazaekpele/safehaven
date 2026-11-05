import Image from "next/image";
import { IMAGES } from "@/lib/assets";

export function Hero() {
  const flyer = IMAGES.flyer;
  return (
    <header className="bg-wood">
      <h1 className="sr-only">Safe Haven Foundation — 3rd Edition Food Drive</h1>
      <div className="mx-auto max-w-6xl sm:px-5 sm:pt-6">
        <Image
          src={flyer.src}
          alt={flyer.alt}
          width={flyer.width}
          height={flyer.height}
          priority
          sizes="(min-width: 1152px) 1112px, 100vw"
          className="h-auto w-full sm:rounded-2xl sm:shadow-lg"
        />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 text-center">
        <p className="max-w-prose text-lg text-cream">
          Exams are hard enough on an empty stomach.{" "}
          <strong className="text-yellow">₦1,200 feeds one student.</strong>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="#donate"
            className="rounded-full bg-burgundy px-8 py-3 text-lg font-semibold text-cream shadow-sm transition hover:bg-burgundy-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            Donate now
          </a>
          <a
            href="#provisions"
            className="rounded-full border-2 border-cream px-8 py-3 text-lg font-semibold text-cream transition hover:bg-cream hover:text-wood focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            Donate provisions
          </a>
        </div>
      </div>
    </header>
  );
}
