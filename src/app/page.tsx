import { buildGuestInfo } from '@/lib/guest';
import { getVisibleEvents, getInvitationConfig } from '@/lib/invitation';
import { InvitationView } from '@/components/invitation/InvitationView';
import Link from 'next/link';

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ type?: string; guest?: string; name?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type, guest, name } = await searchParams;

  // Allows checking customized names on root url (?name=Tanmoy+Chandra or ?guest=...)
  const guestSlug = guest || name || 'Guest';
  const guestInfo = buildGuestInfo(guestSlug, type);
  const visibleEvents = getVisibleEvents(guestInfo.category);
  const config = getInvitationConfig();

  return (
    <div>
      {/* Quick switcher bar for previewing both invitation tiers */}
      <nav
        aria-label="Preview category selector"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-neutral-200/80 px-3 py-1.5 rounded-full shadow-md text-xs font-mono"
      >
        <span className="text-neutral-400">Preview:</span>
        <Link
          href="/?type=f"
          className={`px-2.5 py-1 rounded-full transition-colors ${
            guestInfo.category === 'family'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Family
        </Link>
        <Link
          href="/?type=g"
          className={`px-2.5 py-1 rounded-full transition-colors ${
            guestInfo.category === 'general'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          General
        </Link>
      </nav>

      {/* The physical envelope and scroll opening experience */}
      <InvitationView
        guestInfo={guestInfo}
        events={visibleEvents}
        config={config}
      />
    </div>
  );
}

