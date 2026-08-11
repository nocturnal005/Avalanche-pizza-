import type { Metadata, Viewport } from 'next';
import { Metrophobic, Manrope, JetBrains_Mono } from 'next/font/google';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/motion/Reveal';
import { RestaurantJsonLd } from '@/components/seo/RestaurantJsonLd';
import { SHOP } from '@/config/shop';
import { siteUrl } from '@/lib/site';

import './globals.css';

/**
 * Self-hosted at build time by next/font — no request to fonts.googleapis.com,
 * no third-party origin in the CSP, no extra handshake on a high-latency link,
 * and automatic size-adjust fallbacks so nothing shifts as they load.
 * docs/ARCHITECTURE.md §6.3.
 */
const metrophobic = Metrophobic({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-metrophobic',
  preload: true,
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  preload: true,
});

const jetbrains = JetBrains_Mono({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  // Not preloaded: a third preload competes with the hero image for early
  // bandwidth, and this face only sets small labels.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Avalanche Pizza — Premium Tasty Pizza in Bechem',
    template: '%s | Avalanche Pizza',
  },
  description:
    'Wood-fired premium pizza in the heart of Bechem, Ahafo Region. Browse the menu and order on WhatsApp.',
  applicationName: SHOP.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SHOP.name,
    locale: 'en_GH',
    url: '/',
    title: 'Avalanche Pizza — Premium Tasty Pizza in Bechem',
    description:
      'Wood-fired premium pizza in the heart of Bechem. Browse the menu and order on WhatsApp.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#131313',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GH"
      className={`${metrophobic.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <body className="bg-background text-on-surface font-body-md min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:font-label-caps focus:text-label-caps focus:uppercase"
        >
          Skip to content
        </a>
        {/* Each page renders its own <SiteHeader active="…" />. The active nav
            state needs the current route, and reading it in a layout would mean
            either a client component or opting out of static rendering — both
            unacceptable here. Pages own the header; the footer is invariant. */}
        {children}
        <SiteFooter />
        <RestaurantJsonLd />
        <Reveal />
      </body>
    </html>
  );
}
