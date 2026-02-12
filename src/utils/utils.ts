import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'دينار'): string {
  return `${price} ${currency}`;
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6;
}

export function calculateTotalPrice(
  priceRegular: number,
  priceWeekend: number,
  checkIn: Date,
  checkOut: Date
): number {
  const nights = calculateNights(checkIn, checkOut);
  let total = 0;
  
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(currentDate.getDate() + i);
    total += isWeekend(currentDate) ? priceWeekend : priceRegular;
  }
  
  return total;
}
