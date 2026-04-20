"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

const AUTH_PATHS: string[] = [];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.includes(pathname);

  if (isAuth) {
    return <div className="flex-1 relative z-[2]">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 relative z-[2] pb-24 md:pb-10">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
