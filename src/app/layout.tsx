import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import { Outfit } from "next/font/google"; // Import Font
import { RefineContext } from "./refine-context";

const outfit = Outfit({ subsets: [ "latin" ] });

export const metadata: Metadata = {
  title: "Refine PIM",
  description: "Product Information Management",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <html lang="de">
      <body className={outfit.className}>
        <Suspense fallback="Lade App...">
          <RefineContext defaultMode={defaultMode}>
            {children}
          </RefineContext>
        </Suspense>
      </body>
    </html>
  );
}