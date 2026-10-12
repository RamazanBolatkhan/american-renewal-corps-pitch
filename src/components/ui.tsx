import { Icon } from './Icon';

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="ui-eyebrow"><span className="ui-square" aria-hidden="true" />{children}</p>;
}

export function SkeletonNote({ children }: { children: React.ReactNode }) {
  return <p className="ui-skeleton-note"><Icon name="lock" />{children}</p>;
}
