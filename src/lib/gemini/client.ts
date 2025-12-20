import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { AVAILABLE_MODELS } from './models';

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn('GOOGLE_AI_API_KEY not set - Gemini features will not work');
}

// Initialize the Google Generative AI client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Initialize the File Manager for uploading large files (video/audio)
const fileManager = apiKey ? new GoogleAIFileManager(apiKey) : null;

// Default model for processing (not user-configurable)
const DEFAULT_PROCESSING_MODEL = 'gemini-2.0-flash';

// Re-export models for convenience
export { AVAILABLE_MODELS } from './models';
export type { GeminiModelId } from './models';

// Gemini 2.0 Flash model for text generation, vision, video, and audio
export const geminiFlash: GenerativeModel | null = genAI
  ? genAI.getGenerativeModel({
      model: DEFAULT_PROCESSING_MODEL,
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    })
  : null;

/**
 * Get a Gemini model by ID for chat responses
 */
export function getModel(modelId: string): GenerativeModel | null {
  if (!genAI) return null;

  // Validate model ID or use default
  const validModelId = modelId in AVAILABLE_MODELS ? modelId : 'gemini-2.5-flash';

  return genAI.getGenerativeModel({
    model: validModelId,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
}

/**
 * Generate content with a specific model
 */
export async function generateContentWithModel(
  prompt: string,
  modelId: string = 'gemini-2.5-flash'
): Promise<string> {
  const model = getModel(modelId);
  if (!model) {
    throw new Error('Gemini model not initialized');
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Gemini embedding model for vector embeddings (768 dimensions)
export const geminiEmbedding: GenerativeModel | null = genAI
  ? genAI.getGenerativeModel({
      model: 'text-embedding-004',
    })
  : null;

// Helper function to generate embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!geminiEmbedding) {
    throw new Error('Gemini embedding model not initialized');
  }

  const result = await geminiEmbedding.embedContent(text);
  return result.embedding.values;
}

// Helper function to generate embeddings in batch
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!geminiEmbedding) {
    throw new Error('Gemini embedding model not initialized');
  }

  const embeddings: number[][] = [];

  // Process in batches of 100 to avoid rate limits
  const batchSize = 100;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (text) => {
        const result = await geminiEmbedding.embedContent(text);
        return result.embedding.values;
      })
    );
    embeddings.push(...results);
  }

  return embeddings;
}

// Helper function to generate text content
export async function generateContent(prompt: string): Promise<string> {
  if (!geminiFlash) {
    throw new Error('Gemini Flash model not initialized');
  }

  const result = await geminiFlash.generateContent(prompt);
  const response = result.response;
  return response.text();
}

// Helper function for multimodal content (images, video, audio)
export async function generateContentWithMedia(
  prompt: string,
  mediaData: { mimeType: string; data: string }[]
): Promise<string> {
  if (!geminiFlash) {
    throw new Error('Gemini Flash model not initialized');
  }

  const parts = [
    ...mediaData.map((media) => ({
      inlineData: {
        mimeType: media.mimeType,
        data: media.data,
      },
    })),
    { text: prompt },
  ];

  const result = await geminiFlash.generateContent(parts);
  const response = result.response;
  return response.text();
}

/**
 * Upload a file to Gemini's File API for processing
 * Used for large video/audio files that can't be sent inline
 */
export async function uploadFileToGemini(
  buffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<{ uri: string; name: string }> {
  if (!fileManager) {
    throw new Error('Gemini File Manager not initialized');
  }

  // Write buffer to temp file (required by the SDK)
  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');

  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `gemini-upload-${Date.now()}-${displayName}`);

  try {
    fs.writeFileSync(tempPath, buffer);
    console.log(`[Gemini] Uploading file: ${displayName}, size: ${buffer.length} bytes, mimeType: ${mimeType}`);

    const uploadResult = await fileManager.uploadFile(tempPath, {
      mimeType,
      displayName,
    });

    // Wait for file to be processed
    let file = uploadResult.file;
    console.log(`[Gemini] File uploaded, name: ${file.name}, state: ${file.state}`);

    while (file.state === FileState.PROCESSING) {
      console.log(`[Gemini] File still processing, waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const getFileResult = await fileManager.getFile(file.name);
      file = getFileResult;
    }

    if (file.state === FileState.FAILED) {
      console.error(`[Gemini] File processing failed for: ${displayName}`);
      throw new Error('File processing failed');
    }

    console.log(`[Gemini] File ready, uri: ${file.uri}, state: ${file.state}`);
    return { uri: file.uri, name: file.name };
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Delete a file from Gemini's File API
 */
export async function deleteGeminiFile(fileName: string): Promise<void> {
  if (!fileManager) {
    throw new Error('Gemini File Manager not initialized');
  }

  await fileManager.deleteFile(fileName);
}

/**
 * Generate content with a file uploaded to Gemini
 */
export async function generateContentWithFile(
  prompt: string,
  fileUri: string,
  mimeType: string
): Promise<string> {
  if (!geminiFlash) {
    throw new Error('Gemini Flash model not initialized');
  }

  // Put text prompt first, then file data
  const result = await geminiFlash.generateContent([
    { text: prompt },
    {
      fileData: {
        mimeType,
        fileUri,
      },
    },
  ]);

  return result.response.text();
}

export { genAI, fileManager, FileState };
