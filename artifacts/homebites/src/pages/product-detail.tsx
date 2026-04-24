import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { QuantityStepper } from "@/components/QuantityStepper";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0", 10);

  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) }
  });

  const { items, addItem, updateQty } = useCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <div className="container mx-auto px-4 py-20 text-center">Product not found.</div>;
  }

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

  const handleDecrease = () => updateQty("product", product.id, quantity - 1);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/groceries" className="hover:text-foreground">Groceries</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/groceries?category=${product.categoryId}`} className="hover:text-foreground">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-muted/30 p-8 flex items-center justify-center relative">
            <img src={product.imageUrl} alt={product.name} className="w-full max-w-md aspect-square object-contain mix-blend-multiply" />
            {discount > 0 && (
              <div className="absolute top-6 left-6 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-lg shadow-sm">
                {discount}% OFF
              </div>
            )}
          </div>
          
          <div className="p-6 md:p-10 flex flex-col">
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">{product.name}</h1>
              <div className="text-muted-foreground font-medium">{product.unit}</div>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold">₹{product.price}</span>
                {product.mrp > product.price && (
                  <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50 mb-1">
                    MRP ₹{product.mrp}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">(Inclusive of all taxes)</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl mb-8">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="mt-auto">
              {product.inStock ? (
                <div className="max-w-[200px]">
                  <QuantityStepper
                    quantity={quantity}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    className="h-12"
                  />
                </div>
              ) : (
                <div className="bg-muted text-muted-foreground font-semibold px-6 py-3 rounded-xl inline-block text-center w-full max-w-[200px]">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
