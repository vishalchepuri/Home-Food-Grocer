import { useSearchAll, getSearchAllQueryKey } from "@workspace/api-client-react";
import { useSearch as useWouterSearch } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { ChefCard } from "@/components/ChefCard";
import { DishCard } from "@/components/DishCard";
import { ProductCard } from "@/components/ProductCard";
import { LoadingGrid } from "@/components/LoadingGrid";
import { EmptyState } from "@/components/EmptyState";

export default function SearchPage() {
  const searchString = useWouterSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialQ = urlParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearchAll(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 2, queryKey: getSearchAllQueryKey({ q: debouncedQuery }) } }
  );

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="sticky top-16 z-40 bg-background pt-2 pb-4 -mx-4 px-4 border-b border-border/50 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search for dishes, chefs, or groceries..." 
            className="pl-12 h-14 rounded-2xl bg-muted/30 border-border shadow-sm text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {debouncedQuery.length <= 2 ? (
        <div className="text-center py-20 text-muted-foreground">
          Type at least 3 characters to search
        </div>
      ) : isLoading ? (
        <div className="space-y-8">
          <LoadingGrid count={4} type="dish" />
        </div>
      ) : data ? (
        <div className="space-y-10">
          {(data.chefs.length === 0 && data.dishes.length === 0 && data.products.length === 0) && (
            <EmptyState 
              icon={<Search className="w-8 h-8" />}
              title="No results found"
              description={`We couldn't find anything matching "${debouncedQuery}". Try searching for something else.`}
            />
          )}

          {data.dishes.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xl mb-4">Dishes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.dishes.map(dish => <DishCard key={dish.id} dish={dish} showChefName />)}
              </div>
            </section>
          )}

          {data.chefs.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xl mb-4">Chefs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.chefs.map(chef => <ChefCard key={chef.id} chef={chef} />)}
              </div>
            </section>
          )}

          {data.products.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xl mb-4">Groceries</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.products.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
