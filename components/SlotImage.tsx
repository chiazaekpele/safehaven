import Image from "next/image";
import type { ImageSlot } from "@/lib/assets";

export function SlotImage({
  slot,
  className = "",
  priority = false,
  sizes = "(min-width: 768px) 50vw, 100vw",
}: {
  slot: ImageSlot;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!slot.available) {
    return (
      <div
        role="img"
        aria-label={`${slot.alt} (image coming soon)`}
        className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-brown-light/40 bg-cream-dark p-6 text-center text-sm text-brown-light ${className}`}
        style={{ aspectRatio: `${slot.width} / ${slot.height}` }}
      >
        Image slot: <code className="ml-1">public{slot.src}</code>
      </div>
    );
  }
  return (
    <Image
      src={slot.src}
      alt={slot.alt}
      width={slot.width}
      height={slot.height}
      priority={priority}
      sizes={sizes}
      className={`h-auto w-full rounded-2xl object-cover ${className}`}
    />
  );
}
