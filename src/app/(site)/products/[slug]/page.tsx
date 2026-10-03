import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BuyAssurance, MobileQuoteBar, RelatedProducts, relatedProducts } from '@/components/products/product-extras';
import { ProductGallery } from '@/components/products/product-gallery';
import { SpecActions, SpecHeader, SpecTabs } from '@/components/products/spec-sheet';
import { Icon } from '@/components/ui/icon';
import { getCategories, getProduct, getProducts } from '@/lib/data';
import { siteUrl } from '@/lib/utils';

export const revalidate = 600;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.brand} ${product.name}`,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { images: product.image ? [product.image] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, categories, all] = await Promise.all([getProduct(slug), getCategories(), getProducts()]);
  if (!product) notFound();
  const related = relatedProducts(product, all);
  const category = categories.find((c) => c.slug === product.category);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand} ${product.name}`,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.summary,
    category: category?.title,
    image: product.image ? `${siteUrl}${product.image}` : undefined,
    offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', seller: { '@type': 'Organization', name: 'Flokefama' } },
  };

  return (
    <div className="bg-canvas pb-20 pt-20 md:pb-0">
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-16">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-ink-3 hover:text-ink">
          <Icon name="fi-rr-arrow-small-left" /> Back to catalogue
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Photo and a compact action card stay in view while the spec sheet scrolls */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery product={product} category={category} sizes="(min-width: 1024px) 50vw, 100vw" priority shared={false} visualClassName="aspect-square rounded-5xl" />
            <div className="mt-4 hidden items-center gap-4 rounded-3xl border border-line bg-paper p-4 lg:flex">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{product.brand} {product.name}</p>
                <p className="text-xs text-ink-3">Priced to your configuration · reply within one business day</p>
              </div>
              <Link href={`/quote?product=${product.slug}`} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700">
                Request a quote
              </Link>
            </div>
          </div>
          <div className="min-w-0 space-y-10">
            <SpecHeader product={product} categoryTitle={category?.title} />
            <SpecActions product={product} />
            <BuyAssurance />
            <SpecTabs product={product} categoryTitle={category?.title} />
          </div>
        </div>
      </div>
      <RelatedProducts products={related} category={category} />
      <MobileQuoteBar product={product} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
