import type { Metadata } from 'next';
import { dmSans, quicksand } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Creative Strategist · Branding Intake',
  description:
    'A considered intake questionnaire for new and prospective clients of The Creative Strategist.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'The Creative Strategist · Branding Intake',
    description:
      'The first step of working with The Creative Strategist. A structured branding questionnaire to ground our strategy engagement.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(dmSans.variable, quicksand.variable)}>
      <body className="min-h-screen bg-brand-cream text-brand-navy antialiased">
        {children}
      </body>
    </html>
  );
}
