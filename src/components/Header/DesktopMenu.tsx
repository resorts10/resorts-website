"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem } from "./types";
import { usePathname } from "next/navigation";

interface DesktopMenuProps {
  menuData: MenuItem[];
  stickyMenu: boolean;
}

const DesktopMenu = ({ menuData, stickyMenu }: DesktopMenuProps) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const pathname = usePathname();

  const handleMouseEnter = (index: number) => {
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav>
      <ul className="flex items-center gap-10">
        {menuData.map((menuItem, i) => (
          <li
            key={i}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
          >
            {menuItem.submenu ? (
              <>
                <button
                  className={`flex items-center gap-1 px-4 py-2 bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 text-sm ${
                    menuItem.submenu?.some(subItem => pathname === subItem.path) 
                      ? "ring-2 ring-primary" 
                      : ""
                  }`}
                >
                  {menuItem.title}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${activeDropdown === i ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute left-0 border border-background-hover top-full bg-background-hover shadow-lg rounded-lg p-2 min-w-[220px] z-50 transform transition-all duration-200 ${
                    activeDropdown === i
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 translate-y-2 invisible"
                  }`}
                >
                  {menuItem.submenu.map((subItem, j) => (
                    <Link
                      key={j}
                      href={subItem.path || "#"}
                      className={`block px-4 py-2 text-sm font-bold rounded-lg text-white hover:bg-black hover:-translate-y-1 transform transition duration-400 ${
                        subItem.path && pathname.split('?')[0] === subItem.path.split('?')[0] 
                          ? "ring-2 ring-primary" 
                          : ""
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={menuItem.path || "#"}
                className={`px-4 py-2 bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 text-sm block ${
                  menuItem.path && pathname.split('?')[0] === menuItem.path.split('?')[0] 
                    ? "ring-2 ring-primary" 
                    : ""
                }`}
              >
                {menuItem.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DesktopMenu;
