import { Link, useLocation } from "wouter";
import { Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { LocationPicker } from "@/components/LocationPicker";

export function AppHeader() {
  const { totals } = useCart();
  const [location] = useLocation();

  if (location === "/checkout") return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-lg">
              H
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline-block">
              HomeBites
            </span>
          </Link>
          <LocationPicker />
        </div>

        <div className="flex-1 max-w-md hidden sm:block">
          <Link
            href="/search"
            className="flex items-center gap-2 bg-muted/50 hover:bg-muted px-4 py-2.5 rounded-full text-sm text-muted-foreground transition-colors border border-transparent hover:border-border"
          >
            <Search className="w-4 h-4" />
            <span>Search for dishes, chefs, or groceries...</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/search"
            className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link href="/cart">
            <Button
              variant="ghost"
              className="relative p-2 h-auto rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totals.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background">
                  {totals.count}
                </span>
              )}
            </Button>
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
