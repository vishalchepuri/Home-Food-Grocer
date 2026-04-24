import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";

import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { StickyCartBar } from "@/components/StickyCartBar";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <AppHeader />
      <main className="flex-1">
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
      </main>
      <AppFooter />
      <StickyCartBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </CartProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
