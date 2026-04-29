import { useCart } from "@/hooks/use-cart";
import { useDeviceId } from "@/hooks/use-device-id"; // I will create this export alias in the hook
import {
  useCreateOrder,
  useProcessPayment,
  useValidatePromo,
  getListOrdersQueryKey,
  type PromoResult,
} from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Tag, X, Check } from "lucide-react";
import { useLocationCity } from "@/hooks/use-location";

const CITY_PINCODE_PREFIXES: Record<string, string[]> = {
  Hyderabad: ["500"],
  Warangal: ["506"],
  Karimnagar: ["505"],
  "Rajanna Sircilla": ["505"],
  Nizamabad: ["503"],
  Khammam: ["507"],
  Bangalore: ["560"],
  Mysore: ["570"],
  Mangalore: ["575"],
  Chennai: ["600"],
  Coimbatore: ["641"],
  Madurai: ["625"],
  Pondicherry: ["605"],
  Kochi: ["682"],
  Thiruvananthapuram: ["695"],
  Mumbai: ["400"],
  Pune: ["411"],
  Nagpur: ["440"],
  Delhi: ["110"],
  Gurgaon: ["122"],
  Noida: ["201"],
  Kolkata: ["700"],
  Ahmedabad: ["380"],
  Surat: ["395"],
  Jaipur: ["302"],
  Lucknow: ["226"],
  Chandigarh: ["160"],
  Bhubaneswar: ["751"],
  Visakhapatnam: ["530"],
  Vijayawada: ["520"],
  Goa: ["403"],
};

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function getDeliveryError(selectedCity: string, address: AddressForm) {
  const addressCity = normalize(address.city);
  const activeCity = normalize(selectedCity);
  if (addressCity && addressCity !== activeCity) {
    return `Cannot deliver to ${address.city} while your selected location is ${selectedCity}. Change the location or enter a ${selectedCity} address.`;
  }

  const prefixes = CITY_PINCODE_PREFIXES[selectedCity] ?? [];
  const pincode = address.pincode.trim();
  if (prefixes.length > 0 && !prefixes.some((prefix) => pincode.startsWith(prefix))) {
    return `Cannot deliver to pincode ${pincode} for ${selectedCity}. Please use a ${selectedCity} serviceable pincode.`;
  }

  return null;
}

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone is required"),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  landmark: z.string().optional(),
});

const cardSchema = z.object({
  cardHolder: z.string().min(2, "Cardholder name is required"),
  cardNumber: z.string().length(16, "Must be 16 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format MM/YY"),
  cvv: z.string().length(3, "Must be 3 digits"),
});

type AddressForm = z.infer<typeof addressSchema>;
type CardForm = z.infer<typeof cardSchema>;

