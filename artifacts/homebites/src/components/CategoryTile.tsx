import { Category } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface CategoryTileProps {
  category: Category;
}

export function CategoryTile({ category }: CategoryTileProps) {
  const href = category.kind === "home_food" 
    ? `/chefs?category=${category.slug}` 
    : `/groceries?category=${category.id}`;

  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-2 cursor-pointer group"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted/50 p-2 shadow-sm border border-border/50 group-hover:border-primary/50 transition-colors">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        </div>
        <span className="text-xs font-medium text-center line-clamp-2 leading-tight px-1 group-hover:text-primary transition-colors">
          {category.name}
        </span>
      </motion.div>
    </Link>
  );
}
