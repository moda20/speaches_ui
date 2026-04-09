import api from '@/lib/api';
import type { components } from '@/types/api';

type ChatCompletion = components['schemas']['ChatCompletion'];
type ChatCompletionMessageParam =
  | components['schemas']['ChatCompletionUserMessageParam']
  | components['schemas']['ChatCompletionAssistantMessageParam']
  | components['schemas']['ChatCompletionSystemMessageParam'];

type MessageContent =
  | string
  | Array<{
      type: string;
      input_audio?: {
        data: string;
        format: string;
      };
      text?: string;
    }>;

export interface ChatCompletionOptions {
  model: string;
  messages: Array<{
    role: string;
    content: MessageContent;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  audio?: {
    voice: string;
    format?: string;
  };
  transcription_model?: string;
  speech_model?: string;
}

export interface VoiceChatService {
  handleCompletions: (
    options: ChatCompletionOptions,
    onStream?: (chunk: string) => void
  ) => Promise<ChatCompletion>;
}

export const voiceChatService: VoiceChatService = {
  async handleCompletions(options, onStream) {
    if (options.stream && onStream) {
      const response = await api.post(
        '/v1/chat/completions',
        {
          model: options.model,
          messages: options.messages,
          temperature: options.temperature || 0.7,
          ...(options.max_tokens && { max_tokens: options.max_tokens }),
          stream: true,
          ...(options.audio && { audio: options.audio }),
          ...(options.transcription_model && { transcription_model: options.transcription_model }),
          ...(options.speech_model && { speech_model: options.speech_model }),
        },
        {
          responseType: 'stream',
        }
      );

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                onStream(content);
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }

      return {
        id: 'stream-' + Date.now(),
        choices: [
          {
            message: {
              role: 'assistant',
              content: fullText,
            },
            index: 0,
            finish_reason: 'stop',
          },
        ],
        created: Date.now(),
        model: options.model,
        object: 'chat.completion',
      } as ChatCompletion;
    }

    const response = await api.post<ChatCompletion>('/v1/chat/completions', {
      model: options.model,
      messages: options.messages,
      temperature: options.temperature || 0.7,
      ...(options.max_tokens && { max_tokens: options.max_tokens }),
      stream: false,
      ...(options.audio && { audio: options.audio }),
      ...(options.transcription_model && { transcription_model: options.transcription_model }),
      ...(options.speech_model && { speech_model: options.speech_model }),
    });

    return response.data;
  },
};
