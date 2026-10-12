/** Sample module supplied in the ARC engineering assignment (Appendix B). */

export const formats = ['read', 'diagram', 'game', 'sim'] as const;
export type Format = (typeof formats)[number];

export const formatInfo: Record<Format, { label: string; short: string; description: string }> = {
  read: { label: 'Read', short: 'READ', description: 'A short, plain-language explanation you can read in a few minutes.' },
  diagram: { label: 'Picture & diagram', short: 'DIAGRAM', description: 'A labeled technical drawing with short captions for each part.' },
  game: { label: 'Game', short: 'GAME', description: 'Match, order, or sort the ideas until everything clicks.' },
  sim: { label: 'Practice sim', short: 'SIM', description: 'Walk through a realistic scenario and make the call at each step.' },
};

export type Fact = { key: string; text: string };
export type Topic = { id: string; title: string; objective: string; facts: Fact[]; commonMistake: string };

export const coolingModule = {
  id: 'cooling-airflow',
  program: 'Data Center Technician (sample)',
  title: 'Cooling & airflow',
  labTask:
    'Containment walk-down: walk a contained cold aisle, find airflow problems (open doors, missing blanking panels, misplaced perforated tiles, out-of-range inlet temperatures), and correct or report them.',
  skills: [
    'Identifies and corrects airflow and containment problems in a data hall.',
    'Judges whether rack inlet temperatures are within the recommended range.',
  ],
  topics: [
    {
      id: 'topic-aisles',
      title: 'Hot aisles and cold aisles',
      objective: 'Explain how rack orientation separates cool intake air from hot exhaust air.',
      facts: [
        { key: 'f1', text: 'Servers draw cool air in through the front and push hot air out the back.' },
        { key: 'f2', text: 'Rows are arranged so rack fronts face each other across a cold aisle.' },
        { key: 'f3', text: 'Rack backs face each other across a hot aisle, which carries exhaust air back to the cooling units.' },
        { key: 'f4', text: 'A rack installed facing the wrong way blows hot exhaust into the cold aisle.' },
      ],
      commonMistake: 'Thinking a hot hot aisle is a fault. The hot aisle is supposed to be hot; the problem is hot air reaching the cold aisle.',
    },
    {
      id: 'topic-containment',
      title: 'Containment',
      objective: 'Explain how containment keeps hot and cold air apart, and identify what breaks it.',
      facts: [
        { key: 'f1', text: 'Containment encloses an aisle with doors and roof panels so hot and cold air cannot mix.' },
        { key: 'f2', text: 'A containment door left open lets hot exhaust leak into the cold aisle.' },
        { key: 'f3', text: 'Blanking panels cover empty spaces in a rack so exhaust cannot flow back to the front.' },
        { key: 'f4', text: 'Perforated floor tiles belong in the cold aisle, where they deliver cold air to rack fronts.' },
      ],
      commonMistake: 'Opening containment doors to “let heat out” during a temperature problem, which makes rack inlets hotter.',
    },
    {
      id: 'topic-inlet',
      title: 'Inlet temperature limits',
      objective: 'Judge whether a rack inlet temperature reading is within the recommended range.',
      facts: [
        { key: 'f1', text: 'What matters is the temperature of air entering the rack at its front (the inlet), not the air leaving the cooling unit.' },
        { key: 'f2', text: 'ASHRAE’s recommended inlet range for most IT equipment is 18 to 27°C (64.4 to 80.6°F).' },
        { key: 'f3', text: 'After a cooling problem, check inlet temperatures across the whole row, not just one rack.' },
        { key: 'f4', text: 'A cleared alarm does not prove every rack is back in range; confirm with the readings.' },
      ],
      commonMistake: 'Trusting a cleared alarm or the cooling unit’s supply air temperature as proof that the racks are fine.',
    },
  ] satisfies Topic[],
};

export function isFormat(value: unknown): value is Format {
  return typeof value === 'string' && (formats as readonly string[]).includes(value);
}

export function getTopic(id: string) {
  return coolingModule.topics.find(topic => topic.id === id);
}
