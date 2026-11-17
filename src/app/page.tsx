import { buildGuestInfo } from '@/lib/guest';
import { getVisibleEvents, getInvitationConfig } from '@/lib/invitation';
import { InvitationView } from '@/components/invitation/InvitationView';
import Link from 'next/link';

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ type?: string; guest?: string; name?: string; lang?: string; language?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type, guest, name, lang, language } = await searchParams;
  const langParam = lang || language;

  // Allows checking customized names on root url (?name=Tanmoy+Chandra or ?guest=...)
  const guestSlug = guest || name || 'Guest';
  const guestInfo = buildGuestInfo(guestSlug, type, langParam);
  const visibleEvents = getVisibleEvents(guestInfo.category);
  const config = getInvitationConfig();

  return (
    <div>
      {/* Quick switcher bar for previewing both invitation tiers & languages */}
      <nav
        aria-label="Preview category and language selector"
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 sm:gap-2 bg-neutral-900/85 backdrop-blur-md border border-neutral-700/80 px-3 py-1.5 rounded-full shadow-lg text-xs font-mono"
      >
        <span className="text-neutral-400">Tier:</span>
        <Link
          href={`/?type=f${guestInfo.language === 'bn' ? '&lang=bn' : ''}`}
          className={`px-2.5 py-0.5 rounded-full transition-colors ${
            guestInfo.category === 'family'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          Family
        </Link>
        <Link
          href={`/?type=g${guestInfo.language === 'bn' ? '&lang=bn' : ''}`}
          className={`px-2.5 py-0.5 rounded-full transition-colors ${
            guestInfo.category === 'general'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          General
        </Link>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-400">Lang:</span>
        <Link
          href={`/?type=${guestInfo.category === 'family' ? 'f' : 'g'}&lang=en`}
          className={`px-2 py-0.5 rounded-full transition-colors ${
            guestInfo.language === 'en'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          EN
        </Link>
        <Link
          href={`/?type=${guestInfo.category === 'family' ? 'f' : 'g'}&lang=bn`}
          className={`px-2 py-0.5 rounded-full transition-colors ${
            guestInfo.language === 'bn'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          বাংলা
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

