// ─────────────────────────────────────────────────────────────
// Habit pool — single source of truth for all habit definitions
// Sponsors add entries here (or via the API in future cycles)
// ─────────────────────────────────────────────────────────────

export interface VerifyRequirement {
  type: 'upload';
  label: string;
  hint: string;
}

export interface Habit {
  id: string;
  icon: string;
  name: string;
  tag: string;
  color: string;
  desc: string;
  why: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Custom';
  diffColor: string;
  impact: string;
  tipLabel: string;
  tipVal: string;
  verify: VerifyRequirement | null;
  // Sponsorship fields — null for organic habits
  sponsor?: {
    name: string;
    logoUrl?: string;
    rewardPool?: number;   // gCRC committed for this cycle
    rewardLabel?: string;  // human-readable e.g. "up to 35 gCRC"
  } | null;
  isCustom?: boolean;
}

export const HABITS: Habit[] = [
  {
    id: 'stillness',
    icon: '🧘',
    name: 'Five minutes of stillness',
    tag: 'Mindfulness',
    color: '#a29bfe',
    desc: 'Sit quietly for five minutes each morning with your eyes closed, focusing only on your breathing.',
    why: 'Short mindfulness sessions lower cortisol and sharpen focus — even five minutes shifts your nervous system out of fight-or-flight mode.',
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'High',
    tipLabel: 'Best time',
    tipVal: 'Morning',
    verify: null
  },
  {
    id: 'move',
    icon: '🏃',
    name: 'Move your body for 20 mins',
    tag: 'Fitness',
    color: '#55efc4',
    desc: 'Any continuous movement counts — a brisk walk, a run, a workout, or a bike ride.',
    why: 'Regular aerobic activity releases BDNF, a protein that literally grows new brain cells.',
    difficulty: 'Medium',
    diffColor: '#fdcb6e',
    impact: 'Very high',
    tipLabel: 'Best time',
    tipVal: 'Any time',
    verify: {
      type: 'upload',
      label: 'Screenshot from fitness app',
      hint: 'Show your activity summary from Apple Health, Strava, Google Fit, or similar.'
    }
  },
  {
    id: 'deepread',
    icon: '📖',
    name: 'Read with full attention',
    tag: 'Learning',
    color: '#74b9ff',
    desc: 'Read a physical book or long-form article for at least 20 minutes — phone face-down.',
    why: 'Deep reading builds sustained attention and measurably expands vocabulary and empathy.',
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'High',
    tipLabel: 'Pages',
    tipVal: '15–20',
    verify: null
  },
  {
    id: 'hydrate',
    icon: '💧',
    name: 'Eight glasses of water',
    tag: 'Health',
    color: '#74b9ff',
    desc: 'Drink 8 full glasses (about 2 litres) spread across the day.',
    why: 'Even mild dehydration of 1–2% impairs cognitive performance.',
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'Medium',
    tipLabel: 'Target',
    tipVal: '2 litres',
    verify: null
  },
  {
    id: 'journal',
    icon: '✍️',
    name: 'Write one honest page',
    tag: 'Reflection',
    color: '#ffeaa7',
    desc: 'Fill one page in a notebook without editing yourself — stream of consciousness.',
    why: 'Expressive writing reduces anxiety, clarifies thinking, and improves immune function.',
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'High',
    tipLabel: 'Time',
    tipVal: '10 mins',
    verify: {
      type: 'upload',
      label: 'Photo of your journal page',
      hint: 'A quick photo of your written page. Text does not need to be legible.'
    }
  },
  {
    id: 'nophone',
    icon: '📵',
    name: 'No screen for the first hour',
    tag: 'Digital',
    color: '#fd79a8',
    desc: 'After waking, avoid all screens for the first 60 minutes of your day.',
    why: "Avoiding dopamine spikes from social media preserves your morning cortisol peak, your natural focus window.",
    difficulty: 'Hard',
    diffColor: '#e17055',
    impact: 'Very high',
    tipLabel: 'Duration',
    tipVal: '60 mins',
    verify: null
  },
  {
    id: 'sleep',
    icon: '😴',
    name: 'Lights out by 10:30 pm',
    tag: 'Recovery',
    color: '#6c5ce7',
    desc: 'Be in bed with devices off by 10:30 pm to aim for 7–9 hours of sleep.',
    why: 'Consistent sleep timing synchronises your circadian rhythm, improving memory and hormonal balance.',
    difficulty: 'Medium',
    diffColor: '#fdcb6e',
    impact: 'Very high',
    tipLabel: 'Target',
    tipVal: '7–9 hrs',
    verify: {
      type: 'upload',
      label: 'Sleep tracker screenshot',
      hint: 'A screenshot from Apple Health, Oura, Fitbit, or any sleep tracker showing last night.'
    }
  },
  {
    id: 'grateful',
    icon: '🙏',
    name: 'Name three good things',
    tag: 'Mindfulness',
    color: '#fd79a8',
    desc: 'Before sleeping, write or say aloud three specific things that went well today.',
    why: "Gratitude practice rewires the brain's negativity bias over time.",
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'High',
    tipLabel: 'Time',
    tipVal: 'Evening',
    verify: null
  },
  {
    id: 'walk',
    icon: '🚶',
    name: 'Reach 10,000 steps',
    tag: 'Fitness',
    color: '#00b894',
    desc: 'Hit 10,000 steps across the day — break it into chunks if needed.',
    why: 'Regular step targets are strongly associated with lower risk of cardiovascular disease.',
    difficulty: 'Medium',
    diffColor: '#fdcb6e',
    impact: 'High',
    tipLabel: 'Steps',
    tipVal: '10,000',
    verify: {
      type: 'upload',
      label: 'Step count screenshot',
      hint: 'Show your step count from Apple Health, Google Fit, Garmin, or your phone pedometer reaching 10,000.'
    }
  },
  {
    id: 'cold',
    icon: '🚿',
    name: 'End shower with cold water',
    tag: 'Health',
    color: '#00cec9',
    desc: 'Finish your daily shower with at least 60 seconds of cold water.',
    why: 'Cold exposure activates norepinephrine, linked to mood, alertness and focus.',
    difficulty: 'Hard',
    diffColor: '#e17055',
    impact: 'High',
    tipLabel: 'Duration',
    tipVal: '60 secs',
    verify: null
  },
  {
    id: 'nosugar',
    icon: '🚫',
    name: 'Skip added sugar today',
    tag: 'Nutrition',
    color: '#e17055',
    desc: 'Avoid anything with added sugar — sweets, sodas, pastries. Fruit is fine.',
    why: 'Going sugar-free for 21 days resets taste preferences and significantly improves insulin sensitivity.',
    difficulty: 'Hard',
    diffColor: '#e17055',
    impact: 'Very high',
    tipLabel: 'Hardest',
    tipVal: 'Days 1–3',
    verify: null
  },
  {
    id: 'stretch',
    icon: '🤸',
    name: 'Ten minutes of stretching',
    tag: 'Fitness',
    color: '#a29bfe',
    desc: 'Follow a simple stretch routine — hips, hamstrings, back, shoulders.',
    why: 'Flexibility work reduces injury risk and releases postural tension from sitting.',
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'Medium',
    tipLabel: 'Focus',
    tipVal: 'Hips, back',
    verify: null
  },
  {
    id: 'cook',
    icon: '🥗',
    name: 'Cook at least one meal',
    tag: 'Nutrition',
    color: '#00b894',
    desc: 'Prepare at least one full meal from scratch — even a simple one.',
    why: 'People who cook at home regularly consume fewer calories and more nutrients.',
    difficulty: 'Medium',
    diffColor: '#fdcb6e',
    impact: 'High',
    tipLabel: 'Time needed',
    tipVal: '20–40 mins',
    verify: {
      type: 'upload',
      label: 'Photo of your meal',
      hint: 'A quick photo of the meal you cooked counts as verification.'
    }
  },
  {
    id: 'connect',
    icon: '🤝',
    name: 'Reach out to one person',
    tag: 'Social',
    color: '#fdcb6e',
    desc: 'Send a meaningful message, make a call, or meet someone — a genuine check-in.',
    why: 'Social connection is the single strongest predictor of long-term happiness.',
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'Very high',
    tipLabel: 'Medium',
    tipVal: 'Any channel',
    verify: null
  },
  {
    id: 'breathe',
    icon: '🌬️',
    name: 'Box breathing for 5 mins',
    tag: 'Mindfulness',
    color: '#74b9ff',
    desc: 'Inhale 4 counts, hold 4, exhale 4, hold 4 — repeat for 5 minutes.',
    why: 'Box breathing activates the vagus nerve and lowers heart rate within minutes.',
    difficulty: 'Easy',
    diffColor: '#55efc4',
    impact: 'High',
    tipLabel: 'Pattern',
    tipVal: '4-4-4-4',
    verify: null
  },
  {
    id: 'create',
    icon: '🎨',
    name: 'Make something from scratch',
    tag: 'Creativity',
    color: '#fd79a8',
    desc: 'Spend 20 minutes making something: a sketch, writing, a melody — anything original.',
    why: 'Creative output activates the default mode network and builds cognitive flexibility.',
    difficulty: 'Medium',
    diffColor: '#fdcb6e',
    impact: 'High',
    tipLabel: 'Time',
    tipVal: '20+ mins',
    verify: {
      type: 'upload',
      label: 'Photo of your creation',
      hint: 'A photo or screenshot of what you made today — drawing, writing, music app, anything.'
    }
  }
];

