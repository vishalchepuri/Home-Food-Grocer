import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StickyCartBar() {
  const { totals } = useCart();
  const [location] = useLocation();

  // Hide on pages that already deal with cart/checkout directly
  if (location === "/cart" || location === "/checkout" || totals.count === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50"
      >
        <Link href="/cart">
          <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-xl flex items-center justify-between cursor-pointer hover:bg-primary/95 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">
                  {totals.count} {totals.count === 1 ? "Item" : "Items"}
                </span>
                <span className="text-xs text-white/90">₹{totals.subtotal}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-semibold text-sm">
              View Cart <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
