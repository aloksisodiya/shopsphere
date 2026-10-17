import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice, onImageError } from "../utils.js";

export default function Cart() {
  const { items, subtotal, setQuantity, remove, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn-primary mt-6">
          Start shopping
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) navigate("/login", { state: { from: "/checkout" } });
    else navigate("/checkout");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Shopping cart</h1>
        <button onClick={clear} className="text-sm text-slate-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="card divide-y divide-slate-200 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 p-4">
              <Link to={`/product/${product.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <img src={product.imageUrl} alt={product.name} onError={onImageError} className="h-full w-full object-cover" />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link to={`/product/${product.id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                    {product.name}
                  </Link>
                  <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
                </div>
                <span className="text-sm text-slate-500">{formatPrice(product.price)} each</span>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => remove(product.id)} className="text-sm text-slate-500 hover:text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card h-fit space-y-4 p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Shipping</span>
            <span className="text-emerald-600">Free</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button onClick={handleCheckout} className="btn-primary w-full py-2.5">
            {user ? "Proceed to checkout" : "Log in to checkout"}
          </button>
        </aside>
      </div>
    </div>
  );
}
