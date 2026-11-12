// render.mjs — CLI renderer for motor-cartoon.
// Supports:
//   node render.mjs --roteiro <roteiro.json> --tempos <tempos.json> --saida <video.mp4>
//   node render.mjs --roteiro <roteiro.json> [--tempos <tempos.json>] --teste [--saida-dir <dir>]
//   node render.mjs --estado <estado.json> --saida <video.mp4>
// Renders video in 150-frame chunks (one fresh Node/Chromium process per chunk) and concatenates via ffmpeg -f concat -c copy.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const CHUNK = 150;

// ---------------- Auto-detect Playwright Chromium across Linux & Windows ----------------
export function findBrowserExecutable() {
  if (process.env.BROWSER_EXECUTABLE && fs.existsSync(process.env.BROWSER_EXECUTABLE)) {
    return process.env.BROWSER_EXECUTABLE;
  }
  const roots = [
    "/opt/pw-browsers",
    path.join(os.homedir(), ".cache", "ms-playwright"),
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "ms-playwright") : "",
  ].filter(Boolean);

  const candidates = [
    ["chromium_headless_shell-", "chrome-headless-shell-linux64", "chrome-headless-shell"],
    ["chromium-", "chrome-linux64", "chrome"],
    ["chromium_headless_shell-", "chrome-headless-shell-win64", "chrome-headless-shell.exe"],
    ["chromium-", "chrome-win64", "chrome.exe"],
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const entries = fs.readdirSync(root).sort().reverse();
    for (const [prefix, sub, bin] of candidates) {
      for (const dir of entries) {
        if (dir.startsWith(prefix)) {
          const full = path.join(root, dir, sub, bin);
          if (fs.existsSync(full)) return full;
        }
      }
    }
  }
  return undefined;
}

// ---------------- Resolve roteiro.json + tempos.json (matches hora-muerta/scripts/comum.py) ----------------
function tempoRef(segs, ref) {
  const idx = Math.min(Math.max(0, Number(ref.linea ?? 0)), segs.length - 1);
  const s = segs[idx] || { start: 0, end: 2 };
  const t0 = s.t0 ?? s.start ?? 0;
  const t1 = s.t1 ?? s.end ?? t0 + 2;
  const en = ref.en ?? "inicio";
  const base = en === "inicio" ? t0 : en === "fin" ? t1 : t0 + (t1 - t0) * Number(en);
  return Math.round((base + Number(ref.mas ?? 0)) * 1000) / 1000;
}

export function resolverEstado(h, tempos) {
  const cenasRaw = h.cenas || [];
  let rawSegs = tempos?.segs || tempos?.segments;

  if (!rawSegs || !rawSegs.length) {
    rawSegs = [];
    let t = 0;
    const todasLinhas = h.lineas?.length
      ? h.lineas
      : cenasRaw.flatMap((c) => c.linhas || []);
    todasLinhas.forEach((item, idx) => {
      const txt = typeof item === "string" ? item : String(item?.texto || item?.text || "");
      const words = txt.trim().split(/\s+/).filter(Boolean);
      const dur = Math.max(1.8, words.length * 0.36);
      rawSegs.push({ idx, t0: t, t1: t + dur, start: t, end: t + dur, dur, text: txt });
      t += dur + 0.12;
    });
  }

  const segs = rawSegs.map((s, idx) => {
    const start = Number(s.t0 ?? s.start ?? 0);
    const end = Number(s.t1 ?? s.end ?? start + Number(s.dur ?? 2));
    const text = typeof s.text === "string" ? s.text : String(s.texto || s.text?.texto || s.text?.text || "");
    return {
      idx: s.idx ?? idx,
      start,
      end,
      t0: start,
      t1: end,
      dur: Math.max(0.05, end - start),
      text,
      ...(Array.isArray(s.w) ? { w: s.w } : {}),
    };
  });

  const durTotal = Number(tempos?.dur ?? ((segs.length ? segs[segs.length - 1].end : 10) + 0.25));

  // Top-level events resolved via tempoRef (matches comum.py)
  const topEventos = (h.eventos || []).map((e) => ({
    ...e,
    t_abs: e.t !== undefined ? Number(e.t) : tempoRef(segs, e),
  }));

  const cenas = [];
  if (cenasRaw.length) {
    let cursor = 0;
    cenasRaw.forEach((item, ci) => {
      let t0;
      if (item.t0 !== undefined && item.t1 !== undefined) {
        t0 = Number(item.t0);
      } else if (item.linea !== undefined) {
        t0 = ci === 0 ? 0.0 : tempoRef(segs, { en: "inicio", mas: -0.25, ...item });
      } else if (item.t0 !== undefined) {
        t0 = Number(item.t0);
      } else {
        const s0 = segs[Math.min(cursor, segs.length - 1)] || { start: 0 };
        t0 = ci === 0 ? 0.0 : s0.start;
        cursor += (item.linhas || []).length || 1;
      }
      const cfg = item.cena || item;
      cenas.push({
        idx: ci,
        t0,
        t1: durTotal,
        cenario: cfg.cenario || "floresta",
        marca: cfg.marca,
        plano: cfg.plano,
        luz: cfg.luz,
        efeito: cfg.efeito,
        atores: cfg.atores || [],
        criatura: cfg.criatura || null,
        _rawEventos: cfg.eventos || [],
      });
    });

    for (let i = 0; i < cenas.length - 1; i++) {
      cenas[i].t1 = Math.max(cenas[i].t0 + 0.2, cenas[i + 1].t0);
    }

    // Attach both scene-level and top-level events falling into each scene
    cenas.forEach((c) => {
      const durC = Math.max(0.1, c.t1 - c.t0);
      const evs = (c._rawEventos || []).map((ev) => ({
        ...ev,
        t_abs: ev.t_abs !== undefined ? Number(ev.t_abs) : ev.linea !== undefined ? tempoRef(segs, ev) : c.t0 + Number(ev.em ?? 0.5) * durC,
      }));
      for (const te of topEventos) {
        if (te.t_abs >= c.t0 && te.t_abs <= c.t1) {
          evs.push(te);
        }
      }
      c.eventos = evs;
      delete c._rawEventos;
    });
  }

  return {
    fps: FPS,
    dur: durTotal,
    legenda: tempos?.legenda || h.legenda || (segs.some((s) => Array.isArray(s.w)) ? "alinhamento" : "proporcional"),
    serie: h.serie || "",
    destaque: h.destaque || [],
    elenco: h.elenco || {},
    cenas,
    segs,
  };
}

