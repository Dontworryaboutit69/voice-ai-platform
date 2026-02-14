import { footerColumns } from "@/lib/constants/landing-data";

export function Footer() {
  return (
    <footer className="relative py-16 bg-black border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                VoiceAI
              </span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed mb-6">
              Build agency-grade voice AI agents for your business. No coding, no
              complexity.
            </p>
            {/* Social icons placeholder */}
            <div className="flex gap-2">
              {["X", "Li", "GH"].map((label) => (
                <div
                  key={label}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/30 hover:bg-white/10 hover:text-white/60 transition-colors cursor-pointer"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/30 hover:text-white/60 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; 2026 Voice AI Platform. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Powered by Claude AI &bull; Retell AI &bull; ElevenLabs
          </p>
        </div>
      </div>
    </footer>
  );
}
