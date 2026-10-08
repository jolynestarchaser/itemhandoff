import type { Metadata, Viewport } from 'next';
import { Sarabun } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const applySavedTheme = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F58220',
  colorScheme: 'light dark',
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
    <html lang="th" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: applySavedTheme }} />
      </head>
      <body suppressHydrationWarning className={`${sarabun.className} antialiased min-h-screen bg-background text-foreground selection:bg-[#F58220]/30`}>
        <Navbar />
        <main className="max-w-5xl mx-auto pb-24 sm:pb-12 px-3 sm:px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
