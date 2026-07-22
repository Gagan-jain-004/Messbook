"use client";

export default function AdPlaceholder() {
  return (
    <div className="w-full flex justify-center mt-6">
      <div className="w-full max-w-[728px] h-[90px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border border-transparent rounded-xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02]">
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Tagline */}
        <span className="text-[11px] uppercase tracking-[0.25em] text-white/70 font-mono mb-1">
          Sponsored Content
        </span>

        {/* Call to action */}
        <p className="text-base text-white font-semibold">
          <a
            href="https://rtu-got-latent.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Post Anonymously at RTU Got Latent →
          </a>
        </p>
      </div>
    </div>
  );
}
