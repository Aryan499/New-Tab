import type { Metadata } from "next";
import {Anton,Roboto} from "next/font/google";
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
const robotoFont=Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: "400",
});


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
        className={` antialiased dark ${antonFont.variable} ${robotoFont.variable} font-inter bg-background text-foreground`}
      >
        {children}
        <Toaster/>
      </body>
    </html>
      </ClerkProvider>
  );
}
