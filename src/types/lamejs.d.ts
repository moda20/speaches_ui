declare module 'lamejs' {
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, kbps: number);
    encodeBuffer(pcmData: Int16Array): Uint8Array;
    flush(): Uint8Array;
  }

  export class Mp3Decoder {
    constructor();
    decode(mp3Data: Uint8Array): Int16Array;
  }
}
