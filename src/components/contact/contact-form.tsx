'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { composeLinks } from '@/lib/compose';
import { contactSchema, topics, type ContactInput } from '@/lib/contact-schema';
import { cn } from '@/lib/utils';

type Errors = Partial<Record<keyof ContactInput, string>>;
type Result = { delivered: boolean; data: ContactInput } | null;

const field =
  'h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-brand-400 focus:bg-white/[0.07] focus:ring-4 focus:ring-brand-500/20 aria-[invalid=true]:border-signal/60';

/**
 * Get in touch: delivered to the CRM when it is connected; otherwise the visitor sends the
 * same message, pre-filled, by email (to the right inbox for the topic) or WhatsApp.
 */
export function ContactForm() {
  const [topic, setTopic] = useState<ContactInput['topic']>('sales');
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = contactSchema.safeParse({ ...raw, topic });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof ContactInput] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error);
      setResult({ delivered: json.delivered === true, data: parsed.data });
      if (json.delivered) toast.success('Message sent', { description: 'Our team will get back to you shortly.' });
    } catch (error) {
      toast.error('We couldn’t send your message', { description: (error as Error).message || `Please call ${contact.phone}.` });
    } finally {
      setPending(false);
    }
  }

  if (result) return <Sent {...result} onReset={() => setResult(null)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <fieldset>
        <legend className="font-mono text-[11px] uppercase tracking-widest text-white/50">I’d like to talk about</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {topics.map((t) => (
            <label
              key={t.id}
              className={cn(
                'relative flex h-12 cursor-pointer items-center justify-center rounded-xl border text-sm transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/30',
                topic === t.id ? 'border-brand-400/60 bg-brand-500/15 text-white' : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white',
              )}
            >
              <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} className="sr-only" />
              {topic === t.id && <motion.span layoutId="topic-dot" className="absolute left-3 size-1.5 rounded-full bg-brand-400" aria-hidden />}
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>
          <input name="name" autoComplete="name" placeholder="Dr. Ama Mensah" aria-invalid={!!errors.name} className={field} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+233 …" aria-invalid={!!errors.phone} className={field} />
        </Field>
      </div>
      <Field label="Email (optional)" error={errors.email}>
        <input name="email" type="email" autoComplete="email" placeholder="you@hospital.org" aria-invalid={!!errors.email} className={field} />
      </Field>
      <Field label="Message" error={errors.message}>
        <textarea name="message" rows={4} placeholder="How can we help your facility?" aria-invalid={!!errors.message} className={cn(field, 'h-auto resize-none py-3')} />
      </Field>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button
        type="submit"
        disabled={pending}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgb(46_154_91/0.8)] transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send message'} {!pending && <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-1" />}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">{label}</span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="flex items-center gap-2 text-xs text-white/80">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden /> {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

function Sent({ delivered, data, onReset }: NonNullable<Result> & { onReset: () => void }) {
  const t = topics.find((x) => x.id === data.topic)!;
  const send = composeLinks({
    to: t.inbox,
    subject: `${t.label}: ${data.name}`,
    body: [data.message, '', data.name, data.phone, data.email].filter((l) => l !== undefined && l !== null).join('\n').trim(),
  });
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-2xl text-white shadow-[0_20px_40px_-15px_rgb(46_154_91/0.9)]">
        <Icon name={delivered ? 'fi-rr-check' : 'fi-rr-paper-plane'} />
      </span>
      {delivered ? (
        <>
          <p className="mt-6 text-2xl font-bold tracking-[-0.02em] text-white">Message sent.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">Thank you, {data.name.split(' ')[0]}. Our team will get back to you shortly.</p>
        </>
      ) : (
        <>
          <p className="mt-6 text-2xl font-bold tracking-[-0.02em] text-white">One last step.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">Your message is ready. Send it by email to {t.inbox} or on WhatsApp. Everything is filled in.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={send.email} className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 text-[15px] font-medium text-white transition hover:bg-brand-700">
              <Icon name="fi-rr-envelope" /> Send by email
            </a>
            <a href={send.whatsapp} target="_blank" rel="noopener noreferrer" className="glass inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-medium text-white transition hover:bg-white/10">
              <Icon name="fi-brands-whatsapp" /> Send on WhatsApp
            </a>
          </div>
        </>
      )}
      <button type="button" onClick={onReset} className="mt-6 text-sm text-white/45 underline-offset-4 hover:text-white hover:underline">
        Write another message
      </button>
    </motion.div>
  );
}
