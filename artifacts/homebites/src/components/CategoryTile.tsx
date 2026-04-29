import { Category } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Apple,
  Beef,
  CakeSlice,
  Coffee,
  Drumstick,
  Fish,
  Flame,
  IceCreamBowl,
  Milk,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Sprout,
  Utensils,
  Wheat,
} from "lucide-react";

interface CategoryTileProps {
  category: Category;
}

export function CategoryTile({ category }: CategoryTileProps) {
  const href = category.kind === "home_food" 
    ? `/chefs?category=${encodeURIComponent(category.name)}` 
    : `/groceries?category=${category.id}`;
  const [imageFailed, setImageFailed] = useState(false);

  const iconKey = category.name.toLowerCase();
  const Icon =
    iconKey.includes("north") || iconKey.includes("andhra") || iconKey.includes("rajasthani") || iconKey.includes("hyderabadi")
      ? Flame
      : iconKey.includes("south") || iconKey.includes("kerala") || iconKey.includes("odia")
        ? Soup
        : iconKey.includes("momo") || iconKey.includes("roll") || iconKey.includes("wrap")
          ? Sandwich
          : iconKey.includes("bbq") || iconKey.includes("grill") || iconKey.includes("turkish") || iconKey.includes("lebanese") || iconKey.includes("mediterranean")
            ? Beef
            : iconKey.includes("breakfast") || iconKey.includes("juice") || iconKey.includes("shake")
              ? Coffee
              : iconKey.includes("salad")
                ? Salad
                : iconKey.includes("ice cream")
                  ? IceCreamBowl
                  : iconKey.includes("vietnamese") || iconKey.includes("japanese") || iconKey.includes("korean") || iconKey.includes("north east")
                    ? Soup
        : iconKey.includes("italian") || iconKey.includes("pizza")
      ? Pizza
      : iconKey.includes("dessert") || iconKey.includes("sweet")
        ? CakeSlice
        : iconKey.includes("cafe") || iconKey.includes("bakery")
          ? Coffee
          : iconKey.includes("dairy")
            ? Milk
            : iconKey.includes("fruit") || iconKey.includes("vegetable")
              ? Apple
              : iconKey.includes("healthy")
                ? Salad
                : iconKey.includes("coastal") || iconKey.includes("seafood")
                  ? Fish
                  : iconKey.includes("biryani") || iconKey.includes("mughlai")
                    ? Drumstick
                    : iconKey.includes("bread") || iconKey.includes("atta")
                      ? Wheat
                      : iconKey.includes("fast") || iconKey.includes("sandwich")
                        ? Sandwich
                        : iconKey.includes("thai") || iconKey.includes("chinese")
                          ? Soup
                          : iconKey.includes("organic")
                            ? Sprout
                            : iconKey.includes("meat")
                              ? Beef
                              : iconKey.includes("frozen")
                                ? IceCreamBowl
                                : iconKey.includes("street") || iconKey.includes("chaat")
                                  ? Flame
                                  : Utensils;

  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-2 cursor-pointer group"
      >
        <div className="relative w-24 h-24 rounded-full bg-muted/50 p-2 shadow-sm border border-border/50 group-hover:border-primary/50 transition-colors">
          {imageFailed ? (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-9 w-9" strokeWidth={2.2} />
            </div>
          ) : (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="absolute -bottom-1 -right-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-card text-primary shadow-md">
            <Icon className="h-5 w-5" strokeWidth={2.4} />
          </div>
        </div>
        <span className="max-w-24 text-sm font-medium text-center line-clamp-2 leading-tight px-1 group-hover:text-primary transition-colors">
          {category.name}
        </span>
      </motion.div>
    </Link>
  );
}
