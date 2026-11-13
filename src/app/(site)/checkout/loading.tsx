/**
 * Shown the moment a "Request a quote" or "Quote list" link is clicked, while the quote page loads: the same heading
 * and a quiet outline of the list, so the click answers at once.
 */
export default function Loading() {
  return (
    <div className="bg-canvas pb-20 pt-32 md:pb-28 md:pt-36" aria-busy="true">
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        <h1 className="text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold tracking-[-0.03em] text-ink">Request a quote</h1>
        <p className="mb-8 mt-2 text-ink-3">List what you need and send the request. Our sales team sends you a quote with the price and delivery within one business day. Installation and training are included.</p>
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-paper lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4 p-5 md:p-8 lg:p-10">
            <div className="h-10 animate-pulse rounded bg-mist" />
            <div className="h-20 animate-pulse rounded-xl bg-mist" />
            <div className="h-20 animate-pulse rounded-xl bg-mist" />
          </div>
          <div className="min-h-[320px] bg-brand-600" />
        </div>
      </div>
    </div>
  );
}
