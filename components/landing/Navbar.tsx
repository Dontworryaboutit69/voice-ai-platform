"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { navLinks } from "@/lib/constants/landing-data";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed top-0 inset-x-0 z-50 transition-all duration-700",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div
        className={clsx(
          "max-w-6xl mx-auto px-4 transition-all duration-700 rounded-2xl",
          scrolled
            ? "mx-4 sm:mx-auto glass-light !bg-white/90 shadow-xl shadow-black/5"
            : ""
        )}
      >
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span
              className={clsx(
                "text-lg font-bold tracking-tight transition-colors duration-300",
                scrolled ? "text-slate-900" : "text-white"
              )}
            >
              VoiceAI
            </span>
          </a>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={clsx(
                  "px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300",
                  scrolled
                    ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/onboarding"
            className={clsx(
              "hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300",
              scrolled
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-white text-slate-900 hover:bg-white/90"
            )}
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={clsx(
              "md:hidden p-2 rounded-lg",
              scrolled ? "text-slate-900" : "text-white"
            )}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 mx-4 rounded-2xl glass-light !bg-white/95 shadow-2xl overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <a
                  href="/onboarding"
                  className="block w-full text-center px-4 py-3 rounded-lg bg-slate-900 text-white text-sm font-semibold"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
