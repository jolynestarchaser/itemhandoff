import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inventory Handoff',
  description: 'QR Scanner for inventory handoff and reporting',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <main className="max-w-md mx-auto sm:max-w-3xl pb-10 px-4 sm:px-0">
          {children}
        </main>
      </body>
    </html>
  );
}
