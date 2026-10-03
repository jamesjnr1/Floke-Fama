import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * Home: in-vitro diagnostics as four equal cards, all readable at a glance.
 * Every product named here is in the current flokefama.com catalogue. Photos: Mindray's official
 * BC-5150 and BA-88A images, Evident's (Olympus) CX23 image, and Flokefama's own specialists at a
 * client lab (Media Centre).
 */
type Area = {
  name: string;
  title: string;
  body: string;
  image: {
    src: string;
    alt: string;
    /** `cover` fills the frame (photos); `contain` floats a cut-out product on the studio background. */
    fit: "cover" | "contain";
    position?: string;
    /** Wide photos cropped into the frame need a larger source than the card width. */
    sizes?: string;
  };
};

const areas: Area[] = [
  {
    name: "Haematology",
    title: "Complete blood counts, from clinic to teaching hospital.",
    body: "Mindray BC-5150, BC-3000plus, BC-30s and BC-20s haematology analysers.",
    image: {
      src: "/images/diagnostics-bc5150.webp",
      alt: "A laboratory scientist using a Mindray BC-5150 haematology analyser",
      fit: "cover",
      position: "58% 50%",
      sizes: "(min-width: 1024px) 640px, 100vw",
    },
  },
  {
    name: "Clinical chemistry",
    title: "Chemistry with matched reagents.",
    body: "Mindray semi-automated chemistry analysers, BS-230 cuvettes, reagents and controls.",
    image: {
      src: "/images/diagnostics-ba88a.webp",
      alt: "Mindray BA-88A semi-automated chemistry analyser",
      fit: "cover",
      position: "50% 55%",
    },
  },
  {
    name: "Urinalysis & microscopy",
    title: "The everyday tests, done right.",
    body: "UA-66 urine analysers and Olympus CX23 clinical microscopes.",
    image: {
      src: "/images/diagnostics-cx23.webp",
      alt: "Olympus CX23 clinical microscope",
      fit: "contain",
    },
  },
  {
    name: "Installed & supported",
    title: "Calibrated on day one. Supported every day after.",
    body: "Installation, calibration, preventive maintenance and training from engineers across six branches.",
    image: {
      src: "/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-2.webp",
      alt: "Flokefama specialists with laboratory staff at a client facility",
      fit: "cover",
      position: "50% 40%",
    },
  },
];

export function Diagnostics() {
  return (
    <section
      aria-labelledby="diagnostics-title"
      className="border-y border-line bg-paper py-16 md:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-5 md:px-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="label !text-brand-700">
            In-vitro diagnostics · Official Mindray distributor
          </p>
          <h2
            id="diagnostics-title"
            className="display mt-4 text-[clamp(2.25rem,1.3rem+3vw,3.75rem)] text-ink"
          >
            Diagnostics you can trust.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">
            Analysers, reagents and the engineers who keep them running, for
            laboratories across Ghana.
          </p>
        </Reveal>

        <ul className="swipe-row mt-10 md:mt-14 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {areas.map((area, i) => (
            <li key={area.name}>
              <Reveal delay={0.06 * i} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-canvas">
                  {/* One studio-grey stage for every image, so product cut-outs and photos read as a set */}
                  <div className="relative aspect-[4/3] bg-[linear-gradient(180deg,#f4f6f5_0%,#e3e8e5_100%)]">
                    <Image
                      src={area.image.src}
                      alt={area.image.alt}
                      fill
                      sizes={
                        area.image.sizes ??
                        "(min-width: 1024px) 300px, (min-width: 768px) 50vw, 84vw"
                      }
                      className={
                        area.image.fit === "cover"
                          ? "object-cover"
                          : "object-contain p-[9%] mix-blend-multiply"
                      }
                      style={
                        area.image.position
                          ? { objectPosition: area.image.position }
                          : undefined
                      }
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm font-semibold tracking-wide text-brand-700">
                      {String(i + 1).padStart(2, "0")} · {area.name}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-ink">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-3">
                      {area.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center md:mt-12">
          <Button asChild>
            <Link href="/products?category=in-vitro-diagnostics">
              Explore diagnostics <Icon name="fi-rr-arrow-small-right" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
