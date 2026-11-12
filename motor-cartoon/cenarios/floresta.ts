// Cenario: floresta — Dense storybook forest with dirt trail, moonlit clearing, tree stump (toco),
// wooden watchtower base (pe_torre), mossy boulders, and layered pines/oaks.
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, grassHD, stoneHD, planksHD,
  addTree, rough, ROCK,
} from "./comum";

export function buildFloresta(): ScenarioResult {
  const group = new THREE.Group();

  const grassM = lam("flor_grass", () => ({ map: rep(grassHD(), 16, 16) }));
  const pathM = lam("flor_path", () => ({ map: rep(stoneHD("florDirt"), 2, 12), color: "#9c8262" }));
  const barkM = lam("flor_bark", () => ({ color: "#6e4932" }));
  const woodM = lam("flor_wood", () => ({ map: rep(planksHD("#7d5c41"), 2, 2) }));
  const rockM = lam("flor_rock", () => ({ map: rep(ROCK(), 3, 3) }));

  // Forest ground
  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Dirt trail winding from trilha (-1.5, 8.5) through clareira (1.2, 3.4) to fundo (0, -9)
  const trail = mesh(rough(new THREE.BoxGeometry(2.8, 0.08, 36, 6, 1, 24), 0.18, 0.3, 7, false), pathM);
  trail.position.set(-0.2, 0.03, 0);
  group.add(trail);

  // Clearing moss circle around clareira (1.2, 3.4)
  const clearing = mesh(new THREE.CircleGeometry(4.8, 32), lam("flor_clear", () => ({ color: "#5f9e49" })));
  clearing.rotation.x = -Math.PI / 2;
  clearing.position.set(1.2, 0.02, 3.4);
  group.add(clearing);

  // Tree stump at toco (2.2, -0.6)
  const stump = new THREE.Group();
  stump.position.set(2.2, 0, -0.6);
  const stBody = mesh(rough(new THREE.CylinderGeometry(0.48, 0.62, 0.72, 16), 0.05, 2.0, 3), barkM);
  stBody.position.y = 0.36;
  stump.add(stBody);
  const stTop = mesh(new THREE.CircleGeometry(0.46, 16), lam("stumpTop", () => ({ color: "#c9a87a" })));
  stTop.rotation.x = -Math.PI / 2;
  stTop.position.y = 0.725;
  stump.add(stTop);
  group.add(stump);

  // Wooden watchtower / ranger tower at pe_torre (3.0, -1.6) — offset slightly to (4.2, -2.4) so actor at (3.0, -1.6) stands at its foot
  const tower = new THREE.Group();
  tower.position.set(4.2, 0, -2.4);
  for (const [lx, lz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]] as const) {
    const leg = mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.2, 8), woodM);
    leg.position.set(lx, 3.1, lz);
    tower.add(leg);
  }
  // Cross braces
  for (const h of [1.8, 3.8]) {
    const b1 = mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), woodM);
    b1.position.set(0, h, -1.1);
    tower.add(b1);
    const b2 = mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), woodM);
    b2.position.set(0, h, 1.1);
    tower.add(b2);
  }
  // Platform & cabin top
  const plat = mesh(new THREE.BoxGeometry(3.0, 0.22, 3.0), woodM);
  plat.position.set(0, 5.8, 0);
  tower.add(plat);
  const roof = mesh(new THREE.ConeGeometry(2.4, 1.6, 4), woodM);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 7.6, 0);
  tower.add(roof);
  group.add(tower);

  // Boulders scattered around clearing and woods
  for (const [bx, bz, br] of [[-3.8, 2.2, 0.9], [4.5, 4.8, 0.75], [-5.2, -4.0, 1.1], [2.8, -7.5, 0.85], [-2.4, -11.0, 1.2]] as const) {
    const b = mesh(rough(new THREE.IcosahedronGeometry(br, 2), br * 0.3, 1.5, bx, false), rockM);
    b.position.set(bx, br * 0.35, bz);
    b.scale.y = 0.7;
    group.add(b);
  }

  // Dense ring of pines and oaks (leaving camera corridors open around marks)
  const trees: [number, number, number, "pine" | "round" | "dead"][] = [
    [-5.8, 6.5, 5.8, "pine"],
    [5.8, 7.2, 5.4, "round"],
    [-6.2, 0.5, 6.2, "pine"],
    [-9.2, -6.2, 6.6, "pine"],
    [-6.4, -8.8, 5.8, "dead"],
    [-8.5, -10.5, 6.4, "pine"],
    [6.8, -6.2, 6.0, "pine"],
    [7.5, 1.2, 5.6, "round"],
    [-4.2, -13.5, 6.8, "pine"],
    [0.5, -15.0, 7.0, "pine"],
    [4.8, -13.2, 6.4, "round"],
    [-11.0, 3.5, 6.5, "pine"],
    [10.5, -3.5, 6.8, "pine"],
    [-3.5, 13.0, 5.8, "round"],
    [3.8, 12.5, 6.0, "pine"],
  ];
  trees.forEach(([tx, tz, th, kind], i) => addTree(group, tx, 0, tz, th, i + 20, kind));

  return {
    group,
    marcas: {
      clareira: { x: 1.2, z: 3.4 },
      trilha: { x: -1.5, z: 8.5 },
      entre_arvores: { x: -7.5, z: -7 },
      pe_torre: { x: 3.0, z: -1.6 },
      fundo: { x: 0, z: -9 },
      toco: { x: 2.2, z: -0.6 },
    },
  };
}
