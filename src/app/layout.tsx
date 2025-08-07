import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import type { Metadata } from "next";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Navigation } from "@/presentation/component/Navigation";
import { getUserRoleAuth } from "@/lib/utils/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hello World",
  description: "Hello World",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col bg-black text-white`}>
        <Navigation />
        {children}
        <ToastContainer
          aria-label="notification"
          position="top-left"
          closeOnClick
          theme="dark"
          autoClose={7000}
          pauseOnFocusLoss={false}
        />
      </body>
    </html>
  );
}
