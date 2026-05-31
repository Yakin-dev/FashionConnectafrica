export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E7DED1] bg-white p-4 space-y-4 animate-pulse">
      <div className="aspect-[3/4] w-full rounded-xl bg-[#E7DED1]/50" />
      <div className="h-4 w-2/3 rounded bg-[#E7DED1]/50" />
      <div className="h-3 w-1/2 rounded bg-[#E7DED1]/50" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-12 rounded-full bg-[#E7DED1]/50" />
        <div className="h-6 w-12 rounded-full bg-[#E7DED1]/50" />
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
