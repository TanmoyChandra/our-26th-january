import { notFound } from 'next/navigation';
import { buildGuestInfo } from '@/lib/guest';
import { getVisibleEvents, getInvitationConfig } from '@/lib/invitation';
import { InvitationView } from '@/components/invitation/InvitationView';

// This route is fully dynamic — the guest name and category come from the URL.
// `force-dynamic` ensures Vercel never statically caches a guest's personalised page.
export const dynamic = "force-dynamic";

interface GuestPageProps {
  params: Promise<{ guest: string }>;
  searchParams: Promise<{ type?: string; lang?: string; language?: string }>;
}

export default async function GuestPage({ params, searchParams }: GuestPageProps) {
  const { guest } = await params;
  const { type, lang, language } = await searchParams;
  const langParam = lang || language;

  // Validate guest slug — reject empty or obviously invalid slugs
  if (!guest || guest.length > 100) {
    notFound();
  }

  const guestInfo = buildGuestInfo(guest, type, langParam);
  const visibleEvents = getVisibleEvents(guestInfo.category);
  const config = getInvitationConfig();

  return (
    <InvitationView
      guestInfo={guestInfo}
      events={visibleEvents}
      config={config}
    />
  );
}

export function generateMetadata({ params }: { params: Promise<{ guest: string }> }) {
  // Minimal metadata — will be expanded in design phase
  return {
    title: '26th January 2027 — You are invited',
    description: 'A personal invitation for 26th January 2027.',
  };
}
