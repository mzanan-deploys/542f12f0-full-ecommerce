import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="h-dvh-header w-full">
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
}
