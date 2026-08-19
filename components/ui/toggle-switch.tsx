"use client";

import { cn } from "@/lib/utils";

/** Toggle on/off — usado onde um botão de texto (ex.: "aparece pros clientes") não era intuitivo. */
export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (valor: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50",
        checked ? "border-ambar bg-ambar/30" : "border-borda-forte bg-card",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full transition-transform",
          checked ? "translate-x-5 bg-ambar" : "translate-x-0.5 bg-prata",
        )}
      />
    </button>
  );
}
