import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-14">
      <div className="size-16 rounded-2xl bg-[#2F7D4F]/10 text-primary flex items-center justify-center mb-4">
        <Icon size={30} />
      </div>
      <p className="text-[15px]">{title}</p>
      {subtitle && (
        <p className="text-[13px] text-muted-foreground mt-1 max-w-[240px] leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[14px] active:scale-[0.98] transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
