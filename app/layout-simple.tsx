import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.scss"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Personal Finance Dashboard",
  description: "Track your finances with ease",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
