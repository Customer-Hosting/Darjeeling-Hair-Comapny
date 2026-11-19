import { WhatsAppIcon } from "@/components/icons/Brand";

export function WhatsAppFab({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi! I'd like to know more about your services.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-ink shadow-[0_10px_40px_-8px_rgba(37,211,102,.7)] transition hover:scale-105 md:right-8 md:bottom-8"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
      <WhatsAppIcon className="size-7" />
      <span className="max-w-0 overflow-hidden text-sm font-bold whitespace-nowrap transition-all duration-500 group-hover:max-w-40 group-hover:pr-2">
        Chat with us
      </span>
    </a>
  );
}
