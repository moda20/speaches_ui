import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Settings,
  Package,
  Mic,
  FileAudio,
  MessageSquare,
  Activity,
  Fingerprint,
  Users,
  Radio,
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export const navigation: NavigationGroup[] = [
  {
    title: 'Audio Features',
    items: [
      {
        title: 'Models',
        url: '/models',
        icon: Package,
      },
      {
        title: 'Transcription',
        url: '/transcription',
        icon: FileAudio,
      },
      {
        title: 'Speech Synthesis',
        url: '/synthesis',
        icon: Mic,
      },
      {
        title: 'Voice Chat',
        url: '/voice-chat',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Advanced',
    items: [
      {
        title: 'Voice Activity Detection',
        url: '/vad',
        icon: Activity,
      },
      {
        title: 'Speaker Embeddings',
        url: '/embeddings',
        icon: Fingerprint,
      },
      {
        title: 'Speaker Diarization',
        url: '/diarization',
        icon: Users,
      },
      {
        title: 'Realtime WebRTC',
        url: '/realtime',
        icon: Radio,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics',
        url: '/analytics',
        icon: BarChart3,
      },
      {
        title: 'Reports',
        url: '/reports',
        icon: FileText,
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
      },
    ],
  },
];

/**
 * Find the navigation item and its group for a given path
 */
export function findNavigationItem(pathname: string): {
  item: NavigationItem;
  group: NavigationGroup;
} | null {
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.url === pathname) {
        return { item, group };
      }
    }
  }
  return null;
}