// ---------------- CLI Argument Parser ----------------
function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const nxt = argv[i + 1];
      if (!nxt || nxt.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = nxt;
        i++;
      }
    }
  }
  return out;
}

async function ensureBundle(forceBundle = false) {
  const outDir = path.join(__dirname, ".bundle");
  if (!forceBundle && fs.existsSync(path.join(outDir, "index.html"))) {
    return outDir;
  }
  return await bundle({
    entryPoint: path.join(__dirname, "src", "index.ts"),
    outDir,
  });
}

// ---------------- Worker mode: renders a single chunk [a, b] and exits ----------------
async function runWorkerChunk(args) {
  const browserExecutable = findBrowserExecutable();
  const serveUrl = args["serve-url"];
  const estado = JSON.parse(fs.readFileSync(args["estado-file"], "utf8"));
  const [a, b] = args["worker-chunk"].split("-").map(Number);
  const outChunk = args["chunk-out"];
  const dpr = args.dpr ? Number(args.dpr) : undefined;
  const noCaps = Boolean(args.noCaps);
  const defaultConc = os.totalmem() >= 12 * 1024 ** 3 ? Math.min(4, Math.max(1, os.cpus().length)) : 2;
  const concurrency = Number(args.concurrency || process.env.CARTOON_CONCURRENCY || defaultConc);

  const inputProps = { estado, ...(dpr ? { dpr } : {}), ...(noCaps ? { noCaps: true } : {}) };
  const composition = await selectComposition({
    serveUrl,
    id: "cartoon",
    inputProps,
    browserExecutable,
    chromiumOptions: { gl: "swangle" },
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 16,
    pixelFormat: "yuv420p",
    frameRange: [a, b],
    inputProps,
    concurrency,
    muted: true,
    browserExecutable,
    chromiumOptions: { gl: "swangle" },
    timeoutInMilliseconds: 300000,
    outputLocation: outChunk,
  });
}

