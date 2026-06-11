import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navigation from "@/components/ui/Navigation";
import ExperienceCanvas from "@/components/canvas/ExperienceCanvas";
import Preloader from "@/components/ui/Preloader";
import { personal } from "@/data/personal";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: `${personal.name} — ${personal.role}`,
  description: personal.tagline,
  keywords: [
    "Rakesh Saraswat",
    "Software Engineer Intern",
    "Portfolio",
    "Frontend",
    "WebGL",
    "Long Beach",
  ],
  openGraph: {
    title: `${personal.name} — ${personal.role}`,
    description: personal.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" id="top">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
      >
        <SmoothScroll>
          <Preloader />
          <ExperienceCanvas />
          <CustomCursor />
          <Navigation />
          <main className="relative z-10">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
