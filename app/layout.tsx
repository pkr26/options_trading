import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://options-academy-pradeep.giftedpage.chatgpt.site"),
  title: "First Principles — Your options learning journey",
  description: "Learn options from first principles through advanced case seminars, interactive laboratories, portfolio decisions, research, and a defended capstone.",
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
