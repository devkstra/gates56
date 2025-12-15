import type { ReactNode } from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "GymGuard - Gym Management System",
  description: "Comprehensive gym management and attendance system with face recognition",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}
