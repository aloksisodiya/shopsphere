import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "All";

  const [search, setSearch] = useState(q);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateParam = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== "All") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );

  useEffect(() => {
    api("/products/categories", { auth: false }).then(setCategories).catch(() => {});
  }, []);

  // Debounce the search box so we don't fetch on every keystroke
  useEffect(() => {
    const t = setTimeout(() => updateParam("q", search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category !== "All") qs.set("category", category);

    setLoading(true);
    setError("");
    api(`/products?${qs}`, { auth: false })
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, category]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Find something you'll love</h1>
        <p className="mt-2 max-w-xl text-indigo-100">
          Browse our catalogue, add items to your cart and check out in a few clicks.
        </p>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="mt-6 w-full max-w-md rounded-lg border-0 px-4 py-2.5 text-sm text-slate-900 shadow focus:outline-none focus:ring-2 focus:ring-white/60"
        />
      </section>

      <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => updateParam("category", c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === c
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-slate-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
