import { useCart } from "@/hooks/use-cart";
import { QuantityStepper } from "@/components/QuantityStepper";
import { EmptyState } from "@/components/EmptyState";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const TIPS = [0, 10, 20, 30];

export default function CartPage() {
  const { items, updateQty, removeItem, totals } = useCart();
  const [selectedTip, setSelectedTip] = useState(0);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore top chefs and daily essentials."
          actionLabel="Start Ordering"
          actionHref="/"
        />
      </div>
    );
  }

  const dishes = items.filter(i => i.kind === "dish");
  const groceries = items.filter(i => i.kind === "product");

  const deliveryFee = 29;
  const grandTotal = totals.subtotal + deliveryFee + selectedTip;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
      <h1 className="font-display font-bold text-3xl mb-8">Cart Review</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {dishes.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
                <h3 className="font-semibold">Home Food</h3>
              </div>
              <div className="divide-y divide-border/50">
                {dishes.map((item) => (
                  <div key={`${item.kind}-${item.refId}`} className="flex items-center p-4 gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 line-clamp-1">{item.name}</h4>
                      <div className="font-semibold text-sm">₹{item.unitPrice}</div>
                    </div>
                    <div className="w-[100px] flex flex-col items-end gap-2">
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrease={() => updateQty(item.kind, item.refId, item.quantity + 1)}
                        onDecrease={() => updateQty(item.kind, item.refId, item.quantity - 1)}
                        size="sm"
                      />
                      <button onClick={() => removeItem(item.kind, item.refId)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groceries.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
                <h3 className="font-semibold">Groceries</h3>
              </div>
              <div className="divide-y divide-border/50">
                {groceries.map((item) => (
                  <div key={`${item.kind}-${item.refId}`} className="flex items-center p-4 gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-contain bg-muted/30 p-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 line-clamp-1">{item.name}</h4>
                      <div className="font-semibold text-sm">₹{item.unitPrice}</div>
                    </div>
                    <div className="w-[100px] flex flex-col items-end gap-2">
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrease={() => updateQty(item.kind, item.refId, item.quantity + 1)}
                        onDecrease={() => updateQty(item.kind, item.refId, item.quantity - 1)}
                        size="sm"
                      />
                      <button onClick={() => removeItem(item.kind, item.refId)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm sticky top-24">
            <h3 className="font-semibold mb-4 text-lg">Bill Details</h3>
            
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Total</span>
                <span className="font-medium">₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium text-primary">₹{deliveryFee}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="mb-4">
              <span className="text-sm font-medium mb-2 block">Tip your delivery partner</span>
              <div className="flex gap-2">
                {TIPS.map(tip => (
                  <button
                    key={tip}
                    onClick={() => setSelectedTip(tip)}
                    className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTip === tip ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {tip === 0 ? "No tip" : `₹${tip}`}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">To Pay</span>
              <span className="font-bold text-xl">₹{grandTotal}</span>
            </div>

            <Link href={`/checkout?tip=${selectedTip}`}>
              <Button className="w-full h-12 text-base rounded-xl">
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
