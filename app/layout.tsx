import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { Providers } from "./providers"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Wood Ward - Master Every Sales Conversation",
  description: "AI-powered sales coaching with real-time voice role play, instant feedback, and custom scripts built on the Woodward Sales Methodology.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster position="bottom-right" richColors />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
