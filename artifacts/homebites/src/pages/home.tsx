import { 
  useGetOffers, 
  useListCategories
} from "@workspace/api-client-react";
import { OfferCard } from "@/components/OfferCard";
import { CategoryTile } from "@/components/CategoryTile";
import { ChefCard } from "@/components/ChefCard";
import { DishCard } from "@/components/DishCard";
import { ProductCard } from "@/components/ProductCard";
import { LoadingGrid } from "@/components/LoadingGrid";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocationCity } from "@/hooks/use-location";
import { apiPath } from "@/lib/api-path";
import { useState } from "react";
import type { Chef, Dish, Product } from "@workspace/api-client-react";

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export default function Home() {
  const { city } = useLocationCity();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loadPopularDishes, setLoadPopularDishes] = useState(false);
  const [loadGroceries, setLoadGroceries] = useState(false);
  const { data: offers, isLoading: isLoadingOffers } = useGetOffers();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: featuredChefs, isLoading: isLoadingChefs } = useQuery<Chef[]>({
    queryKey: ["featured-chefs", city],
    queryFn: () =>
      fetch(apiPath(`/api/dashboard/featured-chefs?city=${encodeURIComponent(city)}&limit=4`)).then((res) =>
        res.json(),
      ),
  });
  const { data: popularDishes, isLoading: isLoadingDishes } = useQuery<Dish[]>({
    queryKey: ["popular-dishes", city],
    enabled: loadPopularDishes,
    queryFn: () =>
      fetch(apiPath(`/api/dashboard/popular-dishes?city=${encodeURIComponent(city)}&limit=6`)).then((res) =>
        res.json(),
      ),
  });
  const { data: groceryEssentials, isLoading: isLoadingGroceries } = useQuery<Product[]>({
    queryKey: ["grocery-essentials", 8],
    enabled: loadGroceries,
    queryFn: () =>
      fetch(apiPath("/api/dashboard/grocery-essentials?limit=8")).then((res) =>
        res.json(),
      ),
  });

  const offersList = asArray(offers);
  const categoriesList = asArray(categories);
  const featuredChefsList = asArray(featuredChefs);
  const popularDishesList = asArray(popularDishes);
  const groceryEssentialsList = asArray(groceryEssentials);

  const homeFoodCategories = categoriesList.filter(c => c.kind === "home_food");
  const groceryCategories = categoriesList.filter(c => c.kind === "grocery");
  const visibleHomeFoodCategories = showAllCategories
    ? homeFoodCategories
    : homeFoodCategories.slice(0, 12);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Hero / Offers Section */}
      <section className="pt-6 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-2xl mb-4">Great offers for you</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
            {isLoadingOffers ? (
              <div className="flex gap-4">
                {[1, 2, 3].map(i => <div key={i} className="w-[280px] h-[140px] bg-muted rounded-2xl shrink-0 animate-pulse" />)}
              </div>
            ) : offersList.map((offer) => (
              <div key={offer.id} className="snap-start">
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-xl mb-4">Eat what makes you happy</h2>
          {isLoadingCategories ? (
            <div className="flex gap-6 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-20 h-20 rounded-full bg-muted animate-pulse shrink-0" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-5 gap-y-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {visibleHomeFoodCategories.map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
            </div>
          )}
          {!isLoadingCategories && homeFoodCategories.length > visibleHomeFoodCategories.length ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllCategories(true)}
                className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                Load more cuisines
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured Chefs */}
      <section className="bg-muted/30 py-10 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl">Top Home Chefs</h2>
            <Link href="/chefs" className="text-primary font-medium flex items-center text-sm hover:underline">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {isLoadingChefs ? (
            <LoadingGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredChefsList.map((chef, i) => (
                <motion.div key={chef.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <ChefCard chef={chef} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Dishes */}
      <section>
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-2xl mb-6">Popular Right Now</h2>
          {!loadPopularDishes ? (
            <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
              <button
                type="button"
                onClick={() => setLoadPopularDishes(true)}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Load popular dishes
              </button>
            </div>
          ) : isLoadingDishes ? (
            <LoadingGrid count={6} type="dish" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {popularDishesList.map((dish, i) => (
                <motion.div key={dish.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <DishCard dish={dish} showChefName />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Daily Essentials */}
      <section className="mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Daily Essentials</h2>
              <p className="text-muted-foreground text-sm">Delivered in 10 minutes</p>
            </div>
            <Link href="/groceries" className="text-primary font-medium flex items-center text-sm hover:underline">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {groceryCategories.map((category) => (
              <Link key={category.id} href={`/groceries?category=${category.id}`}>
                <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer border border-border">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>

          {!loadGroceries ? (
            <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
              <button
                type="button"
                onClick={() => setLoadGroceries(true)}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Load daily essentials
              </button>
            </div>
          ) : isLoadingGroceries ? (
            <LoadingGrid count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groceryEssentialsList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
