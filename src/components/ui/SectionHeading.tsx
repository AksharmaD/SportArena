import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  return (
    <div
      className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left'} ${className}`}
    >
      {eyebrow && (
        <span className="reveal mb-4 inline-block text-sm font-bold uppercase tracking-wider text-brand-600">
          {eyebrow}
        </span>
      )}
      <h2 className="reveal font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-950 sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="reveal mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
