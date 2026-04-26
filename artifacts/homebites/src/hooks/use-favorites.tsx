import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FavoriteKind = "chef" | "dish" | "product";

export type FavoriteItem = {
  kind: FavoriteKind;
  refId: number;
  name: string;
  imageUrl: string;
  subtitle?: string;
  price?: number;
  addedAt: number;
};

const STORAGE_KEY = "homebites:favorites";

type FavoritesContextValue = {
  items: FavoriteItem[];
  isFavorite: (kind: FavoriteKind, refId: number) => boolean;
  toggle: (item: Omit<FavoriteItem, "addedAt">) => boolean;
  remove: (kind: FavoriteKind, refId: number) => void;
  clear: () => void;
  countByKind: (kind: FavoriteKind) => number;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as FavoriteItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const isFavorite = useCallback(
    (kind: FavoriteKind, refId: number) =>
      items.some((i) => i.kind === kind && i.refId === refId),
    [items],
  );

  const toggle = useCallback(
    (item: Omit<FavoriteItem, "addedAt">) => {
      let added = false;
      setItems((prev) => {
        const exists = prev.find(
          (i) => i.kind === item.kind && i.refId === item.refId,
        );
        if (exists) {
          return prev.filter(
            (i) => !(i.kind === item.kind && i.refId === item.refId),
          );
        }
        added = true;
        return [...prev, { ...item, addedAt: Date.now() }];
      });
      return added;
    },
    [],
  );

  const remove = useCallback((kind: FavoriteKind, refId: number) => {
    setItems((prev) =>
      prev.filter((i) => !(i.kind === kind && i.refId === refId)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const countByKind = useCallback(
    (kind: FavoriteKind) => items.filter((i) => i.kind === kind).length,
    [items],
  );

  const value = useMemo(
    () => ({ items, isFavorite, toggle, remove, clear, countByKind }),
    [items, isFavorite, toggle, remove, clear, countByKind],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
