import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebApp',
  description: 'Practice page',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
