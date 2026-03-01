"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        console.log("LOGIN_SUCCESS: Redirecting to projects...");
        window.location.href = "/projects";
      }
    } catch (err) {
      console.error("LOGIN_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="font-display text-5xl md:text-7xl uppercase italic tracking-tighter text-white">
          Welcome <br />
          Back
        </h1>
        <p className="text-white/40 font-bold uppercase text-xs tracking-[0.2em] leading-relaxed max-w-[300px]">
          Enter your credentials to continue your journey into the chaos.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4">
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
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 px-12 py-4 text-white font-bold uppercase placeholder:text-white/10 outline-none focus:border-primary focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              className="w-3 h-3 border-2 border-white/20 bg-black checked:bg-primary appearance-none transition-all"
            />
            Remember me
          </label>
          <Link href="#" className="hover:text-primary transition-colors">
            Forgot password?
          </Link>
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
          {loading ? "PROCESSING..." : "Login Session"}{" "}
          <ArrowRight className="w-6 h-6" />
        </button>
      </form>

      <div className="space-y-6">
        <div className="relative flex items-center">
          <div className="grow border-t border-white/10"></div>
          <span className="shrink mx-4 text-white/20 font-bold uppercase text-[10px] tracking-widest">
            OR_CONTINUE_WITH
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
        New to Utsukushii?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline underline-offset-4 decoration-2"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
