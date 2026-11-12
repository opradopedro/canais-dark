// stills.mjs — Quick still frame renderer for visual inspection or thumbnail generation.
// Usage:
//   node stills.mjs --roteiro <roteiro.json> [--tempos <tempos.json>] [--frame <N>] [--saida <capa.png>]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findBrowserExecutable, resolverEstado } from "./render.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;

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

async function main() {
  const args = parseArgs(process.argv);
  let estado;
  if (args.estado) {
    estado = JSON.parse(fs.readFileSync(path.resolve(args.estado), "utf8"));
  } else if (args.roteiro) {
    const h = JSON.parse(fs.readFileSync(path.resolve(args.roteiro), "utf8"));
    const tempos = args.tempos && fs.existsSync(path.resolve(args.tempos))
      ? JSON.parse(fs.readFileSync(path.resolve(args.tempos), "utf8"))
      : null;
    estado = resolverEstado(h, tempos);
  } else {
    throw new Error("Uso: node stills.mjs --roteiro <roteiro.json> [--frame <N>] [--saida <out.png>]");
  }

  const estadoFile = path.join(__dirname, "estado-render.json");
  fs.writeFileSync(estadoFile, JSON.stringify(estado));

  const outDir = path.join(__dirname, ".bundle");
  const serveUrl = fs.existsSync(path.join(outDir, "index.html")) && !args.rebundle
    ? outDir
    : await bundle({ entryPoint: path.join(__dirname, "src", "index.ts"), outDir });

  const browserExecutable = findBrowserExecutable();
  const noCaps = args.noCaps !== undefined ? Boolean(args.noCaps) : Boolean(args.saida);
  const inputProps = { estado, ...(noCaps ? { noCaps: true } : {}) };

  const composition = await selectComposition({
    serveUrl,
    id: "cartoon",
    inputProps,
    browserExecutable,
    chromiumOptions: { gl: "swangle" },
  });

  if (args.saida) {
    const f = args.frame !== undefined
      ? Number(args.frame)
      : Math.min(composition.durationInFrames - 1, Math.round((estado.dur || 10) * 0.35 * FPS));
    const outPng = path.resolve(args.saida);
    fs.mkdirSync(path.dirname(outPng), { recursive: true });
    await renderStill({
      composition,
      serveUrl,
      frame: f,
      imageFormat: "png",
      inputProps,
      browserExecutable,
      chromiumOptions: { gl: "swangle" },
      output: outPng,
    });
    console.log(`[motor-cartoon] Still salvo em ${outPng}`);
    return;
  }

  // Otherwise render 1 still per scene into stills/
  const stillsDir = path.resolve(args["saida-dir"] || path.join(__dirname, "stills"));
  fs.mkdirSync(stillsDir, { recursive: true });
  for (const c of estado.cenas || []) {
    const f = Math.min(composition.durationInFrames - 1, Math.round(((c.t0 + c.t1) * 0.5) * FPS));
    const outPng = path.join(stillsDir, `cena_${String(c.idx + 1).padStart(2, "0")}_${c.cenario}.png`);
    await renderStill({
      composition,
      serveUrl,
      frame: f,
      imageFormat: "png",
      inputProps,
      browserExecutable,
      chromiumOptions: { gl: "swangle" },
      output: outPng,
    });
    console.log(`  still ${path.basename(outPng)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
