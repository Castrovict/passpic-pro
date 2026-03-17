import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/remove-bg", async (req, res) => {
  const apiKey = process.env["REMOVE_BG_API_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "REMOVE_BG_API_KEY not configured" });
    return;
  }

  const { image_base64 } = req.body as { image_base64?: string };
  if (!image_base64) {
    res.status(400).json({ error: "image_base64 is required" });
    return;
  }

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

    if (!upstream.ok) {
      const err = await upstream.text().catch(() => upstream.status.toString());
      res.status(upstream.status).json({ error: err });
      return;
    }

    const arrayBuf = await upstream.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");
    res.json({ image_base64: base64, content_type: "image/jpeg" });
  } catch (e: any) {
    console.error("[remove-bg] proxy error:", e?.message ?? e);
    res.status(500).json({ error: e?.message ?? "unknown error" });
  }
});

export default router;
