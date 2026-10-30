export function MaintenanceBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-[#087A48] px-4 py-2.5 text-center font-sans text-xs leading-relaxed text-white sm:text-[13px]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
      >
        <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3.1 3.1-3-3 3.1-3.1Z" />
      </svg>
      <span className="font-semibold">Website Under Maintenance</span>
      <span className="text-white/90">
        We are making improvements to serve you better. Thank you for your patience.
      </span>
    </div>
  );
}