// Custom tag options and their colors — used by the custom habit creator
export const CUSTOM_TAGS = [
  'Mindfulness', 'Fitness', 'Health', 'Learning', 'Nutrition',
  'Creativity', 'Social', 'Digital', 'Recovery', 'Reflection', 'Personal'
] as const;

export const TAG_COLORS: Record<string, string> = {
  Mindfulness: '#a29bfe',
  Fitness: '#55efc4',
  Health: '#74b9ff',
  Learning: '#74b9ff',
  Nutrition: '#00b894',
  Creativity: '#fd79a8',
  Social: '#fdcb6e',
  Digital: '#fd79a8',
  Recovery: '#6c5ce7',
  Reflection: '#ffeaa7',
  Personal: '#a29bfe'
};

export const EMOJI_LIST = [
  '🌟','💪','🎯','🧠','🌱','🔥','⚡','🎵','🌍','🏆',
  '❤️','🦋','🌸','🍎','🧘','🏃','📖','💧','✍️','🙏',
  '🚶','🚿','🥗','🤝','🎨','🌬️','🧹','🌙','☀️','🎭',
  '🔑','🌈','🦁','🐝','🍃','💎','🧩','🌺','🎸','📝',
  '🏋️','🚴','🧗','🎪','🌻','🍵','🤸','🎯','🔮','🌊',
  '🎬','🎤','💫','🌙'
];
