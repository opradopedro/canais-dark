// Cenario: bairro — Suburban street with asphalt road, crosswalk, sidewalks, picket fences,
// storybook gabled houses on both sides, street lamps with warm glow, and background hills/trees.
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, asphaltTex, cobbleHD, grassHD, planksHD,
  addTree, addGabledHouse, addStreetLamp, rough, ROCK,
} from "./comum";
import { NOINK } from "../src/ink";

export function buildBairro(): ScenarioResult {
  const group = new THREE.Group();

  const grassM = lam("bairro_grass", () => ({ map: rep(grassHD(), 16, 16) }));
  const roadM = lam("bairro_road", () => ({ map: rep(asphaltTex(), 4, 24) }));
  const walkM = lam("bairro_walk", () => ({ map: rep(cobbleHD(), 3, 24) }));
  const stripeM = lam("bairro_stripe", () => ({ color: "#f2ead8" }));
  const fenceM = lam("bairro_fence", () => ({ map: rep(planksHD("#d9ccb8"), 2, 1) }));
  const rockM = lam("bairro_rock", () => ({ map: rep(ROCK(), 3, 3) }));

  // Ground lawn
  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Asphalt road along Z (-60..60), width 7.2m
  const road = mesh(new THREE.BoxGeometry(7.2, 0.06, 120), roadM);
  road.position.set(0, 0.03, 0);
  group.add(road);

  // Sidewalks on both sides (x = -4.5 and x = +4.5)
  for (const sx of [-4.5, 4.5]) {
    const sw = mesh(new THREE.BoxGeometry(1.8, 0.14, 120), walkM);
    sw.position.set(sx, 0.07, 0);
    group.add(sw);
  }

  // Center dashed line
  for (let z = -45; z <= 45; z += 4.5) {
    if (z >= -6 && z <= -2) continue; // leave space for crosswalk
    const dash = mesh(new THREE.BoxGeometry(0.18, 0.07, 2.0), stripeM);
    dash.position.set(0, 0.04, z);
    group.add(dash);
  }

  // Crosswalk at z = -4 (marca: faixa)
  for (let x = -2.8; x <= 2.8; x += 0.8) {
    const cw = mesh(new THREE.BoxGeometry(0.45, 0.075, 2.4), stripeM);
    cw.position.set(x, 0.042, -4);
    group.add(cw);
  }

  // Houses on right (x > 0) and left (x < 0)
  addGabledHouse(group, 9.2, 0, -2, -Math.PI / 2, 6.2, 5.4, 4.2, 0); // frente_casa at (5.4, -2)
  addGabledHouse(group, 9.5, 0, -12, -Math.PI / 2, 5.8, 5.0, 3.9, 1);
  addGabledHouse(group, 9.4, 0, 8, -Math.PI / 2, 6.0, 5.2, 4.5, 2);
  addGabledHouse(group, -9.4, 0, 2, Math.PI / 2, 6.0, 5.2, 4.1, 3);
  addGabledHouse(group, -9.6, 0, -9, Math.PI / 2, 5.6, 5.0, 3.8, 4);
  addGabledHouse(group, -9.2, 0, 12, Math.PI / 2, 6.2, 5.2, 4.3, 5);

  // Front walkway to main house at (5.4, -2)
  const path = mesh(new THREE.BoxGeometry(3.6, 0.1, 1.4), walkM);
  path.position.set(5.8, 0.05, -2);
  group.add(path);

  // Low wooden fences along yards
  for (const sx of [-5.6, 5.6]) {
    for (let z = -18; z <= 16; z += 2.4) {
      if (sx > 0 && Math.abs(z - -2) < 1.8) continue;
      const post = mesh(new THREE.BoxGeometry(0.14, 0.95, 0.14), fenceM);
      post.position.set(sx, 0.475, z);
      group.add(post);
      const rail = mesh(new THREE.BoxGeometry(0.08, 0.12, 2.4), fenceM);
      rail.position.set(sx, 0.72, z + 1.2);
      group.add(rail);
      const rail2 = mesh(new THREE.BoxGeometry(0.08, 0.12, 2.4), fenceM);
      rail2.position.set(sx, 0.36, z + 1.2);
      group.add(rail2);
    }
  }

  // Street lamps (marca: poste at (3.4, 9))
  addStreetLamp(group, 3.8, 0, 9, 4.6);
  addStreetLamp(group, -3.8, 0, 1, 4.6);
  addStreetLamp(group, 3.8, 0, -7, 4.6);
  addStreetLamp(group, -3.8, 0, -15, 4.6);

  // Trees along yards and at the end of the street (marca: arvores at (0, -24))
  const treeSpots: [number, number, number, "round" | "pine"][] = [
    [-6.8, 6.5, 4.8, "round"],
    [6.8, 3.5, 4.4, "round"],
    [-7.2, -4.5, 5.2, "round"],
    [7.0, -7.0, 4.6, "round"],
    [-6.5, -15.0, 5.0, "pine"],
    [6.5, -16.0, 5.2, "pine"],
    [-3.5, -25.0, 6.0, "pine"],
    [0.0, -27.0, 6.4, "round"],
    [3.8, -25.5, 5.8, "pine"],
    [-8.0, -23.0, 5.5, "round"],
    [8.2, -23.5, 5.5, "round"],
  ];
  treeSpots.forEach(([tx, tz, th, kind], i) => addTree(group, tx, 0, tz, th, i + 1, kind));

  // Distant hills closing the horizon
  for (const [hx, hz, rad, h] of [[-28, -48, 26, 14], [24, -52, 30, 16], [0, -58, 34, 18]] as const) {
    const hill = mesh(rough(new THREE.SphereGeometry(rad, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0.8, 0.15, hx, false), grassM, false);
    hill.scale.y = h / rad;
    hill.position.set(hx, -0.5, hz);
    group.add(hill);
  }

  return {
    group,
    marcas: {
      rua: { x: 0, z: 0 },
      faixa: { x: 0, z: -4 },
      calcada: { x: -4.2, z: 4 },
      frente_casa: { x: 5.4, z: -2 },
      poste: { x: 3.4, z: 9 },
      arvores: { x: 0, z: -24 },
      fim_rua: { x: 0, z: -18 },
    },
  };
}
