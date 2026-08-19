import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#121212',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://itemhandoff.vercel.app'),
  title: {
    default: 'Inventory Handoff | ระบบส่งมอบรถเข็นโรงพยาบาล',
    template: '%s | Inventory Handoff',
  },
  description: 'ระบบสแกน QR Code และจัดการส่งมอบรถเข็นโรงพยาบาล ตรวจสอบเลขรถ และพิมพ์เอกสารส่งมอบ A4 ครบวงจร',
  applicationName: 'Inventory Handoff',
  keywords: ['inventory', 'handoff', 'hospital cart', 'QR scanner', 'รถเข็นโรงพยาบาล', 'ใบส่งมอบ'],
  authors: [{ name: 'Inventory Handoff Team' }],
  creator: 'Inventory Handoff',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://itemhandoff.vercel.app',
    title: 'Inventory Handoff | ระบบส่งมอบรถเข็นโรงพยาบาล',
    description: 'ระบบสแกน QR Code และจัดการส่งมอบรถเข็นโรงพยาบาล ตรวจสอบเลขรถ และพิมพ์เอกสารส่งมอบ',
    siteName: 'Inventory Handoff',
  },
  twitter: {
    card: 'summary',
    title: 'Inventory Handoff | ระบบส่งมอบรถเข็นโรงพยาบาล',
    description: 'ระบบสแกน QR Code และจัดการส่งมอบรถเข็นโรงพยาบาล ตรวจสอบเลขรถ และพิมพ์เอกสารส่งมอบ',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-[#121212] text-white selection:bg-[#F58220]/30 selection:text-white`}>
        <Navbar />
        <main className="max-w-5xl mx-auto pb-12 px-3 sm:px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
