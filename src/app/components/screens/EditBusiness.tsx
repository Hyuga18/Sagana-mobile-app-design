import { useState } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { BARANGAYS } from "../../data";
import { Profile, ResubmitPayload, resubmitBusiness } from "../../lib/api";

const BUSINESS_TYPES = [
  "Small eatery / Carinderia",
  "Restaurant",
  "Large restaurant / Chain",
  "Institutional (hotel, catering, grocery)",
];

export function EditBusiness({
  token,
  profile,
  onBack,
  onUpdated,
}: {
  token: string;
  profile: Profile;
  onBack: () => void;
  onUpdated: (p: Profile) => void;
}) {
  const [businessName, setBusinessName] = useState(profile.businessName ?? "");
  const [businessType, setBusinessType] = useState(
    profile.businessType ?? BUSINESS_TYPES[0],
  );
  const [permitNumber, setPermitNumber] = useState(profile.permitNumber ?? "");
  const [contactPerson, setContactPerson] = useState(
    profile.contactPerson ?? "",
  );
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [barangay, setBarangay] = useState(profile.barangay ?? BARANGAYS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const payload: ResubmitPayload = {
        businessName,
        businessType,
        permitNumber,
        contactPerson,
        phone,
        barangay,
      };
      const updated = await resubmitBusiness(token, payload);
      onUpdated(updated);
    } catch (e: any) {
      setError(e.message ?? "Resubmission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-5 pt-14 pb-3 flex items-center gap-3 border-b border-border">
        <button onClick={onBack} className="-ml-1">
          <ArrowLeft size={24} />
        </button>
        <h3>Edit &amp; resubmit</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {profile.rejectionReason && (
          <div className="rounded-xl bg-[#C1613D]/12 border border-[#C1613D]/40 p-3">
            <p className="text-[13px] text-[#C1613D]">
              {profile.rejectionReason}
            </p>
          </div>
        )}
        <Input label="Business / restaurant name" value={businessName} onChange={setBusinessName} />
        <Select label="Business type" value={businessType} onChange={setBusinessType} options={BUSINESS_TYPES} />
        <Input
          label="Business permit / DTI / BIR reg. no."
          value={permitNumber}
          onChange={setPermitNumber}
          placeholder="e.g. DTI-1234567"
        />
        <Input label="Contact person" value={contactPerson} onChange={setContactPerson} />
        <Input label="Mobile number" value={phone} onChange={setPhone} />
        <Select label="Barangay / town" value={barangay} onChange={setBarangay} options={BARANGAYS} />
        {error && (
          <div className="rounded-xl bg-[#C1613D]/12 border border-[#C1613D]/40 p-3">
            <p className="text-[13px] text-[#C1613D]">{error}</p>
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-6 border-t border-border">
        <button
          onClick={submit}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] transition"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          Resubmit for verification
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[13px]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full h-12 rounded-xl bg-input-background px-3.5 text-[14px] outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-[13px]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-xl bg-input-background px-3.5 text-[14px] outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
