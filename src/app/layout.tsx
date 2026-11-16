import type { Metadata, Viewport } from 'next';
import { Inter, Great_Vibes } from 'next/font/google';
import { MotionProvider } from '@/components/providers/MotionProvider';
import './globals.css';
import '@/styles/animations.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cursive',
});

export const metadata: Metadata = {
  title: {
    default: '26th January 2027 — You are invited',
    template: '%s | 26th January 2027',
  },
  description: 'A personal digital invitation for 26th January 2027.',
  robots: { index: false, follow: false }, // Private invitation — do not index
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${greatVibes.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
