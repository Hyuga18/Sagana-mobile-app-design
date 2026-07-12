import { Clock, LogOut, RefreshCw, XCircle } from "lucide-react";
import { Profile } from "../../lib/api";

export function PendingApproval({
  profile,
  onRefresh,
  onLogout,
  onEdit,
  refreshing,
}: {
  profile: Profile;
  onRefresh: () => void;
  onLogout: () => void;
  onEdit: () => void;
  refreshing?: boolean;
}) {
  const rejected = profile.status === "rejected";
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 text-center">
      <div
        className="size-20 rounded-full flex items-center justify-center mb-5"
        style={{
          background: rejected ? "rgba(193,97,61,0.12)" : "rgba(240,169,62,0.15)",
        }}
      >
        {rejected ? (
          <XCircle size={46} className="text-[#C1613D]" />
        ) : (
          <Clock size={46} className="text-[#F0A93E]" />
        )}
      </div>
      <h2>{rejected ? "Application not approved" : "Account under review"}</h2>
      <p className="text-[14px] text-muted-foreground mt-2 max-w-[280px]">
        {rejected
          ? "Your business registration couldn't be verified. Update your details and resubmit to be re-checked automatically."
          : "Thanks for registering your business. Our team is verifying your details before you can start ordering."}
      </p>

      {rejected && profile.rejectionReason && (
        <div className="w-full rounded-xl bg-[#C1613D]/12 border border-[#C1613D]/40 p-3 mt-4 text-left">
          <p className="text-[13px] text-[#C1613D]">{profile.rejectionReason}</p>
        </div>
      )}

      <div className="w-full rounded-2xl bg-card border border-border p-4 mt-6 text-left space-y-1.5">
        <Row label="Business" value={profile.businessName ?? "—"} />
        <Row label="Type" value={profile.businessType ?? "—"} />
        <Row label="Permit no." value={profile.permitNumber ?? "—"} />
        <Row
          label="Status"
          value={rejected ? "Rejected" : "Pending review"}
        />
      </div>

      <div className="w-full space-y-3 mt-8">
        {rejected ? (
          <button
            onClick={onEdit}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            <RefreshCw size={18} /> Edit &amp; resubmit
          </button>
        ) : (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] transition"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Check status
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full h-12 rounded-xl bg-card border border-border flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] text-right">{value}</span>
    </div>
  );
}
