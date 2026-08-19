"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PortalCabecalho } from "@/components/portal/PortalCabecalho";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";

/** Só redireciona pro lugar certo — sem UI própria. */
export default function PortalRaiz() {
  const router = useRouter();
  const sessao = useSessaoPortal();

  useEffect(() => {
    if (sessao.carregando) return;
    if (!sessao.logado) router.replace("/portal/login");
    else if (sessao.tipo === "equipe") router.replace("/portal/equipe");
    else if (sessao.tipo === "cliente") router.replace("/portal/cliente");
    else router.replace("/portal/login");
  }, [sessao, router]);

  return (
    <>
      <PortalCabecalho />
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-prata" />
      </main>
    </>
  );
}
