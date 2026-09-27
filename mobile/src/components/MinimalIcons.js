import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

/**
 * Pixel-perfect minimalist icons matching the Feedants design reference:
 * - Bottom Navigation: Home, Explore, Create (+), Competitions
 * - Important Dates: Calendar, Paper Plane, Tray Upload, Trophy Cup
 * - Rewards List: 1st (Gold Trophy), 2nd (Silver Medal), 3rd (Bronze Medal), 4th-6th (Teal Outline Star)
 * - Header & Badges: Certificate Trophy, Spots Users
 * - Countdown Banner: Hourglass, Stopwatch
 * - Policy & Assurance: Shield Outline
 * - Refer & Earn: Megaphone Outline
 * - Disclaimer: Info Circle
 */

// --- BOTTOM NAVIGATION ICONS ---

export function HomeNavIcon({ size = 22, color = '#64748B', isActive = false }) {
  const strokeColor = isActive ? '#0F766E' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10Z"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? '#0F766E' : 'none'}
        fillOpacity={isActive ? 0.15 : 0}
      />
    </Svg>
  );
}

export function ExploreNavIcon({ size = 22, color = '#64748B', isActive = false }) {
  const strokeColor = isActive ? '#0F766E' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="11"
        cy="11"
        r="7"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="16.5"
        y1="16.5"
        x2="21"
        y2="21"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CompetitionsNavIcon({ size = 22, color = '#0F766E', isActive = false }) {
  const strokeColor = isActive ? '#0F766E' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4C2.89543 9 2 8.10457 2 7C2 5.89543 2.89543 5 4 5H6"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 9H20C21.1046 9 22 8.10457 22 7C22 5.89543 21.1046 5 20 5H18"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 5H19V10C19 13.866 15.866 17 12 17C8.13401 17 5 13.866 5 10V5Z"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? '#0F766E' : 'none'}
        fillOpacity={isActive ? 0.2 : 0}
      />
      <Path
        d="M12 17V20"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 20H16"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CreatePlusNavIcon({ size = 20, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.5"
      />
      <Line
        x1="12"
        y1="7.5"
        x2="12"
        y2="16.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Line
        x1="7.5"
        y1="12"
        x2="16.5"
        y2="12"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// --- IMPORTANT DATES ICONS ---

export function CalendarOutlineIcon({ size = 22, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="16"
        y1="2"
        x2="16"
        y2="5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Line
        x1="8"
        y1="2"
        x2="8"
        y2="5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Line
        x1="3"
        y1="9"
        x2="21"
        y2="9"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Circle cx="8" cy="13" r="1" fill={color} />
      <Circle cx="12" cy="13" r="1" fill={color} />
      <Circle cx="16" cy="13" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
      <Circle cx="12" cy="17" r="1" fill={color} />
      <Circle cx="16" cy="17" r="1" fill={color} />
    </Svg>
  );
}

export function PaperPlaneOutlineIcon({ size = 22, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrayUploadOutlineIcon({ size = 22, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15V3M12 3L7.5 7.5M12 3L16.5 7.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrophyOutlineIcon({ size = 22, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4.5C3.11929 9 2 7.88071 2 6.5C2 5.11929 3.11929 4 4.5 4H6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 9H19.5C20.8807 9 22 7.88071 22 6.5C22 5.11929 20.8807 4 19.5 4H18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 4H20V10C20 13.3137 17.3137 16 14 16H10C6.68629 16 4 13.3137 4 10V4Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16V20"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 20H16"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// --- REWARDS ICONS ---

export function RewardTrophyIcon({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 8H3.5C2.67 8 2 7.33 2 6.5C2 5.67 2.67 5 3.5 5H6"
        stroke="#D97706"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Path
        d="M18 8H20.5C21.33 8 22 7.33 22 6.5C22 5.67 21.33 5 20.5 5H18"
        stroke="#D97706"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Path
        d="M4.5 4H19.5V9.5C19.5 13.09 16.14 16 12 16C7.86 16 4.5 13.09 4.5 9.5V4Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16V19.5"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M8 20H16"
        stroke="#D97706"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function RewardMedalSilverIcon({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="14" r="6.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.6" />
      <Path
        d="M8 3.5L10.5 8M16 3.5L13.5 8M9.5 3.5H14.5"
        stroke="#475569"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="14" r="3" fill="#CBD5E1" />
    </Svg>
  );
}

export function RewardMedalBronzeIcon({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="14" r="6.5" fill="#FFEDD5" stroke="#EA580C" strokeWidth="1.6" />
      <Path
        d="M8 3.5L10.5 8M16 3.5L13.5 8M9.5 3.5H14.5"
        stroke="#C2410C"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="14" r="3" fill="#FED7AA" />
    </Svg>
  );
}

export function RewardStarOutlineIcon({ size = 18, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// --- HEADER, BADGES & CARD ICONS ---

export function CertificateTrophyIcon({ size = 14, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4C2.89543 9 2 8.10457 2 7C2 5.89543 2.89543 5 4 5H6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M18 9H20C21.1046 9 22 8.10457 22 7C22 5.89543 21.1046 5 20 5H18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M5 5H19V10C19 13.866 15.866 17 12 17C8.13401 17 5 13.866 5 10V5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 17V20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 20H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function UsersOutlineIcon({ size = 14, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M2 20C2 16.134 5.13401 13 9 13C12.866 13 16 16.134 16 20"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M16 3.13C17.75 3.82 19 5.51 19 7.5C19 9.49 17.75 11.18 16 11.87"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M19 14.5C21.36 15.35 23 17.47 23 20"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function HourglassOutlineIcon({ size = 14, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2H18M6 22H18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 2V6.5C7 8.5 9 10.5 12 12C15 10.5 17 8.5 17 6.5V2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 22V17.5C7 15.5 9 13.5 12 12C15 13.5 17 15.5 17 17.5V22"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="17" r="1.5" fill={color} />
    </Svg>
  );
}

export function StopwatchOutlineIcon({ size = 14, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="13"
        r="8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 9V13L15 15"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 2V5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10 2H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function ShieldOutlineIcon({ size = 16, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 5.5V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V5.5L12 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12L11 14L15 10"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MegaphoneOutlineIcon({ size = 18, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H2V15H6L11 19V5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.54 8.46C16.48 9.4 17 10.65 17 12C17 13.35 16.48 14.6 15.54 15.54"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M19.07 4.93C20.94 6.8 22 9.3 22 12C22 14.7 20.94 17.2 19.07 19.07"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function InfoCircleOutlineIcon({ size = 14, color = '#0F766E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Line
        x1="12"
        y1="11"
        x2="12"
        y2="16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="8" r="1" fill={color} />
    </Svg>
  );
}
