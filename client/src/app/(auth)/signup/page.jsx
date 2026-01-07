"use client";

import { useState } from "react";
import { Mail, Phone, Globe, MapPin, Store, Lock } from "lucide-react";
import axios from "axios";
import baseUrl from "@/api/env";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    category: "",
    city: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post(`${baseUrl}/users/register`, formData);

      if (res.status === 201 || res.status === 200) {
        const token = res.data.token;
        localStorage.setItem("token", token);

        setMessage({
          type: "success",
          text: "🎉 Account created successfully! Redirecting to dashboard...",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          category: "",
          city: "",
          country: "",
        });

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Registration failed. Try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
      <div className="relative bg-zinc-900/70 border border-zinc-800 rounded-3xl shadow-[0_0_40px_rgba(255,78,88,0.15)] w-full max-w-2xl p-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 bg-[#FF4E58]/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-[#FF4E58] text-2xl font-bold">LC</span>
          </div>
          <h2 className="text-3xl font-bold text-[#FF4E58]">
            Register your business
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Join LocalConnect and showcase your business to the world 🌍
          </p>
        </div>

        {message.text && (
          <p
            className={`text-center mb-6 text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField
            label="Store Name"
            name="name"
            placeholder="e.g. Everest Handicrafts"
            icon={<Store size={18} />}
            value={formData.name}
            onChange={handleChange}
            required
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <InputField
            label="Phone"
            name="phone"
            placeholder="+977 9801234567"
            icon={<Phone size={18} />}
            value={formData.phone}
            onChange={handleChange}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            icon={<Lock size={18} />}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm mb-2 text-gray-300">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-zinc-800/70 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#FF4E58] outline-none transition"
            >
              <option value="">Select a category</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel & Stay</option>
              <option value="crafts">Local Crafts</option>
              <option value="trekking">Trekking Agency</option>
              <option value="shop">Shop</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="City"
              name="city"
              placeholder="e.g. Kathmandu"
              icon={<MapPin size={18} />}
              value={formData.city}
              onChange={handleChange}
            />
            <InputField
              label="Country"
              name="country"
              placeholder="e.g. Nepal"
              icon={<Globe size={18} />}
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-500" : "bg-[#FF4E58] hover:bg-[#ff636d]"
            } text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_25px_#FF4E58]`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-[#FF4E58] hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  required,
}) {
  return (
    <div>
      <label className="block text-sm mb-2 text-gray-300">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-zinc-800/70 border border-zinc-700 rounded-lg px-10 py-3 text-white focus:ring-2 focus:ring-[#FF4E58] outline-none transition"
        />
      </div>
    </div>
  );
}
