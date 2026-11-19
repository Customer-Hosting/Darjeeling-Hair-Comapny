import Link from "next/link";
import "./(site)/site.css";
import { LogoBadge } from "@/components/site/LogoBadge";

export default function NotFound() {
  return (
    <div className="site grid min-h-dvh place-items-center bg-gradient-to-b from-sand to-[#efe6dd] px-5 text-center">
      <div>
        <LogoBadge className="w-24" />
        <p className="h-serif mt-10 text-8xl !text-accent md:text-9xl">404</p>
        <h1 className="h-serif mt-4 text-3xl">This page took a wrong turn.</h1>
        <p className="mt-3">Let&apos;s get you back to the good hair days.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="s-btn-accent">Back to home</Link>
          <Link href="/contact#book" className="s-btn-outline">Book an appointment</Link>
        </div>
      </div>
    </div>
  );
}
