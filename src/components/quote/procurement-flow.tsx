'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { track } from '@/lib/analytics';
import { composeLinks } from '@/lib/compose';
import { quoteList } from '@/lib/quote-list';
import { departments, quoteSchema, timelines, type QuoteInput } from '@/lib/quote-schema';
import { cn } from '@/lib/utils';

type Option = { slug: string; label: string; group: string };
/** The machine the visitor came from ("Request a quote" on a product page). */

const steps: { title: string; hint: string; fields: FieldPath<QuoteInput>[] }[] = [
  { title: 'Your department', hint: 'Who is this equipment for?', fields: ['intent', 'department'] },
  { title: 'Equipment', hint: 'Select everything you need. Add anything missing below.', fields: ['equipment'] },
  { title: 'Timeline', hint: 'When does it need to be installed?', fields: ['timeline'] },
  { title: 'Your details', hint: 'A specialist replies within one business day.', fields: ['name', 'facility', 'phone', 'email'] },
  { title: 'Review', hint: 'Check everything before sending.', fields: [] },
];

export function ProcurementFlow({ options, initial }: { options: Option[]; initial: Partial<QuoteInput> }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [custom, setCustom] = useState('');
  const [find, setFind] = useState('');
  const [done, setDone] = useState<{ reference: string; delivered: boolean; data: QuoteInput } | null>(null);

  const form = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: 'onTouched',
    defaultValues: { intent: 'quote', equipment: [], role: '', notes: '', website: '', ...initial },
  });
  const { register, watch, setValue, trigger, handleSubmit, formState } = form;
  const values = watch();
  const errors = formState.errors;

  const go = async (next: number) => {
    if (next > step && !(await trigger(steps[step].fields))) return;
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const toggle = (label: string) => {
    const set = new Set(values.equipment);
    if (set.has(label)) set.delete(label);
    else set.add(label);
    setValue('equipment', [...set], { shouldValidate: formState.isSubmitted });
  };

  const submit = handleSubmit(async (data) => {
    const res = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = (await res.json().catch(() => ({}))) as { reference?: string; delivered?: boolean; error?: string };
    if (!res.ok || !json.reference) {
      toast.error('We couldn’t send your request', { description: json.error ?? `Please try again, or call ${contact.phone}.` });
      return;
    }
    setDone({ reference: json.reference, delivered: json.delivered === true, data });
    track(data.intent === 'demo' ? 'demo_submitted' : 'quote_submitted', { items: data.equipment.length, department: data.department, delivered: json.delivered === true });
    quoteList.clear(); // the list has been sent
    if (json.delivered) toast.success(data.intent === 'demo' ? 'Demonstration request received' : 'Quote request received', { description: `Reference ${json.reference}. A specialist will contact you shortly.` });
  });

  if (done) {
    const { reference, delivered, data } = done;
    const label = data.intent === 'demo' ? 'Demonstration request' : 'Quote request';
    const send = composeLinks({
      to: contact.sales,
      subject: `${label} ${reference}: ${data.facility}`,
      body: [
        `Reference: ${reference}`,
        `Department: ${departments.find((d) => d.id === data.department)?.label ?? data.department}`,
        `Equipment: ${data.equipment.join(', ')}`,
        `Timeline: ${timelines.find((t) => t.id === data.timeline)?.label ?? data.timeline}`,
        data.notes ? `Notes: ${data.notes}` : null,
        '',
        `${data.name}${data.role ? `, ${data.role}` : ''}`,
        data.facility,
        `${data.phone} · ${data.email}`,
      ].filter((l) => l !== null).join('\n'),
    });
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-5xl border border-line bg-paper p-10 text-center md:p-16">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }} className="mx-auto grid size-20 place-items-center rounded-full bg-brand-600 text-3xl text-white shadow-[0_20px_40px_-15px_rgb(37_120_71/0.8)]">
          <Icon name={delivered ? 'fi-rr-check' : 'fi-rr-paper-plane'} />
        </motion.span>
        {delivered ? (
          <>
            <h2 className="display mt-8 text-4xl">Request received.</h2>
            <p className="mx-auto mt-4 max-w-md font-light text-ink-3">
              Your reference is <strong className="font-semibold text-ink">{reference}</strong>. A Flokefama specialist will contact you within one business day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline"><Link href="/products">Back to shop</Link></Button>
              <Button asChild><Link href="/">Home</Link></Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="display mt-8 text-4xl">One last step.</h2>
            <p className="mx-auto mt-4 max-w-md font-light text-ink-3">
              Your request <strong className="font-semibold text-ink">{reference}</strong> is ready. Send it to our sales team by email or WhatsApp. Everything is filled in for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg"><a href={send.email}><Icon name="fi-rr-envelope" /> Send by email</a></Button>
              <Button asChild size="lg" variant="outline"><a href={send.whatsapp} target="_blank" rel="noopener noreferrer"><Icon name="fi-brands-whatsapp" /> Send on WhatsApp</a></Button>
            </div>
            <p className="mt-6 text-sm text-ink-3">Or call us on <a href={contact.phoneHref} className="font-medium text-brand-700 hover:underline">{contact.phone}</a></p>
          </>
        )}
      </motion.div>
    );
  }

  const progress = ((step + 1) / steps.length) * 100;
  const q = find.trim().toLowerCase();
  const shown = q ? options.filter((o) => `${o.label} ${o.group}`.toLowerCase().includes(q)) : options;
  const groups = [...new Set(shown.map((o) => o.group))];

  return (
    <form
      onSubmit={(e) => {
        // Enter on an earlier step advances instead of submitting early.
        if (step < steps.length - 1) {
          e.preventDefault();
          void go(step + 1);
        } else void submit(e);
      }}
      noValidate className="overflow-hidden rounded-5xl border border-line bg-paper shadow-[0_40px_80px_-40px_rgb(11_21_16/0.25)]">
      {/* Progress */}
      <div className="border-b border-line p-6 md:px-10">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium text-ink">{steps[step].title}</p>
          <p className="label">Step {step + 1} / {steps.length}</p>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progress">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>

      <div className="relative min-h-[420px] p-6 md:p-10">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.fieldset
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <legend className="sr-only">{steps[step].title}</legend>
            <p className="mb-6 text-ink-3">{steps[step].hint}</p>

            {step === 0 && (
              <div className="space-y-8">
                <div className="inline-flex rounded-full bg-mist p-1" role="radiogroup" aria-label="Request type">
                  {(['quote', 'demo'] as const).map((intent) => (
                    <button
                      key={intent}
                      type="button"
                      role="radio"
                      aria-checked={values.intent === intent}
                      onClick={() => setValue('intent', intent)}
                      className={cn('relative rounded-full px-5 py-2.5 text-sm font-medium', values.intent === intent ? 'text-white' : 'text-ink-3')}
                    >
                      {values.intent === intent && <motion.span layoutId="intent-pill" className="absolute inset-0 rounded-full bg-midnight" />}
                      <span className="relative">{intent === 'quote' ? 'Request a quote' : 'Schedule a demonstration'}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3" role="radiogroup" aria-label="Department">
                  {departments.map((d) => {
                    const active = values.department === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setValue('department', d.id, { shouldValidate: true })}
                        className={cn(
                          'flex flex-col items-start gap-6 rounded-3xl border p-5 text-left transition-all duration-500 ease-out-expo',
                          active ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_4px_var(--color-brand-100)]' : 'border-line hover:border-ink/20',
                        )}
                      >
                        <Icon name={d.icon} className={cn('text-2xl', active ? 'text-brand-600' : 'text-ink-3')} />
                        <span className="font-medium text-ink">{d.label}</span>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.department?.message} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                {values.equipment.length > 0 && (
                  <div className="rounded-3xl bg-canvas p-4">
                    <p className="label mb-3">Selected ({values.equipment.length})</p>
                    <ul className="flex flex-wrap gap-2">
                      {values.equipment.map((e) => (
                        <li key={e}>
                          <button type="button" onClick={() => toggle(e)} aria-label={`Remove ${e}`} className="inline-flex items-center gap-1.5 rounded-full bg-midnight px-3.5 py-1.5 text-sm text-white">
                            {e} <Icon name="fi-rr-cross-small" className="text-white/60" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <label className="relative block">
                  <span className="sr-only">Find equipment</span>
                  <Icon name="fi-rr-search" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
                  <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find equipment, e.g. analyser, monitor, autoclave" className="h-11 w-full rounded-full border border-line bg-paper pl-11 pr-4 text-sm outline-none focus:border-brand-500" />
                </label>
                {groups.length === 0 && <p className="text-sm text-ink-3">Nothing matches “{find}”. Add it below and we’ll source it.</p>}
                {groups.map((g) => (
                  <div key={g}>
                    <p className="label mb-3">{g}</p>
                    <div className="flex flex-wrap gap-2">
                      {shown.filter((o) => o.group === g).map((o) => {
                        const active = values.equipment.includes(o.label);
                        return (
                          <motion.button
                            key={o.slug}
                            type="button"
                            layout
                            aria-pressed={active}
                            onClick={() => toggle(o.label)}
                            className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors', active ? 'border-midnight bg-midnight text-white' : 'border-line bg-paper text-ink-2 hover:border-ink/30')}
                          >
                            {active && <Icon name="fi-rr-check" className="text-brand-300" />}
                            {o.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Something else? e.g. Ultrasound machine" className="h-11 flex-1 rounded-full border border-line bg-canvas px-4 text-sm outline-none focus:border-brand-500" aria-label="Add other equipment" />
                  <Button type="button" variant="outline" size="sm" className="h-11" onClick={() => { if (custom.trim()) { toggle(custom.trim()); setCustom(''); } }}>
                    Add
                  </Button>
                </div>
                {values.equipment.filter((e) => !options.some((o) => o.label === e)).length > 0 && (
                  <p className="text-sm text-ink-3">Also requested: {values.equipment.filter((e) => !options.some((o) => o.label === e)).join(', ')}</p>
                )}
                <FieldError message={errors.equipment?.message} />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Timeline">
                {timelines.map((t) => {
                  const active = values.timeline === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setValue('timeline', t.id, { shouldValidate: true })}
                      className={cn('rounded-3xl border p-6 text-left transition-all duration-500', active ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_4px_var(--color-brand-100)]' : 'border-line hover:border-ink/20')}
                    >
                      <Icon name="fi-rr-calendar" className={cn('text-xl', active ? 'text-brand-600' : 'text-ink-3')} />
                      <p className="mt-8 text-lg font-semibold text-ink">{t.label}</p>
                      <p className="text-sm text-ink-3">{t.detail}</p>
                    </button>
                  );
                })}
                <div className="md:col-span-3"><FieldError message={errors.timeline?.message} /></div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" error={errors.name?.message}><input {...register('name')} autoComplete="name" className={inputCls} /></Field>
                <Field label="Role (optional)"><input {...register('role')} autoComplete="organization-title" placeholder="e.g. Lab manager" className={inputCls} /></Field>
                <Field label="Facility" error={errors.facility?.message} className="md:col-span-2"><input {...register('facility')} autoComplete="organization" className={inputCls} /></Field>
                <Field label="Phone" error={errors.phone?.message}><input {...register('phone')} type="tel" autoComplete="tel" placeholder="+233" className={inputCls} /></Field>
                <Field label="Email" error={errors.email?.message}><input {...register('email')} type="email" autoComplete="email" className={inputCls} /></Field>
                <Field label="Anything else? (optional)" className="md:col-span-2"><textarea {...register('notes')} rows={3} className={cn(inputCls, 'h-auto py-3')} /></Field>
                <input {...register('website')} tabIndex={-1} autoComplete="off" className="absolute left-[-9999px]" aria-hidden />
              </div>
            )}

            {step === 4 && (
              <dl className="divide-y divide-line rounded-3xl border border-line">
                {[
                  ['Request', values.intent === 'demo' ? 'Equipment demonstration' : 'Quotation'],
                  ['Department', departments.find((d) => d.id === values.department)?.label],
                  ['Equipment', values.equipment.join(', ')],
                  ['Timeline', timelines.find((t) => t.id === values.timeline)?.label],
                  ['Contact', `${values.name}${values.role ? `, ${values.role}` : ''} · ${values.facility}`],
                  ['Reach me at', `${values.phone} · ${values.email}`],
                ].map(([k, v]) => (
                  <div key={k} className="grid gap-1 px-5 py-4 text-sm md:grid-cols-[180px_1fr]">
                    <dt className="text-ink-3">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </motion.fieldset>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-line p-6 md:px-10">
        <Button type="button" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          <Icon name="fi-rr-arrow-small-left" /> Back
        </Button>
        {step < steps.length - 1 ? (
          // Distinct keys: React must swap the element, not flip type="button" → "submit" mid-click.
          <Button key="next" type="button" onClick={() => go(step + 1)}>
            Continue <Icon name="fi-rr-arrow-small-right" />
          </Button>
        ) : (
          <Button key="submit" type="submit" variant="glow" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Sending…' : values.intent === 'demo' ? 'Request demonstration' : 'Send quote request'}
          </Button>
        )}
      </div>
    </form>
  );
}

const inputCls = 'h-12 w-full rounded-2xl border border-line bg-canvas px-4 text-[15px] text-ink outline-none transition focus:border-brand-500 focus:bg-paper focus:ring-4 focus:ring-brand-100';

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('grid gap-1.5 text-sm font-medium text-ink', className)}>
      {label}
      {children}
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="text-xs font-normal text-signal-700">
          {message}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
