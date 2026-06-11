import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-8 lg:gap-0 lg:flex-row lg:items-start p-10 lg:h-[calc(100vh-var(--header-height))]">
      <div className="w-full max-w-[432px] lg:max-w-[557px]">
        <Skeleton className="aspect-[9/16] w-full rounded-lg" />
      </div>
      <div className="flex w-full flex-col gap-6 lg:pl-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          <Skeleton className="aspect-[3/4] w-full max-w-[260px]" />
          <Skeleton className="aspect-[3/4] w-full max-w-[260px]" />
        </div>
      </div>
    </div>
  );
}
