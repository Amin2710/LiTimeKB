import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/layout/SessionProvider";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import FavoritesProvider from "@/components/layout/FavoritesProvider";
import CaseStatsProvider from "@/components/layout/CaseStatsProvider";
import PlaceholderProvider from "@/components/kb/PlaceholderProvider";
import SignatureProvider from "@/components/layout/SignatureProvider";
import { CommandPaletteProvider } from "@/components/search/CommandPalette";
import "./globals.css";

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiTime CS Knowledge Base",
  description: "Agent knowledge base for LiTime customer support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${outfit.variable} h-full dark antialiased`}
      suppressHydrationWarning
    >
      <Script id="theme-init" strategy="beforeInteractive">
        {`(function(){try{var t=localStorage.getItem('litime-theme');if(t==='light')document.documentElement.classList.remove('dark')}catch(e){}})()`}
      </Script>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider>
              <FavoritesProvider>
                <CaseStatsProvider>
                  <PlaceholderProvider>
                    <SignatureProvider>
                      <CommandPaletteProvider>
                        <Navbar />
                        <main className="flex-1 w-full max-w-[1180px] mx-auto px-[22px] py-6">
                          {children}
                        </main>
                      </CommandPaletteProvider>
                    </SignatureProvider>
                  </PlaceholderProvider>
                </CaseStatsProvider>
              </FavoritesProvider>
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
