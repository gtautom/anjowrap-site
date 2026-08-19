const BLOCOS = [
  {
    numero: "01",
    titulo: "Protege do quê",
    texto:
      "Pedrisco de estrada, arranhão de lavagem, marca de inseto e respingo de combustível. A película fica sobre a pintura original e absorve o atrito no lugar dela — a cor do carro não muda.",
  },
  {
    numero: "02",
    titulo: "Quanto tempo dura",
    texto:
      "De cinco a dez anos, dependendo da linha aplicada e de quanto o carro roda na estrada. Risco leve na superfície some sozinho com o calor do sol — a película volta ao estado liso.",
  },
  {
    numero: "03",
    titulo: "Diferença para polimento e cristalização",
    texto:
      "Polimento corrige o que já aconteceu: tira risco do verniz. Revestimento cerâmico facilita a limpeza e dá brilho. Nenhum dos dois é barreira física — só o PPF impede que o dano chegue na pintura.",
  },
];

export default function SobrePPF() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-16 md:py-28">
      <p className="rotulo mb-4">O que é PPF</p>
      <h2 className="max-w-[20ch] text-[2rem] font-semibold leading-[1.05] tracking-[0.02em] md:text-h2">
        A proteção que você não vê
      </h2>

      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {BLOCOS.map((bloco) => (
          <article key={bloco.numero} className="border-t border-borda pt-6">
            {/* Numeracao tipografica grande — o kit proibe icone de biblioteca */}
            <span
              className="block font-display text-[3.5rem] font-bold leading-none text-ambar"
              aria-hidden
            >
              {bloco.numero}
            </span>
            <h3 className="mt-4 text-h3 font-semibold tracking-[0.14em] text-offwhite">
              {bloco.titulo}
            </h3>
            <p className="mt-4 max-w-leitura text-corpo text-prata">
              {bloco.texto}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
