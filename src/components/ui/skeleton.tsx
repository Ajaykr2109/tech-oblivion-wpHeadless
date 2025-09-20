import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base tone matches theme; darker in dark mode
        "relative overflow-hidden rounded-md bg-muted/70 dark:bg-muted/50",
        // Soft shimmer using gradient overlay
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite]",
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)]",
        "dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
