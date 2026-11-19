import ServicesAdminPage from "./services-client";

// The admin panel only renders after Firebase sign-in is confirmed in the
// browser, so it can never be prerendered or navigated to "instantly".
// Opt out of Next.js instant-navigation validation for this auth-gated page.
export const instant = false;

export default function Page() {
  return <ServicesAdminPage />;
}
