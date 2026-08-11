/**
 * Inline SVG replacing the Material Symbols webfont.
 *
 * The Stitch exports load Google's Material Symbols Outlined variable font —
 * hundreds of kilobytes from a third-party origin, blocking, for twelve glyphs.
 * These are the survivors after the cart and login controls were removed,
 * drawn as paths so they cost ~1.5 KB inline, need no request, cannot FOIT,
 * and inherit currentColor. docs/ARCHITECTURE.md §6.3, deviation 8.
 */

export type IconName =
  | 'whatsapp'
  | 'phone'
  | 'add'
  | 'arrow_forward'
  | 'arrow_right'
  | 'restaurant'
  | 'flame'
  | 'celebration'
  | 'architecture'
  | 'filter_3'
  | 'menu'
  | 'close';

const PATHS: Record<IconName, React.ReactNode> = {
  whatsapp: (
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.64 4.19 3.7.59.26 1.04.41 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
  ),
  phone: (
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
  ),
  add: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />,
  arrow_forward: <path d="m14 5-1.41 1.41L17.17 11H4v2h13.17l-4.58 4.59L14 19l7-7-7-7Z" />,
  arrow_right: <path d="M10 17l5-5-5-5v10Z" />,
  restaurant: (
    <path d="M8.1 13.34 3.91 9.16a4 4 0 0 1 0-5.66l5.66 5.66-1.47 4.18ZM14.88 11.53l1.06 1.06 5.66-5.66a4 4 0 0 0-5.66 0l-3.54 3.54 1.06 1.06ZM3 20.41 4.41 22l8.13-8.13 4.24 4.24a2 2 0 0 0 2.83-2.83L3 20.41Z" />
  ),
  flame: (
    <path d="M12 2s1.5 3.5 3.5 5.5S19 12 19 14a7 7 0 1 1-14 0c0-2.5 1.5-4 2.5-5.5C8.5 7 9 5.5 9 5.5S10 8 11 8s1-6 1-6Zm0 17a3.5 3.5 0 0 0 3.5-3.5c0-1.5-1-2.5-1.75-3.5-.75 1-1.25 1.5-1.75 1.5s-.5-1.5-.5-1.5-2 2-2 3.5A3.5 3.5 0 0 0 12 19Z" />
  ),
  celebration: (
    <path d="m2 22 4.5-13L15 17.5 2 22Zm12.5-8.5L9 8l1.5-4.5L20 13l-5.5.5ZM16 2h2v3h-2V2Zm4.24 2.34 1.42 1.42-2.13 2.12-1.41-1.41 2.12-2.13ZM19 10h3v2h-3v-2Z" />
  ),
  architecture: (
    <path d="M12 2 4 20h2.2l1.3-3h9l1.3 3H20L12 2Zm-3.6 13L12 6.8 15.6 15H8.4Z" />
  ),
  filter_3: (
    <path d="M3 5h2v14H3V5Zm4 0h2v14H7V5Zm5 1h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7v-2h7v-3h-4v-2h4V8h-7V6Z" />
  ),
  menu: <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />,
  close: (
    <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.4 1.41 6.29 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.29 6.29 1.41-1.41-6.29-6.3 6.29-6.29-1.4-1.41Z" />
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
  /** Decorative by default; give a label when the icon is the only content. */
  label?: string;
}

export function Icon({ name, className = 'size-5', label }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
