import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const PREFIX = "/make-server-a7d7416f";

// Invite code required to self-register as the platform admin (oversight).
const ADMIN_INVITE_CODE = "SAGANA-ADMIN";

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ---------------------------------------------------------------------------
// Automated permit / business-registration validation.
//
// NOTE: This performs FORMAT + TYPE detection only. There is no free public
// DTI/BIR API to confirm a permit is genuinely issued; true verification needs
// a paid KYB provider. If a KYB_API_KEY secret is configured, we call that
// provider; otherwise we fall back to the automated format checks below.
// ---------------------------------------------------------------------------
type PermitResult = { valid: boolean; type?: string; reason?: string };

function classifyPermit(raw: string): PermitResult {
  const value = (raw ?? "").trim().toUpperCase();
  if (!value) return { valid: false, reason: "No registration number provided." };

  const compact = value.replace(/\s+/g, "");
  const tinDigits = compact.replace(/[^0-9]/g, "");

  // BIR TIN: 9 digits, or 12 digits with a 3-digit branch code.
  if (/^\d{9}$/.test(tinDigits) || /^\d{12}$/.test(tinDigits)) {
    return { valid: true, type: "BIR TIN" };
  }
  // DTI Business Name registration: "DTI-" prefix or a 7+ digit certificate no.
  if (/^DTI[-]?\d{6,}$/.test(compact) || /^\d{7,}$/.test(tinDigits)) {
    return { valid: true, type: "DTI Registration" };
  }
  // Mayor's / LGU business permit: alphanumeric with dashes, 8+ chars, 5+ digits.
  if (/^[A-Z0-9-]{8,}$/.test(compact) && tinDigits.length >= 5) {
    return { valid: true, type: "Business Permit" };
  }
  return {
    valid: false,
    reason:
      "The number doesn't match a recognized DTI, BIR TIN, or business permit format.",
  };
}

async function verifyPermit(raw: string): Promise<PermitResult> {
  const kybKey = Deno.env.get("KYB_API_KEY");
  const base = classifyPermit(raw);
  // No provider configured, or the format already failed -> return format result.
  if (!kybKey || !base.valid) return base;

  // Plug-in point for a real KYB / government verification provider.
  try {
    // Example shape — replace URL/body with your provider's contract.
    const res = await fetch("https://api.example-kyb.com/v1/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kybKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registrationNumber: raw }),
    });
    if (!res.ok) {
      console.log("KYB provider error, falling back to format check:", res.status);
      return base;
    }
    const data = await res.json();
    if (data?.verified === false) {
      return { valid: false, reason: "Registration number could not be verified with records." };
    }
    return { valid: true, type: base.type };
  } catch (e) {
    console.log("KYB verification failed, using format check:", e);
    return base;
  }
}

// ---------------------------------------------------------------------------
// Email notifications via Resend.
// ---------------------------------------------------------------------------
async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.log("RESEND_API_KEY not set; skipping email to", to);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sagana <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.log("Resend email failed:", res.status, await res.text());
    }
  } catch (e) {
    console.log("Email send error:", e);
  }
}

function approvedEmail(name: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#2F7D4F">You're approved! 🌱</h2>
      <p>Hi ${name},</p>
      <p>Your business account on <b>Sagana</b> has been verified and approved.
      You can now log in and start ordering fresh produce directly from Cavite farmers.</p>
      <p>— The Sagana Team</p>
    </div>`;
}

function rejectedEmail(name: string, reason: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#C1613D">About your Sagana application</h2>
      <p>Hi ${name},</p>
      <p>We couldn't approve your business account yet.</p>
      <p><b>Reason:</b> ${reason}</p>
      <p>Please log in and use <b>Edit &amp; resubmit</b> to correct your
      business details, and we'll re-check them automatically.</p>
      <p>— The Sagana Team</p>
    </div>`;
}

// Resolve the authenticated user's profile from the Authorization header.
async function getAuthedProfile(authHeader: string | undefined) {
  const accessToken = authHeader?.split(" ")[1];
  if (!accessToken) return { error: "Missing access token", profile: null };
  const {
    data: { user },
    error,
  } = await admin().auth.getUser(accessToken);
  if (error || !user) {
    return {
      error: `Invalid session: ${error?.message ?? "no user"}`,
      profile: null,
    };
  }
  const profile = await kv.get(`profile:${user.id}`);
  if (!profile) return { error: "Profile not found", profile: null };
  return { error: null, profile };
}

