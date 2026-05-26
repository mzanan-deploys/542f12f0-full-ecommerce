import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

export type ImageOptimizeOptions = {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  format?: 'webp';
};

export type VideoOptimizeOptions = {
  targetHeight?: number;
  crf?: number;
  fps?: number;
  preset?: string;
};

export async function optimizeImageFile(file: File, options: ImageOptimizeOptions): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  const arrayBuf = await file.arrayBuffer();
  const input = Buffer.from(arrayBuf);
  const quality = options.quality ?? 80;

  const image = sharp(input, { animated: false });
  const metadata = await image.metadata();

  const width = metadata.width ?? options.maxWidth;
  const height = metadata.height ?? options.maxHeight;

  const result = await image
    .resize({
      width: Math.min(width, options.maxWidth),
      height: Math.min(height, options.maxHeight),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat('webp', { 
      quality, 
      smartSubsample: true 
    })
    .toBuffer();

  return { buffer: result, mimeType: 'image/webp', ext: 'webp' };
}

export async function optimizeVideoFile(file: File, options: VideoOptimizeOptions = {}): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  const [{ default: ffmpegStaticPath }, { default: ffmpegLib }] = await Promise.all([
    import('ffmpeg-static').catch(() => ({ default: null as unknown as string })),
    import('fluent-ffmpeg') as Promise<{ default: typeof import('fluent-ffmpeg') }>,
  ]);
  const ffmpeg = (ffmpegLib as any) as typeof import('fluent-ffmpeg');
  
  /* Path Resolution Fix */
  let resolvedFfmpegPath: string | null = null;
  
  if (process.env.FFMPEG_PATH) {
    resolvedFfmpegPath = process.env.FFMPEG_PATH;
  } else if (ffmpegStaticPath) {
    // Check if the path from ffmpeg-static actually exists
    try {
        await fs.access(ffmpegStaticPath);
        resolvedFfmpegPath = ffmpegStaticPath;
    } catch {
        // Fallback: If bundled path fails (Next.js issue), try node_modules
        const localPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
        try {
            await fs.access(localPath);
            resolvedFfmpegPath = localPath;
        } catch {
            // fallback to global command
            resolvedFfmpegPath = 'ffmpeg';
        }
    }
  } else {
    resolvedFfmpegPath = 'ffmpeg';
  }

  if (resolvedFfmpegPath && (ffmpeg as any)?.setFfmpegPath) {
      (ffmpeg as any).setFfmpegPath(resolvedFfmpegPath);
  }

  const arrayBuf = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuf);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'media-opt-'));
  const inputPath = path.join(tmpDir, `input-${Date.now()}.mov`);
  const outputPath = path.join(tmpDir, `output-${Date.now()}.mp4`);

  await fs.writeFile(inputPath, inputBuffer);

  const targetHeight = options.targetHeight ?? 720;
  const crf = options.crf ?? 26;
  const fps = options.fps ?? 30;
  
  /* IMPORTANTE PARA VERCEL: Usamos 'veryfast' para evitar timeouts */
  const preset = options.preset ?? 'veryfast'; 

  await new Promise<void>((resolve, reject) => {
    (ffmpeg as any)(inputPath)
      .videoCodec('libx264')
      .size(`?x${targetHeight}`)
      .fps(fps)
      .outputOptions([
        `-crf ${crf}`,
        `-preset ${preset}`,
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-profile:v high',
        '-level 4.1'
      ])
      .noAudio()
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .save(outputPath);
  });

  const buffer = await fs.readFile(outputPath);

  Promise.all([
    fs.unlink(inputPath).catch(() => {}),
    fs.unlink(outputPath).catch(() => {}),
    fs.rmdir(tmpDir).catch(() => {})
  ]);

  return { buffer, mimeType: 'video/mp4', ext: 'mp4' };
}