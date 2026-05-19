import { createWorker } from "tesseract.js";

export function canRunOcr(file) {
  return Boolean(file?.type?.startsWith("image/"));
}

export async function readTicketText(file) {
  if (!canRunOcr(file)) {
    return "";
  }

  const worker = await createWorker("spa");

  try {
    const result = await worker.recognize(file);
    return result?.data?.text || "";
  } finally {
    await worker.terminate();
  }
}
