"use client";

import { Check, X } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { comparisonRows } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

function UsCell({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
      <Check className="w-4 h-4" />
      {value}
    </span>
  );
}

function CompetitorCell({ value }: { value: string }) {
  const isNegative = value === "No" || value === "Manual only";
  return (
    <span
      className={clsx(
        "text-sm",
        isNegative ? "text-white/20" : "text-white/40"
      )}
    >
      {isNegative && <X className="w-3.5 h-3.5 inline mr-1 text-white/15" />}
      {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="relative py-28 lg:py-36 bg-black overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-emerald-950/20 blur-[200px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Why Choose Us
              <br />
              <span className="text-white/40">Over Alternatives?</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              We&apos;re not just cheaper — we&apos;re better.
            </p>
          </div>
        </SectionWrapper>

        {/* Desktop Table */}
        <SectionWrapper delay={0.2}>
          <div className="hidden md:block">
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-5 text-left text-sm font-medium text-white/30">
                      Feature
                    </th>
                    <th className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                          Recommended
                        </span>
                        <span className="text-sm font-bold text-white">
                          Our Platform
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-medium text-white/30">
                      Hey Rosie
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-medium text-white/30">
                      Custom Build
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={clsx(
                        "transition-colors hover:bg-white/5",
                        index < comparisonRows.length - 1 && "border-b border-white/5"
                      )}
                    >
                      <td className="px-6 py-5 font-medium text-white/70 text-sm">
                        {row.feature}
                      </td>
                      <td className="px-6 py-5 text-center bg-emerald-500/5">
                        <UsCell value={row.us} />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <CompetitorCell value={row.heyRosie} />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <CompetitorCell value={row.customBuild} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionWrapper>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {comparisonRows.map((row, index) => (
            <SectionWrapper key={row.feature} delay={0.05 * index}>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold text-white mb-4 text-sm">
                  {row.feature}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/30">Us</span>
                    <UsCell value={row.us} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/30">Hey Rosie</span>
                    <CompetitorCell value={row.heyRosie} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/30">Custom Build</span>
                    <CompetitorCell value={row.customBuild} />
                  </div>
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
