"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, Mail, Lock, User, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api/client";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.register({ name, email, password });
      if (res.success) {
        console.log("REGISTER_SUCCESS: Redirecting to projects...");
        window.location.href = "/projects";
      }
    } catch (err) {
      console.error("REGISTER_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="font-display text-5xl md:text-7xl uppercase italic tracking-tighter text-white">
          Create <br />
          Account
        </h1>
        <p className="text-white/40 font-bold uppercase text-xs tracking-[0.2em] leading-relaxed max-w-[300px]">
          Start your mission today. 500 free credits waiting for you.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleRegister}>
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
              <User className="w-5 h-5 text-white/20" />
            </div>
            <input
              type="text"
              placeholder="FULL_NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 px-12 py-4 text-white font-bold uppercase placeholder:text-white/10 outline-none focus:border-primary focus:bg-white/10 transition-all"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
              <Mail className="w-5 h-5 text-white/20" />
            </div>
            <input
              type="email"
              placeholder="EMAIL_ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 px-12 py-4 text-white font-bold uppercase placeholder:text-white/10 outline-none focus:border-primary focus:bg-white/10 transition-all"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
              <Lock className="w-5 h-5 text-white/20" />
            </div>
            <input
              type="password"
              placeholder="CREATE_PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 px-12 py-4 text-white font-bold uppercase placeholder:text-white/10 outline-none focus:border-primary focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 leading-loose">
          By registering, you agree to our{" "}
          <Link href="#" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          .
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-5 bg-primary text-black font-display text-2xl uppercase tracking-widest neo-border-primary neo-shadow transition-all flex items-center justify-center gap-3",
            loading
              ? "opacity-50 cursor-not-allowed"
              : "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
          )}
        >
          {loading ? "DEPLOYING..." : "Deploy Profile"}{" "}
          <ArrowRight className="w-6 h-6" />
        </button>
      </form>

      <div className="space-y-6">
        <div className="relative flex items-center">
          <div className="grow border-t border-white/10"></div>
          <span className="shrink mx-4 text-white/20 font-bold uppercase text-[10px] tracking-widest">
            OR_REGISTER_WITH
          </span>
          <div className="grow border-t border-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="py-4 border-2 border-white/10 hover:border-white text-white font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-colors">
            <Github className="w-5 h-5" /> Github
          </button>
          <button className="py-4 border-2 border-white/10 hover:border-white text-white font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-colors">
            <Shield className="w-5 h-5 text-[#5865F2]" /> Discord
          </button>
        </div>
      </div>

      <div className="pt-8 text-center text-white/40 font-bold uppercase text-xs tracking-widest">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline underline-offset-4 decoration-2"
        >
          Sign in session
        </Link>
      </div>
    </div>
  );
}
