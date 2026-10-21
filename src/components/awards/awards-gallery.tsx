import { AwardsEditorial, AwardsFilmstripSection, AwardsPodium, AwardsSticky } from '@/components/awards/awards-layouts';
import { getSite } from '@/lib/site';

const layouts = { editorial: AwardsEditorial, filmstrip: AwardsFilmstripSection, sticky: AwardsSticky, podium: AwardsPodium };
export type AwardsLayout = keyof typeof layouts;

/** Switch with NEXT_PUBLIC_AWARDS_LAYOUT=filmstrip (or sticky, podium) in Vercel, then redeploy; editorial is the default. */
const chosen = process.env.NEXT_PUBLIC_AWARDS_LAYOUT as AwardsLayout | undefined;

/** The actual awards, photographed: the No.1 healthcare ranking leads. */
export async function AwardsGallery({ layout }: { layout?: AwardsLayout }) {
  const { awards } = await getSite();
  const Layout = layouts[layout ?? (chosen && chosen in layouts ? chosen : 'editorial')];
  return <Layout awards={awards} />;
}
