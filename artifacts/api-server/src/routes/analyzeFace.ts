import { Router, type IRouter } from "express";

const router: IRouter = Router();

type FaceStatus = "no_face" | "too_far" | "too_close" | "tilted" | "off_center" | "ready";

interface AnalyzeResult {
  status: FaceStatus;
  message: string;
  messageEs: string;
}

/**
 * POST /api/analyze-face
 * Analyzes a camera frame for passport photo readiness.
 * Uses skin-tone pixel analysis + spatial distribution to estimate
 * face presence, position, and size — no ML model required.
 *
 * Body:   { image_base64: string }   (low-res JPEG, quality=0.25 is fine)
 * Returns: AnalyzeResult
 */
router.post("/analyze-face", async (req, res) => {
  const { image_base64 } = req.body as { image_base64?: string };
  if (!image_base64) {
    res.status(400).json({ error: "image_base64 required" });
    return;
  }

  try {
    const sharp = (await import("sharp")).default;

    const inputBuf = Buffer.from(image_base64, "base64");

    // Work on a small 160×213 raw RGB image (fast, preserves 3:4 portrait ratio)
    const W = 160;
    const H = 213;
    const { data } = await sharp(inputBuf)
      .resize(W, H, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // ── Skin-tone detection in HSV-like space ─────────────────────────────
    // Covers all skin tones: fair, tan, brown, dark
    // Using RGB heuristics validated against Fitzpatrick scale
    const skinMap = new Uint8Array(W * H);
    let totalSkin = 0;

    for (let i = 0; i < W * H; i++) {
      const r = data[i * 3]!;
      const g = data[i * 3 + 1]!;
      const b = data[i * 3 + 2]!;

      if (isSkin(r, g, b)) {
        skinMap[i] = 1;
        totalSkin++;
      }
    }

    const skinRatio = totalSkin / (W * H);

    // No skin detected at all → no face
    if (skinRatio < 0.03) {
      res.json(r("no_face",
        "No face detected · Move into the oval",
        "Sin rostro · Colócate dentro del óvalo"
      ));
      return;
    }

    // ── Find bounding box of skin region ─────────────────────────────────
    let minX = W, maxX = 0, minY = H, maxY = 0;
    let sumX = 0, sumY = 0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (skinMap[y * W + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          sumX += x;
          sumY += y;
        }
      }
    }

    const skinW = maxX - minX;
    const skinH = maxY - minY;
    const skinCX = sumX / totalSkin;
    const skinCY = sumY / totalSkin;

    // Relative to frame (0..1)
    const relW = skinW / W;
    const relH = skinH / H;
    const relCX = skinCX / W;
    const relCY = skinCY / H;

    // ── Biometric checks ──────────────────────────────────────────────────

    // 1. Face too far (too small)
    if (relW < 0.22 || relH < 0.25) {
      res.json(r("too_far",
        "Too far · Move closer to the camera",
        "Muy lejos · Acércate a la cámara"
      ));
      return;
    }

    // 2. Face too close (fills >75% of frame)
    if (relW > 0.78 || relH > 0.82) {
      res.json(r("too_close",
        "Too close · Move back a little",
        "Muy cerca · Aléjate un poco"
      ));
      return;
    }

    // 3. Horizontally off-center
    if (Math.abs(relCX - 0.5) > 0.18) {
      const dir = relCX < 0.5 ? "derecha" : "izquierda";
      res.json(r("off_center",
        `Not centered · Move ${relCX < 0.5 ? "right" : "left"}`,
        `No centrado · Muévete a la ${dir}`
      ));
      return;
    }

    // 4. Vertically off-center (face should be in upper 2/3 of frame)
    if (relCY < 0.15 || relCY > 0.65) {
      res.json(r("off_center",
        "Not centered · Adjust your height",
        "No centrado · Ajusta la altura"
      ));
      return;
    }

    // 5. Head tilt: estimate from asymmetry of skin region in upper half
    //    If the left side of the face has significantly more skin than right → tilted
    const midX = Math.round(skinCX);
    let leftSkin = 0;
    let rightSkin = 0;
    for (let y = minY; y <= Math.min(minY + Math.round(skinH * 0.6), H - 1); y++) {
      for (let x = minX; x <= maxX; x++) {
        if (skinMap[y * W + x]) {
          if (x < midX) leftSkin++;
          else rightSkin++;
        }
      }
    }
    const sideDiff = Math.abs(leftSkin - rightSkin) / (leftSkin + rightSkin + 1);
    if (sideDiff > 0.35 && totalSkin > 200) {
      res.json(r("tilted",
        "Head tilted · Look straight ahead",
        "Cabeza inclinada · Mira directo a la cámara"
      ));
      return;
    }

    // ── All checks passed ─────────────────────────────────────────────────
    res.json(r("ready",
      "Perfect position · Hold still",
      "¡Posición perfecta! Quédate quieto…"
    ));
  } catch (e: any) {
    console.error("[analyze-face] error:", e?.message);
    // Graceful fallback: don't block the camera UX
    res.status(500).json(r("no_face", "Analysis unavailable", "Análisis no disponible"));
  }
});

// ── Skin-tone detection across Fitzpatrick scale ──────────────────────────────
// Uses a combination of RGB and YCbCr-inspired heuristics
function isSkin(r: number, g: number, b: number): boolean {
  // Reject near-white (bright background) and near-black
  if (r > 245 && g > 245 && b > 245) return false;
  if (r < 20 && g < 20 && b < 20) return false;

  // Must have some redness (all skin tones are redder than blue)
  if (r <= g || r <= b) return false;

  // YCbCr skin range (robust across lighting and ethnicity)
  const y  =  0.299 * r + 0.587 * g + 0.114 * b;
  const cb = -0.168 * r - 0.331 * g + 0.500 * b + 128;
  const cr =  0.500 * r - 0.418 * g - 0.082 * b + 128;

  return y > 35 && cb >= 77 && cb <= 135 && cr >= 133 && cr <= 173;
}

function r(status: FaceStatus, message: string, messageEs: string): AnalyzeResult {
  return { status, message, messageEs };
}

export default router;
