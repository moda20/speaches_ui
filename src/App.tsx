import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';

const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const Models = lazy(() => import('@/pages/Models'));
const Transcription = lazy(() => import('@/pages/Transcription'));
const Synthesis = lazy(() => import('@/pages/Synthesis'));
const VoiceChat = lazy(() => import('@/pages/VoiceChat'));
const VAD = lazy(() => import('@/pages/VAD'));
const Embeddings = lazy(() => import('@/pages/Embeddings'));
const Diarization = lazy(() => import('@/pages/Diarization'));
const Realtime = lazy(() => import('@/pages/Realtime'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense
        fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}
      >
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'models', element: <Models /> },
      { path: 'transcription', element: <Transcription /> },
      { path: 'synthesis', element: <Synthesis /> },
      { path: 'voice-chat', element: <VoiceChat /> },
      { path: 'vad', element: <VAD /> },
      { path: 'embeddings', element: <Embeddings /> },
      { path: 'diarization', element: <Diarization /> },
      { path: 'realtime', element: <Realtime /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
