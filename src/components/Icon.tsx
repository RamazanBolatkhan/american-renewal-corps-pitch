const paths = {
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  check: 'm5 12 4 4L19 6',
  lock: 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4m-4 5v3',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 15v5h16v-5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c1-4 4-6 8-6s7 2 8 6',
  grid: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  layers: 'm12 3 9 5-9 5-9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5',
  google: 'M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3C20 17.6 21 15.1 21 12.2zM12 21c2.6 0 4.7-.9 6.2-2.3l-3-2.4c-.8.6-1.9.9-3.2.9-2.5 0-4.6-1.7-5.3-3.9H3.6v2.4A9 9 0 0 0 12 21zM6.7 13.3a5.4 5.4 0 0 1 0-3.5V7.4H3.6a9 9 0 0 0 0 8.2zM12 6.6c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9 9 0 0 0 3.6 7.4l3.1 2.4C7.4 8.3 9.5 6.6 12 6.6z',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
