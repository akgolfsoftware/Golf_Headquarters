"use client";

import { Button } from "@/components/athletic/golfdata";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, FileText, Download } from "lucide-react";

export function TesterDetailActions() {
  const router = useRouter();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => toast.info("Del-funksjon kommer snart")}
      >
        <Send size={14} strokeWidth={1.75} />
        Del med spiller
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => toast.info("PDF-eksport kommer snart")}
      >
        <FileText size={14} strokeWidth={1.75} />
        Eksporter PDF
      </Button>
      <Button
        variant="signal"
        size="sm"
        type="button"
        onClick={() => router.push("/admin/tester")}
      >
        <Download size={14} strokeWidth={1.75} />
        Logg ny test
      </Button>
    </>
  );
}
