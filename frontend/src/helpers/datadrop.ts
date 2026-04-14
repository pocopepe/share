import { codeShareApi } from "@/helpers/api";

type DataDropResult = {
  ok: boolean;
  message: string;
  retrieveUrl?: string;
  expiresAt?: string;
  retentionDays?: number;
};

async function datadrop(
  filename: string,
  content: string,
  contentType: string,
): Promise<DataDropResult> {
  try {
    const result = await codeShareApi.upload(filename, content, contentType);
    return {
      ok: true,
      message: "success",
      retrieveUrl: result.retrieveUrl,
      expiresAt: result.expiresAt,
      retentionDays: result.retentionDays,
    };
  } catch (error) {
    console.error("Error saving data:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "error",
    };
  }
}

export default datadrop;