export default function CheckoutPage() {
  const { items, totals, clear } = useCart();
  const { city: selectedCity } = useLocationCity();
  const deviceId = useDeviceId();
  const searchString = useSearch();
  const tip = parseInt(new URLSearchParams(searchString).get("tip") || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: "", phone: "", line1: "", line2: "", city: "", pincode: "", landmark: "" }
  });

  const cardForm = useForm<CardForm>({
    resolver: zodResolver(cardSchema),
    defaultValues: { cardHolder: "", cardNumber: "", expiry: "", cvv: "" }
  });

  const createOrderMutation = useCreateOrder();
  const processPaymentMutation = useProcessPayment();
  const validatePromoMutation = useValidatePromo();

  const deliveryFee = 29;
  const discount = appliedPromo?.valid ? appliedPromo.discount : 0;
  const grandTotal = Math.max(0, totals.subtotal + deliveryFee + tip - discount);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError(null);
    try {
      const result = await validatePromoMutation.mutateAsync({
        data: {
          code,
          items: items.map((i) => ({
            kind: i.kind,
            refId: i.refId,
            name: i.name,
            imageUrl: i.imageUrl,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
          })),
          deliveryFee,
        },
      });
      if (result.valid) {
        setAppliedPromo(result);
        setPromoInput("");
        toast({ title: result.message });
      } else {
        setAppliedPromo(null);
        setPromoError(result.message);
      }
    } catch (err: any) {
      setPromoError(err.message || "Couldn't apply that code");
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  if (items.length === 0) {
    setLocation("/");
    return null;
  }

  const onSubmit = async () => {
    const addressValid = await addressForm.trigger();
    if (!addressValid) return;

    const addressData = addressForm.getValues();
    const deliveryError = getDeliveryError(selectedCity, addressData);
    if (deliveryError) {
      addressForm.setError("pincode", { type: "manual", message: deliveryError });
      toast({
        title: "Cannot deliver to this location",
        description: deliveryError,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      let paymentRef: string | undefined;

      if (paymentMethod === "online") {
        const cardValid = await cardForm.trigger();
        if (!cardValid) {
          setIsProcessing(false);
          return;
        }
        
        const cardData = cardForm.getValues();
        const paymentRes = await processPaymentMutation.mutateAsync({
          data: {
            amount: grandTotal,
            cardNumber: cardData.cardNumber,
            cardHolder: cardData.cardHolder,
            expiry: cardData.expiry,
            cvv: cardData.cvv
          }
        });

        if (!paymentRes.success) {
          toast({ title: "Payment Failed", description: paymentRes.message, variant: "destructive" });
          setIsProcessing(false);
          return;
        }
        paymentRef = paymentRes.reference;
      }

      const order = await createOrderMutation.mutateAsync({
        data: {
          deviceId,
          items: items.map(i => ({ kind: i.kind, refId: i.refId, name: i.name, imageUrl: i.imageUrl, unitPrice: i.unitPrice, quantity: i.quantity })),
          address: addressData,
          paymentMethod,
          paymentReference: paymentRef,
          deliveryFee,
          tip,
          promoCode: appliedPromo?.valid ? appliedPromo.code : undefined,
        }
      });

      clear();
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ deviceId }) });
      toast({ title: "Order placed successfully!" });
      setLocation(`/orders/${order.id}`);

    } catch (err: any) {
      toast({ title: "Error placing order", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl bg-muted/10 min-h-screen">
      <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Step 1: Address */}
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Delivery Address
            </h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input {...addressForm.register("fullName")} placeholder="John Doe" />
                {addressForm.formState.errors.fullName && <span className="text-xs text-destructive">{addressForm.formState.errors.fullName.message}</span>}
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input {...addressForm.register("phone")} placeholder="9876543210" />
                {addressForm.formState.errors.phone && <span className="text-xs text-destructive">{addressForm.formState.errors.phone.message}</span>}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>House / Flat / Block No.</Label>
                <Input {...addressForm.register("line1")} />
                {addressForm.formState.errors.line1 && <span className="text-xs text-destructive">{addressForm.formState.errors.line1.message}</span>}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Apartment / Road / Area (Optional)</Label>
                <Input {...addressForm.register("line2")} />
              </div>
              <div className="space-y-1">
                <Label>City</Label>
                <Input {...addressForm.register("city")} />
                {addressForm.formState.errors.city && <span className="text-xs text-destructive">{addressForm.formState.errors.city.message}</span>}
              </div>
              <div className="space-y-1">
                <Label>Pincode</Label>
                <Input {...addressForm.register("pincode")} />
                {addressForm.formState.errors.pincode && <span className="text-xs text-destructive">{addressForm.formState.errors.pincode.message}</span>}
              </div>
            </form>
          </div>

          {/* Step 2: Payment */}
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Payment Method
            </h2>
            
            <RadioGroup value={paymentMethod} onValueChange={(v: "cod"|"online") => setPaymentMethod(v)} className="flex flex-col gap-3">
              <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-colors ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border"}`} onClick={() => setPaymentMethod("online")}>
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex-1 cursor-pointer font-medium">Credit / Debit Card</Label>
              </div>
              
              {paymentMethod === "online" && (
                <div className="pl-9 pr-4 pb-4 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-muted p-4 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-4">Sandbox: any 16-digit number — ends with even digit succeeds, odd fails.</p>
                    <form className="space-y-4">
                      <div>
                        <Label className="text-xs">Cardholder Name</Label>
                        <Input {...cardForm.register("cardHolder")} className="mt-1 bg-background" />
                        {cardForm.formState.errors.cardHolder && <span className="text-xs text-destructive">{cardForm.formState.errors.cardHolder.message}</span>}
                      </div>
                      <div>
                        <Label className="text-xs">Card Number</Label>
                        <Input {...cardForm.register("cardNumber")} maxLength={16} className="mt-1 bg-background" />
                        {cardForm.formState.errors.cardNumber && <span className="text-xs text-destructive">{cardForm.formState.errors.cardNumber.message}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Expiry (MM/YY)</Label>
                          <Input {...cardForm.register("expiry")} placeholder="12/25" className="mt-1 bg-background" />
                          {cardForm.formState.errors.expiry && <span className="text-xs text-destructive">{cardForm.formState.errors.expiry.message}</span>}
                        </div>
                        <div>
                          <Label className="text-xs">CVV</Label>
                          <Input {...cardForm.register("cvv")} maxLength={3} type="password" className="mt-1 bg-background" />
                          {cardForm.formState.errors.cvv && <span className="text-xs text-destructive">{cardForm.formState.errors.cvv.message}</span>}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`} onClick={() => setPaymentMethod("cod")}>
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium">Cash on Delivery</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Step 3: Summary */}
        <div className="md:col-span-1">
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm sticky top-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={`${item.kind}-${item.refId}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate pr-2">{item.quantity}x {item.name}</span>
                  <span className="font-medium whitespace-nowrap">₹{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="border-t border-border pt-4 mb-4">
              {appliedPromo?.valid ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-green-900 truncate">
                        {appliedPromo.code} applied
                      </div>
                      <div className="text-xs text-green-700">
                        You're saving ₹{appliedPromo.discount}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-green-700 hover:text-green-900 p-1 shrink-0"
                    aria-label="Remove promo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        placeholder="Promo code"
                        className="pl-9 h-10 uppercase"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            applyPromo();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyPromo}
                      disabled={!promoInput.trim() || validatePromoMutation.isPending}
                      className="h-10"
                    >
                      {validatePromoMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-destructive mt-1.5">{promoError}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Try <span className="font-semibold">WELCOME50</span>,{" "}
                    <span className="font-semibold">FREESHIP</span> or{" "}
                    <span className="font-semibold">HOMECHEF75</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm border-t border-border pt-4 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Total</span>
                <span>₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Partner Tip</span>
                  <span>₹{tip}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Promo discount</span>
                  <span>−₹{discount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-border pt-4 mb-6">
              <span className="font-bold text-lg">To Pay</span>
              <span className="font-bold text-xl">₹{grandTotal}</span>
            </div>

            <Button 
              className="w-full h-12 text-base rounded-xl" 
              onClick={onSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
              ) : (
                `Place Order • ₹${grandTotal}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
