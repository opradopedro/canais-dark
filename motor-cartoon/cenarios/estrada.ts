// Cenario: estrada — Lonely highway at night/dusk with KM 13 milestone sign at acostamento,
// wooden bus shelter at ponto, utility poles & lamps, guardrails, and dense pine/tree border.
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, ctex, asphaltTex, grassHD, planksHD, stoneHD,
  addTree, addStreetLamp, rough, ROCK,
} from "./comum";
import { NOINK } from "../src/ink";

const kmSignTex = () =>
  ctex("km13Sign", 256, 256, (g) => {
    g.fillStyle = "#1f6b45";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "#f4efe2";
    g.lineWidth = 14;
    g.strokeRect(14, 14, 228, 228);
    g.fillStyle = "#f4efe2";
    g.font = "900 54px Inter, sans-serif";
    g.textAlign = "center";
    g.fillText("KM", 128, 96);
    g.font = "900 104px Inter, sans-serif";
    g.fillText("13", 128, 204);
  });

export function buildEstrada(): ScenarioResult {
  const group = new THREE.Group();

  const groundM = lam("est_ground", () => ({ map: rep(grassHD(), 18, 18), color: "#8ba678" }));
  const gravelM = lam("est_gravel", () => ({ map: rep(stoneHD("estGrav"), 4, 24), color: "#9c9588" }));
  const roadM = lam("est_road", () => ({ map: rep(asphaltTex(), 3, 28) }));
  const yellowM = lam("est_yellow", () => ({ color: "#e6b83c" }));
  const whiteM = lam("est_white", () => ({ color: "#e8e4da" }));
  const woodM = lam("est_wood", () => ({ map: rep(planksHD("#8b684c"), 2, 2) }));
  const metalM = lam("est_metal", () => ({ color: "#9aa2b0" }));
  const rockM = lam("est_rock", () => ({ map: rep(ROCK(), 3, 3) }));

  // Ground
  const ground = mesh(new THREE.PlaneGeometry(180, 180), groundM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Gravel shoulders
  const shoulder = mesh(new THREE.BoxGeometry(9.6, 0.05, 140), gravelM);
  shoulder.position.set(0, 0.025, 0);
  group.add(shoulder);

  // Asphalt roadway
  const road = mesh(new THREE.BoxGeometry(6.6, 0.09, 140), roadM);
  road.position.set(0, 0.045, 0);
  group.add(road);

  // Side white edge lines
  for (const sx of [-3.05, 3.05]) {
    const line = mesh(new THREE.BoxGeometry(0.14, 0.095, 140), whiteM);
    line.position.set(sx, 0.048, 0);
    group.add(line);
  }

  // Center yellow dashed line
  for (let z = -60; z <= 60; z += 4.8) {
    const dash = mesh(new THREE.BoxGeometry(0.16, 0.095, 2.2), yellowM);
    dash.position.set(0, 0.048, z);
    group.add(dash);
  }

  // KM 13 Signpost at acostamento (-4.3, 1.4) so it sits right beside acostamento (-3.6, 2)
  const signGroup = new THREE.Group();
  signGroup.position.set(-4.35, 0, 1.2);
  signGroup.rotation.y = 0.25;
  const post = mesh(new THREE.CylinderGeometry(0.07, 0.08, 2.3, 8), woodM);
  post.position.y = 1.15;
  signGroup.add(post);
  const signMat = lam("km13Board", () => ({ map: kmSignTex() }));
  const board = mesh(new THREE.BoxGeometry(0.95, 0.95, 0.08), [woodM, woodM, woodM, woodM, signMat, signMat]);
  board.position.set(0, 2.1, 0);
  signGroup.add(board);
  group.add(signGroup);

  // Wooden roadside bus shelter at ponto (3.6, -4)
  const shelter = new THREE.Group();
  shelter.position.set(4.8, 0, -4.0);
  shelter.rotation.y = -Math.PI / 2;
  const pad = mesh(new THREE.BoxGeometry(3.4, 0.14, 2.2), gravelM);
  pad.position.y = 0.07;
  shelter.add(pad);
  for (const [px, pz] of [[-1.4, -0.8], [1.4, -0.8], [-1.4, 0.8], [1.4, 0.8]] as const) {
    const p = mesh(new THREE.BoxGeometry(0.16, 2.4, 0.16), woodM);
    p.position.set(px, 1.25, pz);
    shelter.add(p);
  }
  const backWall = mesh(new THREE.BoxGeometry(2.9, 1.9, 0.12), woodM);
  backWall.position.set(0, 1.2, -0.8);
  shelter.add(backWall);
  const bench = mesh(new THREE.BoxGeometry(2.5, 0.12, 0.55), woodM);
  bench.position.set(0, 0.55, -0.45);
  shelter.add(bench);
  const roof = mesh(new THREE.BoxGeometry(3.4, 0.18, 2.5), woodM);
  roof.position.set(0, 2.5, 0.05);
  roof.rotation.x = 0.14;
  shelter.add(roof);
  group.add(shelter);

  // Guardrail along right shoulder beyond the bus stop
  for (let z = -28; z <= -8; z += 2.5) {
    const gp = mesh(new THREE.BoxGeometry(0.12, 0.75, 0.12), metalM);
    gp.position.set(4.2, 0.375, z);
    group.add(gp);
  }
  const rail = mesh(new THREE.BoxGeometry(0.1, 0.24, 20.5), metalM);
  rail.position.set(4.12, 0.58, -18);
  group.add(rail);

  // Highway lamps along the road
  addStreetLamp(group, 4.4, 0, -3.2, 5.0);
  addStreetLamp(group, -4.4, 0, 8.0, 5.0);
  addStreetLamp(group, 4.4, 0, -18.0, 5.0);
  addStreetLamp(group, -4.4, 0, -28.0, 5.0);

  // Forest border on both sides (especially near beira_mato at (-8.5, -8))
  const trees: [number, number, number, "pine" | "round" | "dead"][] = [
    [-9.8, -9.5, 6.2, "pine"],
    [-11.2, -6.5, 5.8, "pine"],
    [-8.2, -12.5, 5.4, "dead"],
    [-10.5, -2.0, 6.4, "pine"],
    [-9.0, 4.5, 5.6, "round"],
    [-11.5, 11.0, 6.5, "pine"],
    [-9.5, -18.5, 6.8, "pine"],
    [-7.8, -26.0, 6.2, "pine"],
    [9.2, -10.5, 6.0, "pine"],
    [10.8, -2.5, 6.4, "pine"],
    [9.5, 6.0, 5.8, "round"],
    [11.0, 13.5, 6.2, "pine"],
    [8.8, -20.0, 6.6, "pine"],
    [9.6, -28.0, 6.0, "dead"],
  ];
  trees.forEach(([tx, tz, th, kind], i) => addTree(group, tx, 0, tz, th, i + 10, kind));

  // Boulders near shoulder & woods
  for (const [bx, bz, br] of [[-6.5, -7.2, 0.85], [-7.4, -10.2, 0.65], [6.8, -14.0, 0.9], [-5.8, -22.0, 1.1]] as const) {
    const b = mesh(rough(new THREE.IcosahedronGeometry(br, 2), br * 0.28, 1.4, bx, false), rockM);
    b.position.set(bx, br * 0.35, bz);
    b.scale.y = 0.72;
    group.add(b);
  }

  // Distant rounded forest hills on the horizon
  for (const [mx, mz, mr, mh] of [[-60, -150, 50, 7], [55, -155, 55, 8], [0, -170, 60, 9]] as const) {
    const mt = mesh(
      rough(new THREE.SphereGeometry(mr, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0.8, 0.12, mx, false),
      groundM,
      false
    );
    mt.scale.y = mh / mr;
    mt.position.set(mx, -1, mz);
    group.add(mt);
  }

  return {
    group,
    marcas: {
      meio: { x: 0, z: 0 },
      vindo: { x: 0.8, z: 12 },
      indo: { x: -0.8, z: -12 },
      acostamento: { x: -3.6, z: 2 },
      ponto: { x: 3.6, z: -4 },
      curva: { x: 0, z: -24 },
      beira_mato: { x: -8.5, z: -8 },
    },
  };
}
