import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  audioUrl?: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isRecording: boolean;
  isProcessing: boolean;
  selectedModel: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, content: string) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setIsRecording: (recording: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setSelectedModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  reset: () => void;
}

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful AI assistant.';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2048;

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isRecording: false,
      isProcessing: false,
      selectedModel: 'gpt-4',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      temperature: DEFAULT_TEMPERATURE,
      maxTokens: DEFAULT_MAX_TOKENS,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
            },
          ],
        })),

      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((msg) => (msg.id === id ? { ...msg, content } : msg)),
        })),

      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),

      clearMessages: () => set({ messages: [] }),

      setIsRecording: (recording) => set({ isRecording: recording }),

      setIsProcessing: (processing) => set({ isProcessing: processing }),

      setSelectedModel: (model) => set({ selectedModel: model }),

      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),

      setTemperature: (temp) => set({ temperature: temp }),

      setMaxTokens: (tokens) => set({ maxTokens: tokens }),

      reset: () =>
        set({
          messages: [],
          isRecording: false,
          isProcessing: false,
          selectedModel: 'gpt-4',
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          temperature: DEFAULT_TEMPERATURE,
          maxTokens: DEFAULT_MAX_TOKENS,
        }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        systemPrompt: state.systemPrompt,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
      }),
    }
  )
);
