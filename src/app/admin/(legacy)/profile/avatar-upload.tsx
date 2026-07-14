"use client";

/**
 * Coach/admin-profilbilde — samme uploadAvatar-action som PlayerHQ bruker
 * (Supabase Storage-bucket "avatars", nøkkelet på user.id). Sirkelen med
 * initialer var tidligere ren visning uten opplasting; nå direkte klikkbar.
 */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar } from "@/lib/storage/avatar";

export function AvatarUpload({
  initialUrl,
  initials,
}: {
  initialUrl: string | null;
  initials: string;
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    const formData = new FormData();
    formData.append("file", fil);
    startTransition(async () => {
      try {
        const res = await uploadAvatar(formData);
        setAvatarUrl(res.url);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Opplasting feilet.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="relative flex justify-center">
      <label
        htmlFor="admin-avatar-input"
        aria-label="Bytt profilbilde"
        className="group relative block h-24 w-24 cursor-pointer overflow-hidden rounded-full bg-primary"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-[32px] font-semibold text-primary-foreground">
            {initials || "AK"}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {pending ? (
            <Loader2 size={18} className="animate-spin text-white" />
          ) : (
            <Camera size={18} strokeWidth={1.5} className="text-white" />
          )}
        </span>
      </label>
      <input
        ref={inputRef}
        id="admin-avatar-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={velgBilde}
        disabled={pending}
        className="hidden"
      />
    </div>
  );
}
