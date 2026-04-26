import { Heart } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  item: Omit<FavoriteItem, "addedAt">;
  className?: string;
  size?: "sm" | "md";
};

export function FavoriteButton({ item, className, size = "md" }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const { toast } = useToast();
  const active = isFavorite(item.kind, item.refId);

  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(item);
        toast({
          title: added ? "Saved to favorites" : "Removed from favorites",
          description: added ? item.name : undefined,
        });
      }}
      className={cn(
        dim,
        "flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-sm border border-border/40 hover:scale-110 active:scale-95 transition-transform",
        className,
      )}
    >
      <Heart
        className={cn(
          icon,
          "transition-colors",
          active
            ? "fill-primary text-primary"
            : "text-muted-foreground hover:text-primary",
        )}
      />
    </button>
  );
}
