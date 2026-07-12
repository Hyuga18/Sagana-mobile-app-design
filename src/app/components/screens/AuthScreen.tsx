import { useState } from "react";
import {
  Sprout,
  ShoppingBasket,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { BARANGAYS, CROPS } from "../../data";
import {
  Profile,
  SignupPayload,
  fetchProfile,
  getAccessToken,
  signIn,
  signUp,
} from "../../lib/api";

type Mode = "welcome" | "login" | "role" | "farmer" | "buyer";

const BUSINESS_TYPES = [
  "Small eatery / Carinderia",
  "Restaurant",
  "Large restaurant / Chain",
  "Institutional (hotel, catering, grocery)",
];

export function AuthScreen({
  onAuthed,
}: {
  onAuthed: (profile: Profile) => void;
}) {
  const [mode, setMode] = useState<Mode>("welcome");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // farmer
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [barangay, setBarangay] = useState(BARANGAYS[0]);
  const [crops, setCrops] = useState<string[]>([]);
  // buyer
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [permitNumber, setPermitNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // Email must contain a name, an "@", and a domain with a dot (e.g. name@site.com).
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Password: at least 8 chars, with a number and a special character.
  const PW_NUMBER = /[0-9]/;
  const PW_SPECIAL = /[^A-Za-z0-9]/;

  // Guard shared by login and every sign-up path.
  function credentialError(): string | null {
    if (!email.trim()) return "Please enter your email address.";
    if (!EMAIL_RE.test(email.trim()))
      return "Enter a valid email address (e.g. name@business.com).";
    if (!password) return "Please enter a password.";
    return null;
  }

  // Stronger rule applied only on sign-up (not login, so existing users aren't blocked).
  function passwordError(): string | null {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!PW_NUMBER.test(password)) return "Password must include at least one number.";
    if (!PW_SPECIAL.test(password))
      return "Password must include at least one special character (e.g. ! @ # $).";
    return null;
  }

  async function loginAndLoad() {
    const token = await signIn(email.trim(), password);
    if (!token) throw new Error("No session returned after sign in.");
    const profile = await fetchProfile(token);
    onAuthed(profile);
  }

  async function handleLogin() {
    setError(null);
    const cred = credentialError();
    if (cred) return setError(cred);
    setLoading(true);
    try {
      await loginAndLoad();
    } catch (e: any) {
      setError(e.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(role: "farmer" | "buyer") {
    setError(null);
    // Validate role-specific required fields before hitting the server.
    if (role === "farmer" && !name.trim()) {
      return setError("Please enter your full name.");
    }
    if (role === "buyer") {
      if (!businessName.trim()) return setError("Enter your business or restaurant name.");
      if (!permitNumber.trim())
        return setError("Enter your business permit / DTI / BIR registration number.");
    }
    const cred = credentialError();
    if (cred) return setError(cred);
    const pw = passwordError();
    if (pw) return setError(pw);

    setLoading(true);
    try {
      const payload: SignupPayload = {
        email: email.trim(),
        password,
        role,
        phone,
      };
      if (role === "farmer") {
        payload.name = name;
        payload.barangay = barangay;
        payload.crops = crops;
      } else {
        payload.businessName = businessName;
        payload.businessType = businessType;
        payload.permitNumber = permitNumber;
        payload.contactPerson = contactPerson;
        payload.barangay = barangay;
      }
      await signUp(payload);
      // Auto-login right after successful signup.
      await loginAndLoad();
    } catch (e: any) {
      setError(e.message ?? "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  function toggleCrop(id: string) {
    setCrops((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  // ---------- WELCOME ----------
  if (mode === "welcome") {
    return (
      <Shell green>
        <div className="flex-1 flex flex-col justify-center">
          <div className="size-16 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
            <Sprout size={34} className="text-white" />
          </div>
          <h1 className="text-white" style={{ fontSize: 34, lineHeight: 1.15 }}>
            Sagana
          </h1>
          <p className="text-white/80 mt-3 max-w-[280px]" style={{ fontSize: 16 }}>
            Connecting Cavite farmers directly with restaurants and businesses.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setMode("role")}
            className="w-full h-12 rounded-xl bg-white text-primary active:scale-[0.98] transition-transform"
          >
            Create an account
          </button>
          <button
            onClick={() => setMode("login")}
            className="w-full h-12 rounded-xl bg-white/15 text-white active:scale-[0.98] transition-transform"
          >
            I already have an account
          </button>
          <ErrorBox error={error} />
        </div>
      </Shell>
    );
  }

  // ---------- LOGIN ----------
  if (mode === "login") {
    return (
      <Shell onBack={() => setMode("welcome")} title="Welcome back">
        <div className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@business.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          <ErrorBox error={error} />
          <PrimaryButton loading={loading} onClick={handleLogin}>
            Log in
          </PrimaryButton>
          <p className="text-center text-[13px] text-muted-foreground">
            No account yet?{" "}
            <button className="text-primary" onClick={() => setMode("role")}>
              Register
            </button>
          </p>
        </div>
      </Shell>
    );
  }

  // ---------- ROLE PICKER ----------
  if (mode === "role") {
    return (
      <Shell onBack={() => setMode("welcome")} title="How will you use Sagana?">
        <div className="space-y-3">
          <RoleCard
            icon={<Sprout size={24} />}
            title="I'm a Farmer"
            subtitle="Sell your harvest directly to buyers"
            onClick={() => {
              setError(null);
              setMode("farmer");
            }}
          />
          <RoleCard
            icon={<ShoppingBasket size={24} />}
            title="I'm a Business Buyer"
            subtitle="Restaurants & businesses only — buy produce in bulk"
            onClick={() => {
              setError(null);
              setMode("buyer");
            }}
          />
          <p className="text-[12px] text-muted-foreground pt-2 leading-relaxed">
            Buyer accounts are for registered businesses (restaurants,
            eateries, hotels, grocers). Individual shoppers can't create buyer
            accounts.
          </p>
        </div>
      </Shell>
    );
  }

  // ---------- FARMER SIGNUP ----------
  if (mode === "farmer") {
    return (
      <Shell onBack={() => setMode("role")} title="Farmer sign up" scroll>
        <div className="space-y-4">
          <Input label="Full name" value={name} onChange={setName} placeholder="Juana Dela Cruz" />
          <Input label="Mobile number" value={phone} onChange={setPhone} placeholder="0917 123 4567" />
          <Select label="Barangay / town" value={barangay} onChange={setBarangay} options={BARANGAYS} />
          <div>
            <label className="text-[13px]">Crops you grow</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CROPS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCrop(c.id)}
                  className={`rounded-full px-3 py-1.5 text-[13px] border transition-colors ${
                    crops.includes(c.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-border my-1" />
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="8+ chars, 1 number, 1 special char" />
          <ErrorBox error={error} />
          <PrimaryButton loading={loading} onClick={() => handleSignup("farmer")}>
            Create farmer account
          </PrimaryButton>
        </div>
      </Shell>
    );
  }

  // ---------- BUYER SIGNUP ----------
  return (
    <Shell onBack={() => setMode("role")} title="Business sign up" scroll>
      <div className="space-y-4">
        <div className="rounded-xl bg-[#F0A93E]/12 border border-[#F0A93E]/40 p-3 flex gap-2">
          <ShieldCheck size={18} className="text-[#8a5a12] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#8a5a12] leading-relaxed">
            Enter a valid business permit / DTI / BIR registration number. It's
            verified instantly so you can start ordering right away.
          </p>
        </div>
        <Input label="Business / restaurant name" value={businessName} onChange={setBusinessName} placeholder="Kusina ni Aling Nena" />
        <Select label="Business type" value={businessType} onChange={setBusinessType} options={BUSINESS_TYPES} />
        <Input
          label="Business permit / DTI / BIR reg. no."
          value={permitNumber}
          onChange={setPermitNumber}
          placeholder="e.g. DTI-1234567"
        />
        <Input label="Contact person" value={contactPerson} onChange={setContactPerson} placeholder="Owner / manager name" />
        <Input label="Mobile number" value={phone} onChange={setPhone} placeholder="0917 123 4567" />
        <Select label="Barangay / town" value={barangay} onChange={setBarangay} options={BARANGAYS} />
        <div className="h-px bg-border my-1" />
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@business.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="8+ chars, 1 number, 1 special char" />
        <ErrorBox error={error} />
        <PrimaryButton loading={loading} onClick={() => handleSignup("buyer")}>
          Create business account
        </PrimaryButton>
      </div>
    </Shell>
  );
}

// ---------- helper UI ----------
function Shell({
  children,
  green,
  onBack,
  title,
  scroll,
}: {
  children: React.ReactNode;
  green?: boolean;
  onBack?: () => void;
  title?: string;
  scroll?: boolean;
}) {
  return (
    <div
      className={`h-full flex flex-col ${
        green ? "bg-gradient-to-b from-[#2F7D4F] to-[#256340] text-white px-6 pt-16 pb-8" : "bg-background"
      }`}
    >
      {!green && (
        <header className="px-5 pt-14 pb-3 flex items-center gap-3 border-b border-border">
          {onBack && (
            <button onClick={onBack} className="-ml-1">
              <ArrowLeft size={24} />
            </button>
          )}
          <h3>{title}</h3>
        </header>
      )}
      {green ? (
        children
      ) : (
        <div className={`flex-1 px-5 py-5 ${scroll ? "overflow-y-auto" : ""}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function RoleCard({
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
      className="w-full flex items-center gap-4 rounded-2xl bg-card border border-border p-4 text-left active:scale-[0.98] transition-transform"
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

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[13px]">{label}</label>
      <input
        type={type}
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

function PrimaryButton({
  children,
  onClick,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] transition"
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="rounded-xl bg-[#C1613D]/12 border border-[#C1613D]/40 p-3">
      <p className="text-[13px] text-[#C1613D]">{error}</p>
    </div>
  );
}

// re-export so App can await session bootstrapping
export { getAccessToken };
