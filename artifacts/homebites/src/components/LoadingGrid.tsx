import { Skeleton } from "@/components/ui/skeleton";

export function LoadingGrid({ count = 6, type = "card" }: { count?: number; type?: "card" | "dish" }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          {type === "card" ? (
            <>
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-4 p-4 border rounded-xl">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full mt-2" />
              </div>
              <Skeleton className="w-[120px] h-[120px] rounded-lg shrink-0" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
