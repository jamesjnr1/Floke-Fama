import Image from 'next/image';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Flokefama home" className={className}>
      {/* TODO: swap for the vector (SVG) logo once supplied by Flokefama */}
      <Image src="/images/logo.png" alt="Flokefama" width={500} height={153} priority className="-ml-2.5 h-auto w-[150px] md:w-[168px]" />
    </Link>
  );
}
