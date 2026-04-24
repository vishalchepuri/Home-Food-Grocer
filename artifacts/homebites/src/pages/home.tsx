import { 
  useGetOffers, 
  useListCategories, 
  useGetFeaturedChefs, 
  useGetPopularDishes, 
  useGetGroceryEssentials 
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

export default function Home() {
  const { data: offers, isLoading: isLoadingOffers } = useGetOffers();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: featuredChefs, isLoading: isLoadingChefs } = useGetFeaturedChefs();
  const { data: popularDishes, isLoading: isLoadingDishes } = useGetPopularDishes();
  const { data: groceryEssentials, isLoading: isLoadingGroceries } = useGetGroceryEssentials();

  const homeFoodCategories = categories?.filter(c => c.kind === "home_food") || [];
  const groceryCategories = categories?.filter(c => c.kind === "grocery") || [];

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
            ) : offers?.map((offer) => (
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
            <div className="grid grid-rows-2 grid-flow-col gap-x-6 gap-y-4 overflow-x-auto pb-4 hide-scrollbar">
              {homeFoodCategories.map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
            </div>
          )}
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
              {featuredChefs?.map((chef, i) => (
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
          {isLoadingDishes ? (
            <LoadingGrid count={6} type="dish" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {popularDishes?.map((dish, i) => (
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

          {isLoadingGroceries ? (
            <LoadingGrid count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groceryEssentials?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
