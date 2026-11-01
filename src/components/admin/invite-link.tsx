'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

/** The engineers' invite link, with Copy and Share on WhatsApp (a ready-written message with the link). */
export function InviteLink({ url, until, share }: { url: string; until: string; share?: string }) {
  const [copied, setCopied] = useState(false);
  const message = `${share ?? 'Hello, please register on the Flokefama engineer portal with this link (it takes 2 minutes):'} ${url}`;
  return (
    <div>
      <div className="flex flex-wrap items-stretch gap-2">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Invite link" className="h-12 min-w-0 flex-1 basis-72 rounded-xl border border-line bg-[#f6f8f7] px-4 font-mono text-[0.8125rem] text-ink outline-none" />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink px-4 text-[0.9375rem] font-semibold hover:bg-ink hover:text-white"
        >
          <Icon name={copied ? 'fi-rr-check' : 'fi-rr-copy'} /> {copied ? 'Copied' : 'Copy link'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#1fa855] px-4 text-[0.9375rem] font-semibold text-white hover:bg-[#178a45]">
          <Icon name="fi-brands-whatsapp" /> Share on WhatsApp
        </a>
      </div>
      <p className="mt-2 text-[0.875rem] text-ink-3">Works until {until}.{share ? '' : ' Opening this page again gives a fresh link. Registrations wait for your approval below.'}</p>
    </div>
  );
}
