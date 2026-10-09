/**
 * The Biomedical Engineer Service Portal is an application shell: no marketing header or footer.
 * The script applies a saved dark mode before the first paint, so the page doesn't flash light first.
 */
export default function EngineerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('ff-eng-theme')==='dark')document.documentElement.dataset.engTheme='dark'}catch(e){}" }} />
      {children}
    </>
  );
}
