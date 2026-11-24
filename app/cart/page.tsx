import type { Metadata } from "next";
import { DemoCart } from "@/modules/cart/components/demo-popups/demo-cart";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return <DemoCart />;
}