// ---------------- Main mode ----------------
async function main() {
  const args = parseArgs(process.argv);

  if (args["worker-chunk"]) {
    await runWorkerChunk(args);
    return;
  }

  let estado;
  if (args.estado) {
    const rawEst = JSON.parse(fs.readFileSync(path.resolve(args.estado), "utf8"));
    estado = resolverEstado(rawEst, rawEst);
  } else if (args.roteiro) {
    const h = JSON.parse(fs.readFileSync(path.resolve(args.roteiro), "utf8"));
    const tempos = args.tempos && fs.existsSync(path.resolve(args.tempos))
      ? JSON.parse(fs.readFileSync(path.resolve(args.tempos), "utf8"))
      : null;
    estado = resolverEstado(h, tempos);
  } else {
    throw new Error("Uso: node render.mjs --roteiro <roteiro.json> [--tempos <tempos.json>] [--saida <out.mp4> | --teste]");
  }

  // Write estado-render.json for bundle default and worker processes
  const estadoFile = path.join(__dirname, "estado-render.json");
  fs.writeFileSync(estadoFile, JSON.stringify(estado));

  console.log("[motor-cartoon] Bundling Remotion project...");
  const serveUrl = await ensureBundle(Boolean(args.rebundle));
  const browserExecutable = findBrowserExecutable();
  console.log(`[motor-cartoon] Browser: ${browserExecutable || "default"}`);

  // --teste mode: either comma-separated seconds (from render.py) or 6 representative stills
  if (args.teste) {
    const inputProps = { estado };
    const composition = await selectComposition({
      serveUrl,
      id: "cartoon",
      inputProps,
      browserExecutable,
      chromiumOptions: { gl: "swangle" },
    });

    if (typeof args.teste === "string" && args.saida) {
      const base = path.resolve(args.saida).replace(/\.[^.]+$/, "");
      fs.mkdirSync(path.dirname(base), { recursive: true });
      const secs = args.teste.split(",").map((v) => Number(v.trim())).filter((v) => !Number.isNaN(v));
      for (const sec of secs) {
        const frame = Math.min(composition.durationInFrames - 1, Math.max(0, Math.round(sec * FPS)));
        const outJpg = `${base}_${sec.toFixed(1).padStart(5, "0")}.jpg`;
        await renderStill({
          composition,
          serveUrl,
          frame,
          imageFormat: "jpeg",
          jpegQuality: 90,
          inputProps,
          browserExecutable,
          chromiumOptions: { gl: "swangle" },
          output: outJpg,
        });
      }
      return;
    }

    const stillsDir = path.resolve(args["saida-dir"] || path.join(__dirname, "stills"));
    fs.mkdirSync(stillsDir, { recursive: true });

    const cenas = estado.cenas || [];
    const framesToRender = [];
    const nPick = Math.min(6, cenas.length);
    for (let k = 0; k < nPick; k++) {
      const idx = nPick === 1 ? 0 : Math.round((k * (cenas.length - 1)) / (nPick - 1));
      const c = cenas[idx];
      const midT = (c.t0 + c.t1) * 0.5;
      const f = Math.min(composition.durationInFrames - 1, Math.max(0, Math.round(midT * FPS)));
      framesToRender.push({ idx: idx + 1, cenario: c.cenario, luz: c.luz || "auto", frame: f });
    }

    for (const item of framesToRender) {
      const outPng = path.join(stillsDir, `cena_${String(item.idx).padStart(2, "0")}_${item.cenario}_f${item.frame}.png`);
      const t0 = Date.now();
      await renderStill({
        composition,
        serveUrl,
        frame: item.frame,
        imageFormat: "png",
        inputProps,
        browserExecutable,
        chromiumOptions: { gl: "swangle" },
        output: outPng,
      });
      console.log(`  still ${path.basename(outPng)} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
    return;
  }

  // Full video render in 150-frame chunks
  const saida = path.resolve(args.saida || path.join(__dirname, "out.mp4"));
  fs.mkdirSync(path.dirname(saida), { recursive: true });

  const totalFrames = Math.max(1, Math.ceil((estado.dur || 10) * FPS));
  const chunksDir = fs.mkdtempSync(path.join(os.tmpdir(), "cartoon-chunks-"));
  const chunkFiles = [];

  console.log(`[motor-cartoon] Renderizando ${totalFrames} frames (${estado.dur.toFixed(1)}s) em blocos de ${CHUNK}...`);

  for (let a = 0; a < totalFrames; a += CHUNK) {
    const b = Math.min(totalFrames - 1, a + CHUNK - 1);
    const idx = Math.floor(a / CHUNK);
    const chunkPath = path.join(chunksDir, `chunk_${String(idx).padStart(3, "0")}.mp4`);
    const t0 = Date.now();

    const workerArgs = [
      path.join(__dirname, "render.mjs"),
      "--worker-chunk",
      `${a}-${b}`,
      "--serve-url",
      serveUrl,
      "--estado-file",
      estadoFile,
      "--chunk-out",
      chunkPath,
    ];
    if (args.dpr) workerArgs.push("--dpr", String(args.dpr));
    if (args.noCaps) workerArgs.push("--noCaps", "true");
    if (args.concurrency) workerArgs.push("--concurrency", String(args.concurrency));

    const res = spawnSync(process.execPath, workerArgs, {
      cwd: __dirname,
      stdio: "inherit",
      env: process.env,
    });
    if (res.status !== 0) {
      throw new Error(`Falha ao renderizar bloco ${a}-${b} (exit ${res.status})`);
    }
    chunkFiles.push(chunkPath);
    console.log(`  bloco ${a}..${b} / ${totalFrames - 1} concluido em ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }

  // Concatenate chunks with ffmpeg -f concat -c copy
  const listFile = path.join(chunksDir, "list.txt");
  fs.writeFileSync(
    listFile,
    chunkFiles.map((f) => `file '${f.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n") + "\n"
  );

  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", saida]);

  // Cleanup temp chunks
  try {
    fs.rmSync(chunksDir, { recursive: true, force: true });
  } catch {}

  console.log(`[motor-cartoon] Video salvo em ${saida}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
