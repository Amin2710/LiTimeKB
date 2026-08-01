export function AccordionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 rounded bg-muted" />
      <div className="h-10 w-full rounded-lg bg-muted" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-24 rounded-full bg-muted" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 w-full rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function OrientationSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 rounded bg-muted" />
      <div className="h-16 w-full rounded-lg bg-muted/50" />
      <div className="h-10 w-full rounded-lg bg-muted" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 w-full rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function PolicySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-8 w-36 rounded-lg bg-muted" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-48 w-full rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function TrackerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-4">
        <div className="h-16 w-24 rounded-lg bg-muted" />
        <div className="h-16 w-24 rounded-lg bg-muted" />
      </div>
      <div className="h-12 w-full rounded-xl bg-muted" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-20 rounded-lg bg-muted" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-28 w-full rounded-xl bg-muted" />
      ))}
    </div>
  );
}
