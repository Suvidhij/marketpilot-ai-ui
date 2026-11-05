import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "MarketPilot AI | Your marketing, connected",
  description: "The foundation for an AI-powered marketing workspace.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
