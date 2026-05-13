// Prisma serializes Decimal as string and BigInt is not JSON-safe.
// These helpers normalize values for HTTP responses.

const toNumber = (v) => (v == null ? null : Number(v));

export function serializeProduct(p) {
  if (!p) return p;
  return {
    ...p,
    price: toNumber(p.price),
    compareAtPrice: toNumber(p.compareAtPrice),
    rating: toNumber(p.rating),
  };
}

export function serializePromo(p) {
  if (!p) return p;
  return {
    ...p,
    value: toNumber(p.value),
    minOrder: toNumber(p.minOrder),
  };
}

export function serializeOrder(order) {
  if (!order) return order;
  const items = (order.items ?? []).map((i) => ({
    ...i,
    id: typeof i.id === "bigint" ? i.id.toString() : i.id,
    unitPrice: toNumber(i.unitPrice),
    lineTotal: toNumber(i.lineTotal),
  }));
  return {
    ...order,
    subtotal: toNumber(order.subtotal),
    discount: toNumber(order.discount),
    shipping: toNumber(order.shipping),
    tax: toNumber(order.tax),
    total: toNumber(order.total),
    items,
  };
}

export function serializeReview(r) {
  if (!r) return r;
  return { ...r, id: typeof r.id === "bigint" ? r.id.toString() : r.id };
}
