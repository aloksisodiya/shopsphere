import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils.js";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/orders", {
        method: "POST",
        body: {
          shippingAddress: address,
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        },
      });
      clear();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-semibold">Shipping address</h2>
            <label htmlFor="address" className="label">
              Full address
            </label>
            <textarea
              id="address"
              required
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Name, street, city, state, PIN code"
              className="input"
            />
          </section>

          <section className="card p-6">
            <h2 className="mb-2 text-lg font-semibold">Payment</h2>
            <p className="text-sm text-slate-600">
              Cash on delivery. Online payments aren't connected in this demo.
            </p>
          </section>
        </div>

        <aside className="card h-fit space-y-4 p-6">
          <h2 className="text-lg font-semibold">Your order</h2>
          <ul className="space-y-2 text-sm">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-4">
                <span className="text-slate-600">
                  {product.name} × {quantity}
                </span>
                <span className="font-medium">{formatPrice(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? "Placing order..." : "Place order"}
          </button>
          <Link to="/cart" className="block text-center text-sm text-slate-500 hover:text-slate-800">
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
