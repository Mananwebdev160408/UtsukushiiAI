"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientRedirectToLogin() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const redirectTo = `/login?redirect=${encodeURIComponent(pathname || "/")}`;
    // replace so back button doesn't keep landing here
    router.replace(redirectTo);
  }, [pathname, router]);

  return null;
}
