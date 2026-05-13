"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { uploadAvatar, deleteAvatar } from "@/lib/storage/avatar";

type Props = {
  name: string;
  avatarUrl: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarUpload({ name, avatarUrl }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);

  function valg(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setError(null);

    // Vis local preview umiddelbart
    const objectUrl = URL.createObjectURL(fil);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append("file", fil);

    startTransition(async () => {
      try {
        const res = await uploadAvatar(formData);
        setPreviewUrl(res.url);
        URL.revokeObjectURL(objectUrl);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Opplasting feilet.");
        setPreviewUrl(avatarUrl);
        URL.revokeObjectURL(objectUrl);
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function slett() {
    if (!confirm("Slett profilbilde?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteAvatar();
        setPreviewUrl(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sletting feilet.");
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Profilbilde av ${name}`}
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            initials(name)
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          aria-label="Bytt profilbilde"
          className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={valg}
          className="hidden"
          aria-label="Last opp profilbilde"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
          {pending ? "Laster opp …" : previewUrl ? "Bytt bilde" : "Last opp bilde"}
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={slett}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Slett
          </button>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG eller WEBP. Maks 2 MB.
        </p>
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
