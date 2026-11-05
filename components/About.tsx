import { IMAGES } from "@/lib/assets";
import { SlotImage } from "./SlotImage";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-brown/10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-20">
        <div>
          <h2 id="about-title" className="font-display text-3xl font-bold text-brown sm:text-4xl">
            Why we do this
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-brown-light">
            <p>
              Students carry so much. Lectures, deadlines, money worries, home,
              the pressure of exams. We cannot fix every problem they face.
            </p>
            <p>
              But we can offer a meal to those who need it, when they need it
              most.
            </p>
            <p>
              Since January, Safe Haven has provided food to more than{" "}
              <strong className="text-burgundy">300 students</strong> during
              examination seasons. This is our third edition.
            </p>
            <p>
              Safe Haven is led by the Holy Spirit through{" "}
              <strong className="text-brown">Anokwu Chiaza Daniella</strong>, a
              500-level Computer Engineering student.
            </p>
          </div>
        </div>
        <SlotImage slot={IMAGES.heroFood} className="max-h-[26rem] md:max-h-[34rem]" />
      </div>
    </section>
  );
}
