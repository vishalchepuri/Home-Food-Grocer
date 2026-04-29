import { Link } from "wouter";

export function AppFooter() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded flex items-center justify-center font-display font-bold text-sm">
                H
              </div>
              <span className="font-display font-bold text-lg">HomeBites</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Neighborhood marketplace connecting local home chefs with food lovers, along with daily grocery essentials.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/chefs" className="hover:text-primary">Home Food</Link></li>
              <li><Link href="/groceries" className="hover:text-primary">Groceries</Link></li>
              <li><Link href="/healthy-eating" className="hover:text-primary">Healthy Eating</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/partner" className="hover:text-primary">Partner with us</Link></li>
              <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/refunds" className="hover:text-primary">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HomeBites. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
