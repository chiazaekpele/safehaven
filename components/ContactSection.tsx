import {
  CONTACT_NAME,
  CONTACT_PHONE_DISPLAY,
  whatsappContactUrl,
  whatsappShareUrl,
} from "@/lib/config";

export function ContactSection() {
  return (
    <footer id="contact" aria-labelledby="contact-title" className="bg-burgundy text-cream">
      <div className="mx-auto max-w-3xl px-5 py-14 text-center">
        <h2 id="contact-title" className="font-display text-3xl font-bold text-yellow">
          Get in touch
        </h2>
        <p className="mt-4 text-lg">
          {CONTACT_NAME} ·{" "}
          <a href={`tel:${CONTACT_PHONE_DISPLAY.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-4">
            {CONTACT_PHONE_DISPLAY}
          </a>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-cream px-6 py-3 font-semibold text-burgundy transition hover:bg-cream-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            Message on WhatsApp
          </a>
          <a
            href={whatsappShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-cream px-6 py-3 font-semibold text-cream transition hover:bg-cream hover:text-burgundy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            Share on WhatsApp
          </a>
        </div>
        <p className="mt-10 text-sm text-cream/70">Safe Haven Foundation · 3rd Edition Food Drive</p>
      </div>
    </footer>
  );
}
