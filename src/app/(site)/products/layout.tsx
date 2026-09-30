/** Parallel-route layout: `modal` renders the intercepted Deep Spec Sheet over the catalogue. */
export default function ProductsLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
