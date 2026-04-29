const SECTIONS = [
  {
    title: "Account and Eligibility",
    points: [
      "Customers should provide accurate account, phone, address and payment details.",
      "Users are responsible for activity from their account and should keep login details secure.",
      "Business partners must be authorized to manage listings, menus, prices, availability and service areas.",
    ],
  },
  {
    title: "Restaurant and Menu Information",
    points: [
      "Menus, prices, item availability, taxes, fees, offers and images may change by restaurant, city and time.",
      "Restaurant certificates, licences, ratings and menu details are informational and should be verified by the partner.",
      "Food images, restaurant names, trademarks and menu content remain owned by their respective owners.",
    ],
  },
  {
    title: "Ordering and Delivery",
    points: [
      "The final payable amount should be shown before order placement, including item total, delivery fee, discount and taxes where applicable.",
      "Delivery and takeaway times are estimates and may vary because of kitchen load, traffic, weather, distance or partner availability.",
      "Orders from closed restaurants are not accepted. If a restaurant closes after payment, support should cancel, replace or refund after verification.",
      "Customers should remain reachable at the delivery phone number and provide a serviceable address.",
    ],
  },
  {
    title: "Promos and Fair Use",
    points: [
      "Promo codes, wallet credits, referrals, memberships and free-delivery offers can have separate eligibility rules.",
      "Offers may be changed, paused or withdrawn if they are misused, duplicated, expired or applied outside their intended city or account.",
      "Users must not resell ordered food, abuse support, manipulate ratings, create fake accounts or interfere with platform systems.",
    ],
  },
  {
    title: "Cancellations and Refunds",
    points: [
      "Refunds or replacements may require restaurant approval, delivery verification or support review.",
      "Complaints for wrong items, missing items, spillage, foreign objects or poor quality may require photos or other proof.",
      "Customer-side issues such as wrong address, unreachable phone, unavailable recipient or late cancellation may reduce refund eligibility.",
      "Special cooking instructions are handled on a best-effort basis and may not create automatic refund rights.",
      "Approved refunds should return through the original payment method or platform credit, depending on the payment route.",
    ],
  },
  {
    title: "Privacy and Communications",
    points: [
      "HomeBites may collect account, contact, address, location, device, order and payment-reference data needed to operate the marketplace.",
      "Data may be used for order processing, customer support, fraud prevention, personalization, analytics and legal compliance.",
      "Required order data may be shared with restaurant partners, delivery partners, payment processors and support providers.",
      "Transactional messages such as order confirmation, delivery updates, refunds and support alerts may be sent by SMS, email, phone or in-app channels.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Terms and Conditions</h1>
      <p className="mt-3 text-muted-foreground">
        HomeBites follows a practical food-delivery policy model for customers,
        restaurant partners, home chefs, grocery sellers and delivery workflows.
        Review it with a lawyer before production use.
      </p>

      <div className="mt-8 grid gap-5">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-xl font-semibold">{section.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-border bg-muted/40 p-5">
        <h2 className="font-display text-xl font-semibold">HomeBites Support</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          For order, payment, refund, privacy or partner questions, contact the
          HomeBites support team from your order details page.
        </p>
      </section>
    </div>
  );
}
