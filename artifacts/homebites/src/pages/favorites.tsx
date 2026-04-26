import { Link } from "wouter";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/hooks/use-favorites";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const { items, remove, clear } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();

  const chefs = items.filter((i) => i.kind === "chef");
  const dishes = items.filter((i) => i.kind === "dish");
  const products = items.filter((i) => i.kind === "product");

  const addToCart = (fav: FavoriteItem) => {
    if (fav.kind === "chef" || fav.price == null) return;
    addItem({
      kind: fav.kind,
      refId: fav.refId,
      name: fav.name,
      imageUrl: fav.imageUrl,
      unitPrice: fav.price,
      quantity: 1,
    });
    toast({ title: "Added to cart", description: fav.name });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
        <h1 className="font-display font-bold text-3xl mb-8">Your favorites</h1>
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState
            icon={<Heart className="w-8 h-8" />}
            title="No favorites yet"
            description="Tap the heart on any chef, dish or grocery to save it here for next time."
            actionLabel="Explore home chefs"
            actionHref="/chefs"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-5xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Your favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} saved {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-1.5" /> Clear all
        </Button>
      </div>

      {chefs.length > 0 && (
        <Section title="Home chefs" count={chefs.length}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chefs.map((fav) => (
              <Link key={`chef-${fav.refId}`} href={`/chefs/${fav.refId}`}>
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={fav.imageUrl}
                      alt={fav.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display font-semibold line-clamp-1">
                        {fav.name}
                      </div>
                      {fav.subtitle && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {fav.subtitle}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        remove("chef", fav.refId);
                      }}
                      className="text-muted-foreground hover:text-destructive shrink-0 p-1"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {dishes.length > 0 && (
        <Section title="Saved dishes" count={dishes.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dishes.map((fav) => (
              <FavRow
                key={`dish-${fav.refId}`}
                fav={fav}
                onRemove={() => remove("dish", fav.refId)}
                onAdd={() => addToCart(fav)}
              />
            ))}
          </div>
        </Section>
      )}

      {products.length > 0 && (
        <Section title="Saved groceries" count={products.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((fav) => (
              <FavRow
                key={`product-${fav.refId}`}
                fav={fav}
                onRemove={() => remove("product", fav.refId)}
                onAdd={() => addToCart(fav)}
                contain
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
        {title}
        <span className="text-sm font-medium text-muted-foreground">({count})</span>
      </h2>
      {children}
    </section>
  );
}

function FavRow({
  fav,
  onRemove,
  onAdd,
  contain,
}: {
  fav: FavoriteItem;
  onRemove: () => void;
  onAdd: () => void;
  contain?: boolean;
}) {
  const detailHref =
    fav.kind === "dish"
      ? "#"
      : fav.kind === "product"
        ? `/products/${fav.refId}`
        : "#";
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-3 shadow-sm flex gap-3 items-center">
      {detailHref !== "#" ? (
        <Link href={detailHref} className="shrink-0">
          <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden">
            <img
              src={fav.imageUrl}
              alt={fav.name}
              className={
                contain ? "w-full h-full object-contain p-1" : "w-full h-full object-cover"
              }
            />
          </div>
        </Link>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
          <img
            src={fav.imageUrl}
            alt={fav.name}
            className={
              contain ? "w-full h-full object-contain p-1" : "w-full h-full object-cover"
            }
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm line-clamp-2">{fav.name}</div>
        {fav.subtitle && (
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {fav.subtitle}
          </div>
        )}
        {fav.price != null && (
          <div className="font-semibold text-sm mt-1">₹{fav.price}</div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <Button size="sm" onClick={onAdd} className="h-8 px-3">
          <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-8 px-3 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
