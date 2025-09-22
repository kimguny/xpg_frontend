import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { RecoilProvider } from '@/components/providers/RecoilProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'XPG Admin Dashboard',
  description: 'XPG 관리자 대시보드',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <RecoilProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </RecoilProvider>
      </body>
    </html>
  )
}