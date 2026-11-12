// Cenario: hospital — Long clinical corridor with checkered floor tiles, two-tone walls,
// Room 418 door with glowing red call light above it, nurses' reception desk, and stretcher (maca) with breathing sheet.
import * as THREE from "three";
import {
  ScenarioResult, lam, mesh, rep, hospitalTileTex, ctex,
} from "./comum";
import { NOINK } from "../src/ink";

const door418Tex = () =>
  ctex("door418", 256, 512, (g) => {
    g.fillStyle = "#6d848c";
    g.fillRect(0, 0, 256, 512);
    g.strokeStyle = "#35444a";
    g.lineWidth = 10;
    g.strokeRect(14, 14, 228, 484);
    // Window slot
    g.fillStyle = "#223038";
    g.fillRect(68, 56, 120, 140);
    g.strokeStyle = "#485a62";
    g.lineWidth = 6;
    g.strokeRect(68, 56, 120, 140);
    // Room 418 plaque
    g.fillStyle = "#f0ece1";
    g.fillRect(64, 224, 128, 54);
    g.fillStyle = "#1c2428";
    g.font = "900 38px Inter, sans-serif";
    g.textAlign = "center";
    g.fillText("418", 128, 264);
  });

export function buildHospital(): ScenarioResult {
  const group = new THREE.Group();

  const floorM = lam("hosp_floor", () => ({ map: rep(hospitalTileTex(), 3, 12) }));
  const wallTopM = lam("hosp_wallTop", () => ({ color: "#d5e0de" }));
  const wallBotM = lam("hosp_wallBot", () => ({ color: "#6c918c" }));
  const trimM = lam("hosp_trim", () => ({ color: "#3b5254" }));
  const doorM = lam("hosp_door418", () => ({ map: door418Tex() }));
  const metalM = lam("hosp_metal", () => ({ color: "#98a6b0" }));
  const sheetM = lam("hosp_sheet", () => ({ color: "#e8eef2" }));
  const deskM = lam("hosp_desk", () => ({ color: "#8aa4a8" }));

  // Corridor floor: width 7.6m (-3.8..3.8), length 32m (-15..17)
  const floor = mesh(new THREE.BoxGeometry(7.8, 0.16, 32), floorM);
  floor.position.set(0, -0.08, 1);
  group.add(floor);

  // Left and right corridor walls (x = -3.8 and x = +3.8)
  for (const sx of [-3.8, 3.8]) {
    const bot = mesh(new THREE.BoxGeometry(0.24, 1.35, 32), wallBotM);
    bot.position.set(sx, 0.675, 1);
    group.add(bot);
    const top = mesh(new THREE.BoxGeometry(0.24, 2.25, 32), wallTopM);
    top.position.set(sx, 2.475, 1);
    group.add(top);
    const rail = mesh(new THREE.BoxGeometry(0.3, 0.12, 32), trimM);
    rail.position.set(sx, 1.35, 1);
    group.add(rail);
  }

  // Far end wall at z = -14.8 (behind fundo (0, -11)) with double doors
  const backBot = mesh(new THREE.BoxGeometry(7.8, 1.35, 0.24), wallBotM);
  backBot.position.set(0, 0.675, -14.8);
  group.add(backBot);
  const backTop = mesh(new THREE.BoxGeometry(7.8, 2.25, 0.24), wallTopM);
  backTop.position.set(0, 2.475, -14.8);
  group.add(backTop);
  const endDoors = mesh(new THREE.BoxGeometry(2.6, 2.4, 0.3), trimM);
  endDoors.position.set(0, 1.2, -14.7);
  group.add(endDoors);

  // Doors along the corridor walls, with Room 418 at z = -4.0 on left wall (near porta (-1.6, -4))
  for (const z of [-10.5, -4.0, 2.5, 8.0]) {
    for (const side of [-1, 1]) {
      if (side === 1 && z === 8.0) continue; // reception desk space
      const is418 = side === -1 && z === -4.0;
      const dMesh = mesh(new THREE.BoxGeometry(0.14, 2.35, 1.25), is418 ? doorM : trimM);
      dMesh.position.set(side * 3.65, 1.175, z);
      group.add(dMesh);

      // Call light above door
      const bulbCol = is418 ? new THREE.Color(3.6, 0.35, 0.35) : new THREE.Color(0.35, 0.45, 0.5);
      const callMat = new THREE.MeshBasicMaterial({ color: bulbCol, fog: false });
      const callBulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), callMat);
      callBulb.position.set(side * 3.55, 2.58, z);
      callBulb.layers.set(NOINK);
      group.add(callBulb);
    }
  }

  // Overhead ceiling fluorescent tubes (on NOINK so they add atmosphere without heavy ink lines)
  const tubeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.9, 2.1), fog: false });
  for (let z = -12; z <= 12; z += 6) {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.35), tubeMat);
    tube.position.set(0, 3.52, z);
    tube.layers.set(NOINK);
    group.add(tube);
  }

  // Reception desk near recepcao (0.4, 9.5) — placed at (2.1, 0, 9.5) so actor at (0.4, 9.5) stands right beside it
  const desk = new THREE.Group();
  desk.position.set(2.1, 0, 9.5);
  const dBody = mesh(new THREE.BoxGeometry(1.8, 1.05, 2.8), deskM);
  dBody.position.y = 0.525;
  desk.add(dBody);
  const dTop = mesh(new THREE.BoxGeometry(1.95, 0.1, 2.95), trimM);
  dTop.position.y = 1.08;
  desk.add(dTop);
  group.add(desk);

  // Stretcher / Gurney (maca) placed at (1.15, 0, -7.2) so actor at maca (-0.35, 0, -6.2) stands right beside it without clipping
  const gurney = new THREE.Group();
  gurney.position.set(1.15, 0, -7.2);
  for (const [lx, lz] of [[-0.42, -0.95], [0.42, -0.95], [-0.42, 0.95], [0.42, 0.95]] as const) {
    const leg = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.82, 8), metalM);
    leg.position.set(lx, 0.41, lz);
    gurney.add(leg);
    const wheel = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), trimM);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(lx, 0.09, lz);
    gurney.add(wheel);
  }
  const bedFrame = mesh(new THREE.BoxGeometry(1.02, 0.12, 2.15), metalM);
  bedFrame.position.y = 0.85;
  gurney.add(bedFrame);

  // Draped sheet with body contour underneath (animated breathing in update)
  const sheetGroup = new THREE.Group();
  sheetGroup.position.y = 0.92;
  const sheetBase = mesh(new THREE.BoxGeometry(1.08, 0.24, 2.18), sheetM);
  sheetBase.position.y = 0.06;
  sheetGroup.add(sheetBase);
  const chestMound = mesh(new THREE.SphereGeometry(0.42, 16, 12), sheetM);
  chestMound.scale.set(0.95, 0.55, 1.65);
  chestMound.position.set(0, 0.18, -0.1);
  sheetGroup.add(chestMound);
  const headMound = mesh(new THREE.SphereGeometry(0.24, 14, 10), sheetM);
  headMound.scale.set(0.9, 0.75, 0.95);
  headMound.position.set(0, 0.22, -0.78);
  sheetGroup.add(headMound);
  gurney.add(sheetGroup);
  group.add(gurney);

  return {
    group,
    limites: { x: 3.6, z: 14.5, h: 3.3 },
    marcas: {
      corredor: { x: 0, z: 3.5 },
      maca: { x: -0.35, z: -6.2 },
      fundo: { x: 0, z: -11 },
      porta: { x: -1.6, z: -4 },
      entrada: { x: 0, z: 12 },
      recepcao: { x: 0.4, z: 9.5 },
    },
    update: (t: number) => {
      // Subtle rhythmic breathing of the sheet on the stretcher
      const breath = 1 + 0.08 * Math.sin(t * 2.6);
      chestMound.scale.y = 0.55 * breath;
    },
  };
}
