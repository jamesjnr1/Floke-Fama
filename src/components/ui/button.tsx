import { Slot } from '@radix-ui/react-slot';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-semibold transition-[transform,background-color,box-shadow,color,border-color] duration-500 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-cta text-white hover:bg-cta-700 hover:-translate-y-0.5',
        glow: 'bg-cta text-white hover:bg-cta-700 hover:-translate-y-0.5',
        red: 'bg-signal text-white hover:bg-signal-700 hover:-translate-y-0.5',
        glass: 'border border-[#54cdd6]/35 bg-white/[0.03] text-white hover:border-[#54cdd6]/70 hover:bg-white/[0.07] hover:-translate-y-0.5',
        outline: 'border border-line bg-paper text-ink hover:border-ink/30 hover:-translate-y-0.5',
        ghost: 'text-ink hover:bg-mist',
        dark: 'bg-midnight text-white hover:bg-midnight-3 hover:-translate-y-0.5',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-[1.125rem]',
        lg: 'h-14 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Boxed button with the label on the left and an arrow on the right: "up-right" for actions, "right" for going to a page. */
    arrow?: 'right' | 'up-right';
  };

export function Button({ className, variant, size, asChild, arrow, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  let content: ReactNode = children;
  if (arrow) {
    const Ico = arrow === 'up-right' ? ArrowUpRight : ArrowRight;
    const icon = (
      <Ico
        aria-hidden
        className={cn('size-5 shrink-0 transition-transform duration-300', arrow === 'up-right' ? 'group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5' : 'group-hover/btn:translate-x-1')}
      />
    );
    // With asChild the arrow goes inside the child link, so Slot still receives a single element
    content =
      asChild && isValidElement(children) ? (
        cloneElement(children as ReactElement<{ children?: ReactNode }>, undefined, (children as ReactElement<{ children?: ReactNode }>).props.children, icon)
      ) : (
        <>
          {children}
          {icon}
        </>
      );
  }
  return (
    <Comp className={cn(buttonVariants({ variant, size }), arrow && 'min-w-[15rem] justify-between gap-8', className)} {...props}>
      {content}
    </Comp>
  );
}
