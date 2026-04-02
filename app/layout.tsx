import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zeeroh - Event Ticketing Platform",
  description: "Discover and book events in Nigeria. Easy ticketing, secure payments.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
