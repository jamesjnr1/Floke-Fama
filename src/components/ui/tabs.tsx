'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'motion/react';
import { createContext, useContext, useId, useState, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const TabsCtx = createContext<{ value: string; group: string }>({ value: '', group: '' });

/** Radix Tabs (full keyboard + ARIA) with a Framer Motion sliding indicator. */
export function Tabs({ defaultValue, value: controlled, onValueChange, className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  const [inner, setInner] = useState(defaultValue ?? '');
  const value = controlled ?? inner;
  const group = useId();
  return (
    <TabsCtx.Provider value={{ value, group }}>
      <TabsPrimitive.Root
        value={value}
        onValueChange={(v) => {
          setInner(v);
          onValueChange?.(v);
        }}
        className={cn('flex flex-col', className)}
        {...props}
      />
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-mist p-1 [scrollbar-width:none]', className)} {...props} />;
}

export function TabsTrigger({ className, value, children, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ctx = useContext(TabsCtx);
  const active = ctx.value === value;
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'relative shrink-0 rounded-md px-4 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink data-[state=active]:text-ink',
        className,
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId={`tab-${ctx.group}`}
          className="absolute inset-0 rounded-md bg-paper shadow-sm ring-1 ring-line"
          transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('outline-none', className)} {...props} />;
}
