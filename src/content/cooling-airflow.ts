import type { LessonInput, QuestionInput } from '@/lib/content/lessons';

/**
 * Hand-written lessons and questions for the sample module, in the same shapes the AI generator
 * will produce. They teach only the facts in each topic's brief (Appendix B of the assignment).
 * Temperature readings in diagrams and sims are illustrative examples, not real measurements.
 */

export const lessons: LessonInput[] = [
  /* ===================== Topic 1: Hot aisles and cold aisles ===================== */
  {
    id: 'topic-aisles.read',
    topicId: 'topic-aisles',
    format: 'read',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'Why server racks face each other',
      paragraphs: [
        {
          text: 'Servers need a steady supply of cool air. Each one draws cool air in through its front and pushes hot air out through its back. Keeping those two streams apart is the main job of airflow in a data hall.',
          facts: ['f1'],
        },
        {
          text: 'To do that, racks are lined up in rows, and the rows are turned so that the fronts of two rows face each other. The aisle between those fronts is the cold aisle. It is where the servers take in their air.',
          facts: ['f2'],
        },
        {
          text: 'Behind the rows, the backs of the racks face each other across the hot aisle. The hot exhaust collects there and travels back to the cooling units to be cooled again.',
          facts: ['f3'],
        },
        {
          text: 'That is why the way a rack faces matters. A rack installed facing the wrong way points its back at the cold aisle and blows hot exhaust straight into it.',
          facts: ['f4'],
        },
      ],
      keyTerms: [
        { term: 'Cold aisle', definition: 'the aisle between rack fronts, where cool air goes in.', facts: ['f2'] },
        { term: 'Hot aisle', definition: 'the aisle between rack backs, where exhaust goes out.', facts: ['f3'] },
      ],
      commonMistake: {
        text: 'Thinking a hot hot aisle is a fault. The hot aisle is supposed to be hot. The problem is hot air reaching the cold aisle.',
        facts: ['f3', 'f4'],
      },
    },
  },
  {
    id: 'topic-aisles.diagram',
    topicId: 'topic-aisles',
    format: 'diagram',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'Two rows, seen from above',
      width: 640,
      height: 360,
      elements: [
        { id: 'hot-aisle-top', type: 'zone', x: 20, y: 20, w: 500, h: 60, label: 'Hot aisle', tone: 'hot', facts: ['f3'] },
        { id: 'row-a', type: 'rect', x: 20, y: 80, w: 500, h: 50, label: 'Row A · fronts face down', facts: ['f2'] },
        { id: 'cold-aisle', type: 'zone', x: 20, y: 130, w: 500, h: 90, label: 'Cold aisle', tone: 'cool', facts: ['f2'] },
        { id: 'row-b', type: 'rect', x: 20, y: 220, w: 500, h: 50, label: 'Row B · fronts face up', facts: ['f2'] },
        { id: 'hot-aisle-bottom', type: 'zone', x: 20, y: 270, w: 500, h: 70, label: 'Hot aisle', tone: 'hot', facts: ['f3'] },
        { id: 'reversed-rack', type: 'rect', x: 400, y: 220, w: 70, h: 50, label: 'Reversed', tone: 'warning', facts: ['f4'] },
        { id: 'cooling-unit', type: 'rect', x: 550, y: 30, w: 70, h: 310, label: 'Cooling unit', tone: 'cool', facts: ['f3'] },
        { id: 'intake', type: 'arrow', x: 140, y: 200, x2: 140, y2: 134, label: 'Cool air in (front)', tone: 'cool', labelAt: 'start', facts: ['f1'] },
        { id: 'exhaust', type: 'arrow', x: 140, y: 78, x2: 140, y2: 30, label: 'Hot air out (back)', tone: 'hot', labelAt: 'end', facts: ['f1'] },
        { id: 'leak', type: 'arrow', x: 435, y: 218, x2: 435, y2: 160, label: 'Exhaust into cold aisle', tone: 'warning', labelAt: 'end', facts: ['f4'] },
        { id: 'return', type: 'arrow', x: 60, y: 315, x2: 545, y2: 315, label: 'Exhaust returns to cooling', tone: 'hot', facts: ['f3'] },
      ],
      captions: [
        { text: 'Servers draw cool air in at the front and push hot air out of the back.', facts: ['f1'], elements: ['intake', 'exhaust'] },
        { text: 'The fronts of rows A and B face each other across the cold aisle.', facts: ['f2'], elements: ['row-a', 'row-b', 'cold-aisle'] },
        { text: 'Rack backs face the hot aisles, which carry exhaust back to the cooling unit.', facts: ['f3'], elements: ['hot-aisle-top', 'hot-aisle-bottom', 'return', 'cooling-unit'] },
        { text: 'A rack facing the wrong way blows its exhaust into the cold aisle.', facts: ['f4'], elements: ['reversed-rack', 'leak'] },
      ],
    },
  },
  {
    id: 'topic-aisles.game',
    topicId: 'topic-aisles',
    format: 'game',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      kind: 'sort',
      prompt: 'Sort each statement into the aisle it describes.',
      groups: [
        { id: 'cold', label: 'Cold aisle' },
        { id: 'hot', label: 'Hot aisle' },
      ],
      items: [
        { id: 'fronts', text: 'Rack fronts face each other here', facts: ['f2'] },
        { id: 'backs', text: 'Rack backs face each other here', facts: ['f3'] },
        { id: 'intake', text: 'Servers draw their cool air from here', facts: ['f1'] },
        { id: 'exhaust', text: 'Server exhaust is pushed into here', facts: ['f1'] },
        { id: 'return', text: 'Air from here travels back to the cooling units', facts: ['f3'] },
        { id: 'reversed', text: 'A rack facing the wrong way blows hot air into here', facts: ['f4'], scene: { reversed: 1 } },
      ],
      answer: [
        { item: 'fronts', group: 'cold' },
        { item: 'backs', group: 'hot' },
        { item: 'intake', group: 'cold' },
        { item: 'exhaust', group: 'hot' },
        { item: 'return', group: 'hot' },
        { item: 'reversed', group: 'cold' },
      ],
    },
  },
  {
    id: 'topic-aisles.sim',
    topicId: 'topic-aisles',
    format: 'sim',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'Walking the aisles',
      scenario: 'You are walking a data hall with a teammate. Two rows of racks face each other across an aisle, and you are checking that the air is flowing the right way.',
      decisions: [
        {
          id: 'which-side',
          prompt: 'Which side of the racks should face the cold aisle?',
          facts: ['f1', 'f2'],
          choices: [
            { text: 'The fronts, where the servers draw in cool air', correct: true, feedback: 'Right. Servers take in air at the front, so fronts face each other across the cold aisle.' },
            { text: 'The backs, so heat can escape into the open aisle', correct: false, feedback: 'The backs push hot air out. They face the hot aisle, not the cold aisle.' },
          ],
        },
        {
          id: 'reversed',
          prompt: 'In one row, a rack’s back is facing the cold aisle. What is it doing?',
          facts: ['f4'],
          scene: { reversed: 1 },
          choices: [
            { text: 'Blowing hot exhaust into the cold aisle', correct: true, feedback: 'Yes. A rack installed the wrong way pushes its exhaust where the other racks take in air.' },
            { text: 'Nothing unusual; racks can face either way', correct: false, feedback: 'Orientation matters. Facing the wrong way puts hot exhaust into the cold aisle.' },
          ],
        },
        {
          id: 'hot-aisle',
          prompt: 'Your teammate feels the hot aisle and wants to report it as a fault. What do you tell them?',
          facts: ['f3'],
          choices: [
            { text: 'It is supposed to be hot. It carries exhaust back to the cooling units.', correct: true, feedback: 'Correct. A hot hot aisle is normal. The problem would be hot air reaching the cold aisle.' },
            { text: 'Report it. The hot aisle should not be that hot.', correct: false, fromCommonMistake: true, feedback: 'The hot aisle is meant to be hot. The problem would be hot air reaching the cold aisle.' },
          ],
        },
      ],
    },
  },

  /* ===================== Topic 2: Containment ===================== */
  {
    id: 'topic-containment.read',
    topicId: 'topic-containment',
    format: 'read',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'Keeping hot and cold air apart',
      paragraphs: [
        {
          text: 'Facing racks the right way is a good start, but air can still drift around the ends and over the top of the rows. Containment closes in the aisle with doors and roof panels, so hot and cold air cannot mix.',
          facts: ['f1'],
        },
        {
          text: 'Containment only works when it stays closed. A containment door left open lets hot exhaust leak into the cold aisle.',
          facts: ['f2'],
        },
        {
          text: 'Gaps inside a rack matter too. Where a rack has empty spaces, blanking panels cover them, so exhaust cannot flow back through the rack to the front.',
          facts: ['f3'],
        },
        {
          text: 'Cold air also comes up through perforated floor tiles. They belong in the cold aisle, where they deliver cold air to the fronts of the racks.',
          facts: ['f4'],
        },
      ],
      keyTerms: [
        { term: 'Blanking panel', definition: 'a cover for an empty space in a rack, so exhaust cannot flow back to the front.', facts: ['f3'] },
        { term: 'Perforated tile', definition: 'a floor tile with holes that delivers cold air to the rack fronts in the cold aisle.', facts: ['f4'] },
      ],
      commonMistake: {
        text: 'Opening containment doors to “let heat out” during a temperature problem. It lets the air mix, which makes rack inlets hotter.',
        facts: ['f1', 'f2'],
      },
    },
  },
  {
    id: 'topic-containment.diagram',
    topicId: 'topic-containment',
    format: 'diagram',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'A contained cold aisle, seen from above',
      width: 720,
      height: 360,
      elements: [
        { id: 'row-a', type: 'rect', x: 80, y: 60, w: 480, h: 50, label: 'Row A', facts: ['f1'] },
        { id: 'roof', type: 'zone', x: 80, y: 110, w: 480, h: 110, label: 'Roof panels over the cold aisle', tone: 'cool', facts: ['f1'] },
        { id: 'row-b', type: 'rect', x: 80, y: 220, w: 480, h: 50, label: 'Row B', facts: ['f1'] },
        { id: 'door-closed', type: 'rect', x: 66, y: 110, w: 14, h: 110, label: 'Door', facts: ['f1'] },
        { id: 'door-open', type: 'rect', x: 560, y: 110, w: 14, h: 110, label: 'Open door', tone: 'warning', facts: ['f2'] },
        { id: 'leak', type: 'arrow', x: 705, y: 200, x2: 580, y2: 200, label: 'Hot exhaust leaks in', tone: 'hot', facts: ['f2'] },
        { id: 'gap', type: 'rect', x: 160, y: 60, w: 60, h: 50, label: 'Empty gap', tone: 'warning', labelAt: 'below', facts: ['f3'] },
        { id: 'recirculation', type: 'arrow', x: 190, y: 14, x2: 190, y2: 110, label: 'Exhaust flows back to the front', tone: 'hot', labelAt: 'start', facts: ['f3'] },
        { id: 'blank', type: 'rect', x: 420, y: 60, w: 70, h: 50, label: 'Blanking panel', labelAt: 'above', facts: ['f3'] },
        { id: 'tiles', type: 'rect', x: 300, y: 160, w: 200, h: 30, label: 'Perforated tiles', tone: 'cool', facts: ['f4'] },
        { id: 'supply', type: 'arrow', x: 400, y: 160, x2: 400, y2: 114, label: 'Cold air to rack fronts', tone: 'cool', labelAt: 'middle', facts: ['f4'] },
        { id: 'note', type: 'label', x: 80, y: 310, label: 'Doors at both ends and roof panels on top enclose the aisle.', facts: ['f1'] },
      ],
      captions: [
        { text: 'Doors and roof panels enclose the aisle so hot and cold air cannot mix.', facts: ['f1'], elements: ['roof', 'door-closed', 'row-a', 'row-b'] },
        { text: 'An open door lets hot exhaust leak into the cold aisle.', facts: ['f2'], elements: ['door-open', 'leak'] },
        { text: 'Blanking panels cover empty spaces; an uncovered gap lets exhaust flow back to the front.', facts: ['f3'], elements: ['blank', 'gap', 'recirculation'] },
        { text: 'Perforated tiles in the cold aisle deliver cold air to the rack fronts.', facts: ['f4'], elements: ['tiles', 'supply'] },
      ],
    },
  },
  {
    id: 'topic-containment.game',
    topicId: 'topic-containment',
    format: 'game',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      kind: 'sort',
      prompt: 'During a walk-down, sort what you see: does it keep the air apart, or break containment?',
      groups: [
        { id: 'keeps', label: 'Keeps air apart' },
        { id: 'breaks', label: 'Breaks containment' },
      ],
      items: [
        { id: 'enclosed', text: 'Doors and roof panels enclose the aisle', facts: ['f1'] },
        { id: 'open-door', text: 'A containment door is propped open', facts: ['f2'], scene: { doorNear: 'open' } },
        { id: 'blanked', text: 'Empty rack spaces are covered with blanking panels', facts: ['f3'] },
        { id: 'gap', text: 'An empty rack space has nothing covering it', facts: ['f3'], scene: { missingBlank: 2 } },
        { id: 'tile-cold', text: 'Perforated tiles sit in the cold aisle', facts: ['f4'] },
        { id: 'tile-hot', text: 'A perforated tile sits in the hot aisle', facts: ['f4'], scene: { tile: 'hot' } },
      ],
      answer: [
        { item: 'enclosed', group: 'keeps' },
        { item: 'open-door', group: 'breaks' },
        { item: 'blanked', group: 'keeps' },
        { item: 'gap', group: 'breaks' },
        { item: 'tile-cold', group: 'keeps' },
        { item: 'tile-hot', group: 'breaks' },
      ],
    },
  },
  {
    id: 'topic-containment.sim',
    topicId: 'topic-containment',
    format: 'sim',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'Containment walk-down',
      scenario: 'You are doing a containment walk-down of a cold aisle. Rack inlet temperatures have been creeping up this afternoon.',
      decisions: [
        {
          id: 'heat-out',
          prompt: 'A coworker suggests opening the containment doors to let the heat out. What do you do?',
          facts: ['f1', 'f2'],
          choices: [
            { text: 'Keep the doors closed and look for what is breaking containment', correct: true, feedback: 'Right. Opening the doors lets hot and cold air mix, which makes rack inlets hotter.' },
            { text: 'Open the doors to let the heat escape', correct: false, fromCommonMistake: true, feedback: 'Open doors let hot exhaust into the cold aisle. Watch the inlet readings climb.', scene: { doorFar: 'open', doorNear: 'open' } },
          ],
        },
        {
          id: 'propped-door',
          prompt: 'At the near end you find a door propped open. Why does it matter?',
          facts: ['f2'],
          scene: { doorNear: 'open' },
          choices: [
            { text: 'Hot exhaust can leak into the cold aisle', correct: true, feedback: 'Yes. Close it or report it. Closed, the readings come back down.', scene: { doorNear: 'closed' } },
            { text: 'It doesn’t; the roof panels still keep the air apart', correct: false, feedback: 'Containment needs both the doors and the roof panels to keep the air apart.' },
          ],
        },
        {
          id: 'gap',
          prompt: 'Rack A2 has an empty space with nothing covering it. What should be there?',
          facts: ['f3'],
          scene: { missingBlank: 1 },
          choices: [
            { text: 'A blanking panel, so exhaust can’t flow back to the front', correct: true, feedback: 'Correct. Blanking panels close the gap.', scene: { missingBlank: null } },
            { text: 'Nothing; an open space helps the rack breathe', correct: false, feedback: 'An open space lets exhaust flow back to the rack front.' },
          ],
        },
        {
          id: 'tile',
          prompt: 'You spot a perforated floor tile in the hot aisle. Is it in the right place?',
          facts: ['f4'],
          scene: { tile: 'hot' },
          choices: [
            { text: 'No. Perforated tiles belong in the cold aisle, feeding the rack fronts.', correct: true, feedback: 'Right. Correct or report a misplaced tile.', scene: { tile: 'cold' } },
            { text: 'Yes. Cold air in the hot aisle cools the exhaust.', correct: false, feedback: 'Perforated tiles belong in the cold aisle, where they deliver cold air to the rack fronts.' },
          ],
        },
      ],
    },
  },

  /* ===================== Topic 3: Inlet temperature limits ===================== */
  {
    id: 'topic-inlet.read',
    topicId: 'topic-inlet',
    format: 'read',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'Reading the right temperature',
      paragraphs: [
        {
          text: 'To judge whether a rack is cool enough, measure the right air. What matters is the temperature of the air entering the rack at its front, called the inlet. The air leaving the cooling unit is not the reading that counts.',
          facts: ['f1'],
        },
        {
          text: 'ASHRAE, an engineering society for heating and cooling, recommends an inlet range of 18 to 27°C (64.4 to 80.6°F) for most IT equipment. Compare each inlet reading with that range.',
          facts: ['f2'],
        },
        {
          text: 'After a cooling problem, one good reading is not enough. Check inlet temperatures across the whole row, not just one rack.',
          facts: ['f3'],
        },
        {
          text: 'Alarms help, but a cleared alarm does not prove every rack is back in range. Confirm it with the readings before you call the problem fixed.',
          facts: ['f4'],
        },
      ],
      keyTerms: [
        { term: 'Inlet', definition: 'the front of a rack, where air enters.', facts: ['f1'] },
        { term: 'Recommended range', definition: '18 to 27°C (64.4 to 80.6°F) at the inlet for most IT equipment.', facts: ['f2'] },
      ],
      commonMistake: {
        text: 'Trusting a cleared alarm, or the cooling unit’s supply air temperature, as proof that the racks are fine.',
        facts: ['f1', 'f4'],
      },
    },
  },
  {
    id: 'topic-inlet.diagram',
    topicId: 'topic-inlet',
    format: 'diagram',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'Checking a row after a cooling problem',
      width: 700,
      height: 360,
      elements: [
        { id: 'cooling-unit', type: 'rect', x: 20, y: 90, w: 90, h: 180, label: 'Cooling unit', tone: 'cool', facts: ['f1'] },
        { id: 'supply-note', type: 'label', x: 20, y: 300, label: 'Supply air: not the reading that counts', facts: ['f1'] },
        { id: 'rack-1', type: 'rect', x: 140, y: 120, w: 72, h: 150, label: 'Inlet 22°C', tone: 'cool', facts: ['f1', 'f2'] },
        { id: 'rack-2', type: 'rect', x: 218, y: 120, w: 72, h: 150, label: 'Inlet 24°C', tone: 'cool', facts: ['f2'] },
        { id: 'rack-3', type: 'rect', x: 296, y: 120, w: 72, h: 150, label: 'Inlet 29°C', tone: 'warning', facts: ['f2'] },
        { id: 'rack-4', type: 'rect', x: 374, y: 120, w: 72, h: 150, label: 'Inlet 25°C', tone: 'cool', facts: ['f2'] },
        { id: 'rack-5', type: 'rect', x: 452, y: 120, w: 72, h: 150, label: 'Inlet 23°C', tone: 'cool', facts: ['f2'] },
        { id: 'whole-row', type: 'arrow', x: 140, y: 95, x2: 524, y2: 95, label: 'Check the whole row', tone: 'neutral', facts: ['f3'] },
        { id: 'range', type: 'label', x: 300, y: 300, label: 'Recommended inlet range: 18–27°C (64.4–80.6°F)', facts: ['f2'] },
        { id: 'alarm', type: 'rect', x: 545, y: 130, w: 90, h: 60, label: 'Alarm cleared', tone: 'warning', labelAt: 'above', facts: ['f4'] },
        { id: 'confirm', type: 'label', x: 545, y: 215, label: 'Still confirm readings', facts: ['f4'] },
      ],
      captions: [
        { text: 'Read the air entering each rack at its front, not the cooling unit’s supply air.', facts: ['f1'], elements: ['rack-1', 'cooling-unit', 'supply-note'] },
        { text: 'Compare each inlet with 18–27°C. The 29°C rack is out of range (example readings).', facts: ['f2'], elements: ['rack-3', 'range'] },
        { text: 'After a cooling problem, check every rack across the row.', facts: ['f3'], elements: ['whole-row'] },
        { text: 'A cleared alarm is not proof; confirm with the readings.', facts: ['f4'], elements: ['alarm', 'confirm'] },
      ],
    },
  },
  {
    id: 'topic-inlet.game',
    topicId: 'topic-inlet',
    format: 'game',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      kind: 'order',
      prompt: 'A cooling problem has just been fixed. Put the checks in order.',
      items: [
        { id: 'alarm', text: 'The alarm clears, but that alone doesn’t prove the racks are fine', facts: ['f4'] },
        { id: 'inlet', text: 'Read the air entering each rack at its front, not the cooling unit’s supply air', facts: ['f1'] },
        { id: 'row', text: 'Take readings across the whole row, not just one rack', facts: ['f3'] },
        { id: 'compare', text: 'Compare every reading with 18 to 27°C (64.4 to 80.6°F)', facts: ['f2'] },
        { id: 'confirm', text: 'Confirm all racks are in range before closing the issue', facts: ['f4'] },
      ],
      answer: ['alarm', 'inlet', 'row', 'compare', 'confirm'],
    },
  },
  {
    id: 'topic-inlet.sim',
    topicId: 'topic-inlet',
    format: 'sim',
    facts: ['f1', 'f2', 'f3', 'f4'],
    content: {
      title: 'After the alarm clears',
      scenario: 'A cooling unit in your row had a fault earlier. It has been repaired and the temperature alarm has just cleared. Your supervisor asks whether the racks are fine.',
      decisions: [
        {
          id: 'done',
          scene: { missingBlank: 2 },
          prompt: 'The alarm has cleared. Can you report that the racks are fine?',
          facts: ['f4'],
          choices: [
            { text: 'Not yet. Confirm with the readings first.', correct: true, feedback: 'Right. A cleared alarm does not prove every rack is back in range.' },
            { text: 'Yes. The alarm clearing means everything is in range.', correct: false, fromCommonMistake: true, feedback: 'A cleared alarm doesn’t prove every rack is back in range. Check the readings.' },
          ],
        },
        {
          id: 'which-reading',
          scene: { missingBlank: 2 },
          prompt: 'Which temperature do you check?',
          facts: ['f1'],
          choices: [
            { text: 'The air entering each rack at its front (the inlet)', correct: true, feedback: 'Correct. The inlet is what matters.' },
            { text: 'The cooling unit’s supply air temperature', correct: false, fromCommonMistake: true, feedback: 'The supply air is not proof the racks are fine. Read the inlets.' },
          ],
        },
        {
          id: 'where',
          scene: { missingBlank: 2 },
          prompt: 'Which racks do you check?',
          facts: ['f3'],
          choices: [
            { text: 'Every rack across the whole row', correct: true, feedback: 'Yes. After a cooling problem, check the whole row.' },
            { text: 'Only the rack nearest the cooling unit', correct: false, feedback: 'One rack can look fine while others are still out of range.' },
          ],
        },
        {
          id: 'reading',
          scene: { missingBlank: 2 },
          prompt: 'Rack A3’s inlet sensor reads 28.0°C (an example reading). Is it in range?',
          facts: ['f2'],
          choices: [
            { text: 'No. The recommended range is 18 to 27°C.', correct: true, feedback: 'Right. 28.0°C is above the recommended range. Report it.' },
            { text: 'Yes. Anything under 30°C is fine.', correct: false, feedback: 'The recommended inlet range for most IT equipment is 18 to 27°C (64.4 to 80.6°F).' },
          ],
        },
      ],
    },
  },
];

