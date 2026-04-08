export const TASK_OPTIONS = [
  { value: 'automatic-speech-recognition', label: 'ASR (Speech Recognition)' },
  { value: 'text-to-speech', label: 'TTS (Text to Speech)' },
  { value: 'speaker-embedding', label: 'Speaker Embedding' },
  { value: 'voice-activity-detection', label: 'VAD' },
];

export const TASK_COLORS: Record<string, string> = {
  'automatic-speech-recognition': 'bg-blue-500',
  'text-to-speech': 'bg-green-500',
  'speaker-embedding': 'bg-purple-500',
  'voice-activity-detection': 'bg-orange-500',
};

export const TASK_LABELS: Record<string, string> = {
  'automatic-speech-recognition': 'ASR',
  'text-to-speech': 'TTS',
  'speaker-embedding': 'Embedding',
  'voice-activity-detection': 'VAD',
};
