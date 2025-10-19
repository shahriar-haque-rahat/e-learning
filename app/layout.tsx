import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { UISettingsProvider } from "@/lib/providers/ui-settings-provider"
import { ErrorBoundary } from "@/components/error-boundary"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shikkha Admin",
  description: "Educational content management system",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ErrorBoundary>
          <UISettingsProvider>{children}</UISettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
