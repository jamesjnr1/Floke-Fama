import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="grid min-h-[80svh] place-items-center bg-canvas px-5 pt-20 text-center">
      <div>
        <p className="label">404</p>
        <h1 className="display mt-4 text-5xl md:text-7xl">This page has moved.</h1>
        <p className="mx-auto mt-4 max-w-md font-light text-ink-3">This page doesn’t exist or has moved. Try the catalogue or the homepage.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild><Link href="/products">Browse products</Link></Button>
          <Button asChild variant="outline"><Link href="/">Home</Link></Button>
        </div>
      </div>
    </div>
  );
}
