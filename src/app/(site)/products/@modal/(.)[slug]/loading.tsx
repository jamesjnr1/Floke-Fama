/** Shown the moment a product is clicked, until its sheet is ready: the same frame, so nothing jumps. */
export default function LoadingProduct() {
  return (
    <div className="fixed inset-0 z-[60] bg-midnight/60 backdrop-blur-md" aria-busy="true" aria-label="Loading product">
      <div className="fixed inset-x-3 bottom-3 top-16 mx-auto grid max-w-6xl overflow-hidden rounded-5xl bg-canvas shadow-2xl md:inset-x-6 md:bottom-6 md:top-24 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-h-[300px] animate-pulse bg-mist" />
        <div className="space-y-4 p-6 md:p-10">
          <div className="h-4 w-32 animate-pulse rounded bg-mist" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-mist" />
          <div className="h-4 w-full animate-pulse rounded bg-mist" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-mist" />
        </div>
      </div>
    </div>
  );
}