export const questions: QuestionInput[] = [
  /* Topic 1 */
  {
    id: 'topic-aisles.q1', topicId: 'topic-aisles', fact: 'f1',
    prompt: 'Where does a server take in cool air?',
    options: [
      { text: 'Through its front', correct: true, explanation: 'Servers draw cool air in through the front and push hot air out the back.' },
      { text: 'Through its back', correct: false, explanation: 'The back is where hot air goes out.' },
      { text: 'Through its top', correct: false, explanation: 'Air goes in at the front and out at the back.' },
    ],
  },
  {
    id: 'topic-aisles.q2', topicId: 'topic-aisles', fact: 'f2',
    prompt: 'What do the fronts of two rows face across a cold aisle?',
    options: [
      { text: 'Each other', correct: true, explanation: 'Rows are arranged so rack fronts face each other across the cold aisle.' },
      { text: 'The backs of the other row', correct: false, explanation: 'Fronts facing backs would blow exhaust into the intakes.' },
      { text: 'The cooling units', correct: false, explanation: 'Fronts face each other across the cold aisle.' },
    ],
  },
  {
    id: 'topic-aisles.q3', topicId: 'topic-aisles', fact: 'f3',
    prompt: 'The hot aisle feels very hot. What does that mean?',
    options: [
      { text: 'It is working as designed, carrying exhaust back to the cooling units', correct: true, explanation: 'The hot aisle is supposed to be hot.' },
      { text: 'Something is broken and should be reported', correct: false, fromCommonMistake: true, explanation: 'A hot hot aisle is not a fault. The problem is hot air reaching the cold aisle.' },
      { text: 'The racks are facing the wrong way', correct: false, explanation: 'Rack backs face the hot aisle, so it is meant to be hot.' },
    ],
  },
  {
    id: 'topic-aisles.q4', topicId: 'topic-aisles', fact: 'f4',
    prompt: 'What happens when a rack is installed facing the wrong way?',
    options: [
      { text: 'It blows hot exhaust into the cold aisle', correct: true, explanation: 'Its back points at the cold aisle, so exhaust goes there.' },
      { text: 'It cools the hot aisle', correct: false, explanation: 'It puts hot exhaust where cool air should be.' },
      { text: 'Nothing changes', correct: false, explanation: 'Orientation decides where hot exhaust goes.' },
    ],
  },
  /* Topic 2 */
  {
    id: 'topic-containment.q1', topicId: 'topic-containment', fact: 'f1',
    prompt: 'What does containment use to enclose an aisle?',
    options: [
      { text: 'Doors and roof panels', correct: true, explanation: 'They enclose the aisle so hot and cold air cannot mix.' },
      { text: 'Extra cooling units', correct: false, explanation: 'Containment is about enclosing the aisle with doors and roof panels.' },
      { text: 'Perforated tiles', correct: false, explanation: 'Tiles deliver cold air; doors and roof panels enclose the aisle.' },
    ],
  },
  {
    id: 'topic-containment.q2', topicId: 'topic-containment', fact: 'f2',
    prompt: 'Inlet temperatures are rising. Should you open the containment doors to let heat out?',
    options: [
      { text: 'No. An open door lets hot exhaust leak into the cold aisle.', correct: true, explanation: 'Opening doors makes rack inlets hotter.' },
      { text: 'Yes. It lets the heat escape.', correct: false, fromCommonMistake: true, explanation: 'Opening the doors mixes hot and cold air, which makes rack inlets hotter.' },
    ],
  },
  {
    id: 'topic-containment.q3', topicId: 'topic-containment', fact: 'f3',
    prompt: 'What is a blanking panel for?',
    options: [
      { text: 'Covering empty spaces in a rack so exhaust can’t flow back to the front', correct: true, explanation: 'That is exactly its job.' },
      { text: 'Labelling a rack', correct: false, explanation: 'Blanking panels cover empty spaces in a rack.' },
      { text: 'Letting extra air into the rack', correct: false, explanation: 'They block gaps so exhaust can’t flow back to the front.' },
    ],
  },
  {
    id: 'topic-containment.q4', topicId: 'topic-containment', fact: 'f4',
    prompt: 'Where do perforated floor tiles belong?',
    options: [
      { text: 'In the cold aisle', correct: true, explanation: 'They deliver cold air to the rack fronts.' },
      { text: 'In the hot aisle', correct: false, explanation: 'In the hot aisle they would not feed the rack fronts.' },
      { text: 'Anywhere in the room', correct: false, explanation: 'They belong in the cold aisle.' },
    ],
  },
  /* Topic 3 */
  {
    id: 'topic-inlet.q1', topicId: 'topic-inlet', fact: 'f1',
    prompt: 'Which temperature tells you whether a rack is in range?',
    options: [
      { text: 'The air entering the rack at its front', correct: true, explanation: 'The inlet temperature is what matters.' },
      { text: 'The cooling unit’s supply air temperature', correct: false, fromCommonMistake: true, explanation: 'Supply air is not proof the racks are fine.' },
      { text: 'The air in the hot aisle', correct: false, explanation: 'The hot aisle is supposed to be hot; read the inlet.' },
    ],
  },
  {
    id: 'topic-inlet.q2', topicId: 'topic-inlet', fact: 'f2',
    prompt: 'What is ASHRAE’s recommended inlet range for most IT equipment?',
    options: [
      { text: '18 to 27°C (64.4 to 80.6°F)', correct: true, explanation: 'That is the recommended inlet range.' },
      { text: '10 to 20°C (50 to 68°F)', correct: false, explanation: 'The recommended range is 18 to 27°C.' },
      { text: '25 to 35°C (77 to 95°F)', correct: false, explanation: 'The recommended range is 18 to 27°C.' },
    ],
  },
  {
    id: 'topic-inlet.q3', topicId: 'topic-inlet', fact: 'f3',
    prompt: 'After a cooling problem, how many racks should you check?',
    options: [
      { text: 'The whole row', correct: true, explanation: 'Check inlet temperatures across the whole row.' },
      { text: 'Just the rack that alarmed', correct: false, explanation: 'Other racks in the row can still be out of range.' },
    ],
  },
  {
    id: 'topic-inlet.q4', topicId: 'topic-inlet', fact: 'f4',
    prompt: 'The temperature alarm has cleared. What next?',
    options: [
      { text: 'Confirm every rack is in range with the readings', correct: true, explanation: 'A cleared alarm does not prove every rack is back in range.' },
      { text: 'Close the issue; the alarm cleared', correct: false, fromCommonMistake: true, explanation: 'A cleared alarm does not prove every rack is back in range.' },
    ],
  },
];
