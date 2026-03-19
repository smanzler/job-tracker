import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  title: "Jobby",
  description: "Jobby must get Harry Potter hired!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <main className="px-6 py-8">{children}</main>
              <Footer />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </>
  );
}
