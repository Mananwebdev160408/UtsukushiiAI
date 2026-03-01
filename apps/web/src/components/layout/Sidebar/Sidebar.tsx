"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusSquare,
  Settings,
  User,
  LogOut,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const menuItems = [
  { icon: LayoutDashboard, label: "Projects", href: "/projects" },
  { icon: PlusSquare, label: "New Project", href: "/projects/new" },
  { icon: FolderOpen, label: "Assets", href: "/assets" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-black border-r-2 border-white/5 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8">
            <Image
              src="/images/logo-Photoroom.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-display text-xl tracking-tighter uppercase italic">
            utsukushii<span className="text-primary italic-none">.ai</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 font-bold uppercase text-[10px] tracking-[0.2em] transition-all group",
                isActive
                  ? "bg-primary text-black neo-shadow-primary"
                  : "text-white/40 hover:text-white hover:bg-white/5",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive
                    ? "text-black"
                    : "text-white/20 group-hover:text-primary transition-colors",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-2 bg-white/5 mx-4 mb-8 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-display text-black">
            JD
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-[10px] uppercase tracking-widest truncate">
              John_Doe
            </p>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest truncate">
              500 Credits Available
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 space-y-4">
        <Link
          href="/help"
          className="flex items-center gap-4 px-4 py-3 font-bold uppercase text-[10px] tracking-[0.2em] text-white/40 hover:text-white transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-white/20" />
          Support
        </Link>
        <button className="flex items-center gap-4 px-4 py-3 font-bold uppercase text-[10px] tracking-[0.2em] text-white/40 hover:text-secondary transition-colors w-full text-left">
          <LogOut className="w-5 h-5 text-white/20" />
          Terminate session
        </button>
      </div>
    </aside>
  );
}