app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

// Force-create / reset the default admin, then report its email so the client
// can log in. Safe to call anytime (idempotent).
app.post(`${PREFIX}/bootstrap-admin`, async (c) => {
  await seedAdmin();
  return c.json({ email: "admin@sagana.app" });
});

// ---- Sign up (role-gated) ----
app.post(`${PREFIX}/signup`, async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return c.json({ error: "Email, password, and role are required." }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return c.json({ error: "Enter a valid email address." }, 400);
    }
    if (
      String(password).length < 8 ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return c.json(
        {
          error:
            "Password must be at least 8 characters and include a number and a special character.",
        },
        400,
      );
    }
    if (!["farmer", "buyer", "admin"].includes(role)) {
      return c.json({ error: `Invalid role: ${role}` }, 400);
    }
    if (role === "admin" && body.adminCode !== ADMIN_INVITE_CODE) {
      return c.json({ error: "Invalid admin invite code." }, 403);
    }
    if (role === "buyer") {
      if (!body.businessName || !body.businessType || !body.permitNumber) {
        return c.json(
          {
            error:
              "Business name, business type, and permit/registration number are required for buyer accounts.",
          },
          400,
        );
      }
    }
    if (role === "farmer" && !body.name) {
      return c.json(
        { error: "Full name is required for farmer accounts." },
        400,
      );
    }

    // Run automated verification for buyers before creating the account.
    let permitCheck: PermitResult = { valid: true };
    if (role === "buyer") {
      permitCheck = await verifyPermit(body.permitNumber);
    }

    const supabase = admin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role, name: body.name ?? body.businessName },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });
    if (error || !data.user) {
      const msg = error?.message ?? "unknown error";
      if (/already been registered|already exists/i.test(msg)) {
        return c.json(
          {
            error:
              "An account with this email already exists. Please log in instead.",
          },
          409,
        );
      }
      return c.json({ error: `Sign up failed while creating user: ${msg}` }, 400);
    }

    const now = new Date().toISOString();
    const profile: Record<string, unknown> = {
      id: data.user.id,
      email,
      role,
      name: body.name ?? body.businessName ?? "",
      phone: body.phone ?? "",
      createdAt: now,
      status: "active",
    };

    if (role === "farmer") {
      profile.barangay = body.barangay ?? "";
      profile.crops = body.crops ?? [];
    }
    if (role === "buyer") {
      profile.businessName = body.businessName;
      profile.businessType = body.businessType;
      profile.permitNumber = body.permitNumber;
      profile.contactPerson = body.contactPerson ?? "";
      profile.barangay = body.barangay ?? "";
      profile.permitType = permitCheck.type ?? null;
      profile.status = permitCheck.valid ? "active" : "rejected";
      profile.rejectionReason = permitCheck.valid ? null : permitCheck.reason;

      // Notify the business of the automated decision.
      const bizName = String(profile.businessName);
      if (permitCheck.valid) {
        await sendEmail(email, "Your Sagana business account is approved", approvedEmail(bizName));
      } else {
        await sendEmail(
          email,
          "Action needed on your Sagana application",
          rejectedEmail(bizName, permitCheck.reason ?? "Invalid registration number."),
        );
      }
    }

    await kv.set(`profile:${data.user.id}`, profile);
    return c.json({ profile });
  } catch (err) {
    console.log("Signup route error:", err);
    return c.json({ error: `Unexpected sign up error: ${err}` }, 500);
  }
});

// ---- Current user's profile ----
app.get(`${PREFIX}/profile`, async (c) => {
  const { error, profile } = await getAuthedProfile(
    c.req.header("Authorization"),
  );
  if (error) return c.json({ error }, 401);
  return c.json({ profile });
});

