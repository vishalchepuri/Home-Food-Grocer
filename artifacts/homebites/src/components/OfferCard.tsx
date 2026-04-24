import { Offer } from "@workspace/api-client-react";

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div 
      className="shrink-0 w-[280px] h-[140px] rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden text-white"
      style={{ backgroundColor: offer.accentColor }}
    >
      {/* Decorative background elements */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-black/10 blur-2xl" />
      
      <div className="relative z-10">
        <h3 className="font-display font-bold text-xl mb-1">{offer.title}</h3>
        <p className="text-white/90 text-sm mb-4 leading-tight">{offer.subtitle}</p>
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
          <span className="text-xs uppercase tracking-wider font-semibold">Code:</span>
          <span className="font-mono font-bold text-sm bg-white text-black px-1.5 py-0.5 rounded">
            {offer.code}
          </span>
        </div>
      </div>
    </div>
  );
}
