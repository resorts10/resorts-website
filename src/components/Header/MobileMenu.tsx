"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MenuItem } from "./types";
import { CloseIcon } from "./icons";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  headerLogo: string | null;
  isOpen: boolean;
  onClose: () => void;
  menuData: MenuItem[];
}

const MobileMenu = ({ isOpen, onClose, menuData, headerLogo }: MobileMenuProps) => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const pathname = usePathname();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isOpen &&
        !target.closest(".mobile-menu-container") &&
        !target.closest("#Toggle")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleSubmenu = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Offcanvas Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] max-w-full bg-background z-50 shadow-xl transform transition-transform duration-300 ease-in-out mobile-menu-container ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-background-hover">
            <div>
              <Link className="block shrink-0" href="/">
                <div className="amwaj-brand-lockup">
                  <Image
                    src="/figma.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    priority
                    className="amwaj-brand-mark dark:hidden"
                  />
                  <Image
                    src="/figma.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    priority
                    className="amwaj-brand-mark hidden dark:block"
                  />
                  <span className="amwaj-brand-text"> Amwaj Resort&apos;s </span>
                </div>
              </Link>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary focus:outline-none"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-2 overflow-y-auto">
            <nav>
              <ul className="px-2 space-y-2">
                {menuData.map((menuItem, i) => (
                  <li key={i}>
                    {menuItem.submenu ? (
                      <div>
                        <button
                          onClick={() => toggleSubmenu(i)}
                          className={`flex items-center justify-between w-full px-4 py-2 text-sm bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 ${
                            menuItem.submenu?.some(subItem => pathname === subItem.path)
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                        >
                          <span>{menuItem.title}</span>
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
                            className={`transition-transform duration-200 ${
                              expandedItems.includes(i) ? "rotate-180" : ""
                            }`}
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>

                        {/* Submenu */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            expandedItems.includes(i) ? "max-h-96" : "max-h-0"
                          }`}
                        >
                          <div className="pl-2 pt-2 space-y-2">
                            {menuItem.submenu.map((subItem, j) => (
                              <Link
                                key={j}
                                href={subItem.path || "#"}
                                className={`block px-4 py-2 text-sm bg-background-hover text-white rounded-lg font-bold hover:bg-black transform hover:-translate-y-1 transition duration-400 ${
                                  subItem.path && pathname.split('?')[0] === subItem.path.split('?')[0]
                                    ? "ring-2 ring-primary"
                                    : ""
                                }`}
                                onClick={onClose}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={menuItem.path || "#"}
                        className={`block px-4 py-2 text-sm bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 ${
                          menuItem.path && pathname.split('?')[0] === menuItem.path.split('?')[0]
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={onClose}
                      >
                        {menuItem.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
