// Cenario: cemiterio — Atmospheric gothic graveyard with wrought-iron entrance gate,
// stone tombstones and crosses, stone mausoleum, dead gnarled trees, and gravel path.
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, grassHD, stoneHD, cobbleHD,
  addTree, addStreetLamp, rough, ROCK,
} from "./comum";

export function buildCemiterio(): ScenarioResult {
  const group = new THREE.Group();

  const grassM = lam("cem_grass", () => ({ map: rep(grassHD(), 16, 16), color: "#6c8c64" }));
  const pathM = lam("cem_path", () => ({ map: rep(cobbleHD(), 3, 18), color: "#9c968e" }));
  const stoneM = lam("cem_stone", () => ({ map: rep(stoneHD("cemStone"), 2, 2) }));
  const darkStoneM = lam("cem_dstone", () => ({ map: rep(ROCK(), 2, 2), color: "#807a78" }));
  const ironM = lam("cem_iron", () => ({ color: "#2b2f38" }));

  // Ground
  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Cobblestone central path from entrada (0, 9) to fundo (0, -9)
  const path = mesh(new THREE.BoxGeometry(2.8, 0.06, 32), pathM);
  path.position.set(0, 0.03, 0);
  group.add(path);

  // Entrance gate pillars & iron fence at z = 11.5 (behind entrada (0, 9))
  for (const sx of [-2.1, 2.1]) {
    const pil = mesh(new THREE.BoxGeometry(0.85, 3.2, 0.85), stoneM);
    pil.position.set(sx, 1.6, 11.5);
    group.add(pil);
    const cap = mesh(new THREE.ConeGeometry(0.68, 0.55, 4), darkStoneM);
    cap.rotation.y = Math.PI / 4;
    cap.position.set(sx, 3.45, 11.5);
    group.add(cap);
  }
  // Iron arch over gate
  const arch = mesh(new THREE.BoxGeometry(4.4, 0.22, 0.16), ironM);
  arch.position.set(0, 3.05, 11.5);
  group.add(arch);

  // Iron perimeter fence along z = 11.5
  for (const side of [-1, 1]) {
    for (let x = 2.8; x <= 14; x += 0.6) {
      const bar = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), ironM);
      bar.position.set(side * x, 1.1, 11.5);
      group.add(bar);
    }
    const rail = mesh(new THREE.BoxGeometry(11.6, 0.1, 0.1), ironM);
    rail.position.set(side * 8.4, 1.9, 11.5);
    group.add(rail);
  }

  // Helper to place stone cross or headstone
  const addCross = (x: number, z: number, scale = 1, yaw = 0) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    const base = mesh(new THREE.BoxGeometry(0.8 * scale, 0.35 * scale, 0.5 * scale), darkStoneM);
    base.position.y = 0.175 * scale;
    g.add(base);
    const vert = mesh(new THREE.BoxGeometry(0.28 * scale, 1.65 * scale, 0.24 * scale), stoneM);
    vert.position.y = 1.1 * scale;
    g.add(vert);
    const horz = mesh(new THREE.BoxGeometry(0.95 * scale, 0.26 * scale, 0.26 * scale), stoneM);
    horz.position.y = 1.42 * scale;
    g.add(horz);
    group.add(g);
  };

  const addHeadstone = (x: number, z: number, yaw = 0) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    const base = mesh(new THREE.BoxGeometry(0.85, 0.25, 0.45), darkStoneM);
    base.position.y = 0.125;
    g.add(base);
    const slab = mesh(new THREE.BoxGeometry(0.72, 1.15, 0.22), stoneM);
    slab.position.y = 0.7;
    g.add(slab);
    group.add(g);
  };

  // Rows of crosses & headstones around entre_cruzes (0, 0)
  addCross(-2.6, 3.5, 0.9, 0.08);
  addHeadstone(-4.2, 2.8, -0.05);
  addCross(2.6, 3.2, 0.95, -0.06);
  addHeadstone(4.4, 2.4, 0.1);
  addCross(-2.8, -1.2, 1.0, -0.04);
  addHeadstone(-4.6, -2.0, 0.08);
  addCross(2.7, -1.5, 0.9, 0.05);
  addHeadstone(4.5, -2.8, -0.07);
  addHeadstone(-3.4, -5.2, 0.04);

  // Monumental stone cross at cruz_grande (-2.2, -8) — placed at (-2.8, -8.8) so actor at (-2.2, -8) stands right beside it
  addCross(-2.8, -8.8, 2.1, 0.12);

  // Gothic stone Mausoleum at mausoleu (3.4, -6.4) — placed at (4.8, -7.2) facing -X/+Z
  const maus = new THREE.Group();
  maus.position.set(5.0, 0, -7.2);
  maus.rotation.y = -0.35;
  const mBase = mesh(new THREE.BoxGeometry(4.4, 0.45, 3.8), darkStoneM);
  mBase.position.y = 0.225;
  maus.add(mBase);
  const mBody = mesh(new THREE.BoxGeometry(3.8, 3.2, 3.2), stoneM);
  mBody.position.y = 2.0;
  maus.add(mBody);
  const mRoof = mesh(new THREE.ConeGeometry(3.1, 1.5, 4), darkStoneM);
  mRoof.rotation.y = Math.PI / 4;
  mRoof.position.y = 4.35;
  maus.add(mRoof);
  const mDoor = mesh(new THREE.BoxGeometry(1.2, 2.2, 0.18), ironM);
  mDoor.position.set(0, 1.5, 1.62);
  maus.add(mDoor);
  group.add(maus);

  // Dead gnarled tree at arvore_morta (6, 1.5) -> placed at (6.8, 1.5)
  addTree(group, 6.8, 0, 1.5, 5.8, 31, "dead");
  addTree(group, -6.5, 0, 5.5, 5.2, 32, "dead");
  addTree(group, -7.2, 0, -6.5, 6.2, 33, "pine");
  addTree(group, 7.8, 0, -11.0, 6.4, 34, "pine");
  addTree(group, -3.5, 0, -14.0, 6.0, 35, "dead");
  addTree(group, 2.5, 0, -15.0, 6.5, 36, "pine");

  // Warm iron lamp near gate
  addStreetLamp(group, -2.6, 0, 8.2, 4.2);

  return {
    group,
    marcas: {
      entrada: { x: 0, z: 9 },
      entre_cruzes: { x: 0, z: 0 },
      cruz_grande: { x: -2.2, z: -8 },
      mausoleu: { x: 3.4, z: -6.4 },
      fundo: { x: 0, z: -9 },
      arvore_morta: { x: 6, z: 1.5 },
    },
  };
}
