"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SubItemNav = {
  label: string;
  href: string;
};

export type NavItem = {
  id: number;
  label: string;
  link?: string;
  subMenus?: {
    title: string;
    items: SubItemNav[];
  }[];
};

type Props = {
  navItems: NavItem[];
  className?: string;
};

/**
 * Adaptado do componente fornecido: motion/react (nao framer-motion, ja
 * instalado no projeto), tokens do brandkit no lugar das classes shadcn
 * genericas, abre tambem no focus (nao so hover) e fecha no Escape.
 */
export function DropdownNavigation({ navItems, className }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoverAtivo, setHoverAtivo] = useState<number | null>(null);

  const abrir = (label: string) => setOpenMenu(label);
  const fechar = () => setOpenMenu(null);

  return (
    <nav className={cn("relative flex items-center", className)}>
      <ul className="relative flex items-center gap-1">
        {navItems.map((item) => (
          <li
            key={item.label}
            className="relative"
            onMouseEnter={() => abrir(item.label)}
            onMouseLeave={fechar}
            onKeyDown={(e) => {
              if (e.key === "Escape") fechar();
            }}
          >
            {item.subMenus ? (
              <button
                type="button"
                className="group relative flex cursor-pointer items-center gap-1 px-4 py-2 font-mono text-legenda uppercase tracking-[0.1em] text-prata transition-colors duration-300 hover:text-offwhite"
                onFocus={() => abrir(item.label)}
                onMouseEnter={() => setHoverAtivo(item.id)}
                onMouseLeave={() => setHoverAtivo(null)}
                aria-haspopup="true"
                aria-expanded={openMenu === item.label}
              >
                <span className="relative z-10">{item.label}</span>
                <ChevronDown
                  className={`relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180 ${
                    openMenu === item.label ? "rotate-180" : ""
                  }`}
                />
                {(hoverAtivo === item.id || openMenu === item.label) && (
                  <motion.div
                    layoutId="header-hover-bg"
                    className="absolute inset-0 size-full rounded-full bg-ambar/10"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ) : (
              <Link
                href={item.link ?? "#"}
                className="relative block px-4 py-2 font-mono text-legenda uppercase tracking-[0.1em] text-prata transition-colors duration-300 hover:text-offwhite"
              >
                {item.label}
              </Link>
            )}

            <AnimatePresence>
              {openMenu === item.label && item.subMenus && (
                <div className="absolute left-0 top-full w-auto pt-2">
                  <motion.div
                    layoutId="header-menu"
                    className="w-max rounded-2xl border border-border bg-card p-4"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex w-fit shrink-0 gap-9 overflow-hidden">
                      {item.subMenus.map((sub) => (
                        <div key={sub.title} className="w-full">
                          <p className="rotulo mb-3">{sub.title}</p>
                          <ul className="space-y-2">
                            {sub.items.map((sub_item) => (
                              <li key={sub_item.label}>
                                <Link
                                  href={sub_item.href}
                                  onClick={fechar}
                                  className="block whitespace-nowrap px-1 py-1 text-corpo text-prata transition-colors duration-300 hover:text-offwhite"
                                >
                                  {sub_item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </nav>
  );
}
