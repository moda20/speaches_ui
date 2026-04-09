# Speaches UI

A modern web interface for the [Speaches](https://github.com/speaches-ai/speaches) API - an OpenAI-compatible speech AI server. This dashboard provides a comprehensive UI for speech recognition, synthesis, and analysis features.

## Features

### 🎤 Audio Transcription & Translation

- **Speech-to-Text**: Transcribe audio files with support for multiple formats (MP3, WAV, FLAC, M4A)
- **Translation**: Translate audio content between languages
- **Multiple Response Formats**: Text, JSON, verbose JSON, SRT, and VTT
- **Timestamp Support**: Segment-level and word-level timestamps
- **Speaker Diarization**: Identify and track different speakers in audio

### 🔊 Text-to-Speech Synthesis

- **Natural Voice Generation**: Synthesize speech from text using AI models
- **Multiple Output Formats**: MP3, WAV, FLAC, Opus, PCM, AAC
- **Voice Selection**: Choose from available voice profiles
- **Speed & Sample Rate Control**: Customize audio output characteristics
- **Batch Processing**: Synthesize multiple text inputs at once
- **Streaming Support**: Real-time audio streaming with SSE

### 💬 Voice Chat

- **Real-time Audio Chat**: Interactive voice conversations with AI
- **Dual Input Support**: Both audio (microphone) and text input
- **Streaming Responses**: Real-time response streaming
- **Chat History**: Maintain conversation context
- **System Prompts**: Configure AI behavior and personality
- **Temperature Control**: Adjust response randomness

### 📊 Model Management

- **Local Models**: View, manage, and control local AI models
- **Remote Registry**: Browse and download models from the registry
- **Model Types**: Support for multiple model categories:
  - Automatic Speech Recognition (ASR)
  - Text-to-Speech (TTS)
  - Speaker Embedding
  - Voice Activity Detection (VAD)
- **Load/Unload Control**: Manage model memory usage
- **Model Details**: View model specifications and metadata

### 🎯 Voice Activity Detection

- **Silence Detection**: Identify speech and silence segments in audio
- **Adjustable Thresholds**: Fine-tune detection sensitivity
- **Segment Analysis**: View detailed timestamp information
- **Visual Timeline**: Interactive visualization of speech segments
- **Export Options**: Save detection results

### 👥 Speaker Diarization

- **Speaker Identification**: Distinguish between different speakers
- **Speaker Labeling**: Assign names to detected speakers
- **Timeline Visualization**: Visual representation of speaker changes
- **Known Speakers**: Provide reference samples for better accuracy
- **Multiple Formats**: Export in JSON or RTTM format

### 🔍 Speaker Embeddings

- **Voice Fingerprinting**: Generate unique voice embeddings
- **Embedding Visualization**: Visual representation of voice characteristics
- **Comparison Tools**: Compare embeddings for speaker identification
- **Vector Export**: Export embedding data for further analysis

### 🌐 Realtime API

- **WebRTC Support**: Real-time audio streaming via WebRTC
- **Low Latency**: Minimal delay for interactive applications
- **Connection Monitoring**: Track connection status and quality
- **Audio Level Visualization**: Real-time audio level indicators

### ⚙️ System Health

- **Health Monitoring**: System status and API connectivity
- **Version Information**: Track server and model versions
- **Diagnostics**: Troubleshoot and monitor system performance


## Api overview

This UI is a thin client for the [speaches server](https://github.com/speaches-ai/speaches) [api](https://speaches.ai/api/).

## Installation

### Prerequisites

- **Bun**: Latest stable version (recommended)
- **Speaches Server**: Running instance of [Speaches](https://github.com/speaches-ai/speaches)

```bash
# Clone the repository
git clone https://github.com/moda20/speaches_ui.git
cd speaches_ui

# Install dependencies
bun install

# Start development server
bun run dev
```

## Development

### Available Scripts

```bash
# Start development server
bun run dev

# Create production build
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint

# Format code
bun run format

# Type check
bun run type-check

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with UI
bun run test:ui
```

## Deployment

### Docker Deployment (Recommended)

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t speaches-ui .

# Run the container
docker run -d -p 80:80 --name speaches-ui speaches-ui
```

The Dockerfile uses a multi-stage build:

- **Build stage**: Uses `oven/bun:1` to build the React application
- **Production stage**: Uses `nginx:alpine` to serve the static files

**Custom Configuration:**

To customize the API URL at runtime:

```bash
docker run -d -p 80:80 \
  -e VITE_API_URL=https://your-speaches-api.com/api \
  --name speaches-ui \
  speaches-ui
```

### Platform Deployment

The application can be deployed to various platforms:

- **Vercel**: Automatic deployment from Git repository
- **Netlify**: Drag-and-drop or Git deployment
- **Docker**: Containerized deployment (recommended)
- **Static Hosting**: Deploy the `dist/` folder to any static host

**Vercel Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Netlify Deployment:**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## Technical Stack

### Core Framework

- **React 19**: Latest React with concurrent features and automatic batching
- **Vite 8**: Lightning-fast build tool with HMR and optimized bundling
- **TypeScript**: Full type safety across the application
- **Bun**: Ultra-fast package manager and runtime

### Routing & Navigation

- **React Router v7**: Client-side routing with lazy loading
- **Route-based code splitting**: Automatic code splitting for optimal performance

### State Management

- **Zustand**: Lightweight, performant state management
- **TanStack Query v5**: Powerful data fetching, caching, and synchronization
- **React Hook Form**: Efficient form state management
- **Zod**: Runtime type validation and schema validation

### UI Components & Styling

- **shadcn/ui**: Beautiful, accessible component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Consistent icon library
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional class name utilities

### Data Fetching & API

- **Axios**: Promise-based HTTP client with interceptors
- **OpenAPI Types**: Auto-generated TypeScript types from OpenAPI spec
- **Bearer Token Authentication**: Secure API communication

### Audio Processing

- **react-h5-audio-player**: Customizable HTML5 audio player
- **react-dropzone**: Drag-and-drop file upload
- **wavesurfer.js**: Audio waveform visualization
- **@wavesurfer/react**: React wrapper for wavesurfer.js

### Data Visualization

- **Recharts**: Declarative charting library for React
- **Interactive charts**: Line, bar, area, and pie charts

### Form Handling

- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema-first validation
- **@hookform/resolvers**: Seamless Zod integration

### Development Tools

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting with consistent style
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **TypeScript ESLint**: TypeScript-specific linting rules
- **PostCSS**: CSS transformation with autoprefixer
- **Tailwind CSS**: Utility-first CSS framework

### Performance Optimizations

- **Code Splitting**: Route-based code splitting with React.lazy()
- **Lazy Loading**: On-demand component loading
- **Bundle Analysis**: Visualizer for bundle size optimization
- **React.memo**: Component memoization to prevent unnecessary re-renders
- **useMemo & useCallback**: Hook optimizations for expensive computations
- **TanStack Query Caching**: Automatic data caching and background refetching
- **Virtualization**: Support for large lists with @tanstack/react-virtual

## Project Structure

```
speaches_ui/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── features/
│   │   │   ├── audio/             # Audio player & visualizer components
│   │   │   ├── upload/            # File upload components
│   │   │   ├── chat/              # Voice chat components
│   │   │   ├── models/            # Model management components
│   │   │   └── transcription/     # Transcription components
│   │   └── layout/                # Layout components (Sidebar, Header)
│   ├── pages/
│   │   ├── Models.tsx             # Model management
│   │   ├── Transcription.tsx      # Audio transcription
│   │   ├── Synthesis.tsx          # Text-to-speech
│   │   ├── VoiceChat.tsx          # Voice chat
│   │   ├── Embeddings.tsx         # Speaker embeddings
│   │   ├── VAD.tsx                # Voice activity detection
│   │   ├── Diarization.tsx        # Speaker diarization
│   │   ├── Realtime.tsx           # WebRTC realtime
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── Analytics.tsx          # Analytics
│   │   ├── Reports.tsx            # Reports
│   │   └── Settings.tsx           # Settings
│   ├── services/
│   │   ├── models.ts              # Model API calls
│   │   ├── transcription.ts       # Transcription API calls
│   │   ├── synthesis.ts           # Synthesis API calls
│   │   ├── voiceChat.ts           # Voice chat API calls
│   │   ├── embeddings.ts          # Embedding API calls
│   │   ├── vad.ts                 # VAD API calls
│   │   ├── diarization.ts         # Diarization API calls
│   │   ├── realtime.ts            # WebRTC API calls
│   │   └── health.ts              # Health check API calls
│   ├── hooks/
│   │   ├── useAudioRecorder.ts    # Audio recording hook
│   │   ├── useFileUpload.ts       # File upload hook
│   │   └── useAudioPlayer.ts      # Audio player hook
│   ├── stores/
│   │   ├── modelsStore.ts         # Model state
│   │   ├── audioStore.ts          # Audio state
│   │   └── chatStore.ts           # Chat state
│   ├── types/
│   │   ├── api.ts                 # API types (from OpenAPI)
│   │   ├── models.ts              # Model types
│   │   ├── transcription.ts       # Transcription types
│   │   └── synthesis.ts           # Synthesis types
│   ├── lib/
│   │   ├── api.ts                 # Axios instance configuration
│   │   ├── env.ts                 # Environment variables
│   │   ├── utils.ts               # Utility functions
│   │   └── audio-utils.ts         # Audio utilities
│   ├── App.tsx                    # Application root
│   └── main.tsx                   # Entry point
├── public/                        # Static assets
├── Dockerfile                     # Docker configuration
├── nginx.conf                     # Nginx configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite config
├── tailwind.config.ts             # Tailwind config
├── openapi.json                   # OpenAPI specification
└── IMPLEMENTATION_PLAN.md         # Implementation guide
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Speaches API Documentation](https://speaches.ai/api/)
- [Speaches GitHub Repository](https://github.com/speaches-ai/speaches)

## Support

For issues, questions, or contributions, please visit our [GitHub repository](https://github.com/moda20/speaches_ui).
