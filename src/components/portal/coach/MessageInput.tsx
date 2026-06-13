"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type MessageInputProps = {
  placeholder?: string;
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function MessageInput({ placeholder = "Skriv en melding…", disabled, onSend }: MessageInputProps) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl border border-input bg-background p-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Send melding"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-primary transition hover:brightness-105 disabled:opacity-40"
      >
        <Send className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </form>
  );
}
