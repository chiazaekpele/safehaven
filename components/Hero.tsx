import { IMAGES } from "@/lib/assets";
import { SlotImage } from "./SlotImage";

export function Hero() {
  return (
    <header className="bg-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-burgundy">
            Safe Haven Foundation
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-brown sm:text-5xl">
            3rd Edition{" "}
            <span className="text-orange">Food Drive</span>
          </h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed text-brown-light">
            Exams are hard enough on an empty stomach. Help us give a student a
            meal when they need it most. ₦1,200 feeds one student.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#donate"
              className="rounded-full bg-burgundy px-7 py-3 text-base font-semibold text-cream shadow-sm transition hover:bg-burgundy-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              Donate now
            </a>
            <a
              href="#provisions"
              className="rounded-full border-2 border-brown px-7 py-3 text-base font-semibold text-brown transition hover:bg-brown hover:text-cream focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              Give provisions
            </a>
          </div>
        </div>
        <SlotImage slot={IMAGES.heroFood} priority className="max-h-[26rem] md:max-h-[34rem]" />
      </div>
    </header>
  );
}
