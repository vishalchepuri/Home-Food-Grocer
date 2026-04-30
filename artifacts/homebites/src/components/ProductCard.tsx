import { Product } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { QuantityStepper } from "./QuantityStepper";
import { Link } from "wouter";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find((i) => i.kind === "product" && i.refId === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleIncrease = () => {
    if (quantity === 0) {
      addItem({
        kind: "product",
        refId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity: 1,
      });
    } else {
      updateQty("product", product.id, quantity + 1);
    }
  };

  const handleDecrease = () => {
    updateQty("product", product.id, quantity - 1);
  };

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="relative flex flex-col bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm h-full hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`} className="relative aspect-square p-4 bg-muted/30 cursor-pointer block">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary/10 p-3 text-center text-xs font-semibold text-primary">
            {product.name}
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        {discount > 0 && (
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
            {discount}% OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-background px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton
          size="sm"
          item={{
            kind: "product",
            refId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            subtitle: product.unit,
            price: product.price,
          }}
        />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-xs text-muted-foreground mb-1">{product.unit}</div>
        <Link href={`/products/${product.id}`} className="block mb-2 cursor-pointer">
          <h4 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h4>
        </Link>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-sm">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                ₹{product.mrp}
              </span>
            )}
          </div>
          {product.inStock ? (
            <div className="w-[80px]">
              <QuantityStepper
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                size="sm"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
