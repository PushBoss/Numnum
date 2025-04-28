// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { timeRanges } from "./data"; // Import time ranges

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCurrentMealType = (): "Breakfast" | "Lunch" | "Dinner" => {
  const now = new Date();
  const currentHour = now.getHours();

  if (
    currentHour >= timeRanges.BREAKFAST_START &&
    currentHour <= timeRanges.BREAKFAST_END
  ) {
    return "Breakfast";
  } else if (
    currentHour >= timeRanges.LUNCH_START &&
    currentHour <= timeRanges.LUNCH_END
  ) {
    return "Lunch";
  } else {
    return "Dinner";
  }
};

export const getGreeting = (): string => {
  const currentMealType = getCurrentMealType();
  return `What's for ${currentMealType}?`;
};

// Emoji functions now accept max value for better scaling if needed
export const getMoodEmoji = (value: number, max: number): string => {
  if (value <= max / 3) {
    return "☹️"; // Sad
  } else if (value <= (max * 2) / 3) {
    return "😐"; // Neutral
  } else {
    return "🥳"; // Adventurous
  }
};

export const getHungerEmoji = (value: number, max: number): string => {
 if (value <= max / 2) {
      return '🤤'; // Peckish
    } else {
      return '😫'; // Famished
    }
};

export const getBudgetEmoji = (value: number, max: number): string => {
  if (value <= max / 3) {
    return "😒"; // Stingy
  } else if (value <= (max * 2) / 3) {
    return "🙂"; // Normal
  } else {
    return "🤑"; // Fancy
  }
};

export const getDineTypeEmoji = (value: number, max: number): string => {
  if (value <= max / 2) {
    return "🏠"; // Eat In
  } else {
    return "🛵"; // Eat Out
  }
};

export const getSpicyEmoji = (value: number, max: number): string => {
  if (value <= max / 3) {
    return "😇"; // No Spice
  } else if (value <= (max * 2) / 3) {
    return "🔥"; // Medium Spice
  } else {
    return "🥵"; // Fire Breather (using 🥵 for better visibility)
  }
};
