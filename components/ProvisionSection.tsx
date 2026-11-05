import { IMAGES } from "@/lib/assets";
import { CONTACT_NAME, CONTACT_PHONE_DISPLAY, PROVISIONS, whatsappContactUrl } from "@/lib/config";
import { SlotImage } from "./SlotImage";

export function ProvisionSection() {
  return (
    <section id="provisions" aria-labelledby="provisions-title" className="bg-cream-dark">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-20">
        <div>
          <h2 id="provisions-title" className="font-display text-3xl font-bold text-brown sm:text-4xl">
            Give More Than a Meal
          </h2>
          <p className="mt-4 text-lg text-brown-light">
            Prefer to give food items? We gladly receive:
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {PROVISIONS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3 font-semibold"
              >
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-orange" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-lg">
            Contact {CONTACT_NAME} on{" "}
            <a href={`tel:${CONTACT_PHONE_DISPLAY.replace(/\s/g, "")}`} className="font-semibold text-burgundy underline underline-offset-4">
              {CONTACT_PHONE_DISPLAY}
            </a>{" "}
            to arrange your donation.
          </p>
          <a
            href={whatsappContactUrl("Hello Daniella, I'd like to donate provisions to the Safe Haven food drive.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-brown px-7 py-3 font-semibold text-cream transition hover:bg-brown-light focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            Arrange on WhatsApp
          </a>
        </div>
        <SlotImage slot={IMAGES.mealPacks} className="max-h-[26rem] md:max-h-[34rem]" />
      </div>
    </section>
  );
}
