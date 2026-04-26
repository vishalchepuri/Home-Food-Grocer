import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
} from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { LocationProvider } from "@/hooks/use-location";

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
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminChefs from "@/pages/admin/chefs";
import AdminProducts from "@/pages/admin/products";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#ff5a1f",
    colorForeground: "#1c130d",
    colorMutedForeground: "#6b5e54",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#1c130d",
    colorNeutral: "#e5dfd9",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-display font-bold text-2xl text-foreground",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary font-semibold hover:text-primary/80",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-green-600",
    alertText: "text-destructive",
    logoBox: "mb-2",
    logoImage: "h-10",
    socialButtonsBlockButton:
      "border border-border bg-white hover:bg-muted",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
    formFieldInput: "bg-white border border-border text-foreground",
    footerAction: "py-3",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border border-destructive/30",
    otpCodeFieldInput: "bg-white border border-border text-foreground",
    formFieldRow: "",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-12">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-12">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
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

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back to HomeBites",
            subtitle: "Sign in to track orders, save addresses and reorder favourites",
          },
        },
        signUp: {
          start: {
            title: "Create your HomeBites account",
            subtitle: "Order home-cooked meals & daily essentials in minutes",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <LocationProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </LocationProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
