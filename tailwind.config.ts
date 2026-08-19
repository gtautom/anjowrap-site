import type { Config } from "tailwindcss";

/**
 * Tokens extraidos de identidade/ANJOWRAP Brand Kit.dc.html.
 * Fonte unica de verdade. Nao adicionar cor ou fonte que nao esteja no kit.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Paleta principal — proporcao 60/30/5/5 */
        preto: "#0B0C0E", // Preto Verniz — dominante 60%
        grafite: "#15181A", // Grafite Fume — superficie de card
        ambar: "#C6A15B", // Ambar Verniz — acento, teto de 5%
        prata: "#8A8F94", // Prata Nevoa — texto secundario
        offwhite: "#EFEDE8", // Off-White Ceramico — texto principal

        /* Apoio lido do kit */
        "ambar-claro": "#E0C486",
        borda: "#2A2E33",
        "borda-forte": "#3A3E43",
        divisor: "#1C1F22",
        elevado: "#26292D",
        "texto-claro": "#D6D8DA",
        terciario: "#5F646A",

        /*
         * Aliases semanticos no padrao shadcn. Existem so para que componentes
         * de terceiros compilem sem reescrita — cada um aponta para um token do
         * brandkit acima. Nao introduzem cor nova.
         */
        background: "#0B0C0E", // = preto
        foreground: "#EFEDE8", // = offwhite
        card: "#15181A", // = grafite
        "card-foreground": "#EFEDE8",
        popover: "#15181A",
        "popover-foreground": "#EFEDE8",
        muted: "#15181A", // = grafite
        "muted-foreground": "#8A8F94", // = prata
        border: "#2A2E33", // = borda
        input: "#2A2E33",
        ring: "#C6A15B", // = ambar
        primary: "#C6A15B", // = ambar
        "primary-foreground": "#0B0C0E",
        secondary: "#26292D", // = elevado
        "secondary-foreground": "#EFEDE8",
        accent: "#C6A15B",
        "accent-foreground": "#0B0C0E",
      },
      fontFamily: {
        display: ["var(--font-saira)", "sans-serif"], // Saira Condensed
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      fontSize: {
        /* Escala definida no kit: tamanho / entrelinha */
        rotulo: ["0.625rem", { lineHeight: "1.2", letterSpacing: "0.18em" }], // 10px mono
        legenda: ["0.75rem", { lineHeight: "1.8", letterSpacing: "0.1em" }], // 12px mono
        corpo: ["1.0625rem", { lineHeight: "1.647" }], // 17/28
        h3: ["1.375rem", { lineHeight: "1.27", letterSpacing: "0.14em" }], // 22/28
        h2: ["2.5rem", { lineHeight: "1.05", letterSpacing: "0.02em" }], // 40/42
        h1: ["4rem", { lineHeight: "1", letterSpacing: "0.01em" }], // 64/64
      },
      maxWidth: {
        leitura: "68ch", // limite de linha definido no kit
      },
    },
  },
  plugins: [],
};

export default config;
