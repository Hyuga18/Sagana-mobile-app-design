import { useState } from "react";
import { X, Send } from "lucide-react";
import { haptic } from "../lib/haptics";

type Message = { id: string; from: "me" | "them"; text: string };

// Lightweight placeholder messaging sheet. Replies are canned for now — the
// real backend can swap in later without changing the caller.
export function ChatSheet({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", from: "them", text: `Kumusta! This is ${name}. How can I help?` },
  ]);
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    haptic(8);
    const mine: Message = { id: "m" + Date.now(), from: "me", text };
    setMessages((prev) => [...prev, mine]);
    setDraft("");
    // Canned auto-reply so the placeholder feels alive.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "r" + Date.now(),
          from: "them",
          text: "Salamat sa mensahe! I'll get back to you shortly. 🌱",
        },
      ]);
    }, 900);
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close chat"
      />
      <div className="relative rounded-t-3xl bg-card border-t border-border h-[78%] flex flex-col overflow-hidden">
        <header className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-[15px]">{name}</p>
            <p className="text-[12px] text-primary">● Online</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-muted flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                  m.from === "me"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {m.text}
              </span>
            </div>
          ))}
        </div>

        <div className="px-4 pt-2 pb-6 border-t border-border flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 h-11 rounded-full bg-input-background px-4 text-[14px] outline-none"
            style={{ color: "var(--foreground)" }}
          />
          <button
            onClick={send}
            className="size-11 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
