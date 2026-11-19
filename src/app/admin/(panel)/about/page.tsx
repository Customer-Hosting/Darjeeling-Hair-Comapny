import AboutAdminPage from "./about-client";

// The admin panel only renders after Firebase sign-in is confirmed in the
// browser, so it can never be prerendered or navigated to "instantly".
export const instant = false;

export default function Page() {
  return <AboutAdminPage />;
}
