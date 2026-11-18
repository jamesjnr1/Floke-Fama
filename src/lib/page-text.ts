/**
 * Wording on the public pages that staff edit in the Studio (Site content → Home, About, Support, CSR, Footer). Every
 * field starts as the website's own wording (below): a field left empty in the Studio keeps it, so the site never shows
 * a blank. Text marked **like this** is shown in bold (see components/ui/rich.tsx).
 */
export type TextItem = { title: string; text: string };
export type IconItem = TextItem & { icon: string };
export type CsrProjectText = { label?: string; title?: string; text?: string };

export interface PageText {
  home: {
    highlightValue: string;
    highlightLabel: string;
    whatWeDoTitle: string;
    whatWeDoBody: string;
    videoTitle: string;
    videoLead: string;
    purposeTitle: string;
    purposeLead: string;
    ctaTitle: string;
    ctaLead: string;
  };
  about: { introTitle: string; introParagraphs: string[]; officeCaption: string; valuesTitle: string; valuesLead: string };
  support: {
    callKicker: string;
    callTitle: string;
    callPoints: TextItem[];
    helplineLabel: string;
    servicesTitle: string;
    servicesLead: string;
    featuredService: TextItem;
    services: IconItem[];
  };
  /** CSR: only what the Studio sets; the rest comes from data/csr.ts. */
  csr: {
    introTitle: string;
    introLead: string;
    commitments?: (IconItem & { label: string })[];
    forbes?: { label?: string; title?: string; points?: TextItem[] };
    projects: Record<string, CsrProjectText>;
  };
  footer: { statement: string; tagline: string; honours: string };
}

export const defaultPageText: PageText = {
  home: {
    highlightValue: 'No.1',
    highlightLabel: 'Healthcare sector, Ghana Club 100',
    whatWeDoTitle: 'At Flokefama Limited, we go beyond just supplying medical equipment',
    whatWeDoBody:
      'We offer a **comprehensive range of services** designed to ensure **efficiency, reliability, and long-term value** for healthcare facilities. Our expert team provides **end-to-end solutions**, from procurement and installation to training and maintenance, ensuring that our clients get the most out of their investment.',
    videoTitle: 'Healthcare Solutions in Action',
    videoLead: 'From our laboratories and warehouse in Accra to hospitals across Ghana and West Africa: see how Flokefama supplies, installs and maintains the equipment that keeps care running.',
    purposeTitle: 'Why we do what we do',
    purposeLead: 'Saving lives since 2008, and building healthcare capacity in Ghana for the decades ahead.',
    ctaTitle: 'Equip your facility with Ghana’s No.1 healthcare company',
    ctaLead: 'Choose your equipment and our team confirms price and delivery, with installation, training and support included.',
  },
  about: {
    introTitle: 'Redefining healthcare delivery in Ghana and across Africa.',
    introParagraphs: [
      '**FLOKEFAMA LIMITED**, founded in 2008, is a registered company specializing in delivering world-class healthcare equipment across Ghana and West Africa.',
      'With a strong presence in both the private and public sectors, we represent diverse medical equipment manufacturers, bringing innovative technology to our clients and contributing significantly to the development of healthcare in the markets we serve.',
      'As a trusted healthcare solutions provider and a Ghana Club 100 company, we focus on standardization, accessibility, and innovation in healthcare systems.',
    ],
    officeCaption: 'Head office · Santa Maria, Accra',
    valuesTitle: 'The principles that define who we are.',
    valuesLead:
      'At Flokefama Limited, our success is built on a strong foundation of core values that guide every aspect of our operations. These principles define who we are, how we work, and the impact we strive to make in the healthcare industry.',
  },
  support: {
    callKicker: 'Client service · 24/7 call centre',
    callTitle: 'We answer around the clock',
    callPoints: [
      { title: '24/7 dedicated call centre', text: 'Our helpline runs continuously, day and night, for immediate client support and rapid service response.' },
      { title: 'Seamless operational assistance', text: 'Full business coverage from experienced call centre agents committed to excellence.' },
    ],
    helplineLabel: 'Client helpline · open 24/7',
    servicesTitle: 'What we do',
    servicesLead: 'Our engineers look after your equipment from the day it arrives, for as long as you use it.',
    featuredService: { title: 'Installation & calibration', text: 'Every system is installed, commissioned and calibrated by our engineers, and your team is trained to use it before we hand over.' },
    services: [
      { icon: 'fi-rr-shield-check', title: 'Preventive maintenance', text: 'Scheduled servicing and calibration that keep equipment accurate and in peak condition, minimising downtime.' },
      { icon: 'fi-rr-search-alt', title: 'Troubleshooting', text: 'Fast diagnosis by phone, WhatsApp or on site, so faults are understood and resolved quickly.' },
      { icon: 'fi-rr-tool-box', title: 'Repairs & spare parts', text: 'Efficient repairs and genuine spare parts that get equipment back in service.' },
      { icon: 'fi-rr-headset', title: 'Customer assistance', text: 'Ongoing help and training for clinical and laboratory teams, whenever they need it.' },
    ],
  },
  csr: {
    introTitle: 'Giving back to the people behind Ghana’s healthcare',
    introLead: 'Our work does not end with supplying equipment. We invest in hospitals, in the next generation of professionals and in communities.',
    projects: {},
  },
  footer: {
    statement: 'Revolutionizing healthcare practices in Ghana by introducing cutting-edge technologies and solutions that set new standards in medical care and patient safety.',
    tagline: 'Ghana’s No.1 healthcare company.',
    honours: 'Ghana Club 100 · Forbes Africa · Mindray Best in IVD',
  },
};

