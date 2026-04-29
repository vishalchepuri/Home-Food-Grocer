import { useGetChef, getGetChefQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Star, Clock, MapPin, Info } from "lucide-react";
import { DishCard } from "@/components/DishCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ChefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const chefId = parseInt(id || "0", 10);

  const { data, isLoading, error } = useGetChef(chefId, {
    query: { enabled: !!chefId, queryKey: getGetChefQueryKey(chefId) }
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="w-full h-[250px] md:h-[350px]" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Failed to load chef details.</div>;
  }

  const { chef, dishes } = data;

  const vegDishes = dishes.filter(d => d.isVeg);
  const nonVegDishes = dishes.filter(d => !d.isVeg);

  return (
    <div className="pb-24">
      {/* Cover Image & Header Info */}
      <div className="relative w-full h-[200px] md:h-[300px] bg-muted">
        <img src={chef.imageUrl} alt={chef.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 container mx-auto">
          <div className="flex justify-between items-end">
            <div className="text-white">
              <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">{chef.name}</h1>
              <p className="text-white/90 text-sm md:text-base">{chef.cuisine} • {chef.tagline}</p>
            </div>
            <div className="bg-white text-black px-3 py-2 rounded-xl flex flex-col items-center shadow-lg">
              <div className="flex items-center gap-1 font-bold text-lg text-green-600">
                {chef.rating.toFixed(1)} <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Chef Stats Bar */}
          {chef.isOpen === false && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
              This restaurant is closed right now. Delivery opens at {chef.opensAt ?? "10:00"}.
            </div>
          )}

          <div className="flex flex-wrap gap-6 p-4 bg-card border border-border/50 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {chef.opensAt ?? "10:00"}-{chef.closesAt ?? "22:00"}
              </div>
              <div className="text-xs text-muted-foreground">Delivery hours</div>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-10" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{chef.location}</div>
              <div className="text-xs text-muted-foreground">Location</div>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-10" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">₹{chef.priceForTwo}</div>
              <div className="text-xs text-muted-foreground">Cost for two</div>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-10">
          {vegDishes.length > 0 && (
            <section>
              <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <div className="w-4 h-4 border border-green-600 flex items-center justify-center rounded-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                </div>
                Veg Dishes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {vegDishes.map(dish => <DishCard key={dish.id} dish={dish} />)}
              </div>
            </section>
          )}

          {nonVegDishes.length > 0 && (
            <section>
              <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <div className="w-4 h-4 border border-red-600 flex items-center justify-center rounded-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </div>
                Non-Veg Dishes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {nonVegDishes.map(dish => <DishCard key={dish.id} dish={dish} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
