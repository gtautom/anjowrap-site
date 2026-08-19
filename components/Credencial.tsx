import { Contador } from "@/components/ui/contador";
import { CREDENCIAL, INDICADORES } from "@/lib/servicos";

export default function Credencial() {
  return (
    <section className="border-y border-borda bg-grafite">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-16 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-16">
          {/* Destaque — fio ambar, um unico acento no bloco */}
          <div className="border-l border-ambar pl-6">
            <p className="rotulo mb-3">Credencial</p>
            <p className="font-display text-[2rem] font-semibold uppercase leading-[1.05] tracking-[0.02em] md:text-h2">
              <span className="text-ambar">{CREDENCIAL.posicao}</span>{" "}
              {CREDENCIAL.evento}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-6">
            {INDICADORES.map((item) => (
              <div key={item.rotulo}>
                <dt className="sr-only">{item.rotulo}</dt>
                <dd>
                  <Contador
                    valor={item.valor}
                    className="block font-display text-[2.5rem] font-bold leading-none text-offwhite md:text-[3rem]"
                  />
                  <span className="mt-2 block font-mono text-rotulo uppercase tracking-[0.18em] text-prata">
                    {item.rotulo}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
