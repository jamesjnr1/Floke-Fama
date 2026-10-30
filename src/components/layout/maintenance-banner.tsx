export function MaintenanceBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[130] flex h-10 w-full items-center justify-center gap-2 overflow-hidden bg-[#087A48] px-3 text-center font-sans text-[10px] leading-none text-white sm:gap-2.5 sm:px-4 sm:text-xs md:text-[13px]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
      >
        <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3.1 3.1-3-3 3.1-3.1Z" />
      </svg>
      <span className="shrink-0 font-semibold">Website Under Maintenance</span>
      <span className="truncate text-white/90">
        We’re making improvements to serve you better and will be back shortly after the weekend. Thank you for your patience!
      </span>
    </div>
  );
}
