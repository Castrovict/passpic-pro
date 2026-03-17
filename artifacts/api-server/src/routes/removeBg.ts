import { Router, type IRouter } from "express";

const router: IRouter = Router();

/**
 * POST /api/remove-bg
 * Removes background from a portrait image and returns a white-background JPEG.
 *
 * Priority:
 *  1. remove.bg API  — if REMOVE_BG_API_KEY env var is set (best quality)
 *  2. @imgly/background-removal-node — fully local ONNX inference, no API key
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

  const apiKey = process.env["REMOVE_BG_API_KEY"];

  // ── Strategy 1: remove.bg paid API ──────────────────────────────────────
  if (apiKey) {
    try {
      const form = new FormData();
      form.append("image_file_b64", image_base64);
      form.append("size", "auto");
      form.append("type", "person");
      form.append("bg_color", "ffffff");
      form.append("format", "jpg");

      const upstream = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey },
        body: form,
      });

      if (upstream.ok) {
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.json({ image_base64: buf.toString("base64"), content_type: "image/jpeg" });
        return;
      }
      console.warn("[remove-bg] remove.bg error, falling back to local ML");
    } catch (e: any) {
      console.warn("[remove-bg] remove.bg exception, falling back:", e?.message);
    }
  }

  // ── Strategy 2: Local ONNX ML inference (free, no API key) ───────────────
  let tmpInput: string | undefined;
  try {
    console.log("[remove-bg] Local ML inference (first run downloads model ~80 MB)…");

    const { removeBackground } = await import("@imgly/background-removal-node");
    const sharp = (await import("sharp")).default;
    const { writeFileSync, unlinkSync } = await import("fs");
    const { tmpdir } = await import("os");
    const { join } = await import("path");

    // Write input to a temp file so the library can auto-detect format reliably
    const inputBuf = Buffer.from(image_base64, "base64");
    tmpInput = join(tmpdir(), `rmbg_in_${Date.now()}.jpg`);

    // Convert to JPEG first (handles any source format cleanly)
    const jpegInput = await sharp(inputBuf).jpeg({ quality: 95 }).toBuffer();
    writeFileSync(tmpInput, jpegInput);

    // Run ONNX model with file:// URL → transparent PNG blob
    const fileUrl = `file://${tmpInput}`;
    const blob = await removeBackground(fileUrl, {
      model: "medium",
      output: { format: "image/png", quality: 1 },
      progress: (key: string, cur: number, tot: number) => {
        if (tot > 0) process.stdout.write(`\r[remove-bg] ${key}: ${Math.round((cur / tot) * 100)}%   `);
      },
    } as any);

    const transparentPng = Buffer.from(await blob.arrayBuffer());

    // Composite transparent PNG on white, export JPEG
    const { width = 600, height = 800 } = await sharp(transparentPng).metadata();
    const jpeg = await sharp({
      create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([{ input: transparentPng }])
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 95 })
      .toBuffer();

    try { unlinkSync(tmpInput); } catch {}

    console.log("\n[remove-bg] Local ML done, output:", jpeg.length, "bytes");
    res.json({ image_base64: jpeg.toString("base64"), content_type: "image/jpeg" });
  } catch (e: any) {
    if (tmpInput) try { const { unlinkSync } = await import("fs"); unlinkSync(tmpInput); } catch {}
    console.error("\n[remove-bg] Local ML failed:", e?.message ?? e);
    res.status(500).json({ error: `Background removal failed: ${e?.message ?? "unknown error"}` });
  }
});

export default router;
