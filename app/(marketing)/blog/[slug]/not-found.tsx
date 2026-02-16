import { ArrowLeft } from "lucide-react";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-extrabold text-slate-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Post Not Found
        </h1>
        <p className="text-slate-500 mb-8">
          The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </a>
      </div>
    </div>
  );
}
