import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useCart } from "../context/CartContext.jsx";
import Spinner from "../components/Spinner.jsx";
import { formatPrice, onImageError } from "../utils.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api(`/products/${id}`, { auth: false })
      .then((p) => {
        setProduct(p);
        setQuantity(1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">{error}</p>
        <Link to="/" className="btn-primary mt-4">
          Back to shop
        </Link>
      </div>
    );

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    add(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    add(product, quantity);
    navigate("/cart");
  };

  return (
    <div>
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
        &larr; Back to shop
      </Link>

      <div className="card mt-4 grid gap-8 p-6 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
          <img src={product.imageUrl} alt={product.name} onError={onImageError} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">{product.category}</span>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-slate-900">{formatPrice(product.price)}</p>
          <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>

          <p className={`mt-4 text-sm font-medium ${outOfStock ? "text-red-600" : product.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
            {outOfStock ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
          </p>

          {!outOfStock && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Quantity</span>
                <div className="flex items-center rounded-lg border border-slate-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-lg text-slate-600 hover:bg-slate-100"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-lg text-slate-600 hover:bg-slate-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAdd} className="btn-secondary flex-1 py-2.5">
                  Add to cart
                </button>
                <button onClick={handleBuyNow} className="btn-primary flex-1 py-2.5">
                  Buy now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
