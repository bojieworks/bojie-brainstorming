const PERSON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0z" />
  </svg>
);

type Props = { count: number; max?: number; size?: "" | "lg" | "xl"; faded?: boolean; animate?: boolean; newest?: boolean };

export function People({ count, max = 8, size = "", faded, animate, newest }: Props) {
  if (count <= 0) {
    return <span className={`tally empty ${size}`} aria-label="還沒有人">{PERSON}</span>;
  }
  const shown = Math.min(count, max);
  const cls = ["tally", size, animate ? "animate" : "", faded ? "faded" : ""].join(" ");
  return (
    <span className={cls} role="img" aria-label={`${count} 人想一起`}>
      {Array.from({ length: shown }, (_, i) => (
        <i key={i} style={{ ["--i" as string]: i }} className={newest && i === shown - 1 ? "new" : undefined}>{PERSON}</i>
      ))}
      {count > max && <b>+{count - max}</b>}
    </span>
  );
}
