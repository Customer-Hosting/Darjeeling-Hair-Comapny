import type { FaqItem } from "@/components/site/Faq";

/** Static marketing copy shared by the public pages. */

export const PROCESS_STEPS = [
  { title: "Consultation", text: "We look at your hair type, condition, face shape and lifestyle, and agree on the look together — honestly." },
  { title: "The right service", text: "Cut, colour, treatment or texture — matched to your hair and the result you want, never upsold." },
  { title: "Expert craft", text: "Toni&Guy-trained technique with genuine L'Oréal Professionnel products, done with care and hygiene." },
  { title: "Aftercare advice", text: "You leave with a finished style and simple tips to keep it looking fresh at home." },
];

export const DIFFERENCE = [
  { title: "International training", text: "Hair education from Toni&Guy, Mumbai — big-city technique, right here in Darjeeling." },
  { title: "17 years of experience", text: "Nearly two decades in the glamour industry means confident hands and honest advice." },
  { title: "Professional products only", text: "L'Oréal Professionnel colour, care and styling — the same products we recommend for home." },
];

export const WHY_US = [
  { icon: "scissors", title: "Precision cutting", text: "Cuts shaped to your face, texture and the way you actually wear your hair." },
  { icon: "palette", title: "Colour specialists", text: "Balayage, ombré, highlights and global colour with rich, lasting results." },
  { icon: "droplets", title: "Hair health first", text: "Botox, protein and spa treatments that repair and protect, not just style." },
  { icon: "users", title: "Truly unisex", text: "Sharp men's cuts to soft women's styling — a welcoming chair for everyone." },
  { icon: "shield", title: "Clean & hygienic", text: "Sanitised tools and a comfortable, relaxed space you'll want to come back to." },
  { icon: "sparkles", title: "Honest advice", text: "We tell you what your hair really needs — and how to care for it at home." },
] as const;

export const FAQS: FaqItem[] = [
  {
    q: "Do I need an appointment, or can I walk in?",
    a: "Walk-ins are welcome when a chair is free, but booking ahead guarantees your preferred time — especially for colour and treatments. Book online, call or WhatsApp us.",
  },
  {
    q: "Is Darjeeling Hair Company only for women?",
    a: "Not at all — we're a unisex salon. We offer men's cuts and styling as well as the full range of women's cut, colour and treatment services.",
  },
  {
    q: "Which products do you use?",
    a: "We use L'Oréal Professionnel products for colour, care and styling. Shampoos, masks, serums, wax and clay are also available to buy in the salon.",
  },
  {
    q: "How much do services cost?",
    a: "Prices depend on hair length, thickness and condition, so we confirm the exact price during your consultation before we start — no surprises.",
  },
  {
    q: "What's the difference between Nanoplastia, Hair Botox and straightening?",
    a: "Each works differently and suits different hair. Nanoplastia smooths and reduces frizz, Hair Botox focuses on deep repair and softness, and straightening gives a sleek, straight finish. Your stylist will recommend the best option after looking at your hair.",
  },
  {
    q: "Where are you located?",
    a: "Shop No. 5, Ground Floor, Jai Complex, Darjeeling 734101. Use the map on our Contact page for directions.",
  },
];
