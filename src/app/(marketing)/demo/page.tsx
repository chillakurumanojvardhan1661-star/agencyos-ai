import { Metadata } from 'next';
import { DemoPageClient } from './DemoPageClient';

export const metadata: Metadata = {
  title: 'Demo - See AgencyOS AI in action',
  description: 'Watch how AgencyOS AI helps agencies generate reports, analyze performance, and create content in minutes.',
};

export default function DemoPage() {
  return <DemoPageClient />;
}
