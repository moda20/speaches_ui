import { useState, useRef, useCallback, useEffect } from 'react';
import { Mp3Encoder } from 'lamejs';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetRecording: () => void;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const resolveEncodingRef = useRef<(() => void) | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          // Create webm blob from chunks
          const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // Convert to ArrayBuffer
          const arrayBuffer = await webmBlob.arrayBuffer();

          // Decode webm to AudioBuffer using Web Audio API
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Get PCM data from AudioBuffer
          const channels = audioBuffer.numberOfChannels;
          const sampleRate = audioBuffer.sampleRate;
          const mp3encoder = new Mp3Encoder(channels, sampleRate, 128); // 128 kbps bitrate

          // Convert AudioBuffer to interleaved PCM
          const samples = audioBuffer.length;
          const pcmData = new Int16Array(samples * channels);

          for (let i = 0; i < samples; i++) {
            for (let channel = 0; channel < channels; channel++) {
              const sample = audioBuffer.getChannelData(channel)[i];
              // Convert float (-1 to 1) to Int16 (-32768 to 32767)
              pcmData[i * channels + channel] = sample < 0 ? sample * 32768 : sample * 32767;
            }
          }

          // Encode to MP3
          const mp3Data: Uint8Array[] = [];
          const blockSize = 1152; // MP3 frame size

          for (let i = 0; i < samples; i += blockSize) {
            const end = Math.min(i + blockSize, samples);
            const pcmBlock = pcmData.slice(i * channels, end * channels);
            const mp3Buffer = mp3encoder.encodeBuffer(pcmBlock);
            if (mp3Buffer.length > 0) {
              mp3Data.push(mp3Buffer);
            }
          }

          // Flush remaining data
          const mp3Buffer = mp3encoder.flush();
          if (mp3Buffer.length > 0) {
            mp3Data.push(mp3Buffer);
          }

          // Calculate total length and concatenate all MP3 data
          const totalLength = mp3Data.reduce((acc, arr) => acc + arr.length, 0);
          const concatenatedMp3 = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of mp3Data) {
            concatenatedMp3.set(chunk, offset);
            offset += chunk.length;
          }

          // Create MP3 blob from encoded data
          const mp3Blob = new Blob([concatenatedMp3], { type: 'audio/mp3' });
          const url = URL.createObjectURL(mp3Blob);
          setAudioUrl(url);


          console.log('audio url', url)

          // Clean up
          audioContext.close();
          stream.getTracks().forEach((track) => track.stop());

          // Resolve the promise to indicate encoding is complete
          if (resolveEncodingRef.current) {
            resolveEncodingRef.current();
            resolveEncodingRef.current = null;
          }
        } catch (err) {
          console.log('error', err)
          setError(err instanceof Error ? err.message : 'Failed to encode audio to MP3');
          // Resolve even on error so the caller can continue
          if (resolveEncodingRef.current) {
            resolveEncodingRef.current();
            resolveEncodingRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('stopping recording')
      return new Promise<void>((resolve) => {
        resolveEncodingRef.current = resolve;
        mediaRecorderRef.current!.stop();
        setIsRecording(false);
      });
    }
    return Promise.resolve();
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setError(null);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    error,
  };
}
