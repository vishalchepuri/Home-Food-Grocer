import { Router, type IRouter } from "express";
import { ProcessPaymentBody } from "@workspace/api-zod";
import { randomBytes } from "node:crypto";

const router: IRouter = Router();

router.post("/payments/process", (req, res) => {
  const body = ProcessPaymentBody.parse(req.body);
  const digits = body.cardNumber.replace(/\D/g, "");
  if (digits.length < 12) {
    res
      .status(400)
      .json({ message: "Card number must be at least 12 digits" });
    return;
  }
  const lastDigit = Number(digits[digits.length - 1]);
  const success = lastDigit % 2 === 0;
  const reference = "PAY_" + randomBytes(6).toString("hex").toUpperCase();
  if (!success) {
    res.json({
      success: false,
      reference,
      message:
        "Payment was declined by the issuing bank. Please try a different card.",
    });
    return;
  }
  res.json({
    success: true,
    reference,
    message: "Payment successful",
  });
});

export default router;
