const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-zinc-200 rounded-sm ${className}`} />
);

export const SkeletonProductRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-2.5 w-1/3" />
    </div>
    <Skeleton className="h-8 w-8 rounded-sm flex-shrink-0" />
  </div>
);

export const SkeletonCartRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-1/2" />
      <Skeleton className="h-2.5 w-1/4" />
    </div>
    <Skeleton className="h-7 w-20 rounded-sm" />
  </div>
);

export const SkeletonTableRow = () => (
  <tr>
    {[...Array(4)].map((_, i) => (
      <td key={i} className="px-5 py-3.5">
        <Skeleton className="h-3.5 w-full" />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = ({ rows = 3 }) => (
  <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
    <div className="px-4 py-3 border-b border-zinc-100">
      <Skeleton className="h-4 w-1/3" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <SkeletonProductRow key={i} />
    ))}
  </div>
);

export default Skeleton;
