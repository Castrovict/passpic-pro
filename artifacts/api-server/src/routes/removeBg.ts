import { Router, type IRouter } from "express";

const router: IRouter = Router();

/**
 * POST /api/remove-bg
 * Removes background from a portrait image and returns a white-background JPEG.
 *
 * Pipeline (ICAO compliant):
 *  A. Resize to max 800px wide  → prevents OOM on Replit
 *  B. @imgly/background-removal-node → transparent PNG (local ONNX, free, unlimited)
 *  C. sharp .flatten({ background: white }) → ICAO pure white background
 *  D. Return JPEG quality 90
 *
 * Body:   { image_base64: string }
 * Returns: { image_base64: string, content_type: "image/jpeg" }
 */
router.post("/remove-bg", async (req, res) => {
  const { image_base64 } = req.body as { image_base64?: string };
  if (!image_base64) {
    res.status(400).json({ error: "image_base64 is required" });
    return;
  }

  let tmpInput: string | undefined;
  try {
    const { removeBackground } = await import("@imgly/background-removal-node");
    const sharp = (await import("sharp")).default;
    const { writeFileSync, unlinkSync } = await import("fs");
    const { tmpdir } = await import("os");
    const { join } = await import("path");

    const inputBuf = Buffer.from(image_base64, "base64");

    // ── A. Resize to max 800px wide (anti-OOM) ────────────────────────────────
    console.log("[remove-bg] Step A: resizing to max 800px wide…");
    const resizedBuf = await sharp(inputBuf)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 95 })
      .toBuffer();

    // Write resized image to temp file for @imgly/background-removal-node
    tmpInput = join(tmpdir(), `rmbg_in_${Date.now()}.jpg`);
    writeFileSync(tmpInput, resizedBuf);

    // ── B. Local ONNX background removal ─────────────────────────────────────
    console.log("[remove-bg] Step B: running ONNX background removal (first run downloads model ~80MB)…");
    const fileUrl = `file://${tmpInput}`;
    const blob = await removeBackground(fileUrl, {
      model: "medium",
      output: { format: "image/png", quality: 1 },
      progress: (key: string, cur: number, tot: number) => {
        if (tot > 0) process.stdout.write(`\r[remove-bg] ${key}: ${Math.round((cur / tot) * 100)}%   `);
      },
    } as any);

    const transparentPng = Buffer.from(await blob.arrayBuffer());
    try { unlinkSync(tmpInput); tmpInput = undefined; } catch {}

    // ── C. Flatten transparent pixels → ICAO pure white + encode JPEG ────────
    console.log("\n[remove-bg] Step C: compositing on white (ICAO)…");
    const { width = 600, height = 800 } = await sharp(transparentPng).metadata();

    const jpeg = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .composite([{ input: transparentPng }])
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 90 })
      .toBuffer();

    // ── D. Return result ──────────────────────────────────────────────────────
    console.log("[remove-bg] Done. Output:", jpeg.length, "bytes");
    res.json({ image_base64: jpeg.toString("base64"), content_type: "image/jpeg" });

  } catch (e: any) {
    if (tmpInput) {
      try { const { unlinkSync } = await import("fs"); unlinkSync(tmpInput); } catch {}
    }
    console.error("\n[remove-bg] Failed:", e?.message ?? e);
    res.status(500).json({ error: `Background removal failed: ${e?.message ?? "unknown error"}` });
  }
});

export default router;
