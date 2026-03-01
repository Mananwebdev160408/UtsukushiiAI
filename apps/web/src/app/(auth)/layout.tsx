import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black">
      {/* Left Side: Illustration / Info */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden group">
        <div className="relative z-10 flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10">
              <Image
                src="/images/logo-Photoroom.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="font-display text-2xl tracking-tighter uppercase italic text-black">
              utsukushii<span className="text-white italic-none">.ai</span>
            </span>
          </Link>
          <div className="space-y-4">
            <h2 className="font-display text-7xl uppercase text-black leading-tight tracking-tighter italic">
              Join the <br />
              Chaos.
            </h2>
            <p className="text-black font-bold max-w-sm">
              The future of manga animation is here. Stop wasting hours on
              manual edits.
            </p>
          </div>
        </div>

        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none grid-bg h-full w-full" />

        <div className="relative z-10 h-[400px] w-full mt-12 bg-black neo-border-white neo-shadow h-overflow-hidden">
          <Image
            src="/images/hero.png"
            alt="Art"
            fill
            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-[20s]"
          />
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-white text-black font-bold text-[10px] uppercase tracking-widest">
            AI_GENERATED_ART_V2
          </div>
        </div>

        <div className="relative z-10 pt-12 text-[10px] font-bold text-black uppercase tracking-[0.3em]">
          © 2026 UTSUKUSHII AI INC. • TOKYO • SINCE 2025
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl tracking-tighter uppercase italic text-white">
              utsukushii<span className="text-primary italic-none">.ai</span>
            </span>
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
