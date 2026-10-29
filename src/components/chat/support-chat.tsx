'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { track } from '@/lib/analytics';
import { supportSchema, type SupportInput } from '@/lib/support-schema';
import { cn } from '@/lib/utils';

/**
 * The website's chat assistant (the CEO, Oct 2026: help visitors reach the support desk). It answers common
 * questions from the site's own content (branches, contacts, the buying FAQ) and takes a support request step by
 * step: a fault, maintenance, an installation or a demonstration. The request goes to the support desk exactly as
 * the Support page's form does (saved in the admin console, emailed, texted to the engineers). Anything else goes to
 * a person: WhatsApp with the conversation so far, or a call. No outside AI service: every answer is written here.
 */

type Choice = { label: string; value: string };
type Msg = { from: 'bot' | 'you'; text: string; links?: { label: string; href: string }[] };
type Flow = 'fault' | 'maintenance' | 'installation' | 'demo';
type Step = { key: keyof SupportInput; ask: string; choices?: Choice[]; optional?: boolean; kind?: 'phone' };

const flows: Record<Flow, { title: string; type: SupportInput['type']; topic?: SupportInput['topic']; steps: Step[] }> = {
  fault: {
    title: 'Report a faulty machine',
    type: 'fault',
    steps: [
      { key: 'equipment', ask: 'Which equipment is it? (for example: BC-5150 haematology analyser)' },
      { key: 'working', ask: 'Is it still working?', choices: [{ label: 'Not working at all', value: 'down' }, { label: 'Working, with problems', value: 'partly' }] },
      { key: 'message', ask: 'What is happening? Any error message on the screen helps our engineers.' },
    ],
  },
  maintenance: {
    title: 'Book maintenance',
    type: 'maintenance',
    steps: [
      { key: 'equipment', ask: 'Which equipment needs maintenance?' },
      { key: 'message', ask: 'Anything we should know? (or press Skip)', optional: true },
    ],
  },
  installation: {
    title: 'Book an installation',
    type: 'installation',
    steps: [
      { key: 'equipment', ask: 'Which equipment are we installing?' },
      { key: 'location', ask: 'Where will it be installed? (department or room)' },
      { key: 'order', ask: 'Your order or invoice number, if you have it (or press Skip)', optional: true },
    ],
  },
  demo: {
    title: 'Arrange a demonstration',
    type: 'assistance',
    topic: 'demo',
    steps: [
      { key: 'equipment', ask: 'Which equipment would you like to see? (or press Skip)', optional: true },
      { key: 'message', ask: 'When would suit you, and anything else we should know?' },
    ],
  },
};
/** Every request ends with who to call back. */
const caller: Step[] = [
  { key: 'facility', ask: 'Which hospital or laboratory are you with?' },
  { key: 'name', ask: 'And your name?' },
  { key: 'phone', ask: 'Which phone number should our team call you on?', kind: 'phone' },
];

const menu: Choice[] = [
  { label: 'Report a faulty machine', value: 'flow:fault' },
  { label: 'Book maintenance', value: 'flow:maintenance' },
  { label: 'Book an installation', value: 'flow:installation' },
  { label: 'Arrange a demonstration', value: 'flow:demo' },
  { label: 'Prices & buying', value: 'topic:price' },
  { label: 'Branches & contacts', value: 'topic:branches' },
  { label: 'Talk to a person', value: 'topic:person' },
];

const has = (t: string, ...words: string[]) => words.some((w) => new RegExp(`\\b${w}`, 'i').test(t));

