import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { RecoilProvider } from '@/components/providers/RecoilProvider'
import Script from 'next/script'

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
      <head>
        <Script
          strategy="beforeInteractive"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=1owuku51kd`}
        />
      </head>
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