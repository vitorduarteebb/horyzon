"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

const MARK = "/brand/horyzon-mark-white.png";
const WORDMARK = "/brand/horyzon-wordmark-white.png";

type Props = {
  /** Ícone constellation (compacto, ex.: sidebar) vs. marca + wordmark. */
  variant: "mark" | "wordmark";
  className?: string;
};

/**
 * Logos monochrome fornecidas em PNG (branco sobre preto nos ficheiros).
 * O contentor `bg-neutral-950` garante contraste igual em tema claro e escuro — alinhado a [horyzonn.com.br](https://horyzonn.com.br).
 */
export function HoryzonLogo({ variant, className }: Props) {
  const src = variant === "mark" ? MARK : WORDMARK;

  const sizes =
    variant === "mark"
      ? { container: "size-11 p-2.5 rounded-2xl", w: 80, h: 80 }
      : {
          container: "h-28 w-full max-w-[240px] p-6 rounded-3xl mx-auto",
          w: 480,
          h: 200,
        };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-neutral-950 shadow-sm ring-1 ring-white/10",
        sizes.container,
        className,
      )}
    >
      <Image src={src} alt="HORYZON" width={sizes.w} height={sizes.h} className="h-full w-full object-contain" priority />
    </div>
  );
}
