// Mock backend for the cart page. Every endpoint resolves after a random
// delay so the dialogs that depend on them open in an unpredictable order.

export type CartItem = {
  id: string
  name: string
  pack: string
  composition: string
  manufacturer: string
  mrp: number
  price: number
  qty: number
}

export type CoinsOffer = {
  coinsApplied: number
  value: number
  balance: number
}

export type EdgeMembership = {
  expiresInDays: number
  renewPrice: number
  mrp: number
  durationMonths: number
  renewedTill: string
  benefits: string[]
}

export type BrandSubstitute = {
  itemId: string
  substitute: Omit<CartItem, "qty">
}

export type CashOffer = {
  amount: number
  balance: number
  expiresOn: string
}

export const initialCartItems: CartItem[] = [
  {
    id: "pyrexin-650",
    name: "Pyrexin 650 Tablet",
    pack: "Strip of 15 tablets",
    composition: "Paracetamol 650 mg",
    manufacturer: "Novacure Pharma",
    mrp: 34,
    price: 30,
    qty: 3,
  },
  {
    id: "gastrocid-40",
    name: "Gastrocid 40 Capsule",
    pack: "Strip of 10 capsules",
    composition: "Pantoprazole 40 mg",
    manufacturer: "Helix Labs",
    mrp: 128,
    price: 109,
    qty: 1,
  },
  {
    id: "vitacal-d3",
    name: "Vitacal D3 Sachet",
    pack: "1 sachet of 1 g",
    composition: "Cholecalciferol 60,000 IU",
    manufacturer: "Sunvale Health",
    mrp: 62,
    price: 55,
    qty: 2,
  },
  {
    id: "cetrifex-10",
    name: "Cetrifex 10 Tablet",
    pack: "Strip of 10 tablets",
    composition: "Cetirizine 10 mg",
    manufacturer: "Orbis Remedies",
    mrp: 22,
    price: 19,
    qty: 1,
  },
]

function respond<T>(data: T, minMs = 250, maxMs = 1400): Promise<T> {
  const delay = minMs + Math.random() * (maxMs - minMs)
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}

export function fetchCoinsOffer() {
  return respond<CoinsOffer>({ coinsApplied: 120, value: 120, balance: 450 })
}

export function fetchEdgeMembership() {
  return respond<EdgeMembership>({
    expiresInDays: 3,
    renewPrice: 149,
    mrp: 299,
    durationMonths: 3,
    renewedTill: "27 Feb 2027",
    benefits: [
      "Extra 5% off on every order",
      "Free delivery, no minimum order",
      "Free doctor consults",
    ],
  })
}

export function fetchBrandSubstitute() {
  return respond<BrandSubstitute>({
    itemId: "pyrexin-650",
    substitute: {
      id: "paracetamol-650-generic",
      name: "Paracetamol 650 Tablet",
      pack: "Strip of 15 tablets",
      composition: "Paracetamol 650 mg",
      manufacturer: "Medline Generics",
      mrp: 18,
      price: 14,
    },
  })
}

export function fetchCashOffer() {
  return respond<CashOffer>({ amount: 75, balance: 75, expiresOn: "30 Nov" })
}

export function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}
