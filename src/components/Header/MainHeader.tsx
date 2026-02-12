"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { menuData } from "./menuData";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import {
  MenuIcon,
  CloseIcon,
} from "./icons";
import { resorts } from "@/assets/resorts";
import { RippleButton } from "@/components/ui/ripple-button";
import { ThemeToggle } from "@/components/ThemeToggle";

type IProps = {
  headerData?: any;
};

const MainHeader = ({ headerData }: IProps) => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const paymentLink = resorts[0]?.paymentLink || "/resorts";

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setNavigationOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <header
        className={`left-0 top-0 w-full max-h-[80px] z-50 bg-background transition-all ease-in-out duration-300 ${stickyMenu && "shadow-sm border-b border-background-hover"}`}
      >
        {/* Main Header */}
        <div className="px-3 mx-auto max-w-7xl sm:px-6 xl:px-0 ">
          <div className="flex items-center justify-between  py-2">
            {/* Logo */}
            <div >
              <Link className="absolute left-6 right-3 flex items-center gap-0 shrink-0" href="/">
                  {/* <span className="amwaj-brand-text"> Amwaj Resort&apos;s </span> */}
                <div className="relative bottom-0   max-w-[500px] max-h-[210px] ">
                  <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={500}
                    height={250}
                    priority
                    className="relative w-[250px] h-[100px] mr-12 border-2 border-meta-2/60 bottom-3 rounded-lg dark:hidden"
                  />
                  <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={500}
                    height={150}
                    priority
                    className="relative w-[250px] h-[100px] mr-12 border-2 border-meta-2/60 bottom-3 rounded-lg hidden dark:block"
                  />
                
                </div>
              </Link>
            </div>

            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden xl:block mt-25 mr-45">
              <DesktopMenu menuData={menuData} stickyMenu={stickyMenu} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center mx-8">
              <div className="hidden xl:block mt-25 ml-5">
              <ThemeToggle />
              </div>
              
              <RippleButton
                onClick={() => {
                  if (paymentLink.startsWith("http")) {
                    window.open(paymentLink, "_blank");
                  } else {
                    window.location.href = paymentLink;
                  }
                }}
                className="hidden mt-25 sm:inline-flex bg-black text-white border-2 border-white"
                rippleColor="rgba(120, 183, 225, 0.6)"
              >
                احجز الآن
              </RippleButton>

              {/* Mobile Menu Toggle */}
              <button
                className="transition xl:hidden focus:outline-none text-white"
                onClick={() => setNavigationOpen(!navigationOpen)}
                aria-label={navigationOpen ? "Close menu" : "Open menu"}
              >
                {navigationOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Offcanvas */}
      <MobileMenu
        headerLogo={headerData?.headerLogo || null}
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        menuData={menuData}
      />
    </>
  );
};

export default MainHeader;
