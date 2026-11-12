// Objetos e figurantes de cena (Pedro, 12/11: "fala da policia, do carro, do onibus mas nao mostra nada na tela").
// Cada cena pode ter "objetos": ["caminhao", "viatura", {"tipo": "vaca", "n": 3}]. Quando o roteiro nao diz,
// render.mjs tira da propria fala (PALAVRAS abaixo): se a narracao fala "camioneros, policia, autobus", eles aparecem.
// Veiculos, animais e placas sao 3D no mesmo estilo do cenario (twoTone + tinta); pessoas sao cartoes do elenco.
import * as THREE from "three";
import { lam, mesh, ctex } from "../cenarios/comum";
import { NOINK } from "../src/ink";
import { ElencoSpec } from "./pessoas";

export interface ObjetoCena {
  tipo: string;
  n?: number;
}

// palavra (sem acento, minuscula) -> tipo. Ingles, espanhol e portugues.
import PALAVRAS_JSON from "./objetos-palavras.json";
// palavra (sem acento, minuscula) -> tipo. Ingles, espanhol e portugues. A mesma lista e lida pelo fiscal
// (motor-en/validar_roteiros.py), que confere se a cena muda de verdade.
export const PALAVRAS: [RegExp, string][] = (PALAVRAS_JSON as [string, string][]).map(([re, tipo]) => [new RegExp(re), tipo]);

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function objetosDaFala(texto: string): string[] {
  const t = semAcento(texto || "");
  const out: string[] = [];
  for (const [re, tipo] of PALAVRAS) if (re.test(t) && !out.includes(tipo)) out.push(tipo);
  return out;
}

export const VEICULOS = new Set(["carro", "viatura", "caminhao", "onibus", "ambulancia"]);
export const ANIMAIS = new Set(["vaca", "cavalo", "cachorro"]);
export const PESSOAS: Record<string, ElencoSpec> = {
  enfermeira: { roupa: "enfermeira", camisa: "#4fb3c8", cabelo: "curto" },
  medico: { roupa: "jaqueta", camisa: "#eef2f4", calca: "#3a4a5a", cabelo: "curto" },
  guarda: { roupa: "guarda", camisa: "#2f3d55", chapeu: "bone" },
  multidao: {},
  crianca: { corpo: "crianca" },
  soldado: { roupa: "soldado_esparta", chapeu: "capacete_esparta" },
  monge: { roupa: "monge", cabelo: "careca" },
};
// quantos de cada um aparecem quando o roteiro nao diz
export const N_PADRAO: Record<string, number> = { multidao: 4, vaca: 3, soldado: 3, enfermeira: 2, guarda: 2, medico: 1, crianca: 2, placa: 2, monge: 2 };

// ---------------- construtores 3D ----------------
const roda = () => {
  const m = lam("obj_pneu", () => ({ color: "#22252b" }));
  const r = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 14), m);
  r.rotation.z = Math.PI / 2;
  return r;
};

const farol = (cor: THREE.Color) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: cor, fog: false }));
  b.layers.set(NOINK);
  return b;
};

function caixaVeiculo(g: THREE.Group, w: number, h: number, l: number, corCorpo: string, key: string, cabine?: { h: number; l: number; z: number; cor?: string }) {
  const corpo = mesh(new THREE.BoxGeometry(w, h, l), lam(`obj_${key}_corpo`, () => ({ color: corCorpo })));
  corpo.position.y = 0.42 + h / 2;
  g.add(corpo);
  const vidro = lam("obj_vidro", () => ({ color: "#2c3a4c" }));
  if (cabine) {
    const cab = mesh(new THREE.BoxGeometry(w * 0.9, cabine.h, cabine.l), lam(`obj_${key}_cab`, () => ({ color: cabine.cor || corCorpo })));
    cab.position.set(0, 0.42 + h + cabine.h / 2, cabine.z);
    g.add(cab);
    const vf = mesh(new THREE.BoxGeometry(w * 0.82, cabine.h * 0.7, 0.04), vidro, false);
    vf.position.set(0, 0.42 + h + cabine.h / 2, cabine.z + cabine.l / 2 + 0.02);
    g.add(vf);
    for (const s of [-1, 1]) {
      const vl = mesh(new THREE.BoxGeometry(0.04, cabine.h * 0.62, cabine.l * 0.8), vidro, false);
      vl.position.set(s * (w * 0.45 + 0.02), 0.42 + h + cabine.h / 2, cabine.z);
      g.add(vl);
    }
  }
  const zs = [l / 2 - 0.7, -(l / 2 - 0.7)];
  if (l > 6) zs.push(-(l / 2 - 1.8));
  for (const z of zs) for (const s of [-1, 1]) {
    const r = roda();
    r.position.set(s * (w / 2 - 0.05), 0.36, z);
    g.add(r);
  }
  for (const s of [-1, 1]) {
    const f = farol(new THREE.Color(3.2, 3.0, 2.2));
    f.position.set(s * (w / 2 - 0.3), 0.42 + Math.min(h, 0.9) * 0.55, l / 2 + 0.03);
    g.add(f);
    const tr = farol(new THREE.Color(2.4, 0.2, 0.15));
    tr.position.set(s * (w / 2 - 0.3), 0.42 + Math.min(h, 0.9) * 0.55, -l / 2 - 0.03);
    g.add(tr);
  }
}

