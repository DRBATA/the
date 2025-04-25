import type { Metadata } from "next";
import "./globals.css";

import { UserProvider } from "../contexts/user-context";
import { ToastContainer } from "./components/ToastNotification";
import RefillOfferToast from "../components/RefillFactToast";


export const metadata: Metadata = {
  title: "The Water Bar – Discover. Refill. Repeat.",
  description: "Your city-wide guide to sustainable hydration. Find premium refill venues and track your impact.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <UserProvider>
          {children}
          <ToastContainer />
          <RefillOfferToast />
        </UserProvider>
      </body>
    </html>
  );
}
