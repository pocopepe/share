const resolveApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8787";
    }
  }

  return "https://share-backend.avijusanjai.workers.dev";
};

const API_BASE_URL = resolveApiBaseUrl();

const AUTH_STORAGE_KEY = "share_auth_token";

type ApiFetchInit = RequestInit & {
  includeAuth?: boolean;
};

const getStoredAuthToken = (): string | null => localStorage.getItem(AUTH_STORAGE_KEY);

const apiFetch = async (path: string, init?: ApiFetchInit): Promise<Response> => {
  const headers = new Headers(init?.headers || {});

  if (init?.includeAuth !== false) {
    const token = getStoredAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
};

export const auth = {
  getToken: getStoredAuthToken,
  clearToken: (): void => localStorage.removeItem(AUTH_STORAGE_KEY),
  login: async (password: string): Promise<{ tokenExpiresAt: string }> => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      includeAuth: false,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Login failed");
    }

    const data = (await response.json()) as { token: string; tokenExpiresAt: string };
    localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    return { tokenExpiresAt: data.tokenExpiresAt };
  },
};

export const codeShareApi = {
  upload: async (
    filename: string,
    content: string,
    contentType: string,
  ): Promise<{ key: string; expiresAt: string; retentionDays: number; retrieveUrl: string }> => {
    const response = await apiFetch(`/upload/codeshare/${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: content,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to upload code");
    }

    return response.json();
  },

  get: async (filename: string): Promise<{ content: string; contentType: string }> => {
    const response = await apiFetch(`/get/codeshare/${encodeURIComponent(filename)}`, {
      method: "GET",
      includeAuth: false,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to fetch code");
    }

    return response.json();
  },
};

export const filesApi = {
  uploadFiles: async (
    files: File[],
    email: string,
  ): Promise<{ key: string; email: string; itemName: string; kind: "single" | "zip"; fileCount: number; downloadUrl: string; expiresAt: string; retentionDays: number }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    formData.append("email", email.trim());

    const response = await apiFetch("/upload/files", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to upload files");
    }

    return response.json();
  },

  getFilesByEmail: async (
    email: string,
  ): Promise<{ email: string; uploads: Array<{ key: string; itemName: string; kind: "single" | "zip"; fileCount: number; email: string; createdAt: string; expiresAt: string; downloadUrl: string }> }> => {
    const response = await apiFetch(`/get/files/by-email/${encodeURIComponent(email.trim())}`, {
      method: "GET",
      includeAuth: false,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to retrieve file");
    }

    return response.json();
  },
};
