// PECAS EXTRAS do motor (estilo flat). Cada pacote do KIRO-PROMPT.md vira UM arquivo aqui:
//   hora-muerta/scripts/pecas/<NN>-<pacote>.js   (ex.: 01-kit-efeitos.js, 05-china-wukong.js)
// e UMA linha no fim do engine.html, no bloco "PECAS EXTRAS", na ordem dos numeros:
//   <script src="pecas/01-kit-efeitos.js"></script>
// Os arquivos rodam DEPOIS do script principal: podem usar x, W, H, TF(), fonte(), pessoa(), corpoFlat(), camFlat(),
// glow, ease, lerp, rng, rnd, E, COMP... e criar COMP.f_<nome> e funcoes novas (nunca redefinir as que ja existem).
// O fiscal (motor-en/validar_roteiros.py) le estes arquivos para saber quais pecas existem.
