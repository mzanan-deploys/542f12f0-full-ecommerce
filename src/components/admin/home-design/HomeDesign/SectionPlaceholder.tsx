import { cn } from "@/lib/utils/cn";

interface SectionPlaceholderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export const SectionPlaceholder = ({ title, subtitle, className }: SectionPlaceholderProps) => (
  <div className={cn(
    "border border-dashed border-gray-400 bg-gray-100 dark:bg-gray-700 p-4 flex flex-col items-center justify-center text-center text-muted-foreground opacity-60",
    className
  )}>
    <h3 className="font-semibold text-lg">{title}</h3>
    {subtitle && <p className="text-sm">({subtitle})</p>}
  </div>
); 