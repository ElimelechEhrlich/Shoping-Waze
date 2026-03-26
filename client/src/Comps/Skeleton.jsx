// Skeleton — pulse placeholder for loading states
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

export const SkeletonProductRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-2/3" />
    </div>
    <Skeleton className="h-8 w-8 rounded-xl flex-shrink-0" />
  </div>
);

export const SkeletonCartRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-1/2" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
    <Skeleton className="h-7 w-20 rounded-lg" />
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
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-50">
      <Skeleton className="h-4 w-1/3" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <SkeletonProductRow key={i} />
    ))}
  </div>
);

export default Skeleton;
