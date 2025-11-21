import type { Candidate, CandidateProfile, ProfileSource } from './candidate.types';

/**
 * Select the best profile to display based on priority: Resume > LinkedIn > Manual
 */
export function selectBestProfile(candidate: Candidate): {
  profile: CandidateProfile | null;
  source: ProfileSource | null;
} {
  if (candidate.resumeProfile) {
    return { profile: candidate.resumeProfile, source: 'RESUME' };
  }
  if (candidate.linkedinProfile) {
    return { profile: candidate.linkedinProfile, source: 'LINKEDIN' };
  }
  if (candidate.manualProfile) {
    return { profile: candidate.manualProfile, source: 'MANUAL' };
  }
  return { profile: null, source: null };
}

/**
 * Get display label and variant for profile source
 */
export function getSourceBadge(source: ProfileSource): {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
} {
  switch (source) {
    case 'RESUME':
      return { label: 'Resume', variant: 'default' };
    case 'LINKEDIN':
      return { label: 'LinkedIn', variant: 'secondary' };
    case 'MANUAL':
      return { label: 'Manual', variant: 'outline' };
  }
}

/**
 * Format a date range from month/year values
 * Examples: "Jan 2020 - Present", "2018 - 2022", "Jan 2020 - Dec 2023"
 */
export function formatDateRange(
  startMonth?: number,
  startYear?: number,
  endMonth?: number,
  endYear?: number
): string {
  if (!startYear) return '';

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const startPart = startMonth
    ? `${monthNames[startMonth - 1]} ${startYear}`
    : `${startYear}`;

  if (!endYear && !endMonth) {
    return `${startPart} - Present`;
  }

  const endPart = endMonth
    ? `${monthNames[endMonth - 1]} ${endYear}`
    : `${endYear}`;

  return `${startPart} - ${endPart}`;
}

/**
 * Calculate duration between dates in years and months
 * Examples: "3 yrs 6 mos", "6 mos", "2 yrs"
 */
export function formatDuration(
  startMonth?: number,
  startYear?: number,
  endMonth?: number,
  endYear?: number
): string {
  if (!startYear) return '';

  const start = new Date(startYear, (startMonth || 1) - 1);
  const end = endYear
    ? new Date(endYear, (endMonth || 12) - 1)
    : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (months < 1) return '1 mo';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'mo' : 'mos'}`;
  }

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'yr' : 'yrs'}`;
  }

  return `${years} ${years === 1 ? 'yr' : 'yrs'} ${remainingMonths} ${remainingMonths === 1 ? 'mo' : 'mos'}`;
}

/**
 * Format location from city and country
 */
export function formatLocation(city?: string, country?: string): string {
  if (city && country) {
    return `${city}, ${country}`;
  }
  return city || country || '';
}
