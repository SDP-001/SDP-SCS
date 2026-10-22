import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEC Portal — Nandha Engineering College | Verified Student Achievements",
  description:
    "Nandha Engineering College (NEC) Autonomous Institutional Co-Curricular Credential Management & Faculty Verification Portal.",
  applicationName: "NEC Portal",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/nec-logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/nec-logo.png",
    apple: [
      { url: "/nec-logo.png", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEC Portal",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link rel="icon" type="image/png" href="/nec-logo.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/png" href="/nec-logo.png" />
        <link rel="apple-touch-icon" href="/nec-logo.png" />
      </head>
      <body className="min-h-screen bg-[#070913] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black cyber-grid-bg">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var r of registrations) {
                    r.unregister();
                  }
                });
              }
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (var name of names) {
                    caches.delete(name);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
