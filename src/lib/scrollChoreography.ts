// Section 7: phase boundaries of the story scroll progress p (0..1).
export const PHASES = {
  heroFade: [0, 0.06],
  fanToScatter: [0.004, 0.085],
  processFade: [0.05, 0.075],
  processRevealAt: 0.078,
  searchCardHide: [0.17, 0.21],
  toPile: [0.21, 0.31],
  pileToWheel: [0.31, 0.41],
  wheelTurn: [0.41, 0.57],
  wheelHold: [0.57, 0.62],
  skyGrow: [0.62, 0.74],
  cameraYaw: [0.74, 0.88],
  cameraZoom: [0.88, 0.97],
  darkNavAt: 0.985,
} as const;
