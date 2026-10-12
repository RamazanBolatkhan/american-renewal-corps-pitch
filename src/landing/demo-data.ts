export type Screen = 'home' | 'trades' | 'learn' | 'practice' | 'progress';
export type Trade = 'electrical' | 'systems' | 'industrial';
export const screens: { id: Screen; label: string; short: string; icon: string }[] = [
  { id: 'home', label: 'The idea', short: 'Home', icon: 'home' },
  { id: 'trades', label: 'Find your trade', short: 'Trades', icon: 'compass' },
  { id: 'learn', label: 'Learn by doing', short: 'Learn', icon: 'book' },
  { id: 'practice', label: 'Make it stick', short: 'Practice', icon: 'bolt' },
  { id: 'progress', label: 'See your progress', short: 'Progress', icon: 'chart' },
];
export const stories: Record<Screen, { eyebrow: string; title: string[]; accent: number; description: string; feature: string; detail: string; note: string }> = {
  home: { eyebrow: 'A NEW CHAPTER. IN YOUR POCKET.', title: ['SMALL LESSONS.', 'REAL SKILLS.', 'BIG FUTURES.'], accent: 1, description: 'A new way into the skilled trades. Build your knowledge a little every day—and take the next step toward work that matters.', feature: 'A little learning. A lot of possibility.', detail: 'An app concept that brings daily learning to electrical work, building systems, and modern industry.', note: 'TRY THE APP. YOUR NEXT CHAPTER STARTS ON THE RIGHT.' },
  trades: { eyebrow: '01 / FIND YOUR DIRECTION', title: ['YOUR DRIVE.', 'YOUR TRADE.', 'YOUR NEXT MOVE.'], accent: 1, description: 'Behind the data centers, factories, and infrastructure of tomorrow are people with practical skills. Find the path that sparks something in you.', feature: 'Different strengths. Different starting points.', detail: 'Choose a trade in the phone. The sample lesson and practice questions will adapt to your choice.', note: 'PICK A PATH. THERE’S MORE THAN ONE WAY FORWARD.' },
  learn: { eyebrow: '02 / ONE IDEA AT A TIME', title: ['LESS OVERLOAD.', 'MORE LIGHTBULB', 'MOMENTS.'], accent: 2, description: 'Clear ideas. Visual explanations. A few focused minutes. Make the unfamiliar feel a little more familiar, one lesson at a time.', feature: 'Knowledge first. Hands-on training next.', detail: 'Digital lessons support the journey. Supervised practical training and trade requirements remain essential.', note: 'TAP THROUGH A REAL, THREE-CARD SAMPLE LESSON.' },
  practice: { eyebrow: '03 / KNOW IT. TRY IT. REMEMBER IT.', title: ['GIVE IT A GO.', 'GET FEEDBACK.', 'GO AGAIN.'], accent: 1, description: 'You don’t learn a trade by watching from the sidelines. Start by testing your understanding—with space to get it wrong and try again.', feature: 'Small challenges. Useful feedback.', detail: 'Answer three questions in the phone. Each answer comes with an explanation, and you can retry at your own pace.', note: 'NO PRESSURE. JUST YOUR NEXT LIGHTBULB MOMENT.' },
  progress: { eyebrow: '04 / EVERY STEP ADDS UP', title: ['SEE THE WORK.', 'FEEL THE', 'PROGRESS.'], accent: 2, description: 'A new career starts with showing up. See what you’ve learned, celebrate the small wins, and make your next step a little clearer.', feature: 'Momentum you can actually see.', detail: 'Your sample lesson and practice activity update this demo’s progress. These are learning milestones, not qualifications.', note: 'THIS IS YOUR PROGRESS IN THIS DEMO SESSION.' },
};
export const trades: Record<Trade, { name: string; subtitle: string; icon: string; lesson: string; cards: { title: string; body: string; visual: string; caption: string }[]; questions: { title: string; choices: string[]; correct: number; explanation: string }[] }> = {
  electrical: { name: 'Electrical', subtitle: 'Power what’s next.', icon: 'bolt', lesson: 'Meet the circuit', cards: [
    { title: 'A path for electricity.', body: 'A simple circuit connects a power source, a conductive path, and a load. The load uses electrical energy to do something useful.', visual: 'circuit', caption: 'SOURCE → PATH → LOAD' },
    { title: 'Some materials let it flow.', body: 'Conductors, such as copper, allow electric current to flow readily. Insulators, such as many plastics, resist that flow.', visual: 'wire', caption: 'COPPER CONDUCTOR / INSULATING COVER' },
    { title: 'Small ideas. Bigger systems.', body: 'A light bulb is one example of a load. Understanding these basic concepts is a starting point for studying more complex electrical systems.', visual: 'bulb', caption: 'A LOAD USES ELECTRICAL ENERGY' },
  ], questions: [
    { title: 'Which material is a common electrical conductor?', choices: ['Copper', 'Rubber', 'Glass'], correct: 0, explanation: 'Copper conducts electric current readily, which is why it is commonly used in electrical wiring.' },
    { title: 'What does a load do in a circuit?', choices: ['Stores the instruction manual', 'Uses electrical energy', 'Measures the length of a wire'], correct: 1, explanation: 'A load uses electrical energy. A light bulb, for example, converts it into light and heat.' },
    { title: 'What is the role of an insulator?', choices: ['Generate electricity', 'Increase wire length', 'Resist the flow of current'], correct: 2, explanation: 'An insulator resists current flow. This is a material property, not a guarantee that equipment is safe to touch.' },
  ] },
  systems: { name: 'Building systems', subtitle: 'Keep places working.', icon: 'fan', lesson: 'Meet building controls', cards: [
    { title: 'Buildings have systems, too.', body: 'Heating, ventilation, and air conditioning—HVAC—help manage indoor conditions. Controls help equipment respond to changing needs.', visual: 'fan', caption: 'HEATING / VENTILATION / AIR CONDITIONING' },
    { title: 'First, measure what’s happening.', body: 'A sensor measures a condition. A temperature sensor, for example, reports temperature so a controller can compare it with a target.', visual: 'sensor', caption: 'SENSOR → MEASUREMENT → CONTROLLER' },
    { title: 'Then, compare with a target.', body: 'A setpoint is the target value a control system aims for. Comparing a measurement with its setpoint helps the system determine a response.', visual: 'controls', caption: 'MEASURE. COMPARE. RESPOND.' },
  ], questions: [
    { title: 'What does the V in HVAC stand for?', choices: ['Voltage', 'Ventilation', 'Velocity'], correct: 1, explanation: 'HVAC stands for heating, ventilation, and air conditioning.' },
    { title: 'What does a temperature sensor do?', choices: ['Measures temperature', 'Creates a building plan', 'Stores tools'], correct: 0, explanation: 'A temperature sensor measures a condition and provides information to the control system.' },
    { title: 'What is a setpoint?', choices: ['A maintenance toolbox', 'A room number', 'A target value'], correct: 2, explanation: 'A setpoint is the target value that a control system compares with a measured value.' },
  ] },
  industrial: { name: 'Industrial', subtitle: 'Make industry move.', icon: 'gear', lesson: 'Meet the maintenance mindset', cards: [
    { title: 'Reliability is built daily.', body: 'Industrial maintenance helps equipment stay reliable. It combines observation, planned work, documentation, and specialist knowledge.', visual: 'gear', caption: 'OBSERVE / PLAN / DOCUMENT' },
    { title: 'Plan before a breakdown.', body: 'Preventive maintenance is planned work intended to reduce the likelihood of failure. A schedule helps a team organize this work.', visual: 'calendar', caption: 'CONSISTENT ATTENTION BUILDS RELIABILITY' },
    { title: 'Good records connect the dots.', body: 'Maintenance records describe observations and completed work. They help teams identify recurring patterns and share useful information.', visual: 'clipboard', caption: 'CLEAR RECORDS. BETTER CONTEXT.' },
  ], questions: [
    { title: 'What is a goal of preventive maintenance?', choices: ['Wait until everything fails', 'Reduce the likelihood of failure', 'Remove every record'], correct: 1, explanation: 'Preventive maintenance uses planned work to reduce the likelihood of equipment failure.' },
    { title: 'Why keep maintenance records?', choices: ['To identify patterns and share context', 'To replace all training', 'To avoid planning'], correct: 0, explanation: 'Records help teams understand equipment history and spot recurring issues.' },
    { title: 'Which activity is planned in advance?', choices: ['An unexpected breakdown', 'An unrecorded fault', 'A scheduled maintenance check'], correct: 2, explanation: 'A scheduled maintenance check is planned before it is carried out.' },
  ] },
};
