// Cenario: templo_oriental — Traditional East Asian temple courtyard with crimson Torii gate,
// arched wooden bridge, stone steps (escada), pagoda hall (templo), glowing stone lantern, and cherry blossom trees.
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, grassHD, stoneHD, cobbleHD, roofHD,
  addTree, rough, ROCK,
} from "./comum";
import { NOINK } from "../src/ink";

export function buildTemploOriental(): ScenarioResult {
  const group = new THREE.Group();

  const grassM = lam("temp_grass", () => ({ map: rep(grassHD(), 16, 16) }));
  const stoneM = lam("temp_stone", () => ({ map: rep(stoneHD("tempSt"), 3, 3) }));
  const pathM = lam("temp_path", () => ({ map: rep(cobbleHD(), 3, 12) }));
  const redM = lam("temp_red", () => ({ color: "#c4352b" }));
  const goldM = lam("temp_gold", () => ({ color: "#e3b13b" }));
  const wallM = lam("temp_wall", () => ({ color: "#ede0c5" }));
  const roofM = lam("temp_roof", () => ({ map: rep(roofHD("#2f5266", true), 4, 2) }));
  const rockM = lam("temp_rock", () => ({ map: rep(ROCK(), 3, 3) }));

  // Ground
  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Stone courtyard & walkway
  const walk = mesh(new THREE.BoxGeometry(3.4, 0.08, 24), pathM);
  walk.position.set(0, 0.04, 2);
  group.add(walk);

  // Main Temple Hall behind templo (0, -1.2) -> positioned at (0, 0, -6.2) so actors at templo (0, -1.2) and escada (-1.5, -1.3) stand in front of its grand steps
  const hall = new THREE.Group();
  hall.position.set(0, 0, -6.2);
  const podium = mesh(new THREE.BoxGeometry(13.5, 1.2, 8.4), stoneM);
  podium.position.set(0, 0.6, 0);
  hall.add(podium);

  // Stone steps (escada) leading up the front of the podium
  for (let i = 0; i < 4; i++) {
    const step = mesh(new THREE.BoxGeometry(4.6, 0.3, 0.8), stoneM);
    step.position.set(0, 0.15 + i * 0.3, 4.4 - i * 0.35);
    hall.add(step);
  }

  // Temple walls & red pillars
  const innerWall = mesh(new THREE.BoxGeometry(10.2, 3.8, 5.4), wallM);
  innerWall.position.set(0, 3.1, -0.4);
  hall.add(innerWall);

  for (const px of [-5.2, -2.8, 2.8, 5.2]) {
    const col = mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.0, 14), redM);
    col.position.set(px, 3.2, 2.6);
    hall.add(col);
  }

  // Tiered pagoda roof
  const addPagodaRoof = (w: number, d: number, h: number, y: number) => {
    const rg = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    rg.rotateY(Math.PI / 4);
    const rm = mesh(rg, roofM);
    rm.scale.set(w, h, d);
    rm.position.set(0, y + h / 2, 0);
    hall.add(rm);
    const ridge = mesh(new THREE.BoxGeometry(w * 0.36, 0.2, 0.22), goldM);
    ridge.position.set(0, y + h - 0.05, 0);
    hall.add(ridge);
  };
  addPagodaRoof(15.2, 10.2, 2.3, 5.0);
  const upperWall = mesh(new THREE.BoxGeometry(7.2, 1.8, 4.2), wallM);
  upperWall.position.set(0, 7.1, 0);
  hall.add(upperWall);
  addPagodaRoof(10.6, 7.2, 1.9, 7.9);
  group.add(hall);

  // Crimson Torii gate at torii (0, 4.2) — pillars at x = -2.2 and +2.2 so actor at (0, 4.2) stands right under the gate
  const torii = new THREE.Group();
  torii.position.set(0, 0, 4.2);
  for (const sx of [-2.2, 2.2]) {
    const p = mesh(new THREE.CylinderGeometry(0.24, 0.28, 4.4, 14), redM);
    p.position.set(sx, 2.2, 0);
    torii.add(p);
    const base = mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.35, 14), stoneM);
    base.position.set(sx, 0.175, 0);
    torii.add(base);
  }
  const topBeam = mesh(new THREE.BoxGeometry(6.0, 0.34, 0.42), redM);
  topBeam.position.set(0, 4.35, 0);
  torii.add(topBeam);
  const subBeam = mesh(new THREE.BoxGeometry(5.1, 0.22, 0.28), redM);
  subBeam.position.set(0, 3.65, 0);
  torii.add(subBeam);
  group.add(torii);

  // Stone lantern (Toro) near lanterna (1.8, -1.0) -> placed at (2.65, 0, -1.0)
  const lant = new THREE.Group();
  lant.position.set(2.65, 0, -1.0);
  const lPed = mesh(new THREE.CylinderGeometry(0.22, 0.34, 1.35, 8), stoneM);
  lPed.position.y = 0.675;
  lant.add(lPed);
  const lGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.42, 0.36),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.8, 0.9), fog: false })
  );
  lGlow.position.y = 1.55;
  lGlow.layers.set(NOINK);
  lant.add(lGlow);
  const lCap = mesh(new THREE.ConeGeometry(0.58, 0.42, 6), stoneM);
  lCap.position.y = 1.95;
  lant.add(lCap);
  group.add(lant);

  // Arched wooden bridge at ponte (3.6, 1) -> placed at (4.8, 0, 1.0) over a lotus pond
  const pond = mesh(new THREE.CircleGeometry(3.2, 28), lam("temp_pond", () => ({ color: "#4d91a6" })));
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(4.8, 0.02, 1.0);
  group.add(pond);
  const bridge = new THREE.Group();
  bridge.position.set(4.8, 0, 1.0);
  const deck = mesh(new THREE.BoxGeometry(2.2, 0.22, 4.2), redM);
  deck.position.y = 0.38;
  bridge.add(deck);
  for (const sx of [-0.95, 0.95]) {
    const rail = mesh(new THREE.BoxGeometry(0.12, 0.65, 4.2), redM);
    rail.position.set(sx, 0.72, 0);
    bridge.add(rail);
  }
  group.add(bridge);

  // Cherry blossom trees & garden boulders near jardim (-5.4, 4.4)
  addTree(group, -6.4, 0, 4.8, 4.8, 51, "cherry");
  addTree(group, -5.8, 0, -2.5, 5.2, 52, "cherry");
  addTree(group, 6.8, 0, 4.5, 5.0, 53, "cherry");
  addTree(group, 7.2, 0, -3.5, 5.6, 54, "pine");
  addTree(group, -7.8, 0, -8.5, 6.2, 55, "pine");

  for (const [bx, bz, br] of [[-4.4, 3.8, 0.75], [-6.2, 2.2, 0.95], [5.8, -1.8, 0.8]] as const) {
    const b = mesh(rough(new THREE.IcosahedronGeometry(br, 2), br * 0.28, 1.4, bx, false), rockM);
    b.position.set(bx, br * 0.35, bz);
    b.scale.y = 0.7;
    group.add(b);
  }

  return {
    group,
    marcas: {
      templo: { x: 0, z: -1.2 },
      torii: { x: 0, z: 4.2 },
      ponte: { x: 3.6, z: 1 },
      escada: { x: -1.5, z: -1.3 },
      jardim: { x: -5.4, z: 4.4 },
      lanterna: { x: 1.8, z: -1.0 },
    },
  };
}
