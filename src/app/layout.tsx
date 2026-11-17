import type { Metadata, Viewport } from 'next';
import { Inter, Great_Vibes, Dancing_Script } from 'next/font/google';
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

const dancingScript = Dancing_Script({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-handwriting',
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
  viewportFit: 'cover',
  themeColor: '#0c0a09',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${greatVibes.variable} ${dancingScript.variable}`} suppressHydrationWarning>
      <body className="min-h-[100dvh] w-full bg-background font-sans antialiased" suppressHydrationWarning>
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
