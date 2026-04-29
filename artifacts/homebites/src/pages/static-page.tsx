import { Link } from "wouter";

const CONTENT = {
  about: {
    title: "About HomeBites",
    intro:
      "HomeBites connects nearby kitchens, home chefs and grocery sellers with customers who want reliable local delivery.",
    points: [
      "Location-aware restaurant and grocery discovery.",
      "Operating-hour checks before orders are accepted.",
      "Transparent item total, delivery fee, discounts and payment status.",
      "Saved favourites, search, categories, order history and support-ready order details.",
    ],
  },
  partner: {
    title: "Partner with us",
    intro:
      "Restaurants, home chefs and grocery sellers can list their catalogue, manage availability and receive customer orders.",
    points: [
      "Manage menus, products, pricing, images and stock.",
      "Set cuisine, location, service area, opening time and closing time.",
      "Track new, preparing, delivery and completed orders from the admin portal.",
      "Use offers and featured listings to improve visibility.",
    ],
  },
  careers: {
    title: "Careers",
    intro:
      "HomeBites is a demo marketplace, but this page is ready for hiring content when the business goes live.",
    points: [
      "Operations roles for restaurant onboarding and catalogue quality.",
      "Support roles for order issues, refunds and customer communication.",
      "Engineering roles for delivery, payments, search and admin tools.",
      "Growth roles for local campaigns, partnerships and retention.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "This HomeBites privacy summary combines practical ideas from leading food-delivery platforms while staying original to this app.",
    points: [
      "We collect account, contact, device, location, address, order and payment-reference information needed to run the service.",
      "We use data to process orders, personalize search, prevent fraud, improve support and maintain platform security.",
      "We may share required order data with restaurants, delivery partners, payment processors, support tools and legal authorities when necessary.",
      "Users should keep account credentials secure and update inaccurate address or contact details.",
      "External links have their own privacy practices, so users should review those policies separately.",
    ],
  },
  refund: {
    title: "Refund Policy",
    intro:
      "Refund handling should be clear before checkout and tied to order status, payment status and restaurant confirmation.",
    points: [
      "Refunds or replacements may require restaurant approval, delivery verification or support review.",
      "Issues such as missing items, wrong order, spillage, foreign object or poor quality may require photos or other proof.",
      "Customer mistakes such as incorrect address, unreachable phone or late cancellation may reduce or remove refund eligibility.",
      "Instructions are handled on a best-effort basis by the restaurant and may not guarantee a refund if unmet.",
      "Approved refunds should usually go back to the original payment method or platform credits, depending on the payment route.",
    ],
  },
  healthy: {
    title: "Healthy Eating",
    intro:
      "Explore lighter meals, veg options and balanced home-style food from local kitchens.",
    points: [
      "Search for millet bowls, salads, protein wraps, curd rice and fresh juices.",
      "Use cuisine filters and veg labels to narrow choices quickly.",
      "Check restaurant hours before planning breakfast, lunch or dinner orders.",
      "Use favourites to keep repeat healthy meals one tap away.",
    ],
  },
};

type PageKey = keyof typeof CONTENT;

export function StaticPage({ page }: { page: PageKey }) {
  const content = CONTENT[page];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{content.title}</h1>
      <p className="mt-3 text-muted-foreground">{content.intro}</p>
      <div className="mt-8 grid gap-4">
        {content.points.map((point) => (
          <div key={point} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            {point}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/" className="font-semibold text-primary hover:underline">
          Back to HomeBites
        </Link>
      </div>
    </div>
  );
}
