import { useState, type FormEvent } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { LocationProvider } from "@/hooks/use-location";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { StickyCartBar } from "@/components/StickyCartBar";
import { AdminLayout } from "@/components/AdminLayout";

import Home from "@/pages/home";
import ChefsPage from "@/pages/chefs";
import ChefDetailPage from "@/pages/chef-detail";
import GroceriesPage from "@/pages/groceries";
import ProductDetailPage from "@/pages/product-detail";
import SearchPage from "@/pages/search";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import OrdersPage from "@/pages/orders";
import OrderDetailPage from "@/pages/order-detail";
import FavoritesPage from "@/pages/favorites";
import TermsPage from "@/pages/terms";
import { StaticPage } from "@/pages/static-page";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminChefs from "@/pages/admin/chefs";
import AdminProducts from "@/pages/admin/products";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 6 * 60 * 60 * 1000,
      gcTime: 12 * 60 * 60 * 1000,
      retry: 1,
    },
  },
});

function AuthCard({
  title,
  subtitle,
  onSubmit,
  submitLabel,
}: {
  title: string;
  subtitle: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  submitLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, setLocation] = useLocation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit(email, password);
      setLocation("/");
    } catch (err) {
      setError((err as Error).message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-[440px] max-w-full p-8 shadow-xl border border-border"
      >
        <h1 className="font-display font-bold text-2xl text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
        <div className="mt-6 space-y-4">
          <input
            className="w-full border border-border rounded-lg px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border border-border rounded-lg px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
        <button
          type="submit"
          className="mt-5 w-full bg-primary text-primary-foreground rounded-lg py-2 font-semibold"
          disabled={busy}
        >
          {busy ? "Please wait..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

function SignInPage() {
  const { signIn } = useAuth();
  return (
    <AuthCard
      title="Welcome back to HomeBites"
      subtitle="Sign in to track orders, save addresses and reorder favourites"
      onSubmit={signIn}
      submitLabel="Sign in"
    />
  );
}

function SignUpPage() {
  const { signUp } = useAuth();
  return (
    <AuthCard
      title="Create your HomeBites account"
      subtitle="Order home-cooked meals and daily essentials in minutes"
      onSubmit={signUp}
      submitLabel="Sign up"
    />
  );
}

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
      <StickyCartBar />
    </div>
  );
}

function StorefrontSwitch() {
  return (
    <StorefrontLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/chefs" component={ChefsPage} />
        <Route path="/chefs/:id" component={ChefDetailPage} />
        <Route path="/groceries" component={GroceriesPage} />
        <Route path="/products/:id" component={ProductDetailPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/orders/:id" component={OrderDetailPage} />
        <Route path="/favorites" component={FavoritesPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy">
          <StaticPage page="privacy" />
        </Route>
        <Route path="/refunds">
          <StaticPage page="refund" />
        </Route>
        <Route path="/about">
          <StaticPage page="about" />
        </Route>
        <Route path="/partner">
          <StaticPage page="partner" />
        </Route>
        <Route path="/careers">
          <StaticPage page="careers" />
        </Route>
        <Route path="/healthy-eating">
          <StaticPage page="healthy" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </StorefrontLayout>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/admin" nest>
        <AdminLayout>
          <Switch>
            <Route path="/" component={AdminDashboard} />
            <Route path="/orders" component={AdminOrders} />
            <Route path="/chefs" component={AdminChefs} />
            <Route path="/products" component={AdminProducts} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>
      <Route>
        <StorefrontSwitch />
      </Route>
    </Switch>
  );
}

function ProvidersWithRoutes() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LocationProvider>
            <FavoritesProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </FavoritesProvider>
          </LocationProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ProvidersWithRoutes />
    </WouterRouter>
  );
}

export default App;
