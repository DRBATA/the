export const metadata = {
  title: "Water Bar",
  description: "Minimal Water Bar App",
};

import "./globals.css";
import "../styles/water-bar.css";

import UserProviderWrapper from './UserProviderWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <UserProviderWrapper>{children}</UserProviderWrapper>
      </body>
    </html>
  );
}
