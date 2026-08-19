import { ATENDIMENTO } from "@/lib/servicos";

export default function AreaAtendimento() {
  return (
    <section className="border-t border-borda px-6 py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="rotulo mb-4">Área de atendimento</p>
        <h2 className="text-[2rem] font-semibold leading-[1.05] tracking-[0.02em] md:text-h2">
          Todo o Brasil, oficina em Belém
        </h2>
        <p className="mt-6 max-w-leitura text-corpo text-prata">
          PPF, envelopamento, teto black piano e martelinho de ouro a gente atende para
          todo o Brasil. O serviço é combinado antes pelo WhatsApp, com prazo e data
          fechados.
        </p>
        <p className="mt-4 max-w-leitura text-corpo text-prata">
          Lavagem, higienização e o plano de lavagem semanal são presenciais — o carro
          precisa estar na oficina, em Belém.
        </p>

        <ul className="mt-8 flex flex-wrap gap-3">
          {ATENDIMENTO.map((item) => (
            <li
              key={item.rotulo}
              className="rounded-full border border-borda px-5 py-2 font-mono text-legenda uppercase tracking-[0.1em] text-prata"
            >
              {item.rotulo}
              <span className="ml-2 normal-case tracking-normal text-terciario">
                — {item.detalhe}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
