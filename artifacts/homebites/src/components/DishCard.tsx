import { Dish } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { QuantityStepper } from "./QuantityStepper";
import { Star, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FavoriteButton } from "@/components/FavoriteButton";

interface DishCardProps {
  dish: Dish;
  showChefName?: boolean;
}

export function DishCard({ dish, showChefName = false }: DishCardProps) {
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find((i) => i.kind === "dish" && i.refId === dish.id);
  const quantity = cartItem?.quantity || 0;

  const handleIncrease = () => {
    if (quantity === 0) {
      addItem({
        kind: "dish",
        refId: dish.id,
        name: dish.name,
        imageUrl: dish.imageUrl,
        unitPrice: dish.price,
        quantity: 1,
      });
    } else {
      updateQty("dish", dish.id, quantity + 1);
    }
  };

  const handleDecrease = () => {
    updateQty("dish", dish.id, quantity - 1);
  };

  return (
    <div className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={cn(
              "w-4 h-4 border flex items-center justify-center rounded-sm shrink-0",
              dish.isVeg ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full", dish.isVeg ? "bg-green-600" : "bg-red-600")} />
          </div>
          {dish.rating > 0 && (
            <div className="flex items-center text-yellow-500 text-xs font-medium">
              <Star className="w-3 h-3 fill-current mr-0.5" />
              {dish.rating.toFixed(1)}
            </div>
          )}
          {dish.spiceLevel !== "mild" && (
            <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1 rounded">
              {dish.spiceLevel}
            </span>
          )}
        </div>
        <h4 className="font-semibold text-foreground mb-0.5 line-clamp-2">{dish.name}</h4>
        {showChefName && (
          <p className="text-xs text-muted-foreground mb-1">By {dish.chefName}</p>
        )}
        <div className="font-medium text-sm mb-2">₹{dish.price}</div>
        <p className="text-sm text-muted-foreground line-clamp-2">{dish.description}</p>
      </div>
      <div className="w-[120px] shrink-0 flex flex-col items-center">
        <div className="w-full aspect-square rounded-lg overflow-hidden mb-[-16px] relative z-0">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover bg-muted"
            loading="lazy"
          />
          <div className="absolute top-1.5 right-1.5">
            <FavoriteButton
              size="sm"
              item={{
                kind: "dish",
                refId: dish.id,
                name: dish.name,
                imageUrl: dish.imageUrl,
                subtitle: dish.chefName,
                price: dish.price,
              }}
            />
          </div>
        </div>
        <div className="w-[100px] relative z-10 shadow-sm rounded-md bg-background">
          <QuantityStepper
            quantity={quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