// ---- Buyer: edit business details & resubmit for re-check ----
app.post(`${PREFIX}/resubmit`, async (c) => {
  const { error, profile } = await getAuthedProfile(
    c.req.header("Authorization"),
  );
  if (error) return c.json({ error }, 401);
  const p = profile as any;
  if (p.role !== "buyer") {
    return c.json({ error: "Only business buyer accounts can resubmit." }, 403);
  }
  const body = await c.req.json();
  if (!body.businessName || !body.businessType || !body.permitNumber) {
    return c.json(
      { error: "Business name, business type, and registration number are required." },
      400,
    );
  }

  const check = await verifyPermit(body.permitNumber);

  p.businessName = body.businessName;
  p.businessType = body.businessType;
  p.permitNumber = body.permitNumber;
  p.contactPerson = body.contactPerson ?? p.contactPerson ?? "";
  p.barangay = body.barangay ?? p.barangay ?? "";
  p.phone = body.phone ?? p.phone ?? "";
  p.permitType = check.type ?? null;
  p.status = check.valid ? "active" : "rejected";
  p.rejectionReason = check.valid ? null : check.reason;

  if (check.valid) {
    await sendEmail(p.email, "Your Sagana business account is approved", approvedEmail(p.businessName));
  } else {
    await sendEmail(
      p.email,
      "Action needed on your Sagana application",
      rejectedEmail(p.businessName, check.reason ?? "Invalid registration number."),
    );
  }

  await kv.set(`profile:${p.id}`, p);
  return c.json({ profile: p });
});

// ---- Admin: list all buyers (for approval queue) ----
app.get(`${PREFIX}/admin/pending`, async (c) => {
  const { error, profile } = await getAuthedProfile(
    c.req.header("Authorization"),
  );
  if (error) return c.json({ error }, 401);
  if ((profile as any).role !== "admin") {
    return c.json({ error: "Admin access required." }, 403);
  }
  const all = (await kv.getByPrefix("profile:")) as any[];
  const buyers = all.filter((p) => p.role === "buyer");
  return c.json({ buyers });
});

// ---- Admin: manually approve or reject a buyer (override) ----
app.post(`${PREFIX}/admin/approve`, async (c) => {
  const { error, profile } = await getAuthedProfile(
    c.req.header("Authorization"),
  );
  if (error) return c.json({ error }, 401);
  if ((profile as any).role !== "admin") {
    return c.json({ error: "Admin access required." }, 403);
  }
  const { userId, approve, reason } = await c.req.json();
  const target = (await kv.get(`profile:${userId}`)) as any;
  if (!target) return c.json({ error: "Buyer not found." }, 404);
  target.status = approve ? "active" : "rejected";
  target.rejectionReason = approve ? null : reason ?? "Reviewed by admin.";
  await kv.set(`profile:${userId}`, target);

  const bizName = target.businessName ?? target.name ?? "there";
  if (approve) {
    await sendEmail(target.email, "Your Sagana business account is approved", approvedEmail(bizName));
  } else {
    await sendEmail(
      target.email,
      "Action needed on your Sagana application",
      rejectedEmail(bizName, target.rejectionReason),
    );
  }
  return c.json({ profile: target });
});

// ---------------------------------------------------------------------------
// Seed a default platform admin on startup so there's no sign-up hassle.
// Log in with these credentials on the normal login screen — role routing
// sends admins straight to the approvals dashboard.
//   email:    admin@sagana.app
//   password: Sagana@Admin1
// Change these before a real launch.
// ---------------------------------------------------------------------------
async function seedAdmin() {
  const email = "admin@sagana.app";
  const password = "Sagana@Admin1";
  try {
    const supabase = admin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: "admin", name: "Platform Admin" },
      email_confirm: true,
    });
    let userId = data?.user?.id;
    if (error) {
      // Likely already exists — look it up and reset the password to the known
      // value so these credentials always work (handles accounts created by
      // earlier code with a different password).
      console.log("Seed admin note:", error.message);
      const { data: list } = await supabase.auth.admin.listUsers();
      userId = list?.users?.find((u) => u.email === email)?.id;
      if (userId) {
        const { error: updErr } = await supabase.auth.admin.updateUserById(
          userId,
          { password, email_confirm: true, user_metadata: { role: "admin", name: "Platform Admin" } },
        );
        if (updErr) console.log("Admin password reset failed:", updErr.message);
      }
    }
    if (userId) {
      const existing = await kv.get(`profile:${userId}`);
      if (!existing) {
        await kv.set(`profile:${userId}`, {
          id: userId,
          email,
          role: "admin",
          name: "Platform Admin",
          status: "active",
          createdAt: new Date().toISOString(),
        });
      }
      console.log("Default admin account ready.");
    }
  } catch (e) {
    console.log("Seed admin failed:", e);
  }
}

await seedAdmin();

Deno.serve(app.fetch);
