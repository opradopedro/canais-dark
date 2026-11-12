import React from "react";
import { Composition, registerRoot } from "remotion";
import { CartoonShort, FPS, EstadoRender } from "./CartoonShort";

const defaultEstado: EstadoRender = {
  fps: FPS,
  dur: 10,
  cenas: [{ idx: 0, t0: 0, t1: 10, cenario: "floresta", luz: "noite" }],
  segs: [],
};

const Root: React.FC = () => {
  return React.createElement(Composition, {
    id: "cartoon",
    component: CartoonShort,
    durationInFrames: 300,
    fps: FPS,
    width: 1080,
    height: 1920,
    defaultProps: { estado: defaultEstado },
    calculateMetadata: ({ props }) => {
      const est = (props?.estado as EstadoRender) || defaultEstado;
      const frames = Math.max(1, Math.ceil((est.dur || 10) * FPS));
      return {
        durationInFrames: frames,
        props,
      };
    },
  });
};

registerRoot(Root);
