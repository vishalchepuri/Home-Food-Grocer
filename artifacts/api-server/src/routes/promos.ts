import { Router, type IRouter, type Request, type Response } from "express";
import { ValidatePromoBody } from "@workspace/api-zod";

const router: IRouter = Router();

type CartItem = {
  kind: "dish" | "product";
  unitPrice: number;
  quantity: number;
};

type PromoDef = {
  code: string;
  label: string;
  evaluate: (ctx: {
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
  }) =>
    | { ok: true; discount: number; message: string }
    | { ok: false; message: string };
};

const PROMOS: Record<string, PromoDef> = {
  WELCOME50: {
    code: "WELCOME50",
    label: "50% off (max ₹100)",
    evaluate: ({ subtotal }) => {
      if (subtotal <= 0)
        return { ok: false, message: "Add items to your cart first" };
      const discount = Math.min(Math.round(subtotal * 0.5), 100);
      return {
        ok: true,
        discount,
        message: `WELCOME50 applied — you saved ₹${discount}`,
      };
    },
  },
  FREESHIP: {
    code: "FREESHIP",
    label: "Free delivery on orders ≥ ₹299",
    evaluate: ({ subtotal, deliveryFee }) => {
      if (subtotal < 299) {
        const need = 299 - subtotal;
        return {
          ok: false,
          message: `Add ₹${need} more to unlock free delivery`,
        };
      }
      return {
        ok: true,
        discount: deliveryFee,
        message: `FREESHIP applied — delivery is on us`,
      };
    },
  },
  HOMECHEF75: {
    code: "HOMECHEF75",
    label: "₹75 off home meals (min ₹399)",
    evaluate: ({ items, subtotal }) => {
      const dishTotal = items
        .filter((i) => i.kind === "dish")
        .reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      if (dishTotal <= 0) {
        return {
          ok: false,
          message: "Add a dish from a home chef to use this code",
        };
      }
      if (subtotal < 399) {
        const need = 399 - subtotal;
        return {
          ok: false,
          message: `Add ₹${need} more to use HOMECHEF75`,
        };
      }
      return {
        ok: true,
        discount: 75,
        message: `HOMECHEF75 applied — ₹75 off`,
      };
    },
  },
};

export function calculatePromoDiscount(
  code: string | null | undefined,
  items: CartItem[],
  deliveryFee: number,
): { discount: number; appliedCode: string | null } {
  if (!code) return { discount: 0, appliedCode: null };
  const promo = PROMOS[code.trim().toUpperCase()];
  if (!promo) return { discount: 0, appliedCode: null };
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const result = promo.evaluate({ items, subtotal, deliveryFee });
  if (!result.ok) return { discount: 0, appliedCode: null };
  return { discount: result.discount, appliedCode: promo.code };
}

router.post("/promos/validate", (req: Request, res: Response) => {
  const body = ValidatePromoBody.parse(req.body);
  const code = body.code.trim().toUpperCase();
  const promo = PROMOS[code];
  if (!promo) {
    res.json({
      valid: false,
      discount: 0,
      message: "That code doesn't exist. Try WELCOME50, FREESHIP or HOMECHEF75.",
    });
    return;
  }
  const subtotal = body.items.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0,
  );
  const result = promo.evaluate({
    items: body.items,
    subtotal,
    deliveryFee: body.deliveryFee,
  });
  if (!result.ok) {
    res.json({
      valid: false,
      code: promo.code,
      label: promo.label,
      discount: 0,
      message: result.message,
    });
    return;
  }
  res.json({
    valid: true,
    code: promo.code,
    label: promo.label,
    discount: result.discount,
    message: result.message,
  });
});

export default router;
