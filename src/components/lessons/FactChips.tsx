export function FactChips({ facts }: { facts: string[] }) {
  return (
    <span className="lesson-chips" aria-label={`Teaches ${facts.join(', ')}`}>
      {facts.map(f => <span key={f} className="lesson-chip">{f.toUpperCase()}</span>)}
    </span>
  );
}
