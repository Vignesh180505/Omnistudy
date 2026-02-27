import React, { useState } from "react";
import { User } from "../types";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../services/firebase";

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }

      const user: User = {
        name: name.trim() || email.split("@")[0],
        email,
      };

      onRegister(user);

    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") alert("Email already registered");
      else if (err.code === "auth/weak-password") alert("Password must be at least 6 characters");
      else alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleRegister} className="space-y-4 bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-3 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-3 rounded-lg"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <button type="button" className="text-indigo-600" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;
