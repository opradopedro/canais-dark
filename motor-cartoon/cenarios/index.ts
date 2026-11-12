// Registry of all 3D cartoon scenarios (existing 8 from motor-3d + Old Tales scenarios).
import { ScenarioResult } from "./comum";
import { buildBairro } from "./bairro";
import { buildEstrada } from "./estrada";
import { buildFloresta } from "./floresta";
import { buildCasaInterior } from "./casa_interior";
import { buildCemiterio } from "./cemiterio";
import { buildHospital } from "./hospital";
import { buildVila } from "./vila";
import { buildTemploOriental } from "./templo_oriental";
import {
  buildMontanhaNuvens,
  buildCachoeira,
  buildCavernaReino,
  buildPalacioCeu,
  buildAldeiaChina,
  buildEspartaCidade,
  buildCampoBatalha,
  buildMosteiro,
  buildMarJangada,
  buildPalacioDragao,
  buildSubmundo,
  buildJardimPessegos,
  buildFornalhaCeu,
  buildMaoBuda,
  buildMontanhaCincoDedos,
  buildGreciaTemplo,
  buildIlhaMar,
  buildCavernaGorgonas,
} from "./old_tales";

export type { ScenarioResult, MarkDef } from "./comum";

export function buildScenario(name: string, isWukongPart1 = false, cenaIdx = 0): ScenarioResult {
  // When rendering Wukong Part 1 (CL036) that used generic scenario names ("floresta" / "templo_oriental"),
  // route to the authentic Wukong sets from templates/wukong/world.ts.
  if (isWukongPart1) {
    if (name === "templo_oriental" || name === "palacio_ceu") return buildPalacioCeu();
    if (name === "floresta") {
      if (cenaIdx >= 14) return buildCavernaReino();
      if (cenaIdx >= 9 && cenaIdx <= 13) return buildCachoeira();
      return buildMontanhaNuvens(true);
    }
  }

  switch (name) {
    case "bairro":
      return buildBairro();
    case "estrada":
      return buildEstrada();
    case "floresta":
      return buildFloresta();
    case "casa_interior":
      return buildCasaInterior();
    case "cemiterio":
      return buildCemiterio();
    case "hospital":
      return buildHospital();
    case "vila":
      return buildVila();
    case "templo_oriental":
      return buildTemploOriental();
    case "montanha_nuvens":
      return buildMontanhaNuvens(isWukongPart1);
    case "cachoeira":
      return buildCachoeira();
    case "caverna_reino":
      return buildCavernaReino();
    case "palacio_ceu":
      return buildPalacioCeu();
    case "aldeia_china":
      return buildAldeiaChina();
    case "esparta_cidade":
      return buildEspartaCidade();
    case "campo_batalha":
      return buildCampoBatalha();
    case "mosteiro":
      return buildMosteiro();
    case "mar_jangada":
      return buildMarJangada();
    case "palacio_dragao":
      return buildPalacioDragao();
    case "submundo":
      return buildSubmundo();
    case "jardim_pessegos":
      return buildJardimPessegos();
    case "fornalha_ceu":
      return buildFornalhaCeu();
    case "mao_buda":
      return buildMaoBuda();
    case "montanha_cinco_dedos":
      return buildMontanhaCincoDedos();
    case "grecia_templo":
      return buildGreciaTemplo();
    case "ilha_mar":
      return buildIlhaMar();
    case "caverna_gorgonas":
      return buildCavernaGorgonas();
    default:
      return buildFloresta();
  }
}
