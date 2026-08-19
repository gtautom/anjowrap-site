"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function PortalCabecalho({ mostrarSair = false }: { mostrarSair?: boolean }) {
  return (
    <header className="border-b border-borda px-6 py-4 md:px-16">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/anjowrap-offwhite.png"
            alt="ANJOWRAP"
            width={1588}
            height={693}
            className="h-auto w-[120px]"
          />
        </Link>
        {mostrarSair && (
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 font-mono text-legenda uppercase tracking-[0.1em] text-prata transition-colors hover:text-offwhite"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Sair
          </button>
        )}
      </div>
    </header>
  );
}
