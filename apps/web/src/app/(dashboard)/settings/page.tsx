"use client";

import { useState } from "react";
import {
  User,
  Cpu,
  Share2,
  CreditCard,
  Lock,
  Settings as SettingsIcon,
  Save,
  Database,
  Key,
  HardDrive,
  Palette,
  Crown,
  Webhook,
  Youtube,
  MessageCircle,
  Sun,
  Moon,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export default function SettingsHubPage() {
  const [activeTab, setActiveTab] = useState("Identity & Profile");
  const { user, fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const tabs = [
    { id: "personal", name: "Identity & Profile", icon: User },
    { id: "ai", name: "Compute Node (AI)", icon: Cpu },
    { id: "billing", name: "Subscription", icon: Crown },
    { id: "integrations", name: "Integrations", icon: Webhook },
    { id: "appearance", name: "Appearance", icon: Palette },
  ];

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 font-body">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="border-4 border-black dark:border-white bg-[#0a0a0a] p-8 shadow-hard hover:shadow-neo transition-all sticky top-32">
            <div className="flex items-center gap-6 mb-10 border-b-4 border-black dark:border-white pb-6">
              <div
                className="w-20 h-20 border-4 border-black dark:border-white bg-cover bg-center grayscale hover:grayscale-0 transition-all shadow-hard-xs"
                style={{ backgroundImage: `url('${user?.avatar || '/images/logo-Photoroom.png'}')` }}
              ></div>
              <div>
                <h2 className="font-display font-black text-xl uppercase italic leading-none text-white">
                  {user?.name || "Utsukushii User"}
                </h2>
              </div>
            </div>

            <nav className="flex flex-col gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 font-black font-mono text-[11px] uppercase italic transition-all border-4 text-left group",
                    activeTab === tab.name
                      ? "bg-primary text-black border-black shadow-hard-xs translate-x-2"
                      : "bg-transparent text-white/40 border-transparent hover:border-white/10 hover:text-white",
                  )}
                >
                  <tab.icon
                    className={cn(
                      "w-5 h-5 transition-transform",
                      activeTab === tab.name
                        ? "rotate-12"
                        : "group-hover:rotate-12",
                    )}
                  />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-12">
          {/* Header Banner */}
          <div className="bg-black border-4 border-black dark:border-white p-8 relative overflow-hidden shadow-[8px_8px_0px_#ff4500]">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="relative z-10">
              <h1 className="font-display font-black text-6xl md:text-8xl text-white uppercase italic tracking-tighter leading-none mb-4 drop-shadow-[4px_4px_0px_#ccff00]">
                Terminal Settings
              </h1>
              <div className="max-w-2xl">
                <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] leading-relaxed">
                  Adjust your identity parameters and local neural-node
                  infrastructure.
                </p>
              </div>
            </div>
            {/* Background Decorative Text */}
            <span className="absolute -bottom-10 -right-10 text-[120px] font-black text-white/3 uppercase italic select-none pointer-events-none">
              MATRIX
            </span>
          </div>

          {/* Tab Content Rendering */}
          <div className="min-h-[600px] transition-all duration-300">
            {activeTab === "Identity & Profile" && (
              <section className="bg-surface-dark border-4 border-black p-8 md:p-12 shadow-hard space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b-4 border-white/10 pb-6">
                  <div>
                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase italic text-white tracking-widest">
                      Identity Core
                    </h2>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-2">
                      UNIQUE_ID: {user?.id || "N/A"} // NODE: ACTIVE
                    </p>
                  </div>
                  <User className="w-10 h-10 text-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <InputGroup
                    label="System Handle"
                    value={user?.name || ""}
                  />
                  <InputGroup
                    label="Network Interface (Email)"
                    value={user?.email || ""}
                    type="email"
                  />
                  <div className="md:col-span-2">
                    <InputGroup
                      label="Portfolio URL"
                      value="https://portfolio.utsukushii.ai"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block">
                      <span className="font-mono font-black text-[10px] uppercase text-white/40 tracking-[0.4em] mb-4 block italic">
                        Artist Manifesto
                      </span>
                      <textarea
                        className="w-full bg-black border-4 border-white/5 p-6 font-mono text-sm text-white focus:border-primary outline-none focus:bg-primary/5 h-40 resize-none transition-all shadow-inner"
                        defaultValue="Digital artist specializing in cyberpunk aesthetics and AI-generated manga music videos."
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t-2 border-white/5">
                  <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest text-center sm:text-left">
                    LAST_LOGIN: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} // {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}_UTC
                  </p>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button className="flex-1 bg-black text-white border-2 border-white/10 px-6 py-4 font-mono font-bold uppercase text-[10px] tracking-widest hover:border-white/40 transition-all">
                      Reset Profile
                    </button>
                    <button className="flex-2 bg-primary text-black border-4 border-black px-12 py-4 font-display font-black uppercase text-xl italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95">
                      Update Identity
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "Compute Node (AI)" && (
              <section className="bg-surface-dark border-4 border-black p-8 md:p-12 shadow-hard space-y-10 border-l-16 border-l-secondary animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b-4 border-white/10 pb-6">
                  <div>
                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase italic text-white tracking-widest">
                      Compute Cluster
                    </h2>
                    <p className="text-[10px] font-mono text-secondary uppercase tracking-widest mt-2">
                      HARDWARE: NVIDIA_RTX_4090 // CUDA: 12.4_READY
                    </p>
                  </div>
                  <Cpu className="w-10 h-10 text-secondary" />
                </div>

                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingCard
                      title="GPU Acceleration"
                      description="Utilize local CUDA cores for Stage 1-5 (SAM2, SVD, MiDaS)."
                      enabled={true}
                    />
                    <SettingCard
                      title="Cold Storage Node"
                      description="Automatic mirroring of FFmpeg outputs to local disk volumes."
                      enabled={true}
                    />
                  </div>

                  {/* Model Registry Status */}
                  <div className="bg-black border-4 border-white/5 p-8 space-y-6 shadow-inner">
                    <h3 className="font-display font-black text-xl italic text-white uppercase tracking-tighter flex items-center gap-3">
                      <Database className="w-5 h-5 text-secondary" />{" "}
                      Model_Registry_Active
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          name: "YOLOv12-Manga",
                          status: "READY",
                          size: "1.2 GB",
                        },
                        {
                          name: "SAM2-Hiera-Base",
                          status: "READY",
                          size: "2.4 GB",
                        },
                        {
                          name: "MiDaS-v3-DPT",
                          status: "READY",
                          size: "0.8 GB",
                        },
                        {
                          name: "SVD-Video-Diffusion",
                          status: "READY",
                          size: "5.1 GB",
                        },
                      ].map((model) => (
                        <div
                          key={model.name}
                          className="flex justify-between items-center border-b border-white/10 pb-3"
                        >
                          <div>
                            <p className="font-mono text-[10px] text-white font-bold">
                              {model.name}
                            </p>
                            <p className="font-mono text-[8px] text-white/30 uppercase">
                              {model.size}
                            </p>
                          </div>
                          <span className="bg-green-500/10 text-green-500 text-[8px] px-2 py-0.5 font-black border border-green-500/20">
                            {model.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-mono font-black text-[10px] uppercase text-white/40 tracking-[0.4em]">
                        Local_VRAM_Budget
                      </label>
                      <span className="text-2xl font-display font-black text-secondary italic">
                        16 GB
                      </span>
                    </div>
                    <div className="h-6 bg-black border-4 border-white/10 p-1 relative">
                      <div className="h-full bg-secondary w-[66%]" />
                      <input
                        type="range"
                        className="absolute inset-0 w-full h-full bg-transparent accent-white appearance-none cursor-pointer opacity-0"
                        defaultValue={66}
                      />
                    </div>
                  </div>

                  <InputGroup
                    label="Local Project Data Volume (Path)"
                    value="C:/Users/Utsukushii/Projects/Videos"
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <button className="bg-secondary text-black border-4 border-black px-10 py-4 font-display font-black uppercase text-xl italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    Re-Init Node
                  </button>
                </div>
              </section>
            )}

            {/* ── Billing Tab (11.2) ─────────────────────────────────── */}
            {activeTab === "Subscription" && (
              <section className="bg-surface-dark border-4 border-black p-8 md:p-12 shadow-hard space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b-4 border-white/10 pb-6">
                  <div>
                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase italic text-white tracking-widest">
                      Subscription Matrix
                    </h2>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-2">
                      Current Tier: <span className="text-primary">FREE_TIER</span> // CREDITS: 0
                    </p>
                  </div>
                  <Crown className="w-10 h-10 text-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Free",
                      price: "$0",
                      period: "/month",
                      color: "border-white/20",
                      highlight: false,
                      features: ["3 Projects", "720p Export", "5 Renders/month", "Community Support"],
                    },
                    {
                      name: "Pro",
                      price: "$19",
                      period: "/month",
                      color: "border-primary",
                      highlight: true,
                      features: ["Unlimited Projects", "4K Export", "50 Renders/month", "Priority Support", "Custom Presets", "Beat Sync AI"],
                    },
                    {
                      name: "Elite",
                      price: "$49",
                      period: "/month",
                      color: "border-secondary",
                      highlight: false,
                      features: ["Everything in Pro", "API Access", "Dedicated GPU", "White-label Export", "Custom Models", "SLA Guarantee"],
                    },
                  ].map((tier) => (
                    <div
                      key={tier.name}
                      className={cn(
                        "border-4 p-8 relative transition-all hover:-translate-y-1 hover:shadow-neo",
                        tier.highlight
                          ? "bg-primary/10 border-primary shadow-hard"
                          : "bg-black/40 " + tier.color,
                      )}
                    >
                      {tier.highlight && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-black text-[10px] uppercase px-4 py-1 border-2 border-black tracking-widest">
                          MOST POPULAR
                        </div>
                      )}
                      <h3 className={cn("font-display font-black text-3xl uppercase italic mb-1", tier.highlight ? "text-primary" : "text-white")}>
                        {tier.name}
                      </h3>
                      <div className="flex items-end gap-1 mb-6">
                        <span className="font-display font-black text-5xl text-white">{tier.price}</span>
                        <span className="font-mono text-xs text-white/40 mb-2">{tier.period}</span>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/60">
                            <CheckCircle2 className={cn("w-4 h-4 shrink-0", tier.highlight ? "text-primary" : "text-white/30")} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        className={cn(
                          "w-full py-3 font-display font-black uppercase italic border-4 border-black transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
                          tier.highlight
                            ? "bg-primary text-black shadow-hard"
                            : "bg-white/5 text-white hover:bg-white/10",
                        )}
                      >
                        {tier.name === "Free" ? "Current Plan" : "Upgrade"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Integrations Tab (11.3) ────────────────────────────── */}
            {activeTab === "Integrations" && (
              <section className="bg-surface-dark border-4 border-black p-8 md:p-12 shadow-hard space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b-4 border-white/10 pb-6">
                  <div>
                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase italic text-white tracking-widest">
                      Integration Hub
                    </h2>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-2">
                      Connect external services // NODE: READY
                    </p>
                  </div>
                  <Webhook className="w-10 h-10 text-secondary" />
                </div>

                <div className="space-y-8">
                  {/* Discord */}
                  <div className="bg-black/40 border-4 border-white/10 p-8 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#5865F2] flex items-center justify-center border-2 border-black shadow-hard-xs shrink-0">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-xl uppercase italic text-white">Discord Webhook</h3>
                        <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Get render notifications in your Discord server</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em] font-black block">Webhook URL</label>
                      <div className="flex gap-3">
                        <input
                          id="discord-webhook-url"
                          type="url"
                          placeholder="https://discord.com/api/webhooks/..."
                          className="flex-1 bg-black border-4 border-white/10 px-4 py-3 text-white font-mono text-sm outline-none focus:border-[#5865F2] transition-all placeholder-white/10"
                        />
                        <button className="px-6 bg-[#5865F2] text-white border-4 border-black font-black uppercase text-xs shadow-hard-xs hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                          Test
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="bg-black/40 border-4 border-white/10 p-8 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FF0000] flex items-center justify-center border-2 border-black shadow-hard-xs shrink-0">
                        <Youtube className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-xl uppercase italic text-white">YouTube API</h3>
                        <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Direct upload rendered videos to your channel</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em] font-black block">API Key</label>
                      <div className="flex gap-3">
                        <input
                          id="youtube-api-key"
                          type="password"
                          placeholder="AIza..."
                          className="flex-1 bg-black border-4 border-white/10 px-4 py-3 text-white font-mono text-sm outline-none focus:border-[#FF0000] transition-all placeholder-white/10"
                        />
                        <button className="px-6 bg-[#FF0000] text-white border-4 border-black font-black uppercase text-xs shadow-hard-xs hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Appearance Tab (11.4) ──────────────────────────────── */}
            {activeTab === "Appearance" && (
              <section className="bg-surface-dark border-4 border-black p-8 md:p-12 shadow-hard space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b-4 border-white/10 pb-6">
                  <div>
                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase italic text-white tracking-widest">
                      Visual Interface
                    </h2>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-2">
                      Customize appearance parameters
                    </p>
                  </div>
                  <Palette className="w-10 h-10 text-accent" />
                </div>

                <div className="space-y-10">
                  {/* Dark/Light Mode */}
                  <div className="space-y-4">
                    <h3 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Color Mode</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: "dark", label: "Dark Mode", icon: Moon, desc: "Forge Aesthetic" },
                        { id: "light", label: "Light Mode", icon: Sun, desc: "Manga Prints" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          className={cn(
                            "p-6 border-4 flex flex-col items-center gap-3 transition-all group",
                            mode.id === "dark"
                              ? "bg-primary/10 border-primary shadow-hard"
                              : "bg-white/5 border-white/10 hover:border-white/30",
                          )}
                        >
                          <mode.icon className={cn("w-8 h-8", mode.id === "dark" ? "text-primary" : "text-white/40")} />
                          <div className="text-center">
                            <p className={cn("font-black uppercase italic text-lg", mode.id === "dark" ? "text-primary" : "text-white")}>
                              {mode.label}
                            </p>
                            <p className="font-mono text-[9px] text-white/30 uppercase mt-1">{mode.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-4">
                    <h3 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Accent Color</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: "Neon Lime", value: "#ccff00" },
                        { label: "Hot Magenta", value: "#ff00ff" },
                        { label: "Cyber Cyan", value: "#00ffff" },
                        { label: "Blood Orange", value: "#ff4500" },
                        { label: "Electric Blue", value: "#0077ff" },
                        { label: "Gold", value: "#ffd700" },
                      ].map((color) => (
                        <button
                          key={color.value}
                          title={color.label}
                          className={cn(
                            "w-12 h-12 border-4 transition-all hover:scale-110",
                            color.value === "#ccff00" ? "border-black shadow-hard" : "border-white/20 hover:border-white/60",
                          )}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-4">
                    <h3 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">UI Density</h3>
                    <div className="flex gap-3">
                      {["Compact", "Comfortable", "Spacious"].map((d, i) => (
                        <button
                          key={d}
                          className={cn(
                            "flex-1 py-3 border-4 font-mono font-black text-xs uppercase transition-all",
                            i === 1
                              ? "bg-primary text-black border-black shadow-hard-xs"
                              : "bg-black/20 text-white/40 border-white/10 hover:border-white/30",
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="bg-primary text-black border-4 border-black px-10 py-4 font-display font-black uppercase text-xl italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    Save Appearance
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="font-mono text-[10px] text-white/10 uppercase tracking-[0.5em]">
          ID: {user?.id || "N/A"} // NODE: ACTIVE
        </p>
      </div>
    </main>
  );
}

function InputGroup({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <label className="block w-full">
      <span className="font-mono font-black text-[10px] uppercase text-white/40 tracking-[0.3em] mb-3 block">
        {label}
      </span>
      <input
        key={value}
        type={type}
        defaultValue={value}
        className="w-full bg-black border-4 border-white/10 p-5 font-mono text-sm text-white focus:border-primary outline-none focus:shadow-neo-sm transition-all uppercase"
      />
    </label>
  );
}

function SettingCard({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div
      className={cn(
        "p-6 border-4 transition-all group cursor-pointer bg-black/40",
        enabled ? "border-secondary shadow-hard-xs" : "border-white/10",
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-display font-black text-xl italic text-white uppercase leading-none">
          {title}
        </h3>
        <div
          className={cn(
            "w-12 h-7 border-4 relative transition-all",
            enabled
              ? "bg-secondary border-secondary"
              : "bg-zinc-800 border-zinc-700",
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 w-4 h-4 transition-all",
              enabled ? "right-0.5 bg-black" : "left-0.5 bg-zinc-600",
            )}
          ></div>
        </div>
      </div>
      <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
        {description}
      </p>
    </div>
  );
}
