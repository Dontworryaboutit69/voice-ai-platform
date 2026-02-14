"use client";

import { Check, X, Minus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { comparisonRows } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

function UsCell({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-100">
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
        "text-sm font-medium",
        isNegative ? "text-slate-400" : "text-slate-500"
      )}
    >
      {isNegative && <X className="w-4 h-4 inline mr-1 text-slate-300" />}
      {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50">
      <Container>
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-[var(--font-heading)] tracking-tight">
              Why Choose Us Over{" "}
              <span className="gradient-text">Alternatives?</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              We&apos;re not just cheaper — we&apos;re better.
            </p>
          </div>
        </SectionWrapper>

        {/* Desktop Table */}
        <SectionWrapper delay={0.2}>
          <div className="hidden md:block">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300">
                      Feature
                    </th>
                    <th className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                          Recommended
                        </span>
                        <span className="text-sm font-bold text-white">
                          Our Platform
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-slate-400">
                      Hey Rosie
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-slate-400">
                      Custom Build
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-5 font-semibold text-slate-900 text-sm">
                        {row.feature}
                      </td>
                      <td className="px-6 py-5 text-center bg-indigo-50/20">
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
        <div className="md:hidden space-y-4">
          {comparisonRows.map((row, index) => (
            <SectionWrapper key={row.feature} delay={0.05 * index}>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900 mb-3">
                  {row.feature}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Us</span>
                    <UsCell value={row.us} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Hey Rosie</span>
                    <CompetitorCell value={row.heyRosie} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Custom Build</span>
                    <CompetitorCell value={row.customBuild} />
                  </div>
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
