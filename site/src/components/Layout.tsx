import React, { useState } from "react";
import { Menu } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { DesktopNav } from "./DesktopNav";
export const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <div className="min-h-screen w-full bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="font-semibold text-xl text-gray-900">Crew Portal</h1>
            <DesktopNav />
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden" aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>
      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-6">{children}</div>
      </div>
    </div>;
};