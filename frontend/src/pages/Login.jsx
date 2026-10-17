import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your details to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" state={location.state} className="font-medium text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-xs text-slate-500">
        <p className="font-medium text-slate-600">Demo accounts</p>
        <p>Admin: admin@shopsphere.com / Admin@123</p>
        <p>Customer: user@shopsphere.com / User@123</p>
      </div>
    </div>
  );
}
