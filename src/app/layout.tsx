import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'CoinScope - AI-Powered Crypto Explorer',
  description: 'Explore cryptocurrencies with AI-powered insights and real-time data',
  keywords: ['crypto', 'web3', 'portfolio', 'security', 'blockchain', 'defi', 'ai', 'explorer'],
  authors: [{ name: 'Crypto Sentinel X Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${geistSans.variable} ${geistMono.variable} font-inter antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}