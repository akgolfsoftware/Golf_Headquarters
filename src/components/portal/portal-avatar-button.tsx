"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { uploadAvatar } from "@/lib/storage/avatar";

type Props = {
  name: string;
  avatarUrl: string | null;
  initial: string;
  tier: "GRATIS" | "PRO";
};

export function PortalAvatarButton({ name, avatarUrl, initial, tier }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const isFree = tier === "GRATIS";

  function valg(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;

    const objectUrl = URL.createObjectURL(fil);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("file", fil);

    startTransition(async () => {
      try {
        const res = await uploadAvatar(formData);
        setPreview(res.url);
        URL.revokeObjectURL(objectUrl);
        router.refresh();
      } catch {
        setPreview(avatarUrl);
        URL.revokeObjectURL(objectUrl);
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <span className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        aria-label="Endre profilbilde"
        className="group relative grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary text-xl font-semibold text-primary-foreground transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 md:h-20 md:w-20 md:text-2xl"
      >
        {preview ? (
          <Image
            src={preview}
            alt={`Profilbilde av ${name}`}
            width={80}
            height={80}
            className="h-full w-full rounded-full object-cover"
            unoptimized
          />
        ) : (
          initial
        )}
        {/* Hover-overlay med kamera-ikon */}
        <span
          aria-hidden
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity ${pending ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <Camera className="h-5 w-5 text-white" strokeWidth={1.75} />
        </span>
      </button>

      {/* Tier-badge */}
      <span
        className="absolute -bottom-1 -right-1 rounded-sm border-2 border-background px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider"
        style={{
          background: isFree
            ? "hsl(var(--secondary))"
            : "hsl(var(--accent))",
          color: isFree
            ? "hsl(var(--muted-foreground))"
            : "hsl(var(--accent-foreground))",
        }}
      >
        {isFree ? "Free" : "Pro"}
      </span>

      {/* Skjult fil-input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={valg}
        className="hidden"
        aria-label="Last opp profilbilde"
      />
    </span>
  );
}
