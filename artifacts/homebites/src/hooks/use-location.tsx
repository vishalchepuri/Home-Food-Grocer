import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

const STORAGE_KEY = "homebites:city";
const DEFAULT_CITY = "Hyderabad";

type LocationContextValue = {
  city: string;
  setCity: (city: string) => void;
  cities: typeof CITIES;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_CITY;
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CITY;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, city);
    } catch {
      /* ignore */
    }
  }, [city]);

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
