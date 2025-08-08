import type { Metadata } from "next";
import {Anton,Playfair_Display} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import {
  ClerkProvider,
} from '@clerk/nextjs'


const antonFont=Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
})
const playfairFont=Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "900",
})


export const metadata: Metadata = {
  title: "New Tab",
  description: "A customizable new tab page with a Google search bar, time display, and day planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ClerkProvider>


    <html lang="en">
      <body
        className={` antialiased dark ${antonFont.variable} ${playfairFont.variable} font-inter bg-background text-foreground`}
      >
        {children}
        <Toaster/>
      </body>
    </html>
      </ClerkProvider>
  );
}
