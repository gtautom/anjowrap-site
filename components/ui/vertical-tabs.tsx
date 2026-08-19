"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TabItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  /** Alt descritivo. Exigencia de SEO — nunca deixar vazio. */
  alt: string;
  /** Quando presente, mostra CTA na aba ativa levando pro item no catálogo. */
  href?: string;
};

export type VerticalTabsProps = {
  items: TabItem[];
  /** Titulo da secao. */
  heading: string;
  /** Rotulo tecnico em mono acima do titulo. */
  eyebrow: string;
  /** Milissegundos por aba antes de avancar sozinho. @default 5000 */
  autoPlay?: number;
  className?: string;
};

export function VerticalTabs({
  items,
  heading,
  eyebrow,
  autoPlay = 5000,
  className,
}: VerticalTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(handleNext, autoPlay);
    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext, autoPlay]);

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
    center: { zIndex: 1, y: 0, opacity: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const ativo = items[activeIndex];

  return (
    <section
      id="servicos"
      className={cn("w-full bg-background py-16 md:py-24", className)}
    >
      <div className="mx-auto w-full px-6 md:px-12 xl:px-20">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Coluna esquerda: as abas */}
          <div className="order-2 flex flex-col justify-center pt-4 lg:order-1 lg:col-span-5">
            <div className="mb-12 space-y-1">
              <h2 className="text-balance font-display text-[2rem] font-semibold uppercase tracking-[0.02em] text-foreground md:text-h2">
                {heading}
              </h2>
              <span className="ml-0.5 block font-mono text-rotulo uppercase tracking-[0.3em] text-muted-foreground">
                ({eyebrow})
              </span>
            </div>

            <div className="flex flex-col space-y-0">
              {items.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  // div, nao button: a aba ativa pode conter um <Link> de CTA,
                  // e <a> dentro de <button> e aninhamento invalido em HTML.
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTabClick(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTabClick(index);
                      }
                    }}
                    aria-current={isActive}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-4 border-t border-border/50 py-6 text-left transition-all duration-500 first:border-0 md:py-8",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground/60 hover:text-foreground",
                    )}
                  >
                    {/* Trilho de progresso — o unico ambar da coluna */}
                    <div className="absolute bottom-0 left-[-16px] top-0 w-[2px] bg-muted md:left-[-24px]">
                      {isActive && (
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="absolute left-0 top-0 w-full origin-top bg-ambar"
                          initial={{ height: "0%" }}
                          animate={isPaused ? { height: "0%" } : { height: "100%" }}
                          transition={{
                            duration: autoPlay / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>

                    <span className="mt-2 font-mono text-rotulo tabular-nums text-ambar opacity-80">
                      /{item.id}
                    </span>

                    <div className="flex flex-1 flex-col gap-2">
                      <span className="font-display text-2xl font-semibold uppercase tracking-[0.04em] transition-colors duration-500 md:text-3xl lg:text-4xl">
                        {item.title}
                      </span>

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="max-w-leitura pb-2 text-corpo font-normal leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                            {item.href && (
                              <Button asChild variant="outline" size="sm" className="mt-1 w-fit">
                                <Link href={item.href} onClick={(e) => e.stopPropagation()}>
                                  Ver na tabela de preços
                                </Link>
                              </Button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna direita: a imagem */}
          <div className="order-1 flex h-full flex-col justify-end lg:order-2 lg:col-span-7">
            <div
              className="group/gallery relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/40 bg-muted/30 md:aspect-[4/3] md:rounded-[2rem] lg:aspect-[16/11]">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 260, damping: 32 },
                      opacity: { duration: 0.4 },
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer"
                    onClick={handleNext}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ativo.image}
                      alt={ativo.alt}
                      className="!m-0 block !p-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-preto/60 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-6 right-6 z-20 flex gap-2 md:bottom-8 md:right-8 md:gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-md transition-all hover:border-ambar hover:text-ambar active:scale-90 md:h-12 md:w-12"
                    aria-label="Serviço anterior"
                  >
                    <ChevronLeft size={20} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-md transition-all hover:border-ambar hover:text-ambar active:scale-90 md:h-12 md:w-12"
                    aria-label="Próximo serviço"
                  >
                    <ChevronRight size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerticalTabs;
