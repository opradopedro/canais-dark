// All 14 vocabulary creatures drawn as full-body 2D cartoon cards in the exact house style of toon.ts & monkey.ts:
// plum-black ink outlines (INK = #241726), two-tone cel-shaded fills (shadedFill), organic superellipse blobs,
// connected limbs (nothing floating/detached), and bright glowing eyes.
// Design space: 600 x 1000 (soles at y = 975).
import { Pen, INK, blobPts, mul, shade } from "../src/toon";

type P2 = [number, number];
const LIGHT = (-120 * Math.PI) / 180;
const SH: [number, number, number] = [0.68, 0.68, 0.78];

const bend = (a: P2, k: P2, b: P2, n = 8): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([
      s * s * a[0] + 2 * s * t * c[0] + t * t * b[0],
      s * s * a[1] + 2 * s * t * c[1] + t * t * b[1],
    ]);
  }
  return out;
};

function drawGlowingEyes(p: Pen, cx: number, cy: number, sep: number, rx: number, ry: number, col: string, pairs = 1) {
  for (let k = 0; k < pairs; k++) {
    const y = cy - k * (ry * 2.8);
    for (const s of [-1, 1]) {
      const x = cx + s * sep;
      p.ell(x, y, rx * 1.6, ry * 1.6, "rgba(255,220,100,0.32)", 0);
      p.ell(x, y, rx, ry, col, 4);
    }
  }
}

export function creatureScale(tipo: string): number {
  switch (tipo) {
    case "alta": return 1.65;              // ~3.5m tall
    case "gigante_mitologico": return 2.0; // ~4.3m tall
    case "lobisomem": return 1.15;
    case "coisa_com_chifres": return 1.25;
    case "sem_rosto": return 1.05;
    case "vulto": return 1.12;
    case "espantalho": return 1.02;
    case "mulher_branca": return 0.92;
    case "fantasma": return 0.95;
    case "rastejante": return 0.85;
    case "aranha_gigante": return 0.95;
    case "cao_negro": return 0.82;
    default: return 1.0;
  }
}

