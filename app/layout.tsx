
import './globals.css'; // Pastikan ini ada di baris paling atas
import { ReactNode } from 'react';
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
