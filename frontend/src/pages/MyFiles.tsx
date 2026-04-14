import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { filesApi } from "@/helpers/api";

function MyFiles() {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadEmail, setUploadEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [uploadsForEmail, setUploadsForEmail] = useState<Array<{ key: string; itemName: string; kind: "single" | "zip"; fileCount: number; createdAt: string; expiresAt: string; downloadUrl: string }>>([]);
  const [isBusy, setIsBusy] = useState(false);

  const expiryLabel = useMemo(() => {
    if (!expiresAt) {
      return "";
    }
    return new Date(expiresAt).toLocaleString();
  }, [expiresAt]);

  const handleUpload = async (): Promise<void> => {
    if (filesToUpload.length === 0) {
      setStatusMessage("Choose one or more files first.");
      return;
    }

    if (!uploadEmail.trim()) {
      setStatusMessage("Enter an email address before uploading.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("");
    setDownloadUrl("");
    setUploadsForEmail([]);

    try {
      const result = await filesApi.uploadFiles(filesToUpload, uploadEmail);
      const modeLabel = result.kind === "single" ? "file" : "archive";
      setStatusMessage(`Uploaded ${result.fileCount} ${modeLabel}${result.fileCount > 1 ? "s" : ""} for ${result.email}.`);
      setDownloadUrl(result.downloadUrl);
      setExpiresAt(result.expiresAt);
      setUploadEmail("");
      setFilesToUpload([]);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsBusy(false);
    }
  };

  const handleRetrieve = async (): Promise<void> => {
    if (!lookupEmail.trim()) {
      setStatusMessage("Enter an email address to retrieve.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("");
    setDownloadUrl("");
    setUploadsForEmail([]);

    try {
      const result = await filesApi.getFilesByEmail(lookupEmail.trim());
      setStatusMessage(`Found ${result.uploads.length} upload(s) for ${result.email}.`);
      setUploadsForEmail(result.uploads);
      setExpiresAt(result.uploads[0]?.expiresAt || "");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Retrieval failed");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">File Vault</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Upload files once, retrieve them by email later</h1>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Pick one file or many files. One upload button handles both: single files are stored directly, multiple files are packed automatically.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
              <Label className="text-sm font-medium text-zinc-300">Email address</Label>
              <Input
                className="border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-500"
                value={uploadEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Upload</h2>
                <p className="text-sm text-zinc-400">Select files and hit upload. The backend decides single vs zip automatically.</p>
              </div>
              <Button onClick={handleUpload} disabled={isBusy} className="bg-white text-black hover:bg-zinc-200">
                {isBusy ? "Working..." : "Upload"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-300">Files</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilesToUpload(Array.from(e.target.files || []))}
                  className="border-white/10 bg-zinc-900 text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-zinc-200"
                />
              </div>

              {filesToUpload.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-sm font-medium text-zinc-300">Selected files</p>
                  <div className="space-y-1 text-sm text-zinc-400">
                    {filesToUpload.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 text-xs text-zinc-500">{Math.ceil(file.size / 1024)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-500">
                  Choose one file or several files to upload.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl">
            <div className="mb-4 space-y-1">
              <h2 className="text-xl font-semibold text-white">Retrieve</h2>
              <p className="text-sm text-zinc-400">Look up all uploads tied to an email address.</p>
            </div>

            <div className="flex gap-3">
              <Input
                className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-500"
                value={lookupEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLookupEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <Button variant="outline" onClick={handleRetrieve} disabled={isBusy} className="border-white/10 bg-white text-black hover:bg-zinc-200">
                Find
              </Button>
            </div>
          </section>
        </div>

        {statusMessage ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
            {statusMessage}
          </div>
        ) : null}

        {downloadUrl ? (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            <a href={downloadUrl} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
              Download latest upload
            </a>
            {expiryLabel ? <p className="mt-1 text-cyan-100/80">Expires at: {expiryLabel}</p> : null}
          </div>
        ) : null}

        {uploadsForEmail.length > 0 ? (
          <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Matching uploads</h3>
                <p className="text-sm text-zinc-400">Download any archive or direct file from this email.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                {uploadsForEmail.length} item(s)
              </span>
            </div>

            <div className="grid gap-3">
              {uploadsForEmail.map((upload) => (
                <div key={upload.key} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{upload.itemName}</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wider text-zinc-300">
                        {upload.kind}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      Uploaded {new Date(upload.createdAt).toLocaleString()} · {upload.fileCount} file{upload.fileCount > 1 ? "s" : ""}
                    </div>
                  </div>
                  <Button asChild className="bg-white text-black hover:bg-zinc-200">
                    <a href={upload.downloadUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default MyFiles;
