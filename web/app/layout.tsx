import "./globals.css";
import { Nav } from "@/components/Nav";
import { Providers } from "./providers";

export const metadata = { title: "ReelTokz Web", description: "Web version of ReelTokz" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
