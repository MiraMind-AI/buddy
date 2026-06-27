import { API_BASE_URL, ApiError } from "@/lib/api/client";

interface TranscriptionResponse {
  text: string;
}

async function readError(response: Response) {
  let message = response.statusText;
  try {
    const body = (await response.json()) as { detail?: string };
    message = body.detail ?? message;
  } catch {
    message = response.statusText;
  }
  throw new ApiError(message, response.status);
}

export async function transcribeVoice(blob: Blob) {
  const form = new FormData();
  const extension = blob.type.includes("mp4") ? "mp4" : "webm";
  form.append("audio", blob, `buddy-voice.${extension}`);

  const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    await readError(response);
  }

  const body = (await response.json()) as TranscriptionResponse;
  return body.text.trim();
}

export async function createVoiceSpeech(text: string) {
  const response = await fetch(`${API_BASE_URL}/voice/speech`, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    await readError(response);
  }

  return response.blob();
}
