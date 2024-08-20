import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";

import type { Metadata } from "next";

import { Navigation } from "@/presentation/component/Navigation";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hello World",
  description: "Hello World",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <Navigation />
        {children}
        <ToastContainer position="bottom-left" theme="dark" autoClose={7000} />
      </body>
    </html>
  );
}
