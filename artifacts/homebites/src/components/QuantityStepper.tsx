import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  className,
  size = "md",
}: QuantityStepperProps) {
  if (quantity === 0) {
    return (
      <Button
        onClick={onIncrease}
        className={cn(
          "w-full text-primary-foreground font-semibold bg-primary hover:bg-primary/90",
          size === "sm" ? "h-8 text-xs" : "h-10",
          className
        )}
      >
        Add
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between border border-primary/20 rounded-md overflow-hidden bg-primary/5",
        size === "sm" ? "h-8" : "h-10",
        className
      )}
    >
      <button
        onClick={onDecrease}
        className="w-1/3 h-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      </button>
      <span className="w-1/3 text-center font-medium text-primary text-sm">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className="w-1/3 h-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      </button>
    </div>
  );
}
