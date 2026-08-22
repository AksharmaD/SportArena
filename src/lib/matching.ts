import type { Profile } from '@/types';

const SKILL_ORDER: Record<string, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
  Professional: 3,
};

/**
 * Rule-based compatibility score between two profiles.
 * Weights: Sport 30%, Skill 20%, Location 25%, Availability 15%, Looking-for 10%.
 * Returns 0-100. Designed to be replaceable by an ML model later.
 */
export function computeCompatibility(user: Profile, other: Profile): number {
  let score = 0;

  // Sport compatibility (30%) — do they share any sport?
  const sharedSports = (user.sports || []).filter((s) => (other.sports || []).includes(s));
  if (sharedSports.length > 0) {
    score += 30;
  }

  // Skill compatibility (20%) — how close are their skill levels?
  const userSkill = SKILL_ORDER[user.skill_level] ?? 0;
  const otherSkill = SKILL_ORDER[other.skill_level] ?? 0;
  const skillDiff = Math.abs(userSkill - otherSkill);
  if (skillDiff === 0) score += 20;
  else if (skillDiff === 1) score += 15;
  else if (skillDiff === 2) score += 8;
  // skillDiff === 3 → 0

  // Location compatibility (25%) — same city gets full marks
  if (user.city && other.city && user.city.toLowerCase() === other.city.toLowerCase()) {
    score += 25;
  } else if (user.area && other.area && user.area.toLowerCase() === other.area.toLowerCase()) {
    score += 20;
  }

  // Availability compatibility (15%) — do they share any availability slot?
  const sharedAvail = (user.availability || []).filter((a) => (other.availability || []).includes(a));
  if (sharedAvail.length > 0) {
    score += 15;
  }

  // Looking-for compatibility (10%) — do their looking-for preferences overlap?
  const sharedLooking = (user.looking_for || []).filter((l) => (other.looking_for || []).includes(l));
  if (sharedLooking.length > 0) {
    score += 10;
  }

  return Math.min(100, score);
}

/** Haversine distance in km between two lat/lng points. */
export function distanceKm(
  lat1: number | null, lon1: number | null,
  lat2: number | null, lon2: number | null
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
