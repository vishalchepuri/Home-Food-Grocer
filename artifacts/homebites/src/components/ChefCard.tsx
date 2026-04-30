import { Chef } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useState } from "react";

interface ChefCardProps {
  chef: Chef;
}

export function ChefCard({ chef }: ChefCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link href={`/chefs/${chef.id}`}>
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col border-border/50">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {imageFailed ? (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 p-4 text-center text-sm font-semibold text-primary">
                {chef.cuisine}
              </div>
            ) : (
              <img
                src={chef.imageUrl}
                alt={chef.name}
                className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            )}
            {chef.isVeg && (
              <div className="absolute top-2 right-2 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold border border-green-600 text-green-700 shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                Pure Veg
              </div>
            )}
            {chef.isOpen === false && (
              <div className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 text-xs font-semibold text-white">
                Closed until {chef.opensAt ?? "10:00"}
              </div>
            )}
            <div className="absolute top-2 left-2">
              <FavoriteButton
                size="sm"
                item={{
                  kind: "chef",
                  refId: chef.id,
                  name: chef.name,
                  imageUrl: chef.imageUrl,
                  subtitle: `${chef.cuisine} • ${chef.location}`,
                }}
              />
            </div>
          </div>
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-display font-semibold text-lg line-clamp-1">
                {chef.name}
              </h3>
              <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-medium shrink-0">
                <span>{chef.rating.toFixed(1)}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm line-clamp-1 mb-2">
              {chef.cuisine} • {chef.tagline}
            </p>
            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {chef.opensAt ?? "10:00"}-{chef.closesAt ?? "22:00"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="line-clamp-1 max-w-[80px]">{chef.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