/** The Studio's raw wording, any field possibly missing or empty. */
type Raw<T> = { [K in keyof T]?: T[K] extends string ? string | null : T[K] extends (infer U)[] ? Partial<U>[] | null : T[K] extends object ? Raw<T[K]> | null : T[K] };

const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
/** A Studio list replaces the built-in one only when it has complete items. */
const items = <T extends Record<string, string>>(v: Partial<T>[] | null | undefined, keys: (keyof T)[], fallback: T[]): T[] => {
  const ok = (v ?? []).filter((x): x is T => Boolean(x) && keys.every((k) => typeof x[k] === 'string' && (x[k] as string).trim().length > 0));
  return ok.length ? ok.map((x) => Object.fromEntries(Object.entries(x).map(([k, val]) => [k, typeof val === 'string' ? val.trim() : val])) as T) : fallback;
};
const fill = <T extends Record<string, string>>(raw: Raw<T> | null | undefined, d: T): T => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, str((raw as Record<string, unknown> | null | undefined)?.[k], v)])) as T;

export type RawPageText = {
  home?: Raw<PageText['home']> | null;
  about?: (Raw<Omit<PageText['about'], 'introParagraphs'>> & { introParagraphs?: (string | null)[] | null }) | null;
  support?: (Raw<Omit<PageText['support'], 'callPoints' | 'services' | 'featuredService'>> & { callPoints?: Partial<TextItem>[] | null; services?: Partial<IconItem>[] | null; featuredService?: Partial<TextItem> | null }) | null;
  csr?: {
    introTitle?: string | null;
    introLead?: string | null;
    commitments?: Partial<IconItem & { label: string }>[] | null;
    forbes?: { label?: string | null; title?: string | null; points?: Partial<TextItem>[] | null } | null;
    projects?: ({ project?: string | null } & { label?: string | null; title?: string | null; text?: string | null })[] | null;
  } | null;
  footer?: Raw<PageText['footer']> | null;
};

/** The wording to show: the Studio's where it set something, the website's own otherwise. */
export function pageText(raw: RawPageText | null | undefined, d: PageText = defaultPageText): PageText {
  const r = raw ?? {};
  const paragraphs = (r.about?.introParagraphs ?? []).filter((p): p is string => typeof p === 'string' && p.trim().length > 0).map((p) => p.trim());
  const sup = r.support ?? {};
  const commitments = items(r.csr?.commitments as Partial<IconItem & { label: string }>[] | null, ['label', 'icon', 'title', 'text'], []);
  const forbesPoints = items(r.csr?.forbes?.points, ['title', 'text'], []);
  const clean = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const projects = Object.fromEntries(
    (r.csr?.projects ?? [])
      .filter((p) => p?.project)
      // Only the fields filled in: an empty one must not blank the page's own wording
      .map((p) => [p.project!, Object.fromEntries((['label', 'title', 'text'] as const).flatMap((k) => (clean(p[k]) ? [[k, clean(p[k])]] : []))) as CsrProjectText] as const),
  );
  return {
    home: fill(r.home, d.home),
    about: {
      ...fill({ introTitle: r.about?.introTitle, officeCaption: r.about?.officeCaption, valuesTitle: r.about?.valuesTitle, valuesLead: r.about?.valuesLead } as never, {
        introTitle: d.about.introTitle,
        officeCaption: d.about.officeCaption,
        valuesTitle: d.about.valuesTitle,
        valuesLead: d.about.valuesLead,
      }),
      introParagraphs: paragraphs.length ? paragraphs : d.about.introParagraphs,
    },
    support: {
      ...fill(
        { callKicker: sup.callKicker, callTitle: sup.callTitle, helplineLabel: sup.helplineLabel, servicesTitle: sup.servicesTitle, servicesLead: sup.servicesLead } as never,
        { callKicker: d.support.callKicker, callTitle: d.support.callTitle, helplineLabel: d.support.helplineLabel, servicesTitle: d.support.servicesTitle, servicesLead: d.support.servicesLead },
      ),
      callPoints: items(sup.callPoints, ['title', 'text'], d.support.callPoints),
      featuredService: fill(sup.featuredService as never, d.support.featuredService),
      services: items(sup.services, ['icon', 'title', 'text'], d.support.services),
    },
    csr: {
      introTitle: str(r.csr?.introTitle, d.csr.introTitle),
      introLead: str(r.csr?.introLead, d.csr.introLead),
      ...(commitments.length ? { commitments } : {}),
      ...(r.csr?.forbes ? { forbes: { label: clean(r.csr.forbes.label), title: clean(r.csr.forbes.title), ...(forbesPoints.length ? { points: forbesPoints } : {}) } } : {}),
      projects,
    },
    footer: fill(r.footer, d.footer),
  };
}
