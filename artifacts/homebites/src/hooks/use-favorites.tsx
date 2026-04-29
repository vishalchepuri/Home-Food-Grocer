import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setHydrated(true);
      return;
    }

    setHydrated(false);
    const ref = doc(firestore, "users", user.uid, "appState", "favorites");
    return onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data();
        setItems(Array.isArray(data?.items) ? (data.items as FavoriteItem[]) : []);
        setHydrated(true);
      },
      (err) => {
        console.error("Failed to load favorites from Firestore", err);
        setHydrated(true);
      },
    );
  }, [user]);

  useEffect(() => {
    if (!hydrated || !user) return;
    const ref = doc(firestore, "users", user.uid, "appState", "favorites");
    void setDoc(ref, { items, updatedAt: Date.now() }, { merge: true }).catch(
      (err) => console.error("Failed to save favorites to Firestore", err),
    );
  }, [items, hydrated, user]);

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
