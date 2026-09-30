import { notFound } from 'next/navigation';
import { SpecModal } from '@/components/products/spec-modal';
import { getCategories, getProduct } from '@/lib/data';

export default async function InterceptedProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProduct(slug), getCategories()]);
  if (!product) notFound();
  return <SpecModal product={product} category={categories.find((c) => c.slug === product.category)} />;
}
