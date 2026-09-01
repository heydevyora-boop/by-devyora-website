"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/app/actions/enquiry.actions";

type DeleteButtonProps = {
  id: string;
  action: (id: string) => Promise<ActionState>;
  confirmMessage?: string;
  label?: string;
};

export function DeleteButton({ id, action, confirmMessage = "Delete this item? This can't be undone.", label = "Delete" }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result = await action(id);
          if (!result.ok) {
            window.alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
      style={{
        background: "none",
        border: 0,
        padding: 0,
        cursor: isPending ? "default" : "pointer",
        fontSize: 12,
        letterSpacing: "0.06em",
        color: "#B3261E",
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? "Deleting…" : label}
    </button>
  );
}