export function drawCreatureCard(p: Pen, tipo: string, t: number) {
  const sway = Math.round(Math.sin(t * 2.2) * 8);
  const cx = 300 + sway * 0.5;
  p.ol = 8;

  switch (tipo) {
    case "mulher_branca": {
      // Pale woman in flowing white gown, long dark hair framing gaunt face, right arm raised hitchhiking
      const gown = "#f0f0ea", gownSh = "#c8ccd8", hair = "#14111c", skin = "#e6e4dc";
      // Back hair layer
      const backHair: P2[] = [
        [cx - 84, 180], [cx + 84, 180], [cx + 98, 480], [cx - 98, 480],
      ];
      p.shadedFill(backHair, hair, "#08060c", LIGHT, 90);
      p.poly(backHair, null, 7);

      // Long flowing skirt to the ground
      const skirt: P2[] = [
        [cx - 58, 430], [cx + 58, 430],
        [cx + 125 + sway, 965], [cx - 125 + sway, 965],
      ];
      p.shadedFill(skirt, gown, gownSh, LIGHT, 120);
      p.poly(skirt, null, 8);
      p.line([[cx - 28, 520], [cx - 48 + sway, 955]], gownSh, 5);
      p.line([[cx + 24, 540], [cx + 42 + sway, 955]], gownSh, 5);

      // Left arm hanging down, right arm raised horizontally (hitchhiking / pointing)
      p.line(bend([cx - 58, 345], [cx - 92, 460], [cx - 84, 585]), skin, 22);
      p.ell(cx - 84, 592, 16, 18, skin, 6);
      p.line(bend([cx + 58, 345], [cx + 145, 325], [cx + 225, 295]), skin, 22);
      p.ell(cx + 232, 292, 18, 16, skin, 6);

      // Torso
      const torso = blobPts(cx, 390, { a: 62, b: 82, nTop: 2.1, nBot: 2.3, egg: 0.15, asym: 0, rot: 0, noise: 0.008, seed: 11 });
      p.shadedFill(torso, gown, gownSh, LIGHT, 65);
      p.inkRing(torso, 7, 13);

      // Pale spectral head
      const head = blobPts(cx, 225, { a: 72, b: 82, nTop: 2.0, nBot: 2.2, egg: -0.1, asym: 0, rot: 0, noise: 0.008, seed: 12 });
      p.shadedFill(head, skin, "#c2c0b8", LIGHT, 72);
      p.inkRing(head, 7, 13);

      // Hollow dark eye sockets with pale glowing pupils + dark sorrowful mouth
      for (const s of [-1, 1]) {
        p.ell(cx + s * 25, 228, 16, 13, "#262230", 5);
        p.ell(cx + s * 25, 228, 7, 7, "#e8f6ff", 0);
      }
      p.line([[cx - 16, 268], [cx + 16, 268]], INK, 6);

      // Long side locks + parted bangs framing the face
      const leftLock: P2[] = [
        [cx - 76, 175], [cx - 35, 138], [cx + 5, 142], [cx - 28, 200],
        [cx - 48, 265], [cx - 52, 465], [cx - 88, 455],
      ];
      const rightLock: P2[] = [
        [cx - 5, 142], [cx + 35, 138], [cx + 76, 175], [cx + 88, 455],
        [cx + 52, 465], [cx + 48, 265], [cx + 28, 200],
      ];
      p.shadedFill(leftLock, hair, "#07060a", LIGHT, 60);
      p.poly(leftLock, null, 7);
      p.shadedFill(rightLock, hair, "#07060a", LIGHT, 60);
      p.poly(rightLock, null, 7);
      break;
    }

    case "sem_rosto": {
      // Tall Slender-like figure in dark suit with tie, blank pale head, dark tendrils
      const suit = "#1b1c26", suitSh = "#101118", pale = "#eee8dc";
      // Dark tendrils from back
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 40, 340], [cx + s * 170, 220 + sway], [cx + s * 235, 120 - sway]), suit, 16);
        p.line(bend([cx + s * 45, 390], [cx + s * 185, 360 - sway], [cx + s * 245, 290 + sway]), suit, 14);
      }
      // Long legs
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 32, 540], [cx + s * 38, 750], [cx + s * 42, 960]), suit, 28);
        p.ell(cx + s * 48, 965, 32, 14, "#0d0d12", 6);
      }
      // Long arms reaching past knees
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 64, 310], [cx + s * 105, 520], [cx + s * 88, 725]), suit, 22);
        p.ell(cx + s * 88, 738, 20, 26, pale, 6);
      }
      // Suit torso + white shirt collar + red tie
      const torso = blobPts(cx, 420, { a: 68, b: 135, nTop: 2.2, nBot: 2.4, egg: -0.1, asym: 0, rot: 0, noise: 0.006, seed: 21 });
      p.shadedFill(torso, suit, suitSh, LIGHT, 70);
      p.inkRing(torso, 7, 13);
      p.poly([[cx - 24, 290], [cx + 24, 290], [cx, 355]], "#e8e4dc", 5);
      p.poly([[cx - 8, 310], [cx + 8, 310], [cx + 11, 435], [cx, 455], [cx - 11, 435]], "#8c2222", 4);
      // Faceless pale oval head
      const head = blobPts(cx, 195, { a: 66, b: 88, nTop: 2.0, nBot: 2.3, egg: 0.14, asym: 0, rot: 0, noise: 0.005, seed: 22 });
      p.shadedFill(head, pale, "#c8c0b4", LIGHT, 66);
      p.inkRing(head, 8, 14);
      break;
    }

    case "cao_negro": {
      // Huge black hellhound / Cadejo with glowing red eyes, fangs, and dragging chain
      const fur = "#1c1a24", furSh = "#0e0d14";
      // Four planted legs
      for (const [lx, ly] of [[-145, 955], [-75, 965], [85, 965], [155, 955]] as const) {
        p.line(bend([cx + lx * 0.7, 680], [cx + lx * 0.9, 820], [cx + lx, ly]), fur, 32);
        p.ell(cx + lx + 8, ly, 28, 15, fur, 6);
      }
      // Curled tail
      p.line(bend([cx - 140, 620], [cx - 220, 540], [cx - 245, 450]), fur, 24);
      // Muscular wolf body
      const body = blobPts(cx - 10, 635, { a: 165, b: 95, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0.08, rot: -0.05, noise: 0.015, seed: 31 });
      p.shadedFill(body, fur, furSh, LIGHT, 165);
      p.inkRing(body, 8, 15);
      // Dragging iron chain from collar
      p.band([[cx + 85, 585], [cx + 40, 780], [cx - 30, 955]], "#7a8490", 14, 5, "round");
      // Wolf head, pointed ears, snout with fangs
      const head = blobPts(cx + 125, 515, { a: 86, b: 76, nTop: 2.1, nBot: 2.3, egg: 0.1, asym: 0, rot: 0.1, noise: 0.01, seed: 32 });
      p.shadedFill(head, fur, furSh, LIGHT, 86);
      p.inkRing(head, 8, 14);
      p.poly([[cx + 75, 450], [cx + 92, 375], [cx + 122, 445]], fur, 7);
      p.poly([[cx + 135, 450], [cx + 162, 375], [cx + 180, 455]], fur, 7);
      // Snout & fangs
      p.poly([[cx + 165, 505], [cx + 255, 520], [cx + 245, 568], [cx + 160, 565]], fur, 7);
      p.poly([[cx + 185, 565], [cx + 195, 592], [cx + 205, 565]], "#f4f0e6", 4);
      p.poly([[cx + 220, 565], [cx + 230, 590], [cx + 240, 565]], "#f4f0e6", 4);
      drawGlowingEyes(p, cx + 145, 500, 26, 13, 9, "#ff2e2e", 1);
      break;
    }

    case "lobisomem": {
      // Hulking werewolf with dark brown fur, snout, fangs, claws, glowing amber eyes
      const fur = "#422d1b", furSh = mul(fur, SH);
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 55, 560], [cx + s * 95, 740], [cx + s * 72, 955]), fur, 38);
        p.ell(cx + s * 82, 962, 42, 18, "#26180e", 7);
      }
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 105, 310], [cx + s * 175, 450], [cx + s * 150, 620]), fur, 34);
        p.ell(cx + s * 150, 632, 28, 26, "#26180e", 7);
      }
      const torso = blobPts(cx, 420, { a: 118, b: 155, nTop: 2.1, nBot: 2.5, egg: -0.18, asym: 0, rot: 0, noise: 0.015, seed: 41 });
      p.shadedFill(torso, fur, furSh, LIGHT, 120);
      p.inkRing(torso, 8, 15);
      // Pointed wolf ears
      for (const s of [-1, 1]) {
        p.poly([[cx + s * 52, 165], [cx + s * 82, 75], [cx + s * 22, 145]], fur, 7);
      }
      const head = blobPts(cx, 210, { a: 86, b: 78, nTop: 2.1, nBot: 2.3, egg: 0.08, asym: 0, rot: 0, noise: 0.012, seed: 42 });
      p.shadedFill(head, fur, furSh, LIGHT, 86);
      p.inkRing(head, 8, 15);
      // Muzzle & fangs
      p.ell(cx, 248, 48, 32, "#2b1c10", 7);
      for (const s of [-1, 1]) {
        p.poly([[cx + s * 22, 268], [cx + s * 28, 296], [cx + s * 36, 268]], "#f5f2e8", 4);
      }
      drawGlowingEyes(p, cx, 198, 28, 13, 9, "#ffb82e", 1);
      break;
    }

    case "espantalho": {
      // Burlap scarecrow with tattered cone hat, stitched mouth, straw hands
      const coat = "#7a4a2a", pants = "#3a4a6a", burlap = "#c8a85a", straw = "#e2c468";
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 34, 560], [cx + s * 42, 760], [cx + s * 46, 960]), pants, 28);
        p.ell(cx + s * 52, 964, 34, 15, "#2b2018", 6);
      }
      // Outstretched scarecrow arms with straw tufts
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 68, 340], [cx + s * 145, 365 + s * sway], [cx + s * 215, 390]), coat, 26);
        p.poly([[cx + s * 210, 380], [cx + s * 248, 372], [cx + s * 242, 408], [cx + s * 210, 400]], straw, 5);
      }
      const torso = blobPts(cx, 445, { a: 76, b: 125, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 51 });
      p.shadedFill(torso, coat, mul(coat, SH), LIGHT, 76);
      p.inkRing(torso, 7, 14);
      const head = blobPts(cx, 235, { a: 74, b: 78, nTop: 2.1, nBot: 2.3, egg: 0.1, asym: 0, rot: 0.05, noise: 0.01, seed: 52 });
      p.shadedFill(head, burlap, mul(burlap, SH), LIGHT, 74);
      p.inkRing(head, 7, 14);
      // Stitched mouth & button/glowing eyes
      p.line([[cx - 32, 268], [cx + 32, 268]], INK, 6);
      for (const dx of [-20, -7, 7, 20]) p.line([[cx + dx, 258], [cx + dx, 278]], INK, 4);
      drawGlowingEyes(p, cx, 225, 26, 12, 12, "#ff9a2e", 1);
      // Wide brimmed wizard/scarecrow cone hat
      p.ell(cx, 172, 135, 22, "#3a2a1a", 7);
      p.poly([[cx - 78, 172], [cx + 12, 42], [cx + 78, 172]], "#4a3622", 7);
      break;
    }

    case "aranha_gigante": {
      // Giant dark spider with 8 jointed legs and cluster of glowing red eyes
      const bodyCol = "#1e1826", legCol = "#15101c";
      for (const s of [-1, 1]) {
        for (let k = 0; k < 4; k++) {
          const y0 = 640 + k * 22;
          const kx = cx + s * (155 + k * 22);
          const ky = 520 + k * 35 - (k % 2) * sway;
          const fx = cx + s * (215 + (k % 2) * 32);
          const fy = 890 + k * 22;
          p.line(bend([cx + s * 65, y0], [kx, ky], [fx, fy]), legCol, 20);
        }
      }
      const abdomen = blobPts(cx, 560, { a: 125, b: 110, nTop: 2.1, nBot: 2.2, egg: 0.18, asym: 0, rot: 0, noise: 0.01, seed: 61 });
      p.shadedFill(abdomen, bodyCol, "#0c0912", LIGHT, 125);
      p.inkRing(abdomen, 8, 15);
      const head = blobPts(cx, 695, { a: 82, b: 68, nTop: 2.1, nBot: 2.3, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 62 });
      p.shadedFill(head, bodyCol, "#0c0912", LIGHT, 82);
      p.inkRing(head, 8, 14);
      // Fangs
      for (const s of [-1, 1]) p.poly([[cx + s * 18, 748], [cx + s * 28, 795], [cx + s * 38, 748]], "#dcd6ce", 5);
      drawGlowingEyes(p, cx, 690, 24, 10, 10, "#ff2e38", 2);
      break;
    }

    case "coisa_com_chifres": {
      // Tall horned beast / Wendigo with pale deer skull, huge branching antlers, glowing eyes
      const bodyCol = "#261e18", skullCol = "#e8e0d0", antlerCol = "#6e5a46";
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 42, 550], [cx + s * 62, 750], [cx + s * 48, 960]), bodyCol, 30);
        p.ell(cx + s * 54, 964, 34, 15, bodyCol, 6);
        p.line(bend([cx + s * 78, 320], [cx + s * 138, 480], [cx + s * 118, 675]), bodyCol, 24);
        p.ell(cx + s * 118, 688, 22, 26, bodyCol, 6);
      }
      const torso = blobPts(cx, 430, { a: 84, b: 135, nTop: 2.1, nBot: 2.4, egg: -0.15, asym: 0, rot: 0, noise: 0.012, seed: 71 });
      p.shadedFill(torso, bodyCol, "#14100c", LIGHT, 84);
      p.inkRing(torso, 8, 14);
      // Branching antlers
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 36, 175], [cx + s * 115, 110], [cx + s * 165, 35]), antlerCol, 16);
        p.line([[cx + s * 85, 130], [cx + s * 75, 65]], antlerCol, 12);
        p.line([[cx + s * 128, 88], [cx + s * 118, 28]], antlerCol, 12);
      }
      // Pale deer skull
      const skull = blobPts(cx, 225, { a: 68, b: 78, nTop: 2.0, nBot: 2.6, egg: -0.22, asym: 0, rot: 0, noise: 0.01, seed: 72 });
      p.shadedFill(skull, skullCol, "#bfb4a2", LIGHT, 68);
      p.inkRing(skull, 8, 14);
      drawGlowingEyes(p, cx, 212, 25, 12, 10, "#ffae2e", 1);
      break;
    }

    case "fantasma": {
      // Spectral pale blue figure with tapering ghostly tail
      const ghost = "#cfe4f4", ghostSh = "#8eb4d4";
      const body: P2[] = [
        [cx - 78, 250], [cx + 78, 250],
        [cx + 115, 580], [cx + 68 + sway, 820], [cx + sway * 1.5, 955],
        [cx - 68 + sway, 820], [cx - 115, 580],
      ];
      p.shadedFill(body, ghost, ghostSh, LIGHT, 110);
      p.poly(body, null, 7);
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 72, 340], [cx + s * 145, 420], [cx + s * 165, 515]), ghost, 24);
      }
      const head = blobPts(cx, 210, { a: 74, b: 82, nTop: 2.0, nBot: 2.3, egg: 0.1, asym: 0, rot: 0, noise: 0.008, seed: 81 });
      p.shadedFill(head, ghost, ghostSh, LIGHT, 74);
      p.inkRing(head, 7, 13);
      drawGlowingEyes(p, cx, 205, 24, 12, 14, "#7ef4ff", 1);
      p.ell(cx, 252, 16, 24, "#1a2436", 5);
      break;
    }

    case "rastejante": {
      // Low crouched pale crawler on all fours
      const col = "#968e84", colSh = mul(col, SH);
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 78, 690], [cx + s * 165, 730], [cx + s * 145, 955]), col, 26);
        p.ell(cx + s * 150, 962, 30, 14, col, 6);
        p.line(bend([cx + s * 65, 640], [cx + s * 135, 780], [cx + s * 95, 960]), col, 24);
        p.ell(cx + s * 95, 964, 28, 14, col, 6);
      }
      const torso = blobPts(cx, 665, { a: 115, b: 78, nTop: 2.1, nBot: 2.3, egg: 0.15, asym: 0, rot: 0, noise: 0.01, seed: 91 });
      p.shadedFill(torso, col, colSh, LIGHT, 115);
      p.inkRing(torso, 7, 14);
      const head = blobPts(cx, 595, { a: 72, b: 68, nTop: 2.0, nBot: 2.3, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 92 });
      p.shadedFill(head, col, colSh, LIGHT, 72);
      p.inkRing(head, 7, 14);
      drawGlowingEyes(p, cx, 595, 24, 13, 10, "#ffe048", 1);
      break;
    }

    case "gigante_mitologico": {
      // Colossal bearded mythological titan/cyclops in bronze armor
      const skin = "#b89c78", tunic = "#6e472b", gold = "#d8a83c";
      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 58, 560], [cx + s * 72, 760], [cx + s * 68, 958]), skin, 42);
        p.ell(cx + s * 76, 964, 46, 20, tunic, 7);
        p.line(bend([cx + s * 115, 310], [cx + s * 175, 460], [cx + s * 155, 620]), skin, 38);
        p.ell(cx + s * 155, 632, 32, 30, skin, 7);
      }
      const torso = blobPts(cx, 430, { a: 124, b: 155, nTop: 2.2, nBot: 2.4, egg: -0.1, asym: 0, rot: 0, noise: 0.01, seed: 101 });
      p.shadedFill(torso, tunic, mul(tunic, SH), LIGHT, 124);
      p.inkRing(torso, 8, 15);
      p.band([[cx - 115, 510], [cx + 115, 510]], gold, 28, 6);
      const head = blobPts(cx, 205, { a: 84, b: 86, nTop: 2.1, nBot: 2.3, egg: 0.1, asym: 0, rot: 0, noise: 0.008, seed: 102 });
      p.shadedFill(head, skin, mul(skin, SH), LIGHT, 84);
      p.inkRing(head, 8, 15);
      // Thick braided beard
      const beard: P2[] = [[cx - 64, 245], [cx - 72, 345], [cx, 385], [cx + 72, 345], [cx + 64, 245]];
      p.shadedFill(beard, "#58524e", "#383432", LIGHT, 70);
      p.poly(beard, null, 7);
      drawGlowingEyes(p, cx, 195, 28, 13, 10, "#fff4b8", 1);
      break;
    }

    case "olhos_no_escuro": {
      // Three pairs of menacing glowing eyes in a dark misty silhouette
      const mist = blobPts(cx, 540, { a: 155, b: 280, nTop: 2.1, nBot: 2.4, egg: 0.15, asym: 0, rot: 0, noise: 0.02, seed: 111 });
      p.shadedFill(mist, "#14121e", "#0a0910", LIGHT, 155);
      drawGlowingEyes(p, cx, 320, 32, 15, 10, "#ffe048", 1);
      drawGlowingEyes(p, cx - 58, 480, 26, 13, 9, "#ff4838", 1);
      drawGlowingEyes(p, cx + 62, 520, 26, 13, 9, "#ffe048", 1);
      break;
    }

    case "vulto":
    case "alta":
    default: {
      // Tall, gaunt shadowy figure ("alta" / "vulto") with elongated limbs and glowing eyes
      const isVulto = tipo === "vulto";
      const bodyCol = isVulto ? "#14121d" : "#3a2e22";
      const shCol = isVulto ? "#09080e" : "#221a12";
      const eyeCol = isVulto ? "#ff3838" : "#ffe048";

      for (const s of [-1, 1]) {
        p.line(bend([cx + s * 36, 520], [cx + s * 46, 740], [cx + s * 42, 960]), bodyCol, 28);
        p.ell(cx + s * 48, 965, 34, 15, bodyCol, 6);
        // Very long arms hanging down to the shins
        p.line(bend([cx + s * 68, 285], [cx + s * 112, 525 + s * sway], [cx + s * 86, 785]), bodyCol, 24);
        p.ell(cx + s * 86, 800, 20, 28, bodyCol, 6);
      }
      const torso = blobPts(cx, 395, { a: 72, b: 145, nTop: 2.1, nBot: 2.4, egg: -0.14, asym: 0, rot: 0, noise: 0.012, seed: 121 });
      p.shadedFill(torso, bodyCol, shCol, LIGHT, 72);
      p.inkRing(torso, 8, 14);

      const head = blobPts(cx, 185, { a: 64, b: 78, nTop: 2.0, nBot: 2.3, egg: 0.12, asym: 0, rot: 0.04, noise: 0.01, seed: 122 });
      p.shadedFill(head, bodyCol, shCol, LIGHT, 64);
      p.inkRing(head, 8, 14);
      drawGlowingEyes(p, cx, 182, 22, 12, 9, eyeCol, 1);
      break;
    }
  }
}
