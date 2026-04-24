import { useListChefs } from "@workspace/api-client-react";
import { ChefCard } from "@/components/ChefCard";
import { LoadingGrid } from "@/components/LoadingGrid";
import { useSearch } from "wouter";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // Will create or fallback to simple timeout if doesn't exist. Actually I'll use a local state.
import { motion } from "framer-motion";

const POPULAR_CUISINES = ["North Indian", "South Indian", "Punjabi", "Bengali", "Mughlai", "Chinese", "Healthy"];

export default function ChefsPage() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialCategory = urlParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState(initialCategory);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: chefs, isLoading } = useListChefs({
    q: debouncedSearch || undefined,
    cuisine: selectedCuisine || undefined
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
    </div>
  );
}
