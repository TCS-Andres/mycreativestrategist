'use client';
import { motion } from 'framer-motion';
import type { Section } from '@/lib/intakes/types';

export function ProgressBar({
  sections,
  currentIndex,
}: {
  sections: Section[];
  currentIndex: number;
}) {
  const total = sections.length;
  const pct = Math.round(((currentIndex + 1) / total) * 100);
  const section = sections[currentIndex];
  if (!section) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-border/70 bg-brand-cream/95 backdrop-blur supports-[backdrop-filter]:bg-brand-cream/70">
      <div className="container flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-heading font-semibold text-brand-navy">
            <span className="text-brand-orange">Section {section.index}</span>
            <span className="mx-2 text-brand-navy/30">/</span>
            <span>{section.title}</span>
          </span>
          <span className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {pct}% complete
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-brand-gray">
          <motion.div
            className="h-full rounded-full bg-brand-orange"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 110, damping: 22 }}
          />
        </div>
      </div>
    </div>
  );
}
