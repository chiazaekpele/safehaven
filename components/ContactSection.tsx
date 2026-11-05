import {
  CONTACT_NAME,
  CONTACT_PHONE_DISPLAY,
  whatsappContactUrl,
  whatsappShareUrl,
} from "@/lib/config";

export function ContactSection() {
  return (
    <footer id="contact" aria-labelledby="contact-title" className="border-t border-brown/10 text-brown">
      <div className="mx-auto max-w-3xl px-5 py-14 text-center">
        <h2 id="contact-title" className="font-display text-3xl font-bold text-brown">
          Get in touch
        </h2>
        <p className="mt-4 text-lg">
          {CONTACT_NAME} ·{" "}
          <a href={`tel:${CONTACT_PHONE_DISPLAY.replace(/\s/g, "")}`} className="font-semibold text-burgundy underline underline-offset-4">
            {CONTACT_PHONE_DISPLAY}
          </a>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-burgundy px-6 py-3 font-semibold text-cream transition hover:bg-burgundy-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            Message on WhatsApp
          </a>
          <a
            href={whatsappShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-brown px-6 py-3 font-semibold text-brown transition hover:bg-brown hover:text-cream focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            Share on WhatsApp
          </a>
        </div>
        <p className="mt-10 text-sm text-brown-light">Safe Haven Foundation · 3rd Edition Food Drive</p>
      </div>
    </footer>
  );
}
