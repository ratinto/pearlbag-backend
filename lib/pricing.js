export const SHIPPING_COST = 12;
export const FREE_SHIPPING_THRESHOLD = 250;
export const EXPRESS_FEE = 18;
export const TAX_RATE = 0.08;

const round2 = (n) => Math.round(Number(n) * 100) / 100;

export function computeTotals({ subtotal, promo, shippingMethod }) {
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  let shipping = baseShipping;
  let discount = 0;

  if (promo) {
    const minOrder = Number(promo.minOrder ?? promo.min_order ?? 0);
    if (subtotal >= minOrder) {
      if (promo.type === "percent") discount = subtotal * (Number(promo.value) / 100);
      else if (promo.type === "fixed") discount = Math.min(Number(promo.value), subtotal);
      else if (promo.type === "shipping") shipping = 0;
    }
  }

  if (shippingMethod === "express") shipping += EXPRESS_FEE;

  const taxable = Math.max(0, subtotal - discount);
  const tax = round2(taxable * TAX_RATE);
  const total = round2(taxable + shipping + tax);

  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    shipping: round2(shipping),
    tax,
    total,
  };
}

export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `PB-${ts}-${rand}`;
}
