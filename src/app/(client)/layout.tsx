"use client";

import Navbar from "@/components/navbar";
import SideMenu from "@/components/sideMenu";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes("/sign-in") || pathname?.includes("/sign-up");

  return (
    <>
      {!isAuthPage && <Navbar />}
            <div className="flex flex-row h-screen">
        {!isAuthPage && <SideMenu />}
              <div className="ml-[200px] pt-[64px] h-full overflow-y-auto flex-grow">
                {children}
              </div>
            </div>
    </>
  );
}
