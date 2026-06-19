"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, FileText, Download } from "lucide-react";
import { AthleticButton } from "@/components/athletic";

export function TesterDetailActions() {
  const router = useRouter();
  return (
    <>
      <AthleticButton
        variant="ghost-light"
        size="sm"
        type="button"
        onClick={() => toast.info("Del-funksjon kommer snart")}
      >
        <Send size={14} strokeWidth={1.75} />
        Del med spiller
      </AthleticButton>
      <AthleticButton
        variant="ghost-light"
        size="sm"
        type="button"
        onClick={() => toast.info("PDF-eksport kommer snart")}
      >
        <FileText size={14} strokeWidth={1.75} />
        Eksporter PDF
      </AthleticButton>
      <AthleticButton
        variant="lime"
        size="sm"
        type="button"
        onClick={() => router.push("/admin/tester")}
      >
        <Download size={14} strokeWidth={1.75} />
        Logg ny test
      </AthleticButton>
    </>
  );
}
