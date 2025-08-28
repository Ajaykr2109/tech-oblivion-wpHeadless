import { cn } from '@/lib/utils';

export function Marquee({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-row items-center overflow-x-hidden',
        className
      )}
    >
      <div className="animate-marquee flex min-w-full flex-shrink-0 flex-row items-center">
        {children}
      </div>
      <div className="animate-marquee flex min-w-full flex-shrink-0 flex-row items-center">
        {children}
      </div>
    </div>
  );
}
