import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Navigation } from "@/presentation/component/Navigation";

const inter = Inter({ subsets: ["latin"] });

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
