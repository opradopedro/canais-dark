// Cenario: casa_interior — Cozy yet atmospheric interior room with wooden plank floor,
// sofa, coffee table, glowing window with curtains, doorway, kitchen counter, and bed corner.
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, planksHD, brick, ctex,
} from "./comum";
import { NOINK } from "../src/ink";

const rugTex = () =>
  ctex("casaRug", 512, 512, (g) => {
    g.fillStyle = "#8a3632";
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "#d9b36c";
    g.lineWidth = 18;
    g.strokeRect(28, 28, 456, 456);
    g.strokeStyle = "#422026";
    g.lineWidth = 8;
    g.strokeRect(52, 52, 408, 408);
  });

export function buildCasaInterior(): ScenarioResult {
  const group = new THREE.Group();

  const floorM = lam("casa_floor", () => ({ map: rep(planksHD("#8f623f"), 4, 4) }));
  const wallM = lam("casa_wall", () => ({ color: "#d8ccb8" }));
  const trimM = lam("casa_trim", () => ({ color: "#5c402c" }));
  const sofaM = lam("casa_sofa", () => ({ color: "#3d5e73" }));
  const woodM = lam("casa_wood", () => ({ map: rep(planksHD("#6b472c"), 2, 1) }));
  const cabM = lam("casa_cab", () => ({ color: "#dcd4c4" }));
  const bedM = lam("casa_bed", () => ({ color: "#9c4b47" }));
  const rugM = lam("casa_rug", () => ({ map: rugTex() }));

  // Room dimensions: x in [-6, 6], z in [-5.2, 5.2], h = 3.4
  const floor = mesh(new THREE.BoxGeometry(12.4, 0.16, 10.8), floorM);
  floor.position.set(0, -0.08, 0);
  group.add(floor);

  // Back wall (z = -5.2), Left wall (x = -6.0), Right wall (x = 6.0)
  // Front side (z = +5.2) is kept low/open above door so cameras looking in never hit wall backs
  const backWall = mesh(new THREE.BoxGeometry(12.4, 3.6, 0.25), wallM);
  backWall.position.set(0, 1.8, -5.2);
  group.add(backWall);

  const leftWall = mesh(new THREE.BoxGeometry(0.25, 3.6, 10.8), wallM);
  leftWall.position.set(-6.0, 1.8, 0);
  group.add(leftWall);

  const rightWall = mesh(new THREE.BoxGeometry(0.25, 3.6, 10.8), wallM);
  rightWall.position.set(6.0, 1.8, 0);
  group.add(rightWall);

  // Teto (sem sombra): de dia o ceu aparecia por cima do comodo
  const ceilM = lam("casa_ceil", () => ({ color: "#efe6d6" }));
  const ceil = mesh(new THREE.BoxGeometry(12.4, 0.12, 10.8), ceilM, false);
  ceil.position.set(0, 3.62, 0);
  ceil.castShadow = false;
  group.add(ceil);

  // Baseboards
  const bbBack = mesh(new THREE.BoxGeometry(12.2, 0.18, 0.3), trimM);
  bbBack.position.set(0, 0.09, -5.15);
  group.add(bbBack);

  // Rug in living room (sala: (-2.2, 0.4))
  const rug = mesh(new THREE.BoxGeometry(3.6, 0.02, 2.6), rugM);
  rug.position.set(-2.2, 0.01, -0.4);
  group.add(rug);

  // Sofa near (-2.9, -2.4) — placed at (-2.9, -3.2) facing +Z so actor at (-2.9, -2.4) stands/sits right in front of it
  const sofa = new THREE.Group();
  sofa.position.set(-2.9, 0, -3.2);
  const seat = mesh(new THREE.BoxGeometry(2.4, 0.45, 0.95), sofaM);
  seat.position.set(0, 0.25, 0);
  sofa.add(seat);
  const back = mesh(new THREE.BoxGeometry(2.4, 0.95, 0.28), sofaM);
  back.position.set(0, 0.62, -0.36);
  sofa.add(back);
  for (const ax of [-1.1, 1.1]) {
    const arm = mesh(new THREE.BoxGeometry(0.26, 0.68, 0.98), sofaM);
    arm.position.set(ax, 0.4, 0);
    sofa.add(arm);
  }
  group.add(sofa);

  // Coffee table & warm table lamp
  const table = mesh(new THREE.BoxGeometry(1.3, 0.42, 0.7), woodM);
  table.position.set(-2.2, 0.21, -1.2);
  group.add(table);

  // Floor lamp in living corner (-4.8, -4.2)
  const lampStand = mesh(new THREE.CylinderGeometry(0.05, 0.18, 1.65, 10), trimM);
  lampStand.position.set(-4.8, 0.82, -4.2);
  group.add(lampStand);
  const shadeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.7, 1.0), fog: false });
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.45, 12), shadeMat);
  lampShade.position.set(-4.8, 1.72, -4.2);
  lampShade.layers.set(NOINK);
  group.add(lampShade);

  // Window on back wall near janela (-1.2, -2.6) -> mounted at (-1.2, 1.75, -5.04)
  const winFrame = mesh(new THREE.BoxGeometry(1.9, 1.5, 0.12), trimM);
  winFrame.position.set(-1.2, 1.75, -5.05);
  group.add(winFrame);
  const glassMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.78, 1.25), fog: false });
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.25), glassMat);
  winGlass.position.set(-1.2, 1.75, -4.98);
  winGlass.layers.set(NOINK);
  group.add(winGlass);
  // Window mullions
  const mulV = mesh(new THREE.BoxGeometry(0.06, 1.3, 0.14), trimM);
  mulV.position.set(-1.2, 1.75, -5.02);
  group.add(mulV);
  const mulH = mesh(new THREE.BoxGeometry(1.7, 0.06, 0.14), trimM);
  mulH.position.set(-1.2, 1.75, -5.02);
  group.add(mulH);

  // Kitchen area near cozinha (2.4, -2.5) — counter along back/right wall
  const counter = mesh(new THREE.BoxGeometry(3.2, 0.9, 0.85), cabM);
  counter.position.set(2.8, 0.45, -4.5);
  group.add(counter);
  const counterTop = mesh(new THREE.BoxGeometry(3.3, 0.08, 0.92), trimM);
  counterTop.position.set(2.8, 0.92, -4.5);
  group.add(counterTop);
  const fridge = mesh(new THREE.BoxGeometry(0.95, 2.0, 0.9), cabM);
  fridge.position.set(4.9, 1.0, -4.4);
  group.add(fridge);

  // Bedroom area near quarto (2.0, 2.2) — bed against right wall
  const bed = new THREE.Group();
  bed.position.set(3.8, 0, 2.2);
  const frame = mesh(new THREE.BoxGeometry(2.2, 0.38, 1.6), woodM);
  frame.position.y = 0.19;
  bed.add(frame);
  const mattress = mesh(new THREE.BoxGeometry(2.05, 0.26, 1.48), bedM);
  mattress.position.y = 0.45;
  bed.add(mattress);
  const pillow = mesh(new THREE.BoxGeometry(0.55, 0.16, 1.1), cabM);
  pillow.position.set(0.65, 0.62, 0);
  bed.add(pillow);
  const headB = mesh(new THREE.BoxGeometry(0.16, 1.15, 1.65), woodM);
  headB.position.set(1.05, 0.58, 0);
  bed.add(headB);
  group.add(bed);

  // Doorway frame near porta (0.6, 2.9) — freestanding door frame at (0.6, 0, 3.6) so camera isn't blocked by a full wall
  const doorFrame = mesh(new THREE.BoxGeometry(1.25, 2.35, 0.18), trimM);
  doorFrame.position.set(0.6, 1.18, 3.8);
  group.add(doorFrame);
  const doorPanel = mesh(new THREE.BoxGeometry(1.05, 2.2, 0.22), woodM);
  doorPanel.position.set(0.6, 1.1, 3.8);
  group.add(doorPanel);

  return {
    group,
    limites: { x: 5.5, z: 4.8, h: 3.0 },
    marcas: {
      sala: { x: -2.2, z: 0.4 },
      sofa: { x: -2.9, z: -2.4 },
      cozinha: { x: 2.4, z: -2.5 },
      quarto: { x: 2.0, z: 2.2 },
      janela: { x: -1.2, z: -2.6 },
      porta: { x: 0.6, z: 2.9 },
    },
  };
}
