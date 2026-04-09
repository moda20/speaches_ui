// @ts-nocheck
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from 'next-themes';
import { useWorkspaceStore } from '@/stores/workspaceStore';

useWorkspaceStore.getState().initializeFromEnv();

// Lame js workarounds : https://github.com/zhuker/lamejs/issues/86
import MPEGMode from 'lamejs/src/js/MPEGMode';
import Lame from 'lamejs/src/js/Lame';

import BitStream from 'lamejs/src/js/BitStream';


window.MPEGMode = MPEGMode;
window.Lame = Lame;
window.BitStream = BitStream;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>
);
