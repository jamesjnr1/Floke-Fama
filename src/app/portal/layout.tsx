/** The client portal is an application shell: no marketing header or footer. */
export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  // Microsoft Clarity records clicks and scrolling here, never what the hospital's screens show
  return <div data-clarity-mask="True" className="contents">{children}</div>;
}