function listraTex(key: string, base: string, faixa: string, texto = "") {
  return ctex(key, 512, 128, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = faixa;
    g.fillRect(0, 58, 512, 26);
    if (texto) {
      g.fillStyle = faixa;
      g.font = "900 40px Inter, sans-serif";
      g.textAlign = "center";
      g.fillText(texto, 256, 44);
    }
  });
}

export function construirObjeto(tipo: string, seed: number): THREE.Group {
  const g = new THREE.Group();
  g.userData.tipo = tipo;
  const cores = ["#b8433a", "#3a6ea8", "#e0c34a", "#5d8a4e", "#d7d2c6", "#6c4f8a"];
  if (tipo === "carro") {
    caixaVeiculo(g, 1.8, 0.62, 4.2, cores[seed % cores.length], `carro${seed % cores.length}`, { h: 0.62, l: 2.1, z: -0.2 });
  } else if (tipo === "viatura") {
    caixaVeiculo(g, 1.85, 0.62, 4.5, "#f2f2ee", "viatura", { h: 0.62, l: 2.2, z: -0.2, cor: "#1d2430" });
    const faixa = mesh(new THREE.BoxGeometry(1.87, 0.18, 4.52), lam("obj_viatura_faixa", () => ({ color: "#1d2430" })), false);
    faixa.position.y = 0.42 + 0.31;
    g.add(faixa);
    const az = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.6, 4.0), fog: false }));
    const vm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(4.0, 0.3, 0.3), fog: false }));
    az.position.set(-0.3, 0.42 + 0.62 + 0.62 + 0.09, -0.2);
    vm.position.set(0.3, 0.42 + 0.62 + 0.62 + 0.09, -0.2);
    az.layers.set(NOINK);
    vm.layers.set(NOINK);
    g.add(az, vm);
    g.userData.sirene = [az, vm];
  } else if (tipo === "ambulancia") {
    caixaVeiculo(g, 2.0, 1.6, 5.0, "#f4f4f0", "ambulancia", { h: 0.5, l: 1.2, z: 1.7 });
    const cruz = mesh(new THREE.BoxGeometry(2.02, 0.22, 2.2), lam("obj_amb_faixa", () => ({ color: "#d43a3a" })), false);
    cruz.position.set(0, 1.25, -0.6);
    g.add(cruz);
    const vm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(4.0, 0.3, 0.3), fog: false }));
    vm.position.set(0, 0.42 + 1.6 + 0.1, 2.0);
    vm.layers.set(NOINK);
    g.add(vm);
    g.userData.sirene = [vm];
  } else if (tipo === "caminhao") {
    // cabine + carroceria
    const cab = new THREE.Group();
    caixaVeiculo(cab, 2.4, 1.3, 2.4, "#c8483c", "camcab", { h: 0.9, l: 1.6, z: 0.3 });
    cab.position.z = 3.6;
    g.add(cab);
    const bau = mesh(new THREE.BoxGeometry(2.5, 2.7, 7.0), lam("obj_bau", () => ({ map: listraTex("bauTex", "#e7e2d6", "#3a6ea8", "") })));
    bau.position.set(0, 0.42 + 1.45, -1.4);
    g.add(bau);
    for (const z of [-3.6, -2.4, 0.6]) for (const s of [-1, 1]) {
      const r = roda();
      r.position.set(s * 1.15, 0.36, z);
      g.add(r);
    }
  } else if (tipo === "onibus") {
    caixaVeiculo(g, 2.5, 2.4, 10.5, "#e6b23c", "onibus");
    const jan = mesh(new THREE.BoxGeometry(2.54, 0.75, 9.6), lam("obj_onibus_jan", () => ({ color: "#2c3a4c" })), false);
    jan.position.set(0, 0.42 + 1.75, 0);
    g.add(jan);
    const luzJan = new THREE.Mesh(new THREE.BoxGeometry(2.56, 0.5, 9.0), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.4, 0.8), fog: false, transparent: true, opacity: 0.0 }));
    luzJan.position.set(0, 0.42 + 1.75, 0);
    luzJan.layers.set(NOINK);
    g.add(luzJan);
    g.userData.janelas = luzJan;
  } else if (tipo === "vaca" || tipo === "cavalo" || tipo === "cachorro") {
    const esc = tipo === "cachorro" ? 0.42 : tipo === "cavalo" ? 1.1 : 1.0;
    const pelo = tipo === "vaca"
      ? lam("obj_vaca", () => ({ map: ctex("vacaTex", 256, 256, (c) => {
          c.fillStyle = "#f2efe8"; c.fillRect(0, 0, 256, 256);
          c.fillStyle = "#2a2426";
          for (const [x, y, r] of [[60, 70, 40], [170, 60, 30], [120, 170, 46], [220, 200, 28], [30, 200, 26]]) {
            c.beginPath(); c.ellipse(x, y, r, r * 0.75, 0.4, 0, Math.PI * 2); c.fill();
          }
        }) }))
      : lam(`obj_${tipo}`, () => ({ color: tipo === "cavalo" ? "#7a4a2c" : "#3a2f2a" }));
    const corpo = mesh(new THREE.BoxGeometry(0.75, 0.7, 1.7), pelo);
    corpo.position.y = 1.05;
    g.add(corpo);
    const pescoco = mesh(new THREE.BoxGeometry(0.34, tipo === "cavalo" ? 0.8 : 0.4, 0.36), pelo);
    pescoco.position.set(0, tipo === "cavalo" ? 1.55 : 1.25, 0.95);
    pescoco.rotation.x = tipo === "cavalo" ? -0.5 : -0.2;
    g.add(pescoco);
    const cabeca = mesh(new THREE.BoxGeometry(0.42, 0.42, 0.6), pelo);
    cabeca.position.set(0, tipo === "cavalo" ? 1.9 : 1.3, 1.25);
    g.add(cabeca);
    const pernaM = lam(`obj_${tipo}_perna`, () => ({ color: tipo === "vaca" ? "#e8e2d8" : tipo === "cavalo" ? "#5e3820" : "#2e2522" }));
    for (const x of [-0.25, 0.25]) for (const z of [-0.65, 0.65]) {
      const p = mesh(new THREE.BoxGeometry(0.16, 0.75, 0.16), pernaM);
      p.position.set(x, 0.37, z);
      g.add(p);
    }
    if (tipo === "vaca") {
      const chifreM = lam("obj_chifre", () => ({ color: "#e9dcb8" }));
      for (const s of [-1, 1]) {
        const ch = mesh(new THREE.ConeGeometry(0.05, 0.22, 6), chifreM);
        ch.position.set(s * 0.18, 1.6, 1.2);
        ch.rotation.z = -s * 0.6;
        g.add(ch);
      }
    }
    g.scale.setScalar(esc);
  } else if (tipo === "placa") {
    const madeira = lam("obj_placa_poste", () => ({ color: "#6e5a44" }));
    const poste = mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.2, 8), madeira);
    poste.position.y = 1.1;
    g.add(poste);
    const textos = ["STOP", "KM 13", "!", "PARE", "→", "50"];
    const txt = textos[seed % textos.length];
    const tab = mesh(new THREE.BoxGeometry(0.9, 0.7, 0.06), lam(`obj_placa_${seed % textos.length}`, () => ({ map: ctex(`placaTex${seed % textos.length}`, 256, 200, (c) => {
      c.fillStyle = "#d9c27a"; c.fillRect(0, 0, 256, 200);
      c.fillStyle = "rgba(120,70,30,0.45)";
      for (let i = 0; i < 14; i++) { c.beginPath(); c.arc((i * 53) % 256, (i * 37) % 200, 10 + (i % 4) * 6, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = "#2a2420"; c.lineWidth = 12; c.strokeRect(8, 8, 240, 184);
      c.fillStyle = "#2a2420"; c.font = "900 72px Inter, sans-serif"; c.textAlign = "center"; c.fillText(txt, 128, 128);
    }) })));
    tab.position.y = 2.0;
    tab.rotation.z = (seed % 2 ? 1 : -1) * 0.12; // placa velha, torta
    g.add(tab);
  }
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.layers.mask !== 0 && !(m.material as THREE.Material & { isMeshBasicMaterial?: boolean }).isMeshBasicMaterial) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return g;
}
