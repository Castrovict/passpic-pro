import app from "./app";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  warmupModel();
});

/**
 * Pre-warms the ONNX background removal model immediately after server starts.
 * This prevents the first real user request from timing out due to model download.
 * Runs in background — does NOT block the server from accepting requests.
 */
async function warmupModel() {
  try {
    console.log("[warmup] Pre-loading ONNX model in background...");
    const { removeBackground } = await import("@imgly/background-removal-node");
    const sharp = (await import("sharp")).default;

    // Minimal 10x10 white JPEG as warmup image
    const warmupBuf = await sharp({
      create: { width: 10, height: 10, channels: 3, background: { r: 255, g: 255, b: 255 } },
    }).jpeg().toBuffer();

    const blob = new Blob([warmupBuf], { type: "image/jpeg" });
    await removeBackground(blob, {
      model: "medium",
      output: { format: "image/png" },
    } as any);

    console.log("[warmup] ONNX model loaded and ready.");
  } catch (e: any) {
    console.warn("[warmup] Model pre-load failed (non-fatal):", e?.message ?? e);
  }
}
