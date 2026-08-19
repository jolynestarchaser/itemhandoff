import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inventory Handoff | ระบบส่งมอบรถเข็นโรงพยาบาล',
  description: 'ระบบสแกน QR Code และจัดการส่งมอบรถเข็นโรงพยาบาล ตรวจสอบเลขรถ และพิมพ์เอกสารส่งมอบ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} antialiased min-h-screen bg-[#121212] text-white selection:bg-[#F58220]/30 selection:text-white`}>
        <Navbar />
        <main className="max-w-5xl mx-auto pb-12 px-3 sm:px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
