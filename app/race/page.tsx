import Link from "next/link";

// Entry for the arbiter demo. The original race demo stays at /cart.
export default function RaceHome() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50">
      <Link
        href="/race/cart"
        className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-black/80"
      >
        Cart
      </Link>
    </main>
  );
}
