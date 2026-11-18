import { Fragment } from 'react';

/**
 * Text from the Studio with **bold** words: the parts between double stars are shown in bold (`strong`, in the
 * classes given). Everything else is plain text, so nothing typed in the Studio can add other markup.
 */
export function Rich({ text, strong = 'font-semibold text-ink-2' }: { text: string; strong?: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        /^\*\*[^*]+\*\*$/.test(part) ? (
          <strong key={i} className={strong}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
