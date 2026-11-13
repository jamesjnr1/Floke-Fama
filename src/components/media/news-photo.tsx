import Image from 'next/image';

type Img = { src: string; width?: number; height?: number };

/**
 * A news story's photo filling its card. A tall picture (a magazine cover, like the Forbes Africa story) is shown whole,
 * on a soft blurred copy of itself, so nothing of it is cut off; a wide photo fills the card as before.
 */
export function NewsPhoto({ image, sizes, className = '' }: { image: Img; sizes: string; className?: string }) {
  const tall = Boolean(image.width && image.height && image.height > image.width * 1.05);
  const zoom = 'transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]';
  if (!tall) return <Image src={image.src} alt="" fill sizes={sizes} className={`object-cover ${zoom} ${className}`} />;
  return (
    <>
      <Image src={image.src} alt="" aria-hidden fill sizes="200px" className="scale-125 object-cover opacity-70 blur-2xl" />
      <span aria-hidden className="absolute inset-0 bg-midnight/30" />
      <Image src={image.src} alt="" fill sizes={sizes} className={`object-contain p-3 drop-shadow-[0_12px_24px_rgb(0_0_0/0.35)] ${zoom}`} />
    </>
  );
}
