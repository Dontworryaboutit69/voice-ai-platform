"use client";

import { Check, X } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { comparisonRows } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

function UsCell({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
      <Check className="w-4 h-4" />
      {value}
    </span>
  );
}

function CompetitorCell({ value }: { value: string }) {
  const isNegative = value === "No" || value === "Manual only" || value === "Manual scripting";
  return (
    <span
      className={clsx(
        "text-sm",
        isNegative ? "text-slate-300" : "text-slate-500"
      )}
    >
      {isNegative && <X className="w-3.5 h-3.5 inline mr-1 text-slate-300" />}
      {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="relative py-28 lg:py-36 bg-white overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Same Quality.
              <br />
              <span className="text-slate-400">Fraction of the Cost.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              Custom-built agents, self-learning AI, and thousands of voices&mdash;compared to the alternatives.
            </p>
          </div>
        </SectionWrapper>

        {/* Desktop Table */}
        <SectionWrapper delay={0.2}>
          <div className="hidden md:block">
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-lg shadow-slate-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-5 text-left text-sm font-medium text-slate-400">
                      Feature
                    </th>
                    <th className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                          Recommended
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          Our Platform
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-medium text-slate-400">
                      Hey Rosie
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-medium text-slate-400">
                      Custom Build
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={clsx(
                        "transition-colors hover:bg-slate-50",
                        index < comparisonRows.length - 1 && "border-b border-slate-100"
                      )}
                    >
                      <td className="px-6 py-5 font-medium text-slate-700 text-sm">
                        {row.feature}
                      </td>
                      <td className="px-6 py-5 text-center bg-emerald-50/50">
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
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 text-sm">
                  {row.feature}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Us</span>
                    <UsCell value={row.us} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Hey Rosie</span>
                    <CompetitorCell value={row.heyRosie} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Custom Build</span>
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
