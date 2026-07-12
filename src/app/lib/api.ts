import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

// Singleton browser client (used for login / session / logout).
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7d7416f`;

export type Profile = {
  id: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
  name: string;
  phone?: string;
  status: "active" | "pending" | "rejected";
  createdAt: string;
  // farmer
  barangay?: string;
  crops?: string[];
  // buyer
  businessName?: string;
  businessType?: string;
  permitNumber?: string;
  permitType?: string | null;
  contactPerson?: string;
  rejectionReason?: string | null;
};

async function post(path: string, body: unknown, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? publicAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`POST ${path} failed:`, data);
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

async function get(path: string, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token ?? publicAnonKey}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`GET ${path} failed:`, data);
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export type SignupPayload = {
  email: string;
  password: string;
  role: "farmer" | "buyer" | "admin";
  name?: string;
  phone?: string;
  barangay?: string;
  crops?: string[];
  businessName?: string;
  businessType?: string;
  permitNumber?: string;
  contactPerson?: string;
  adminCode?: string;
};

export async function signUp(payload: SignupPayload): Promise<Profile> {
  const data = await post("/signup", payload);
  return data.profile;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Sign in error:", error);
    throw new Error(error.message);
  }
  return data.session?.access_token ?? null;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

export async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function fetchProfile(token: string): Promise<Profile> {
  const data = await get("/profile", token);
  return data.profile;
}

export type ResubmitPayload = {
  businessName: string;
  businessType: string;
  permitNumber: string;
  contactPerson?: string;
  barangay?: string;
  phone?: string;
};

export async function resubmitBusiness(
  token: string,
  payload: ResubmitPayload,
): Promise<Profile> {
  const data = await post("/resubmit", payload, token);
  return data.profile;
}

export async function fetchBuyers(token: string): Promise<Profile[]> {
  const data = await get("/admin/pending", token);
  return data.buyers;
}

export async function approveBuyer(
  token: string,
  userId: string,
  approve: boolean,
): Promise<Profile> {
  const data = await post("/admin/approve", { userId, approve }, token);
  return data.profile;
}
