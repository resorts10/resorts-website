"use client";
import { ThemeProvider } from "@/components/ThemeProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

export default Providers;
