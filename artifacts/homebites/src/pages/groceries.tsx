import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { LoadingGrid } from "@/components/LoadingGrid";
import { useSearch } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function GroceriesPage() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialCategory = urlParams.get("category") ? parseInt(urlParams.get("category")!, 10) : undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategory);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categories } = useListCategories();
  const groceryCategories = categories?.filter(c => c.kind === "grocery") || [];

  const { data: products, isLoading } = useListProducts({
    q: debouncedSearch || undefined,
    categoryId: selectedCategory
  });

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-2">Groceries in 10 mins</h1>
        <p className="text-muted-foreground">Everyday essentials delivered fast.</p>
      </div>

      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search for milk, bread, eggs..." 
          className="pl-10 rounded-full bg-muted/50 border-border/50 h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-6 hide-scrollbar mb-4">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex flex-col items-center gap-2 ${
            selectedCategory === undefined ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-muted ${
            selectedCategory === undefined ? "border-primary" : "border-transparent"
          }`}>
            <span className="text-xs font-bold uppercase">ALL</span>
          </div>
          All Items
        </button>

        {groceryCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-2 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex flex-col items-center gap-2 ${
              selectedCategory === category.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`w-16 h-16 rounded-full border-2 overflow-hidden bg-muted ${
              selectedCategory === category.id ? "border-primary p-0.5" : "border-transparent"
            }`}>
              <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover rounded-full" />
            </div>
            {category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingGrid count={12} />
      ) : products?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <div className="text-muted-foreground mb-2">No products found.</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
