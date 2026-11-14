import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://options-academy-pradeep.giftedpage.chatgpt.site"),
  title: "First Principles — Your options learning journey",
  description: "Learn options from the very beginning. Small lessons, thoughtful practice, and a clear path at your pace.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
