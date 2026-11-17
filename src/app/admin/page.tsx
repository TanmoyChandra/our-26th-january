'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { encryptGuestName } from '@/lib/guest';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Sparkles,
  Users,
  Share2,
  RefreshCw,
} from 'lucide-react';

interface GeneratedLinkItem {
  id: string;
  name: string;
  category: 'family' | 'general';
  url: string;
  timestamp: number;
}

export default function AdminLinkGeneratorPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [names, setNames] = useState<string[]>(['']);
  const [category, setCategory] = useState<'family' | 'general'>('general');
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLinkItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-detect base URL from current window location on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Load saved links from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wedding_invite_links');
      if (saved) {
        setGeneratedLinks(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save generated links to localStorage
  const saveLinks = (links: GeneratedLinkItem[]) => {
    setGeneratedLinks(links);
    try {
      localStorage.setItem('wedding_invite_links', JSON.stringify(links));
    } catch {
      // Ignore storage errors
    }
  };

  // Add a new invitee name input
  const handleAddName = () => {
    setNames((prev) => [...prev, '']);
  };

  // Remove an invitee name input
  const handleRemoveName = (index: number) => {
    if (names.length <= 1) {
      setNames(['']);
      return;
    }
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a specific invitee name input
  const handleNameChange = (index: number, value: string) => {
    setNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Helper to slugify a name for URL (all lowercase)
  const formatSlug = (rawName: string): string => {
    return rawName
      .trim()
      .toLowerCase()
      .replace(/\s+and\s+/gi, '-&-')
      .replace(/\s*&\s*/g, '-&-')
      .replace(/\s+/g, '-');
  };

  // Combine names nicely (e.g. "Tanmoy & Parnasha", or "A, B & C")
  const combineDisplayNames = (cleanNames: string[]): string => {
    if (cleanNames.length === 0) return '';
    if (cleanNames.length === 1) return cleanNames[0];
    if (cleanNames.length === 2) return `${cleanNames[0]} & ${cleanNames[1]}`;
    return `${cleanNames.slice(0, -1).join(', ')} & ${cleanNames[cleanNames.length - 1]}`;
  };

  // Generate invitation link
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNames = names.map((n) => n.trim()).filter(Boolean);
    if (cleanNames.length === 0) {
      alert('Please enter at least one invitee name.');
      return;
    }

    const host = baseUrl.trim().replace(/\/+$/, '') || (typeof window !== 'undefined' ? window.location.origin : '');
    
    // Joint combined name
    const combinedName = combineDisplayNames(cleanNames);
    const rawSlug = formatSlug(combinedName);
    const cipherSlug = encryptGuestName(rawSlug);
    const typeCode = category === 'family' ? 'f' : 'g';
    const url = `${host}/${cipherSlug}?type=${typeCode}`;

    const newLink: GeneratedLinkItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: combinedName,
      category,
      url,
      timestamp: Date.now(),
    };

    saveLinks([newLink, ...generatedLinks]);

    // Reset name inputs for the next entry
    setNames(['']);
  };

  // Copy link to clipboard
  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Clear all saved links
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all generated links?')) {
      saveLinks([]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500/30">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-neutral-100 leading-tight">
                Invitation Portal
              </h1>
              <p className="text-xs text-neutral-400">
                Generate personalized invitation links
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            Preview Site
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Generator Card */}
        <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-sm space-y-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* 1. Base URL Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="baseUrl"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-300"
              >
                1. Base URL
              </label>
              <div className="relative flex items-center">
                <input
                  id="baseUrl"
                  type="text"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://your-domain.com"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3.5 py-2.5 text-sm font-mono text-neutral-200 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setBaseUrl(typeof window !== 'undefined' ? window.location.origin : '')}
                  title="Reset to current domain"
                  className="absolute right-2 px-2.5 py-1 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-800 hover:bg-neutral-700/80 rounded-md transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto
                </button>
              </div>
              <p className="text-[11px] text-neutral-500">
                The domain where your wedding invitation is hosted.
              </p>
            </div>

            {/* 2. Invitee Names Field (Dynamic list with plus icon) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  2. Invitee Name(s)
                </label>
                <button
                  type="button"
                  onClick={handleAddName}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-amber-500/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add another name
                </button>
              </div>

              <div className="space-y-2">
                {names.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={
                          idx === 0
                            ? 'e.g., Tanmoy Chandra'
                            : idx === 1
                            ? 'e.g., Parnasha Sen'
                            : `Name ${idx + 1}`
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors"
                        autoFocus={idx > 0}
                      />
                    </div>
                    {names.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveName(idx)}
                        aria-label="Remove name"
                        title="Remove name"
                        className="p-2.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-neutral-800 hover:border-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500">
                Adding multiple names will combine them on the card (e.g. &ldquo;Tanmoy Chandra & Parnasha Sen&rdquo;).
              </p>
            </div>

            {/* 3. Family / General Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                3. Invitation Category
              </label>

              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    category === 'general'
                      ? 'bg-amber-500 text-neutral-950 font-semibold shadow-md'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <span className="text-sm">General</span>
                  <span
                    className={`text-[10px] ${
                      category === 'general' ? 'text-neutral-900/80' : 'text-neutral-500'
                    }`}
                  >
                    Engagement & Registry
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('family')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    category === 'family'
                      ? 'bg-amber-500 text-neutral-950 font-semibold shadow-md'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <span className="text-sm">Family</span>
                  <span
                    className={`text-[10px] ${
                      category === 'family' ? 'text-neutral-900/80' : 'text-neutral-500'
                    }`}
                  >
                    Ashirbad + Full Ceremonies
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 active:scale-[0.99] text-neutral-950 font-semibold text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-neutral-950" />
              Generate Invitation Link
            </button>
          </form>
        </section>

        {/* Generated Links Section */}
        {generatedLinks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Generated Links ({generatedLinks.length})
              </h2>
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-3">
              {generatedLinks.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-md transition-all hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-neutral-100">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            item.category === 'family'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Copy, Open, WhatsApp */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `You are warmly invited! Please open your invitation here:\n${item.url}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on WhatsApp"
                        className="p-2 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                        className="p-2 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors flex items-center justify-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.url)}
                        title="Copy link"
                        className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          copiedId === item.id
                            ? 'bg-emerald-500 text-neutral-950 font-bold'
                            : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* URL Text display box */}
                  <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-mono text-neutral-400 truncate select-all">
                      {item.url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-4 text-center text-xs text-neutral-500">
        Wedding Invitation Portal &bull; Generated links route automatically to the 3D envelope experience.
      </footer>
    </div>
  );
}
