import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Track } from '@/components/marketing/Track';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AgencyOS AI - The AI Operating System for Performance Agencies',
    template: '%s | AgencyOS AI',
  },
  description: 'Generate client-ready reports, AI insights, and branded deliverables in minutes — not hours.',
  keywords: ['agency', 'AI', 'marketing', 'automation', 'reports', 'performance', 'analytics'],
  authors: [{ name: 'AgencyOS AI' }],
  creator: 'AgencyOS AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agencyos.ai',
    title: 'AgencyOS AI - The AI Operating System for Performance Agencies',
    description: 'Generate client-ready reports, AI insights, and branded deliverables in minutes — not hours.',
    siteName: 'AgencyOS AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgencyOS AI - The AI Operating System for Performance Agencies',
    description: 'Generate client-ready reports, AI insights, and branded deliverables in minutes — not hours.',
    creator: '@agencyosai',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <Track />
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