export function SupportChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const site = useSite();
  const { contact, branches, faqs } = site;
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: 'Hello! I’m the Flokefama assistant. I can send a request to our support desk, or help you find what you need. What can I do for you?' },
  ]);
  const [choices, setChoices] = useState<Choice[]>(menu);
  const [flow, setFlow] = useState<{ id: Flow; step: number; data: Partial<SupportInput> } | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => end.current?.scrollIntoView({ block: 'end' }), [msgs, choices]);
  useEffect(() => {
    if (open) setTimeout(() => field.current?.focus(), 250);
  }, [open]);

  const say = (...m: Msg[]) => setMsgs((x) => [...x, ...m]);
  const steps = (f: Flow) => [...flows[f].steps, ...caller];

  const ask = (f: Flow, i: number) => {
    const s = steps(f)[i];
    say({ from: 'bot', text: s.ask });
    setChoices([...(s.choices ?? []), ...(s.optional ? [{ label: 'Skip', value: 'skip' }] : []), { label: 'Cancel', value: 'cancel' }]);
  };

  const start = (f: Flow) => {
    track('chat_request_start', { kind: f });
    setFlow({ id: f, step: 0, data: { type: flows[f].type, topic: flows[f].topic ?? '' } });
    say({ from: 'bot', text: `${flows[f].title}: I’ll ask a few short questions, then pass it straight to our support desk.` });
    ask(f, 0);
  };

  const send = async (f: Flow, data: Partial<SupportInput>) => {
    const parsed = supportSchema.safeParse({ ...data, website: '' });
    if (!parsed.success) {
      say({ from: 'bot', text: 'Something in the details didn’t look right. Let’s try again from the start.' });
      setFlow(null);
      setChoices(menu);
      return;
    }
    setBusy(true);
    say({ from: 'bot', text: 'Sending it to our support desk…' });
    try {
      const res = await fetch('/api/support', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean; reference?: string; error?: string };
      if (res.ok && json.delivered) {
        track('chat_request_sent', { kind: f });
        say({
          from: 'bot',
          text: `Done. Our team will call ${parsed.data.name} on ${parsed.data.phone} shortly.${json.reference ? ` Your reference is ${json.reference}.` : ''}${f === 'fault' && parsed.data.working === 'down' ? ' As the equipment is not working at all, it has been marked urgent.' : ''}`,
          links: [{ label: 'Follow it in the client portal', href: '/login' }],
        });
      } else {
        say({ from: 'bot', text: json.error ?? 'I couldn’t send it just now.', links: [{ label: `Call ${contact.phone}`, href: contact.phoneHref }, { label: 'Send it on WhatsApp', href: whatsapp(summary(f, parsed.data)) }] });
      }
    } catch {
      say({ from: 'bot', text: 'The connection dropped.', links: [{ label: `Call ${contact.phone}`, href: contact.phoneHref }, { label: 'Send it on WhatsApp', href: whatsapp(summary(f, parsed.data)) }] });
    }
    setBusy(false);
    setFlow(null);
    setChoices([{ label: 'Something else', value: 'menu' }]);
  };

  const whatsapp = (text: string) => `${contact.whatsapp}?text=${encodeURIComponent(text)}`;
  const summary = (f: Flow, d: Partial<SupportInput>) =>
    [`Hello Flokefama, ${flows[f].title.toLowerCase()}:`, d.equipment && `Equipment: ${d.equipment}`, d.message && `Details: ${d.message}`, d.location && `Location: ${d.location}`, d.facility && `Hospital/lab: ${d.facility}`, d.name && `Name: ${d.name}`, d.phone && `Phone: ${d.phone}`]
      .filter(Boolean)
      .join('\n');

  /** An answer from the site's own content, or null when the assistant can't tell what is meant. */
  const answer = (t: string): Msg | 'menu' | Flow | null => {
    if (has(t, 'fault', 'broken', 'not working', 'faulty', 'repair', 'error', 'down', 'spoil', 'stopped')) return 'fault';
    if (has(t, 'maintenance', 'servic', 'calibrat', 'preventive')) return 'maintenance';
    if (has(t, 'install', 'commission', 'setup', 'set up')) return 'installation';
    if (has(t, 'demo', 'demonstration', 'training', 'train')) return 'demo';
    if (has(t, 'price', 'cost', 'quote', 'quotation', 'buy', 'purchase', 'order', 'pay', 'how much'))
      return { from: 'bot', text: 'Prices depend on the model, quantity and service package, so our sales team confirms every price. Add products to your cart (or press “Order now” on a product) and send the order; a specialist replies within one business day.', links: [{ label: 'Browse the products', href: '/products' }, { label: 'Ask sales on WhatsApp', href: whatsapp('Hello Flokefama, I would like a price for: ') }] };
    if (has(t, 'branch', 'where', 'location', 'address', 'office', 'direction', 'kumasi', 'aflao', 'techiman', 'okaishie', 'korle'))
      return { from: 'bot', text: `Our head office is at ${contact.address}. Branches: ${branches.map((b) => `${b.name}${b.phone ? ` (${b.phone})` : ''}`).join(', ')}.`, links: [{ label: 'Branches and directions', href: '/about#branches' }] };
    if (has(t, 'track', 'status', 'reference', 'portal', 'login', 'sign in', 'account', 'certificate'))
      return { from: 'bot', text: 'Hospitals follow their requests, engineer visits and calibration certificates in the client portal. Register your hospital there if you haven’t yet.', links: [{ label: 'Open the client portal', href: '/login' }] };
    if (has(t, 'hour', 'open', 'time', 'weekend', 'night', '24'))
      return { from: 'bot', text: `Our support line answers 24/7: ${contact.phone}. Requests sent here reach the support desk straight away, day or night.`, links: [{ label: `Call ${contact.phone}`, href: contact.phoneHref }] };
    if (has(t, 'phone', 'call', 'email', 'contact', 'number', 'reach', 'whatsapp'))
      return { from: 'bot', text: `Call or WhatsApp ${contact.phone}. Email: support ${contact.support}, sales ${contact.sales}, general ${contact.info}.`, links: [{ label: `Call ${contact.phone}`, href: contact.phoneHref }, { label: 'WhatsApp us', href: whatsapp('Hello Flokefama, ') }] };
    if (has(t, 'job', 'career', 'vacanc', 'intern', 'cv', 'employ'))
      return { from: 'bot', text: `For careers and internships, send your CV to ${contact.info}.`, links: [{ label: `Email ${contact.info}`, href: `mailto:${contact.info}` }] };
    if (has(t, 'person', 'human', 'agent', 'someone', 'staff')) return 'menu';
    // The buying FAQ: the question sharing the most words with what was asked
    const words = t.toLowerCase().match(/[a-z]{4,}/g) ?? [];
    const best = faqs
      .map((f) => ({ f, score: words.filter((w) => f.q.toLowerCase().includes(w) || f.a.toLowerCase().includes(w)).length }))
      .sort((a, b) => b.score - a.score)[0];
    if (best && best.score >= 2) return { from: 'bot', text: best.f.a, links: best.f.link ? [{ label: best.f.link.label, href: best.f.link.href }] : undefined };
    return null;
  };

  const person = () =>
    say({
      from: 'bot',
      text: `Our team is a message or a call away, 24/7.`,
      links: [{ label: 'WhatsApp us', href: whatsapp(`Hello Flokefama, ${msgs.filter((m) => m.from === 'you').map((m) => m.text).slice(-3).join(' / ')}`) }, { label: `Call ${contact.phone}`, href: contact.phoneHref }, { label: `Email ${contact.support}`, href: `mailto:${contact.support}` }],
    });

  const handle = (raw: string, label = raw) => {
    const text = raw.trim();
    if (!text || busy) return;
    say({ from: 'you', text: label });
    setInput('');
    if (text === 'cancel') {
      setFlow(null);
      setChoices(menu);
      say({ from: 'bot', text: 'No problem. Anything else I can help with?' });
      return;
    }
    if (text === 'menu') {
      setChoices(menu);
      say({ from: 'bot', text: 'What can I do for you?' });
      return;
    }
    // Inside a request: this is the answer to the current question
    if (flow) {
      const all = steps(flow.id);
      const s = all[flow.step];
      let value = text === 'skip' && s.optional ? '' : text;
      if (s.choices && !s.choices.some((c) => c.value === value)) {
        const match = s.choices.find((c) => c.label.toLowerCase().startsWith(value.toLowerCase().slice(0, 3)));
        if (!match) return ask(flow.id, flow.step);
        value = match.value;
      }
      if (s.kind === 'phone' && !/^[+\d][\d\s()-]{6,}$/.test(value)) {
        say({ from: 'bot', text: 'That doesn’t look like a phone number. Please type it again, for example 024 123 4567.' });
        return;
      }
      if (!s.optional && value.length < 2) return ask(flow.id, flow.step);
      if (s.key === 'message' && !s.optional && value.length < 5) {
        say({ from: 'bot', text: 'A few more words would help our engineers.' });
        return;
      }
      const data = { ...flow.data, [s.key]: value };
      if (flow.step + 1 < all.length) {
        setFlow({ ...flow, step: flow.step + 1, data });
        ask(flow.id, flow.step + 1);
      } else {
        setChoices([]);
        void send(flow.id, data);
      }
      return;
    }
    if (text.startsWith('flow:')) return start(text.slice(5) as Flow);
    if (text === 'topic:price') return handle('price', 'Prices & buying');
    if (text === 'topic:branches') return handle('branches', 'Branches & contacts');
    if (text === 'topic:person') return person();
    const a = answer(text);
    if (a === 'menu') return person();
    if (typeof a === 'string') return start(a);
    if (a) {
      say(a);
      setChoices([{ label: 'Something else', value: 'menu' }, { label: 'Talk to a person', value: 'topic:person' }]);
      return;
    }
    say({ from: 'bot', text: 'I’m not sure I understood. Choose one of these, or talk to a person.' });
    setChoices(menu);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Chat with Flokefama"
          className="flex h-[min(560px,calc(100svh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_30px_60px_-20px_rgb(11_21_16/0.45)]"
        >
          <div className="flex items-center justify-between gap-3 bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_100%)] px-5 py-4 text-white">
            <div>
              <p className="font-semibold">Flokefama assistant</p>
              <p className="text-xs text-white/75">Support desk · answers 24/7</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close the chat" className="grid size-9 place-items-center rounded-full hover:bg-white/10">
              <Icon name="fi-rr-cross-small" className="text-xl" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={cn('flex', m.from === 'you' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[0.9375rem] leading-relaxed', m.from === 'you' ? 'rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-mist text-ink')}>
                  {m.text}
                  {m.links && (
                    <span className="mt-2 flex flex-col gap-1">
                      {m.links.map((l) =>
                        l.href.startsWith('/') ? (
                          <Link key={l.href + l.label} href={l.href} onClick={onClose} className="font-semibold text-brand-700 underline underline-offset-2">{l.label}</Link>
                        ) : (
                          <a key={l.href + l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="font-semibold text-brand-700 underline underline-offset-2">{l.label}</a>
                        ),
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {choices.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {choices.map((c) => (
                  <button key={c.value} type="button" disabled={busy} onClick={() => handle(c.value, c.label)} className="rounded-full border border-brand-600/40 bg-paper px-3 py-1.5 text-sm font-medium text-brand-800 transition hover:bg-brand-50 disabled:opacity-50">
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={end} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handle(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <label htmlFor="chat-input" className="sr-only">Your message</label>
            <input
              ref={field}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={flow && steps(flow.id)[flow.step]?.key === 'message' ? 2000 : 160}
              autoComplete={flow ? ({ name: 'name', phone: 'tel', facility: 'organization' } as Record<string, string>)[steps(flow.id)[flow.step]?.key] ?? 'off' : 'off'}
              inputMode={flow && steps(flow.id)[flow.step]?.kind === 'phone' ? 'tel' : undefined}
              placeholder="Type a message…"
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-[0.9375rem] outline-none focus:border-brand-600"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-700 text-white transition hover:bg-brand-800 disabled:opacity-50">
              <Icon name="fi-rr-paper-plane" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
