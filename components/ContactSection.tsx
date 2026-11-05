import {
  CONTACT_NAME,
  CONTACT_PHONE_DISPLAY,
  whatsappContactUrl,
  whatsappShareUrl,
} from "@/lib/config";

export function ContactSection() {
  const btn =
    "rounded-full px-5 py-2.5 text-center font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange";
  return (
    <footer id="contact" aria-labelledby="contact-title" className="border-t border-brown/10 pb-24 md:pb-0">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="contact-title" className="font-bold text-brown">
            Contact {CONTACT_NAME}
          </h2>
          <a
            href={`tel:${CONTACT_PHONE_DISPLAY.replace(/\s/g, "")}`}
            className="text-burgundy underline underline-offset-4"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={whatsappContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} bg-burgundy text-cream hover:bg-burgundy-dark`}
          >
            WhatsApp
          </a>
          <a
            href={whatsappShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} border-2 border-brown text-brown hover:bg-brown hover:text-cream`}
          >
            Share
          </a>
        </div>
      </div>
      <p className="mx-auto max-w-3xl px-5 pb-8 text-sm text-brown-light">
        Safe Haven Foundation · 3rd Edition Food Drive
      </p>
    </footer>
  );
}
