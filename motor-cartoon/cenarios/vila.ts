// Cenario: vila — Medieval / storybook village with cobblestone square (praca), stone well (poco),
// timber-framed houses, market stalls (mercado), tavern, and distant windmill (moinho).
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, cobbleHD, grassHD, stoneHD, planksHD, roofHD,
  addTree, addGabledHouse, addStreetLamp,
} from "./comum";

export function buildVila(): ScenarioResult {
  const group = new THREE.Group();

  const grassM = lam("vila_grass", () => ({ map: rep(grassHD(), 16, 16) }));
  const cobbleM = lam("vila_cobble", () => ({ map: rep(cobbleHD(), 10, 10) }));
  const stoneM = lam("vila_stone", () => ({ map: rep(stoneHD("vilaWell"), 2, 1) }));
  const woodM = lam("vila_wood", () => ({ map: rep(planksHD("#7a553a"), 2, 2) }));
  const roofM = lam("vila_roof", () => ({ map: rep(roofHD("#b85d47"), 2, 1) }));
  const clothR = lam("vila_clothR", () => ({ color: "#c94a3f" }));
  const clothB = lam("vila_clothB", () => ({ color: "#3d6fa8" }));

  // Ground
  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Cobblestone central plaza
  const plaza = mesh(new THREE.CircleGeometry(15, 48), cobbleM);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.02, 2);
  group.add(plaza);

  // Stone well at poco (1.8, 1.4) — offset slightly to (2.7, 1.4) so actor at (1.8, 1.4) stands right beside the well
  const well = new THREE.Group();
  well.position.set(2.7, 0, 1.4);
  const wWall = mesh(new THREE.CylinderGeometry(0.85, 0.92, 0.95, 16), stoneM);
  wWall.position.y = 0.475;
  well.add(wWall);
  for (const sx of [-0.72, 0.72]) {
    const post = mesh(new THREE.BoxGeometry(0.14, 1.4, 0.14), woodM);
    post.position.set(sx, 1.4, 0);
    well.add(post);
  }
  const wRoof = mesh(new THREE.ConeGeometry(1.15, 0.85, 4), roofM);
  wRoof.rotation.y = Math.PI / 4;
  wRoof.position.y = 2.45;
  well.add(wRoof);
  group.add(well);

  // Market stalls near mercado (0, 2.6) -> placed at (-2.8, 2.6) and (-2.8, -1.2)
  const addStall = (x: number, z: number, yaw: number, canopyMat: THREE.Material) => {
    const st = new THREE.Group();
    st.position.set(x, 0, z);
    st.rotation.y = yaw;
    const counter = mesh(new THREE.BoxGeometry(2.4, 0.85, 1.2), woodM);
    counter.position.y = 0.425;
    st.add(counter);
    for (const [px, pz] of [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]] as const) {
      const p = mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), woodM);
      p.position.set(px, 1.1, pz);
      st.add(p);
    }
    const canopy = mesh(new THREE.BoxGeometry(2.6, 0.18, 1.5), canopyMat);
    canopy.position.y = 2.25;
    canopy.rotation.x = 0.15;
    st.add(canopy);
    group.add(st);
  };
  addStall(-3.4, 2.4, 0.35, clothR);
  addStall(-3.2, -1.6, 0.2, clothB);

  // Storybook village houses around the square
  // casa mark is at (6.2, -3.2) -> place house at (9.2, 0, -3.2) facing -X
  addGabledHouse(group, 9.2, 0, -3.2, -Math.PI / 2, 5.8, 5.0, 4.2, 0);
  // taverna mark is at (7.6, 11.2) -> place tavern at (10.5, 0, 11.2) facing -X
  addGabledHouse(group, 10.5, 0, 11.2, -Math.PI / 2, 6.8, 5.6, 4.6, 3);
  addGabledHouse(group, -9.2, 0, -4.5, Math.PI / 2, 5.6, 4.8, 4.0, 1);
  addGabledHouse(group, -1.5, 0, -10.5, 0, 6.2, 5.0, 4.3, 4);
  addGabledHouse(group, 5.2, 0, -10.2, -0.25, 5.4, 4.8, 3.9, 2);

  // Windmill near moinho (-9, 12) -> placed at (-11.5, 0, 12)
  const mill = new THREE.Group();
  mill.position.set(-11.5, 0, 12);
  mill.rotation.y = 0.55;
  const tower = mesh(new THREE.CylinderGeometry(1.6, 2.4, 7.5, 16), stoneM);
  tower.position.y = 3.75;
  mill.add(tower);
  const cap = mesh(new THREE.ConeGeometry(1.9, 2.0, 16), roofM);
  cap.position.y = 8.5;
  mill.add(cap);
  for (let i = 0; i < 4; i++) {
    const blade = mesh(new THREE.BoxGeometry(0.55, 3.6, 0.08), woodM);
    blade.rotation.z = (i * Math.PI) / 2 + 0.3;
    blade.position.set(0, 6.6, 1.75);
    mill.add(blade);
  }
  group.add(mill);

  // Warm lanterns and trees
  addStreetLamp(group, 3.5, 0, 5.5, 4.2);
  addStreetLamp(group, -4.2, 0, 6.2, 4.2);
  addTree(group, -7.5, 0, -9.5, 5.5, 41, "round");
  addTree(group, 8.8, 0, 3.5, 5.2, 42, "round");
  addTree(group, -8.5, 0, 4.0, 5.0, 43, "round");

  return {
    group,
    marcas: {
      praca: { x: 0, z: 3.2 },
      poco: { x: 1.8, z: 1.4 },
      moinho: { x: -9, z: 12 },
      taverna: { x: 7.6, z: 11.2 },
      mercado: { x: 0, z: 2.6 },
      casa: { x: 6.2, z: -3.2 },
      alto: { x: 0, y: 1.5, z: 0 },
    },
  };
}
