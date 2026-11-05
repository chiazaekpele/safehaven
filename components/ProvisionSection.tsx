import { CONTACT_NAME, PROVISIONS, whatsappContactUrl } from "@/lib/config";
import { Section } from "./Section";

export function ProvisionSection() {
  return (
    <Section id="provisions" title="Give More Than a Meal">
      <p className="text-lg text-brown-light">We also welcome:</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PROVISIONS.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-brown/10 bg-cream/60 px-4 py-3 font-semibold"
          >
            {item}
          </li>
        ))}
      </ul>
      <a
        href={whatsappContactUrl(
          "Hello Daniella, I'd like to donate provisions to the Safe Haven food drive.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-brown px-7 py-3 font-semibold text-cream transition hover:bg-brown-light focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        Arrange with {CONTACT_NAME} on WhatsApp
      </a>
    </Section>
  );
}
