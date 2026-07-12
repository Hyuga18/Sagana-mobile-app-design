import { Sprout, ShoppingBasket, ArrowRight } from "lucide-react";
import { Role } from "../../data";

export function Onboarding({ onPick }: { onPick: (r: Role) => void }) {
  return (
    <div className="h-full flex flex-col px-6 pt-16 pb-8 bg-gradient-to-b from-[#2F7D4F] to-[#256340] text-white">
      <div className="flex-1 flex flex-col justify-center">
        <div className="size-16 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
          <Sprout size={34} className="text-white" />
        </div>
        <h1 className="text-white" style={{ fontSize: 34, lineHeight: 1.15 }}>
          Sagana
        </h1>
        <p className="text-white/80 mt-3 max-w-[280px]" style={{ fontSize: 16 }}>
          Sell your harvest directly to buyers across Cavite — and know the
          right time to sell with smart price forecasts.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-white/70 text-[13px] mb-1">I am a…</p>
        <RoleButton
          icon={<Sprout size={24} />}
          title="Farmer"
          subtitle="Post listings & track crop prices"
          onClick={() => onPick("farmer")}
        />
        <RoleButton
          icon={<ShoppingBasket size={24} />}
          title="Buyer"
          subtitle="Browse & order fresh produce"
          onClick={() => onPick("buyer")}
        />
      </div>
    </div>
  );
}

function RoleButton({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-2xl bg-white p-4 text-left text-foreground active:scale-[0.98] transition-transform"
    >
      <div className="size-12 rounded-xl bg-[#2F7D4F]/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p>{title}</p>
        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <ArrowRight size={20} className="text-muted-foreground shrink-0" />
    </button>
  );
}
