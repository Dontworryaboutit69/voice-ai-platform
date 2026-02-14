"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import type { FAQItem } from "@/lib/types/landing";

interface AccordionProps {
  items: FAQItem[];
  variant?: "dark" | "light";
}

export function Accordion({ items, variant = "dark" }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const isLight = variant === "light";

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={clsx(
              "rounded-xl border transition-all duration-300",
              isLight
                ? isOpen
                  ? "border-slate-300 bg-white shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                : isOpen
                  ? "border-white/15 bg-white/5"
                  : "border-white/10 bg-white/5 hover:border-white/10"
            )}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between px-6 py-5 text-left cursor-pointer"
            >
              <span
                className={clsx(
                  "text-[15px] font-semibold pr-4",
                  isLight ? "text-slate-800" : "text-white/80"
                )}
              >
                {item.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <ChevronDown
                  className={clsx(
                    "w-4 h-4",
                    isLight ? "text-slate-400" : "text-white/30"
                  )}
                />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className={clsx(
                      "px-6 pb-5 leading-relaxed text-[15px]",
                      isLight ? "text-slate-500" : "text-white/40"
                    )}
                  >
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
