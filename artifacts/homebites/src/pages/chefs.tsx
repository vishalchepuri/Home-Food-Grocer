import { useListChefs } from "@workspace/api-client-react";
import { ChefCard } from "@/components/ChefCard";
import { DishCard } from "@/components/DishCard";
import { LoadingGrid } from "@/components/LoadingGrid";
import { useSearch } from "wouter";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocationCity } from "@/hooks/use-location";
import { useQuery } from "@tanstack/react-query";
import { apiPath } from "@/lib/api-path";
import type { Dish } from "@workspace/api-client-react";

const POPULAR_CUISINES = [
  "North Indian",
  "South Indian",
  "Biryani",
  "Chinese",
  "Continental",
  "Italian",
  "Mexican",
  "Thai",
  "Arabian",
  "Desserts",
  "Japanese",
  "Korean",
  "Fast Food",
  "Street Food",
  "Pizza",
  "Burgers",
  "Cafe",
  "Andhra",
  "Kerala",
  "Rajasthani",
  "Mediterranean",
  "Lebanese",
  "Turkish",
  "Vietnamese",
  "Momos",
  "Rolls & Wraps",
  "BBQ & Grill",
  "Breakfast",
  "Salads",
  "Juices & Shakes",
  "Ice Cream",
  "North East",
  "Odia",
  "Hyderabadi",
  "Punjabi",
  "Bengali",
  "Mughlai",
  "Healthy",
  "Coastal",
  "Gujarati",
  "Bakery",
];

export default function ChefsPage() {
  const { city } = useLocationCity();
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialCategory = urlParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState(initialCategory);
  const [loadCuisineDishes, setLoadCuisineDishes] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLoadCuisineDishes(false);
  }, [selectedCuisine]);

  const { data: chefs, isLoading } = useListChefs({
    q: debouncedSearch || undefined,
    cuisine: selectedCuisine || undefined,
    city,
  } as { q?: string; cuisine?: string; city?: string });
  const { data: categoryDishes, isLoading: isLoadingDishes } = useQuery<Dish[]>({
    queryKey: ["category-dishes", selectedCuisine],
    enabled: !!selectedCuisine && loadCuisineDishes,
    queryFn: async () => {
      const res = await fetch(apiPath(`/api/search?q=${encodeURIComponent(selectedCuisine)}`));
      const data = await res.json();
      return Array.isArray(data.dishes) ? data.dishes.slice(0, 12) : [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Home Chefs</h1>
        <p className="text-muted-foreground">Discover authentic meals cooked with love by local chefs.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search chefs or cuisines..." 
            className="pl-10 rounded-full bg-muted/50 border-border/50 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground px-2">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          <button
            onClick={() => setSelectedCuisine("")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              selectedCuisine === "" 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            All
          </button>
          {POPULAR_CUISINES.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                selectedCuisine === cuisine 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingGrid count={8} />
      ) : chefs?.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-muted-foreground mb-2">No chefs found matching your criteria.</div>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCuisine(""); }}
            className="text-primary font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {chefs?.map((chef, i) => (
            <motion.div key={chef.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ChefCard chef={chef} />
            </motion.div>
          ))}
        </div>
      )}

      {selectedCuisine ? (
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Popular {selectedCuisine} food items
              </h2>
              <p className="text-sm text-muted-foreground">
                Dishes attached to restaurants serving this cuisine.
              </p>
            </div>
          </div>
          {!loadCuisineDishes ? (
            <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
              <button
                type="button"
                onClick={() => setLoadCuisineDishes(true)}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Load food items
              </button>
            </div>
          ) : isLoadingDishes ? (
            <LoadingGrid count={6} type="dish" />
          ) : categoryDishes && categoryDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} showChefName />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-muted-foreground">
              No food items found for this cuisine yet.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
