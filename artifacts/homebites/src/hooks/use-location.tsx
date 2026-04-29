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

export const CITIES: { name: string; region: string }[] = [
  { name: "Hyderabad", region: "Telangana" },
  { name: "Warangal", region: "Telangana" },
  { name: "Karimnagar", region: "Telangana" },
  { name: "Rajanna Sircilla", region: "Telangana" },
  { name: "Nizamabad", region: "Telangana" },
  { name: "Khammam", region: "Telangana" },
  { name: "Bangalore", region: "Karnataka" },
  { name: "Mysore", region: "Karnataka" },
  { name: "Mangalore", region: "Karnataka" },
  { name: "Chennai", region: "Tamil Nadu" },
  { name: "Coimbatore", region: "Tamil Nadu" },
  { name: "Madurai", region: "Tamil Nadu" },
  { name: "Pondicherry", region: "Puducherry" },
  { name: "Kochi", region: "Kerala" },
  { name: "Thiruvananthapuram", region: "Kerala" },
  { name: "Mumbai", region: "Maharashtra" },
  { name: "Pune", region: "Maharashtra" },
  { name: "Nagpur", region: "Maharashtra" },
  { name: "Delhi", region: "NCR" },
  { name: "Gurgaon", region: "NCR" },
  { name: "Noida", region: "NCR" },
  { name: "Kolkata", region: "West Bengal" },
  { name: "Ahmedabad", region: "Gujarat" },
  { name: "Surat", region: "Gujarat" },
  { name: "Jaipur", region: "Rajasthan" },
  { name: "Lucknow", region: "Uttar Pradesh" },
  { name: "Chandigarh", region: "Punjab" },
  { name: "Bhubaneswar", region: "Odisha" },
  { name: "Visakhapatnam", region: "Andhra Pradesh" },
  { name: "Vijayawada", region: "Andhra Pradesh" },
  { name: "Goa", region: "Goa" },
];

const DEFAULT_CITY = "Hyderabad";

type LocationContextValue = {
  city: string;
  setCity: (city: string) => void;
  cities: typeof CITIES;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [city, setCityState] = useState<string>(DEFAULT_CITY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!user) {
      setCityState(DEFAULT_CITY);
      setHydrated(true);
      return;
    }

    setHydrated(false);
    const ref = doc(firestore, "users", user.uid, "appState", "preferences");
    return onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data();
        setCityState(typeof data?.city === "string" ? data.city : DEFAULT_CITY);
        setHydrated(true);
      },
      (err) => {
        console.error("Failed to load preferences from Firestore", err);
        setHydrated(true);
      },
    );
  }, [user]);

  useEffect(() => {
    if (!hydrated || !user) return;
    const ref = doc(firestore, "users", user.uid, "appState", "preferences");
    void setDoc(ref, { city, updatedAt: Date.now() }, { merge: true }).catch(
      (err) => console.error("Failed to save preferences to Firestore", err),
    );
  }, [city, hydrated, user]);

  const setCity = useCallback((next: string) => setCityState(next), []);

  const value = useMemo(
    () => ({ city, setCity, cities: CITIES }),
    [city, setCity],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationCity() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocationCity must be used within LocationProvider");
  }
  return ctx;
}
