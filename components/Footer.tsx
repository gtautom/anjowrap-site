import Image from "next/image";
import Link from "next/link";
import { linkWhatsAppDireto } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="border-t border-borda bg-grafite px-6 py-16 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            {/* Versao B do kit: off-white, padrao para fundo escuro */}
            <Image
              src="/brand/anjowrap-offwhite.png"
              alt="ANJOWRAP"
              width={1588}
              height={693}
              className="h-auto w-[160px]"
            />
            <p className="mt-5 max-w-leitura text-corpo text-prata">
              PPF, envelopamento e vitrificação. Aplicação para todo o Brasil, oficina
              em Belém do Pará.
            </p>
          </div>

          <div>
            <p className="rotulo mb-4">Contato</p>
            <ul className="space-y-3 text-corpo">
              <li>
                <a
                  href={linkWhatsAppDireto()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-offwhite transition-colors hover:text-ambar"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/anjowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-offwhite transition-colors hover:text-ambar"
                >
                  @anjowrap
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="rotulo mb-4">Site</p>
            <ul className="space-y-3 text-corpo">
              <li>
                <Link
                  href="/servicos"
                  className="text-offwhite transition-colors hover:text-ambar"
                >
                  Serviços e preços
                </Link>
              </li>
              <li>
                <a
                  href="/#galeria"
                  className="text-offwhite transition-colors hover:text-ambar"
                >
                  Trabalhos
                </a>
              </li>
              <li>
                <a
                  href="/#orcamento"
                  className="text-offwhite transition-colors hover:text-ambar"
                >
                  Orçamento
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-borda pt-6">
          <p className="font-mono text-legenda uppercase tracking-[0.1em] text-terciario">
            © {new Date().getFullYear()} ANJOWRAP · Belém · PA
          </p>
        </div>
      </div>
    </footer>
  );
}
