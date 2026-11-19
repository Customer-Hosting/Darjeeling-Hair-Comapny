import Link from "next/link";
import { BrandLogo } from "@/components/site/BrandLogo";

export default function NotFound() {
  return (
    <div className="brick-bg grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <BrandLogo size="md" />
        <p className="mt-12 font-display text-8xl font-extrabold text-gradient md:text-9xl">404</p>
        <h1 className="mt-6 font-display text-3xl font-bold">This page took a wrong turn.</h1>
        <p className="mt-3 text-muted">Let&apos;s get you back to the good hair days.</p>
        <Link href="/" className="btn-primary mt-10">Back to home</Link>
      </div>
    </div>
  );
}
