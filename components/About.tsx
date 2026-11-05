import { IMAGES } from "@/lib/assets";
import { Section } from "./Section";
import { SlotImage } from "./SlotImage";

export function About() {
  return (
    <Section id="about" title="Why we do this">
      <div className="space-y-5 text-lg leading-relaxed text-brown-light">
        <p>
          Students carry so much. We cannot fix every problem they face, but we
          can offer a meal to those who need it, when they need it most.
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
      <SlotImage
        slot={IMAGES.heroFood}
        sizes="(min-width: 768px) 728px, 100vw"
        className="mt-8 max-h-80 sm:max-h-96"
      />
    </Section>
  );
}
