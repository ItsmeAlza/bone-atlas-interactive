/**
 * Pediatric skeletal geometry.
 *
 * Nothing here is a scaled adult drawing. Each age group has its own
 * proportion model (head-to-body ratio, limb segment lengths, ossification
 * state) and every shape is authored from those landmarks. Growth plates,
 * unfused epiphyses, ossification centres and fontanelles are drawn as their
 * own paths with their own stable anatomical ids.
 *
 * Anatomical ids are identical to the adult ones (`left-femur` everywhere).
 */
import { VIEWBOX, blob, n, shaft } from "@/data/bones";
import type { SkeletonAgeGroup, SkeletonView, ViewShape } from "@/types/bone";

const M = VIEWBOX.width / 2;

/* ------------------------------------------------------------------ */
/* age proportion model                                                */
/* ------------------------------------------------------------------ */

export type AgeProfile = {
  id: Exclude<SkeletonAgeGroup, "adult">;
  /** skull */
  skullTop: number;
  browY: number;
  skullHalfW: number;
  chinY: number;
  /** trunk */
  neckTop: number;
  shoulderY: number;
  shoulderHalfW: number;
  thoraxTop: number;
  thoraxBottom: number;
  lumbarTop: number;
  pelvisTop: number;
  pelvisBottom: number;
  pelvisHalfW: number;
  /** upper limb */
  armX: number;
  elbowY: number;
  wristY: number;
  handEnd: number;
  /** lower limb */
  hipX: number;
  kneeY: number;
  ankleY: number;
  footEnd: number;
  /** ossification state */
  boneW: number;
  physisW: number;
  /** radius of an ossified long-bone epiphysis; small = mostly cartilage */
  epiphysisR: number;
  carpalR: number;
  patellaR: number;
  fontanelle: boolean;
  metopic: boolean;
  capitalCenter: boolean;
  vertebraGap: number;
};

export const AGE_PROFILES: Record<Exclude<SkeletonAgeGroup, "adult">, AgeProfile> = {
  infant: {
    id: "infant",
    skullTop: 44,
    browY: 150,
    skullHalfW: 62,
    chinY: 208,
    neckTop: 214,
    shoulderY: 252,
    shoulderHalfW: 60,
    thoraxTop: 250,
    thoraxBottom: 410,
    lumbarTop: 414,
    pelvisTop: 476,
    pelvisBottom: 540,
    pelvisHalfW: 44,
    armX: 66,
    elbowY: 400,
    wristY: 508,
    handEnd: 566,
    hipX: 26,
    kneeY: 664,
    ankleY: 780,
    footEnd: 848,
    boneW: 7.5,
    physisW: 5,
    epiphysisR: 4,
    carpalR: 2.2,
    patellaR: 0,
    fontanelle: true,
    metopic: true,
    capitalCenter: true,
    vertebraGap: 3.2,
  },
  child: {
    id: "child",
    skullTop: 34,
    browY: 124,
    skullHalfW: 55,
    chinY: 174,
    neckTop: 180,
    shoulderY: 214,
    shoulderHalfW: 58,
    thoraxTop: 212,
    thoraxBottom: 382,
    lumbarTop: 386,
    pelvisTop: 444,
    pelvisBottom: 508,
    pelvisHalfW: 44,
    armX: 68,
    elbowY: 388,
    wristY: 500,
    handEnd: 566,
    hipX: 26,
    kneeY: 662,
    ankleY: 802,
    footEnd: 872,
    boneW: 7,
    physisW: 4,
    epiphysisR: 7,
    carpalR: 3.4,
    patellaR: 5,
    fontanelle: false,
    metopic: true,
    capitalCenter: true,
    vertebraGap: 2.4,
  },
  adolescent: {
    id: "adolescent",
    skullTop: 24,
    browY: 100,
    skullHalfW: 48,
    chinY: 144,
    neckTop: 150,
    shoulderY: 190,
    shoulderHalfW: 66,
    thoraxTop: 190,
    thoraxBottom: 372,
    lumbarTop: 376,
    pelvisTop: 420,
    pelvisBottom: 488,
    pelvisHalfW: 48,
    armX: 74,
    elbowY: 372,
    wristY: 492,
    handEnd: 566,
    hipX: 28,
    kneeY: 650,
    ankleY: 812,
    footEnd: 890,
    boneW: 6.5,
    physisW: 2.4,
    epiphysisR: 9,
    carpalR: 4.2,
    patellaR: 7.5,
    fontanelle: false,
    metopic: false,
    capitalCenter: false,
    vertebraGap: 1.6,
  },
};

/* ------------------------------------------------------------------ */
/* small geometry helpers                                              */
/* ------------------------------------------------------------------ */

/** growth-plate band: a thin lens between epiphysis and metaphysis */
const band = (cx: number, cy: number, halfW: number, h: number) =>
  `M${n(cx - halfW)},${n(cy - h / 2)} Q${n(cx)},${n(cy - h)} ${n(cx + halfW)},${n(cy - h / 2)} ` +
  `L${n(cx + halfW)},${n(cy + h / 2)} Q${n(cx)},${n(cy + h)} ${n(cx - halfW)},${n(cy + h / 2)} Z`;

const box = (cx: number, cy: number, halfW: number, halfH: number) =>
  `M${n(cx - halfW)},${n(cy - halfH)} L${n(cx + halfW)},${n(cy - halfH)} ` +
  `L${n(cx + halfW)},${n(cy + halfH)} L${n(cx - halfW)},${n(cy + halfH)} Z`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* frontal builder (anterior + posterior)                              */
/* ------------------------------------------------------------------ */

function buildFrontal(p: AgeProfile, view: "anterior" | "posterior"): ViewShape[] {
  const out: ViewShape[] = [];
  const back = view === "posterior";
  const add = (id: string, d: string) => out.push({ id, d, mirrored: false, layer: "near" });
  /** authored on the viewer's left (x < 200); duplicated into the mirrored group */
  const pair = (base: string, d: string) => {
    const near = back ? "left" : "right";
    const far = back ? "right" : "left";
    out.push({ id: `${near}-${base}`, d, mirrored: false, layer: "near" });
    out.push({ id: `${far}-${base}`, d, mirrored: true, layer: "near" });
  };

  const sw = p.skullHalfW;
  const vault = (p.browY - p.skullTop) / 2;

  /* ---------------- skull ---------------- */
  if (back) {
    // from behind the occipital squama dominates the infant/child skull
    add(
      "occipital",
      `M${n(M - sw * 0.9)},${n(p.skullTop + vault * 0.5)} C${n(M - sw * 0.8)},${n(p.browY + 8)} ` +
        `${n(M + sw * 0.8)},${n(p.browY + 8)} ${n(M + sw * 0.9)},${n(p.skullTop + vault * 0.5)} ` +
        `C${n(M + sw * 0.4)},${n(p.skullTop + vault * 1.1)} ${n(M - sw * 0.4)},${n(p.skullTop + vault * 1.1)} ${n(M - sw * 0.9)},${n(p.skullTop + vault * 0.5)} Z`,
    );
    add("frontal", box(M, p.skullTop + 6, sw * 0.62, 7));
  } else {
    add(
      "frontal",
      `M${n(M - sw * 0.92)},${n(p.browY)} C${n(M - sw)},${n(lerp(p.skullTop, p.browY, 0.3))} ` +
        `${n(M - sw * 0.55)},${n(p.skullTop)} ${n(M)},${n(p.skullTop)} ` +
        `C${n(M + sw * 0.55)},${n(p.skullTop)} ${n(M + sw)},${n(lerp(p.skullTop, p.browY, 0.3))} ${n(M + sw * 0.92)},${n(p.browY)} ` +
        `C${n(M + sw * 0.5)},${n(p.browY + 8)} ${n(M - sw * 0.5)},${n(p.browY + 8)} ${n(M - sw * 0.92)},${n(p.browY)} Z`,
    );
    add("occipital", blob(M, p.skullTop + 4, sw * 0.34, 4));
  }

  pair(
    "parietal",
    `M${n(M - sw * 0.95)},${n(lerp(p.skullTop, p.browY, 0.28))} C${n(M - sw * 1.05)},${n(lerp(p.skullTop, p.browY, 0.75))} ` +
      `${n(M - sw * 0.95)},${n(p.browY + 4)} ${n(M - sw * 0.72)},${n(p.browY + 14)} ` +
      `L${n(M - sw * 0.55)},${n(p.browY + 2)} C${n(M - sw * 0.74)},${n(lerp(p.skullTop, p.browY, 0.6))} ${n(M - sw * 0.78)},${n(lerp(p.skullTop, p.browY, 0.35))} ${n(M - sw * 0.8)},${n(lerp(p.skullTop, p.browY, 0.24))} Z`,
  );
  pair(
    "temporal",
    `M${n(M - sw * 0.74)},${n(p.browY + 12)} C${n(M - sw * 0.74)},${n(lerp(p.browY, p.chinY, 0.35))} ` +
      `${n(M - sw * 0.6)},${n(lerp(p.browY, p.chinY, 0.55))} ${n(M - sw * 0.42)},${n(lerp(p.browY, p.chinY, 0.6))} ` +
      `L${n(M - sw * 0.38)},${n(lerp(p.browY, p.chinY, 0.36))} C${n(M - sw * 0.55)},${n(lerp(p.browY, p.chinY, 0.28))} ${n(M - sw * 0.6)},${n(p.browY + 8)} ${n(M - sw * 0.6)},${n(p.browY + 4)} Z`,
  );

  if (p.fontanelle) {
    add(
      "anterior-fontanelle",
      `M${n(M)},${n(p.skullTop + vault * 0.28)} L${n(M + sw * 0.2)},${n(p.skullTop + vault * 0.62)} ` +
        `L${n(M)},${n(p.skullTop + vault * 0.98)} L${n(M - sw * 0.2)},${n(p.skullTop + vault * 0.62)} Z`,
    );
    add("posterior-fontanelle", blob(M, p.skullTop + vault * 1.55, sw * 0.11, 6));
  }
  if (p.metopic) add("metopic-suture", box(M, lerp(p.skullTop, p.browY, 0.72), 1.6, vault * 0.42));

  const faceTop = p.browY + 6;
  const faceH = p.chinY - faceTop;
  add("sphenoid", blob(M, faceTop + faceH * 0.1, sw * 0.4, faceH * 0.05));
  add("ethmoid", box(M, faceTop + faceH * 0.22, sw * 0.09, faceH * 0.07));
  add("vomer", box(M, faceTop + faceH * 0.45, sw * 0.045, faceH * 0.09));
  pair("nasal", box(M - sw * 0.09, faceTop + faceH * 0.2, sw * 0.055, faceH * 0.11));
  pair("lacrimal", blob(M - sw * 0.24, faceTop + faceH * 0.22, sw * 0.055, faceH * 0.06));
  pair(
    "zygomatic",
    `M${n(M - sw * 0.52)},${n(faceTop + faceH * 0.26)} C${n(M - sw * 0.3)},${n(faceTop + faceH * 0.22)} ` +
      `${n(M - sw * 0.2)},${n(faceTop + faceH * 0.36)} ${n(M - sw * 0.22)},${n(faceTop + faceH * 0.44)} ` +
      `L${n(M - sw * 0.44)},${n(faceTop + faceH * 0.46)} C${n(M - sw * 0.54)},${n(faceTop + faceH * 0.38)} ${n(M - sw * 0.56)},${n(faceTop + faceH * 0.3)} ${n(M - sw * 0.52)},${n(faceTop + faceH * 0.26)} Z`,
  );
  pair(
    "maxilla",
    box(M - sw * 0.17, faceTop + faceH * 0.58, sw * 0.15, faceH * 0.12),
  );
  pair("palatine", blob(M - sw * 0.1, faceTop + faceH * 0.71, sw * 0.07, faceH * 0.04));
  add(
    "mandible",
    `M${n(M - sw * 0.44)},${n(faceTop + faceH * 0.62)} C${n(M - sw * 0.4)},${n(p.chinY)} ${n(M + sw * 0.4)},${n(p.chinY)} ${n(M + sw * 0.44)},${n(faceTop + faceH * 0.62)} ` +
      `L${n(M + sw * 0.3)},${n(faceTop + faceH * 0.63)} C${n(M + sw * 0.28)},${n(p.chinY - faceH * 0.12)} ${n(M - sw * 0.28)},${n(p.chinY - faceH * 0.12)} ${n(M - sw * 0.3)},${n(faceTop + faceH * 0.63)} Z`,
  );
  add("hyoid", `M${n(M - 10)},${n(p.chinY + 12)} C${n(M - 4)},${n(p.chinY + 8)} ${n(M + 4)},${n(p.chinY + 8)} ${n(M + 10)},${n(p.chinY + 12)} L${n(M + 9)},${n(p.chinY + 15)} C${n(M + 3)},${n(p.chinY + 12)} ${n(M - 3)},${n(p.chinY + 12)} ${n(M - 9)},${n(p.chinY + 15)} Z`);

  /* ---------------- vertebral column ---------------- */
  const cervH = (p.thoraxTop - p.neckTop) / 7;
  for (let i = 0; i < 7; i++) {
    const y = p.neckTop + i * cervH;
    const w = lerp(6, 9, i / 6) * (p.id === "infant" ? 0.8 : 1);
    add(
      `c${i + 1}`,
      back
        ? `${box(M, y + cervH / 2, w, cervH / 2 - p.vertebraGap / 2)} ${box(M, y + cervH * 0.85, 1.8, cervH * 0.3)}`
        : box(M, y + cervH / 2, w, cervH / 2 - p.vertebraGap / 2),
    );
  }
  const thorH = (p.thoraxBottom - p.thoraxTop) / 12;
  for (let i = 0; i < 12; i++) {
    const y = p.thoraxTop + i * thorH;
    const w = lerp(8, 13, i / 11) * (p.id === "infant" ? 0.85 : 1);
    const body = box(M, y + thorH / 2, w, thorH / 2 - p.vertebraGap / 2);
    add(
      `t${i + 1}`,
      back
        ? `${body} ${box(M, y + thorH * 0.9, 2, thorH * 0.34)}`
        : // in the young spine the neurocentral synchondroses leave visible gaps
          `${body} ${blob(M - w - 3, y + thorH / 2, 2.6, 2)} ${blob(M + w + 3, y + thorH / 2, 2.6, 2)}`,
    );
  }
  const lumbH = (p.pelvisTop - p.lumbarTop) / 5;
  for (let i = 0; i < 5; i++) {
    const y = p.lumbarTop + i * lumbH;
    const w = lerp(13, 17, i / 4) * (p.id === "infant" ? 0.85 : 1);
    add(
      `l${i + 1}`,
      back
        ? `${box(M, y + lumbH / 2, w, lumbH / 2 - p.vertebraGap / 2)} ${box(M, y + lumbH * 0.9, 2.4, lumbH * 0.32)}`
        : box(M, y + lumbH / 2, w, lumbH / 2 - p.vertebraGap / 2),
    );
  }

  // sacrum: in the young pelvis the sacral segments are still separate
  const sacTop = p.pelvisTop + 2;
  const sacBottom = p.pelvisBottom - 16;
  const segs = p.id === "adolescent" ? 1 : 5;
  let sacrumPath = "";
  for (let i = 0; i < segs; i++) {
    const h = (sacBottom - sacTop) / segs;
    const y = sacTop + i * h;
    sacrumPath += `${box(M, y + h / 2, lerp(18, 10, i / Math.max(1, segs - 1)), h / 2 - (segs > 1 ? 1.6 : 0))} `;
  }
  add("sacrum", sacrumPath.trim());
  add("coccyx", blob(M, sacBottom + 8, 4, 5));

  /* ---------------- thorax ---------------- */
  const sternTop = p.thoraxTop + 4;
  const sternBottom = lerp(p.thoraxTop, p.thoraxBottom, p.id === "infant" ? 0.62 : 0.7);
  add(
    "sternum",
    // sternebrae are still separate ossification centres in the young chest
    p.id === "adolescent"
      ? box(M, (sternTop + sternBottom) / 2, 8, (sternBottom - sternTop) / 2)
      : [0, 1, 2, 3]
          .map((i) => {
            const h = (sternBottom - sternTop) / 4;
            return box(M, sternTop + i * h + h / 2, 7 - i * 0.6, h / 2 - 1.4);
          })
          .join(" "),
  );

  for (let i = 0; i < 12; i++) {
    const y0 = p.thoraxTop + 4 + i * ((p.thoraxBottom - p.thoraxTop) / 13);
    const spread = p.shoulderHalfW * (0.42 + Math.sin(((i + 1) / 13) * Math.PI) * 0.62);
    const xOut = M - 8 - spread;
    const yf = back ? y0 + 26 + i * 1.6 : y0 + (i < 7 ? 12 + i * 1.4 : 26 + i * 2);
    const xf = back ? xOut + 8 : i < 7 ? M - 10 : xOut + 14;
    const t = p.id === "infant" ? 3.4 : 4;
    add(
      `${back ? "left" : "right"}-rib-${i + 1}`,
      `M${n(M - 8)},${n(y0)} C${n(M - 8 - spread * 0.55)},${n(y0 - 5)} ${n(xOut - 3)},${n(lerp(y0, yf, 0.5))} ${n(xf)},${n(yf)} ` +
        `L${n(xf)},${n(yf + t)} C${n(xOut + 2)},${n(lerp(y0, yf, 0.5) + t)} ${n(M - 8 - spread * 0.5)},${n(y0 - 5 + t + 1)} ${n(M - 8)},${n(y0 + t)} Z`,
    );
    out.push({
      id: `${back ? "right" : "left"}-rib-${i + 1}`,
      d: out[out.length - 1]!.d,
      mirrored: true,
      layer: "near",
    });
  }

  /* ---------------- shoulder girdle + arm ---------------- */
  const shoulderX = M - p.shoulderHalfW;
  pair(
    "clavicle",
    `M${n(M - 6)},${n(p.shoulderY - 6)} C${n(M - 30)},${n(p.shoulderY - 12)} ${n(shoulderX + 6)},${n(p.shoulderY - 12)} ${n(shoulderX)},${n(p.shoulderY - 8)} ` +
      `L${n(shoulderX)},${n(p.shoulderY - 4)} C${n(shoulderX + 8)},${n(p.shoulderY - 8)} ${n(M - 28)},${n(p.shoulderY - 7)} ${n(M - 6)},${n(p.shoulderY - 2)} Z`,
  );
  pair(
    "scapula",
    back
      ? `M${n(shoulderX + 2)},${n(p.shoulderY - 4)} C${n(shoulderX - 16)},${n(p.shoulderY + 2)} ${n(shoulderX - 22)},${n(p.shoulderY + 30)} ${n(shoulderX - 10)},${n(p.shoulderY + 52)} ` +
          `L${n(shoulderX + 8)},${n(p.shoulderY + 40)} C${n(shoulderX + 10)},${n(p.shoulderY + 18)} ${n(shoulderX + 8)},${n(p.shoulderY + 4)} ${n(shoulderX + 2)},${n(p.shoulderY - 4)} Z ` +
          `${box(shoulderX - 6, p.shoulderY + 8, 14, 2.4)}`
      : `M${n(shoulderX + 2)},${n(p.shoulderY - 4)} C${n(shoulderX - 14)},${n(p.shoulderY + 4)} ${n(shoulderX - 18)},${n(p.shoulderY + 28)} ${n(shoulderX - 8)},${n(p.shoulderY + 46)} ` +
          `L${n(shoulderX + 6)},${n(p.shoulderY + 34)} C${n(shoulderX + 8)},${n(p.shoulderY + 16)} ${n(shoulderX + 6)},${n(p.shoulderY + 4)} ${n(shoulderX + 2)},${n(p.shoulderY - 4)} Z`,
  );

  const armTop = p.shoulderY + 6;
  const humX = M - p.armX;
  const epi = p.epiphysisR;
  // the proximal humeral epiphysis is a separate ossification centre, so the
  // shaft (diaphysis) stops short of the joint and a physis sits between
  pair(
    "humerus",
    `${blob(humX + 2, armTop, epi, epi * 0.85)} ${shaft(humX, armTop + epi + p.physisW, p.boneW, humX - 4, p.elbowY - 6, p.boneW * 0.85)} ${blob(humX - 4, p.elbowY, epi * 0.8, epi * 0.6)}`,
  );
  pair("proximal-humeral-physis", band(humX + 1, armTop + epi + 1, p.boneW * 0.95, p.physisW));

  const wristX = humX - 8;
  pair(
    "ulna",
    `${blob(wristX + 4, p.elbowY + 8, epi * 0.6, epi * 0.55)} ${shaft(wristX + 4, p.elbowY + 12, p.boneW * 0.7, wristX + 5, p.wristY - 6, p.boneW * 0.55)}`,
  );
  pair(
    "radius",
    `${blob(wristX - 6, p.elbowY + 14, epi * 0.5, epi * 0.5)} ${shaft(wristX - 6, p.elbowY + 16, p.boneW * 0.55, wristX - 5, p.wristY - p.physisW - 4, p.boneW * 0.7)} ${blob(wristX - 5, p.wristY, epi * 0.72, epi * 0.5)}`,
  );
  pair("distal-radial-physis", band(wristX - 5, p.wristY - p.physisW - 1, p.boneW * 0.8, p.physisW));

  // carpal ossification centres — tiny in the infant, nearly adult in the teen
  const carp: [string, number, number][] = [
    ["scaphoid", -7, 6],
    ["lunate", -1, 5],
    ["triquetrum", 4, 8],
    ["pisiform", 8, 11],
    ["trapezium", -10, 14],
    ["trapezoid", -4, 15],
    ["capitate", 1, 14],
    ["hamate", 6, 17],
  ];
  carp.forEach(([base, dx, dy]) =>
    pair(base, blob(wristX - 3 + dx, p.wristY + 8 + dy, p.carpalR, p.carpalR * 0.88)),
  );

  const handSpan = p.handEnd - p.wristY;
  for (let i = 0; i < 5; i++) {
    const x1 = wristX - 12 + i * 6;
    const x2 = wristX - 18 + i * 8;
    const my = p.wristY + 26;
    const mEnd = my + handSpan * 0.3;
    pair(`metacarpal-${i + 1}`, shaft(x1, my, 3.2 - i * 0.15, x2, mEnd, 2.7 - i * 0.1));
    const segs2: [string, number, number][] = [
      [`proximal-phalanx-hand-${i + 1}`, mEnd + 3, mEnd + handSpan * (i === 0 ? 0.16 : 0.2)],
      [
        `middle-phalanx-hand-${i + 1}`,
        mEnd + handSpan * 0.22,
        mEnd + handSpan * 0.32,
      ],
      [
        `distal-phalanx-hand-${i + 1}`,
        mEnd + handSpan * (i === 0 ? 0.18 : 0.34),
        mEnd + handSpan * (i === 0 ? 0.28 : 0.42),
      ],
    ];
    segs2.forEach(([base, ya, yb], k) => {
      if (i === 0 && k === 1) return;
      pair(base, shaft(x2 - k, ya, 2.7 - k * 0.3, x2 - k - 1, yb, 2.4 - k * 0.3));
    });
  }

  /* ---------------- pelvis ---------------- */
  // ilium, ischium and pubis are still separate bones joined by the
  // triradiate cartilage until skeletal maturity
  const px = M - p.pelvisHalfW;
  const pTop = p.pelvisTop;
  pair(
    "ilium",
    `M${n(M - 12)},${n(pTop)} C${n(px + 4)},${n(pTop - 6)} ${n(px - 6)},${n(pTop + 14)} ${n(px - 2)},${n(pTop + 32)} ` +
      `L${n(M - 14)},${n(pTop + 38)} C${n(M - 10)},${n(pTop + 20)} ${n(M - 10)},${n(pTop + 8)} ${n(M - 12)},${n(pTop)} Z`,
  );
  pair(
    "triradiate-cartilage",
    `${band(M - 22, pTop + 42, 8, p.physisW + 1)} ${band(M - 30, pTop + 46, 5, p.physisW)}`,
  );
  pair(
    "ischium",
    `M${n(M - 30)},${n(pTop + 50)} C${n(M - 36)},${n(pTop + 60)} ${n(M - 30)},${n(p.pelvisBottom)} ${n(M - 20)},${n(p.pelvisBottom - 2)} ` +
      `C${n(M - 14)},${n(pTop + 62)} ${n(M - 18)},${n(pTop + 52)} ${n(M - 24)},${n(pTop + 48)} Z`,
  );
  pair(
    "pubis",
    `M${n(M - 18)},${n(pTop + 50)} C${n(M - 8)},${n(pTop + 54)} ${n(M - 2)},${n(pTop + 60)} ${n(M - 2)},${n(pTop + 66)} ` +
      `L${n(M - 14)},${n(pTop + 66)} C${n(M - 18)},${n(pTop + 60)} ${n(M - 20)},${n(pTop + 54)} ${n(M - 18)},${n(pTop + 50)} Z`,
  );

  /* ---------------- leg ---------------- */
  const fx = M - p.hipX;
  const hipY = p.pelvisBottom - 20;
  pair(
    "femur",
    `${blob(fx - 6, hipY, epi * 0.9, epi * 0.85)} ${shaft(fx - 2, hipY + 8, p.boneW + 1, fx - 6, p.kneeY - p.physisW - 8, p.boneW)} ${blob(fx - 6, p.kneeY - 2, epi * 1.15, epi * 0.85)}`,
  );
  if (p.capitalCenter)
    pair("capital-femoral-ossification-center", blob(fx - 12, hipY - 6, epi * 0.55, epi * 0.55));
  pair("distal-femoral-physis", band(fx - 6, p.kneeY - p.physisW - 4, p.boneW + 3, p.physisW));
  if (p.patellaR) pair("patella", blob(fx - 4, p.kneeY + 4, p.patellaR, p.patellaR * 1.1));

  const tx = fx - 2;
  pair(
    "tibia",
    `${blob(tx, p.kneeY + 12, epi * 1.1, epi * 0.6)} ${shaft(tx, p.kneeY + 16 + p.physisW, p.boneW + 1, tx + 4, p.ankleY - p.physisW - 6, p.boneW * 0.8)} ${blob(tx + 4, p.ankleY - 2, epi * 0.85, epi * 0.55)}`,
  );
  pair("proximal-tibial-physis", band(tx, p.kneeY + 16, p.boneW + 3, p.physisW));
  pair("distal-tibial-physis", band(tx + 4, p.ankleY - p.physisW - 3, p.boneW + 2, p.physisW));
  pair(
    "fibula",
    `${blob(tx - 16, p.kneeY + 16, epi * 0.45, epi * 0.45)} ${shaft(tx - 16, p.kneeY + 18, p.boneW * 0.5, tx - 12, p.ankleY - 4, p.boneW * 0.5)} ${blob(tx - 12, p.ankleY + 2, epi * 0.5, epi * 0.6)}`,
  );

  // tarsus: talus, calcaneus and cuboid ossify first — the cuneiforms and
  // navicular are still small centres in the young foot
  const ay = p.ankleY;
  const smallTarsal = p.id === "infant" ? 0.45 : p.id === "child" ? 0.75 : 1;
  pair("talus", blob(tx + 2, ay + 12, 9 * smallTarsal + 2, 6 * smallTarsal + 1.5));
  pair(
    "calcaneus",
    back
      ? `M${n(tx - 10)},${n(ay + 16)} C${n(tx - 18)},${n(ay + 30)} ${n(tx - 16)},${n(p.footEnd - 8)} ${n(tx - 4)},${n(p.footEnd - 4)} ` +
          `C${n(tx + 10)},${n(p.footEnd - 8)} ${n(tx + 10)},${n(ay + 28)} ${n(tx + 2)},${n(ay + 16)} Z`
      : blob(tx - 3, ay + 26, 11 * smallTarsal + 2, 9 * smallTarsal + 2),
  );
  pair("navicular", blob(tx + 12, ay + 22, 4.4 * smallTarsal + 1, 4 * smallTarsal + 1));
  pair("cuboid", blob(tx - 12, ay + 26, 5.4 * smallTarsal + 1, 4.6 * smallTarsal + 1));
  pair("medial-cuneiform", blob(tx + 17, ay + 32, 3.8 * smallTarsal + 1, 3.4 * smallTarsal + 1));
  pair("intermediate-cuneiform", blob(tx + 9, ay + 35, 3.4 * smallTarsal + 1, 3.2 * smallTarsal + 1));
  pair("lateral-cuneiform", blob(tx + 1, ay + 37, 3.4 * smallTarsal + 1, 3.2 * smallTarsal + 1));

  const footSpan = p.footEnd - ay;
  for (let i = 0; i < 5; i++) {
    const x1 = tx + 18 - i * 8;
    const x2 = x1 + 2;
    const y1 = ay + 40;
    const y2 = y1 + footSpan * 0.3;
    pair(`metatarsal-${i + 1}`, shaft(x1, y1, 3.4 - i * 0.15, x2, y2, 2.8 - i * 0.1));
    pair(
      `proximal-phalanx-foot-${i + 1}`,
      shaft(x2, y2 + 3, 2.7, x2 + 1, y2 + footSpan * (i === 0 ? 0.14 : 0.16), 2.3),
    );
    if (i > 0)
      pair(
        `middle-phalanx-foot-${i + 1}`,
        shaft(x2 + 1, y2 + footSpan * 0.18, 2.2, x2 + 1, y2 + footSpan * 0.24, 2),
      );
    pair(
      `distal-phalanx-foot-${i + 1}`,
      shaft(
        x2 + 1,
        y2 + footSpan * (i === 0 ? 0.16 : 0.26),
        2.1,
        x2 + 2,
        y2 + footSpan * (i === 0 ? 0.24 : 0.32),
        1.8,
      ),
    );
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* lateral builder                                                     */
/* ------------------------------------------------------------------ */

function buildPediatricLateral(p: AgeProfile, face: 1 | -1, nearSide: "left" | "right"): ViewShape[] {
  const shapes: ViewShape[] = [];
  const farSide = nearSide === "left" ? "right" : "left";
  const X = (o: number) => n(M + face * o);
  const push = (id: string, d: string, layer: "near" | "far") =>
    shapes.push({ id, d, mirrored: false, layer });

  const sw = p.skullHalfW;
  const vault = p.browY - p.skullTop;
  const epi = p.epiphysisR;

  /* profile skull: the young cranium is tall and rounded, the face small */
  push(
    "frontal",
    `M${X(2)},${n(p.skullTop)} C${X(sw * 0.6)},${n(p.skullTop + vault * 0.15)} ${X(sw * 0.72)},${n(p.skullTop + vault * 0.6)} ${X(sw * 0.66)},${n(p.browY)} ` +
      `L${X(sw * 0.34)},${n(p.browY - 4)} C${X(sw * 0.4)},${n(p.skullTop + vault * 0.5)} ${X(sw * 0.28)},${n(p.skullTop + vault * 0.2)} ${X(2)},${n(p.skullTop + vault * 0.12)} Z`,
    "near",
  );
  push(
    "occipital",
    `M${X(-sw * 0.5)},${n(p.skullTop + vault * 0.2)} C${X(-sw * 0.86)},${n(p.skullTop + vault * 0.5)} ${X(-sw * 0.84)},${n(p.browY)} ${X(-sw * 0.56)},${n(p.browY + vault * 0.2)} ` +
      `L${X(-sw * 0.3)},${n(p.browY - vault * 0.08)} C${X(-sw * 0.5)},${n(p.browY - vault * 0.3)} ${X(-sw * 0.5)},${n(p.skullTop + vault * 0.45)} ${X(-sw * 0.36)},${n(p.skullTop + vault * 0.3)} Z`,
    "near",
  );
  push("sphenoid", blob(M + face * sw * 0.1, p.browY + 4, sw * 0.16, 4), "near");
  push("ethmoid", blob(M + face * sw * 0.32, p.browY + 6, sw * 0.08, 3), "near");
  push("vomer", box(M + face * sw * 0.3, p.browY + 16, sw * 0.09, 3), "near");
  push(
    "mandible",
    `M${X(-sw * 0.2)},${n(p.browY + vault * 0.16)} L${X(-sw * 0.06)},${n(p.browY + vault * 0.16)} ` +
      `L${X(0)},${n(p.chinY - 10)} L${X(sw * 0.6)},${n(p.chinY - 6)} L${X(sw * 0.6)},${n(p.chinY)} ` +
      `L${X(-sw * 0.1)},${n(p.chinY - 4)} C${X(-sw * 0.26)},${n(p.chinY - 16)} ${X(-sw * 0.28)},${n(p.browY + vault * 0.4)} ${X(-sw * 0.2)},${n(p.browY + vault * 0.16)} Z`,
    "near",
  );
  push("hyoid", box(M + face * sw * 0.16, p.chinY + 14, sw * 0.16, 2), "near");
  push(
    "sternum",
    box(M + face * (p.shoulderHalfW * 0.6), (p.thoraxTop + p.thoraxBottom) / 2 - 20, 4, (p.thoraxBottom - p.thoraxTop) * 0.26),
    "near",
  );

  if (p.fontanelle)
    push(
      "anterior-fontanelle",
      box(M + face * sw * 0.08, p.skullTop + vault * 0.14, sw * 0.18, 4),
      "near",
    );
  if (p.metopic) push("metopic-suture", box(M + face * sw * 0.5, p.skullTop + vault * 0.4, 1.6, vault * 0.16), "near");
  if (p.fontanelle) push("posterior-fontanelle", blob(M + face * -sw * 0.42, p.skullTop + vault * 0.3, 4, 4), "near");

  /* spine in profile — the infant spine is a single C curve, the older spine
     develops cervical lordosis and lumbar lordosis */
  const infantCurve = p.id === "infant";
  const latVert = (y: number, o: number, w: number, h: number, sp: number) =>
    `${box(M + face * o, y + h / 2, w, h / 2 - p.vertebraGap / 2)} ${shaft(X(o - w), y + h * 0.5, h * 0.3, X(o - w - sp), y + h * 0.9, h * 0.15)}`;

  const cervH = (p.thoraxTop - p.neckTop) / 7;
  for (let i = 0; i < 7; i++)
    push(
      `c${i + 1}`,
      latVert(p.neckTop + i * cervH, infantCurve ? 2 - i : 8 + Math.sin((i / 6) * Math.PI) * 6, 5.5, cervH, 7),
      "near",
    );
  const thorH = (p.thoraxBottom - p.thoraxTop) / 12;
  for (let i = 0; i < 12; i++)
    push(`t${i + 1}`, latVert(p.thoraxTop + i * thorH, -2 - Math.sin((i / 11) * Math.PI) * 9, 7.5, thorH, 10), "near");
  const lumbH = (p.pelvisTop - p.lumbarTop) / 5;
  for (let i = 0; i < 5; i++)
    push(
      `l${i + 1}`,
      latVert(p.lumbarTop + i * lumbH, infantCurve ? -8 - i : -4 + Math.sin(((i + 0.5) / 5) * Math.PI) * 12, 9, lumbH, 11),
      "near",
    );

  push(
    "sacrum",
    `M${X(-2)},${n(p.pelvisTop + 2)} C${X(10)},${n(p.pelvisTop + 10)} ${X(12)},${n(p.pelvisBottom - 20)} ${X(4)},${n(p.pelvisBottom - 12)} ` +
      `L${X(-12)},${n(p.pelvisBottom - 20)} C${X(-12)},${n(p.pelvisTop + 14)} ${X(-10)},${n(p.pelvisTop + 6)} ${X(-2)},${n(p.pelvisTop + 2)} Z`,
    "near",
  );
  push("coccyx", blob(M + face * -10, p.pelvisBottom - 6, 4, 5), "near");

  const paired = (side: "left" | "right", ddx: number, ddy: number, layer: "near" | "far") => {
    const P = (o: number) => n(M + face * (o + ddx));
    const Y = (y: number) => n(y + ddy);
    const add = (base: string, d: string) => push(`${side}-${base}`, d, layer);

    add(
      "parietal",
      `M${P(-sw * 0.5)},${Y(p.skullTop + vault * 0.16)} C${P(-sw * 0.2)},${Y(p.skullTop - 4)} ${P(sw * 0.2)},${Y(p.skullTop - 2)} ${P(sw * 0.28)},${Y(p.skullTop + vault * 0.12)} ` +
        `L${P(sw * 0.14)},${Y(p.skullTop + vault * 0.55)} C${P(-sw * 0.14)},${Y(p.skullTop + vault * 0.45)} ${P(-sw * 0.4)},${Y(p.skullTop + vault * 0.5)} ${P(-sw * 0.5)},${Y(p.skullTop + vault * 0.6)} Z`,
    );
    add(
      "temporal",
      `M${P(-sw * 0.42)},${Y(p.skullTop + vault * 0.62)} C${P(-sw * 0.16)},${Y(p.skullTop + vault * 0.52)} ${P(sw * 0.1)},${Y(p.skullTop + vault * 0.58)} ${P(sw * 0.18)},${Y(p.browY - 2)} ` +
        `L${P(sw * 0.06)},${Y(p.browY + vault * 0.24)} C${P(-sw * 0.2)},${Y(p.browY + vault * 0.28)} ${P(-sw * 0.4)},${Y(p.browY)} ${P(-sw * 0.42)},${Y(p.skullTop + vault * 0.62)} Z`,
    );
    add("nasal", box(M + face * (sw * 0.62 + ddx), Y(p.browY + 6), sw * 0.08, 4));
    add("lacrimal", blob(M + face * (sw * 0.42 + ddx), Y(p.browY + 6), 3, 3));
    add("zygomatic", box(M + face * (sw * 0.34 + ddx), Y(p.browY + 16), sw * 0.24, 3.4));
    add("maxilla", box(M + face * (sw * 0.44 + ddx), Y(p.browY + 28), sw * 0.18, 7));
    add("palatine", blob(M + face * (sw * 0.24 + ddx), Y(p.browY + 34), 4, 2.6));

    add(
      "clavicle",
      `M${P(-4)},${Y(p.shoulderY - 8)} C${P(14)},${Y(p.shoulderY - 12)} ${P(28)},${Y(p.shoulderY - 6)} ${P(34)},${Y(p.shoulderY - 2)} ` +
        `L${P(33)},${Y(p.shoulderY + 2)} C${P(24)},${Y(p.shoulderY - 2)} ${P(10)},${Y(p.shoulderY - 6)} ${P(-4)},${Y(p.shoulderY - 4)} Z`,
    );
    add(
      "scapula",
      `M${P(-12)},${Y(p.shoulderY)} C${P(-26)},${Y(p.shoulderY + 10)} ${P(-28)},${Y(p.shoulderY + 40)} ${P(-16)},${Y(p.shoulderY + 54)} ` +
        `L${P(-4)},${Y(p.shoulderY + 40)} C${P(-8)},${Y(p.shoulderY + 26)} ${P(-8)},${Y(p.shoulderY + 10)} ${P(-4)},${Y(p.shoulderY + 4)} Z`,
    );

    for (let i = 0; i < 12; i++) {
      const yb = Y(p.thoraxTop + 4 + i * ((p.thoraxBottom - p.thoraxTop) / 13));
      const reach = p.shoulderHalfW * (0.55 + Math.sin(((i + 1) / 13) * Math.PI) * 0.3);
      const yf = yb + 20 + i * 2;
      const t = 3.6;
      add(
        `rib-${i + 1}`,
        `M${P(-8)},${yb} C${P(-8 + reach * 0.6)},${n(yb + 2)} ${P(-8 + reach)},${n(yb + 12)} ${P(-8 + reach * 0.8)},${n(yf)} ` +
          `L${P(-8 + reach * 0.8 - 3)},${n(yf + t)} C${P(-8 + reach - 4)},${n(yb + 14)} ${P(-8 + reach * 0.6)},${n(yb + 2 + t)} ${P(-8)},${n(yb + t)} Z`,
      );
    }

    const armTop = Y(p.shoulderY + 8);
    add(
      "humerus",
      `${blob(M + face * (-10 + ddx), armTop, epi, epi * 0.85)} ${shaft(P(-12), armTop + epi + p.physisW, p.boneW, P(-16), Y(p.elbowY), p.boneW * 0.85)} ${blob(M + face * (-16 + ddx), Y(p.elbowY + 6), epi * 0.8, epi * 0.6)}`,
    );
    add("proximal-humeral-physis", band(M + face * (-11 + ddx), armTop + epi + 1, p.boneW * 0.95, p.physisW));
    add(
      "ulna",
      `${blob(M + face * (-14 + ddx), Y(p.elbowY + 12), epi * 0.6, epi * 0.5)} ${shaft(P(-14), Y(p.elbowY + 16), p.boneW * 0.65, P(-4), Y(p.wristY), p.boneW * 0.5)}`,
    );
    add(
      "radius",
      `${blob(M + face * (-2 + ddx), Y(p.elbowY + 16), epi * 0.5, epi * 0.5)} ${shaft(P(-2), Y(p.elbowY + 18), p.boneW * 0.5, P(6), Y(p.wristY - p.physisW - 3), p.boneW * 0.65)} ${blob(M + face * (6 + ddx), Y(p.wristY + 3), epi * 0.7, epi * 0.5)}`,
    );
    add("distal-radial-physis", band(M + face * (6 + ddx), Y(p.wristY - p.physisW), p.boneW * 0.8, p.physisW));

    const carp: [string, number, number][] = [
      ["scaphoid", 8, 10],
      ["lunate", 2, 9],
      ["triquetrum", -3, 13],
      ["pisiform", -7, 17],
      ["trapezium", 12, 20],
      ["trapezoid", 7, 21],
      ["capitate", 2, 20],
      ["hamate", -3, 24],
    ];
    carp.forEach(([base, o, dy]) =>
      add(base, blob(M + face * (o + ddx), Y(p.wristY + dy), p.carpalR, p.carpalR * 0.88)),
    );

    const handSpan = p.handEnd - p.wristY;
    for (let i = 0; i < 5; i++) {
      const o1 = 10 - i * 1.6;
      const o2 = 14 - i * 2.2;
      const y1 = Y(p.wristY + 30 + i * 1.5);
      const mEnd = y1 + handSpan * 0.28;
      add(`metacarpal-${i + 1}`, shaft(P(o1), y1, 3.2 - i * 0.15, P(o2), mEnd, 2.7 - i * 0.1));
      add(`proximal-phalanx-hand-${i + 1}`, shaft(P(o2), mEnd + 3, 2.7, P(o2 + 2), mEnd + handSpan * (i === 0 ? 0.16 : 0.2), 2.4));
      if (i > 0)
        add(`middle-phalanx-hand-${i + 1}`, shaft(P(o2 + 2), mEnd + handSpan * 0.22, 2.4, P(o2 + 3), mEnd + handSpan * 0.3, 2.1));
      add(
        `distal-phalanx-hand-${i + 1}`,
        shaft(
          P(o2 + 2),
          mEnd + handSpan * (i === 0 ? 0.18 : 0.32),
          2.2,
          P(o2 + 3),
          mEnd + handSpan * (i === 0 ? 0.26 : 0.4),
          1.9,
        ),
      );
    }

    const pTop = Y(p.pelvisTop);
    add(
      "ilium",
      `M${P(-14)},${pTop} C${P(6)},${n(pTop - 4)} ${P(20)},${n(pTop + 12)} ${P(20)},${n(pTop + 30)} ` +
        `L${P(2)},${n(pTop + 42)} C${P(-10)},${n(pTop + 32)} ${P(-18)},${n(pTop + 16)} ${P(-14)},${pTop} Z`,
    );
    add("triradiate-cartilage", band(M + face * (4 + ddx), n(pTop + 46), 8, p.physisW + 1));
    add(
      "ischium",
      `M${P(-8)},${n(pTop + 50)} C${P(0)},${n(pTop + 58)} ${P(2)},${n(pTop + 70)} ${P(-8)},${n(pTop + 74)} L${P(-18)},${n(pTop + 62)} Z`,
    );
    add(
      "pubis",
      `M${P(4)},${n(pTop + 52)} C${P(18)},${n(pTop + 56)} ${P(22)},${n(pTop + 64)} ${P(16)},${n(pTop + 70)} L${P(2)},${n(pTop + 64)} Z`,
    );

    const hipY = Y(p.pelvisBottom - 20);
    add(
      "femur",
      `${blob(M + face * (-4 + ddx), hipY, epi * 0.9, epi * 0.85)} ${shaft(P(-2), hipY + 10, p.boneW + 1, P(4), Y(p.kneeY - p.physisW - 8), p.boneW)} ${blob(M + face * (4 + ddx), Y(p.kneeY - 2), epi * 1.1, epi * 0.85)}`,
    );
    if (p.capitalCenter)
      add("capital-femoral-ossification-center", blob(M + face * (-10 + ddx), hipY - 6, epi * 0.55, epi * 0.55));
    add("distal-femoral-physis", band(M + face * (4 + ddx), Y(p.kneeY - p.physisW - 4), p.boneW + 3, p.physisW));
    if (p.patellaR) add("patella", blob(M + face * (16 + ddx), Y(p.kneeY + 2), p.patellaR * 0.85, p.patellaR * 1.1));

    add(
      "tibia",
      `${blob(M + face * (2 + ddx), Y(p.kneeY + 12), epi * 1, epi * 0.55)} ${shaft(P(2), Y(p.kneeY + 16 + p.physisW), p.boneW, P(8), Y(p.ankleY - p.physisW - 6), p.boneW * 0.8)} ${blob(M + face * (8 + ddx), Y(p.ankleY - 2), epi * 0.8, epi * 0.5)}`,
    );
    add("proximal-tibial-physis", band(M + face * (2 + ddx), Y(p.kneeY + 16), p.boneW + 3, p.physisW));
    add("distal-tibial-physis", band(M + face * (8 + ddx), Y(p.ankleY - p.physisW - 3), p.boneW + 2, p.physisW));
    add(
      "fibula",
      `${blob(M + face * (-10 + ddx), Y(p.kneeY + 16), epi * 0.45, epi * 0.45)} ${shaft(P(-10), Y(p.kneeY + 18), p.boneW * 0.45, P(-2), Y(p.ankleY - 4), p.boneW * 0.45)} ${blob(M + face * (-2 + ddx), Y(p.ankleY + 4), epi * 0.5, epi * 0.6)}`,
    );

    const st = p.id === "infant" ? 0.45 : p.id === "child" ? 0.75 : 1;
    add("talus", blob(M + face * (2 + ddx), Y(p.ankleY + 12), 8 * st + 2, 6 * st + 1));
    add(
      "calcaneus",
      `M${P(-24)},${Y(p.ankleY + 20)} C${P(-8)},${Y(p.ankleY + 14)} ${P(2)},${Y(p.ankleY + 24)} ${P(0)},${Y(p.ankleY + 36)} ` +
        `L${P(-20)},${Y(p.ankleY + 40)} C${P(-28)},${Y(p.ankleY + 34)} ${P(-30)},${Y(p.ankleY + 26)} ${P(-24)},${Y(p.ankleY + 20)} Z`,
    );
    add("navicular", blob(M + face * (13 + ddx), Y(p.ankleY + 22), 4 * st + 1, 4 * st + 1));
    add("cuboid", blob(M + face * (6 + ddx), Y(p.ankleY + 34), 5 * st + 1, 4.4 * st + 1));
    add("medial-cuneiform", blob(M + face * (22 + ddx), Y(p.ankleY + 26), 3.8 * st + 1, 3.4 * st + 1));
    add("intermediate-cuneiform", blob(M + face * (21 + ddx), Y(p.ankleY + 33), 3.4 * st + 1, 3.2 * st + 1));
    add("lateral-cuneiform", blob(M + face * (18 + ddx), Y(p.ankleY + 40), 3.4 * st + 1, 3.2 * st + 1));

    const footSpan = p.footEnd - p.ankleY;
    for (let i = 0; i < 5; i++) {
      const y = Y(p.ankleY + 28 + i * 3.4);
      add(`metatarsal-${i + 1}`, shaft(P(28), y, 3.2 - i * 0.15, P(28 + footSpan * 0.34), y + 6, 2.7 - i * 0.12));
      add(
        `proximal-phalanx-foot-${i + 1}`,
        shaft(P(30 + footSpan * 0.34), y + 6, 2.7, P(30 + footSpan * 0.5), y + 8, 2.3),
      );
      if (i > 0)
        add(
          `middle-phalanx-foot-${i + 1}`,
          shaft(P(31 + footSpan * 0.5), y + 8, 2.3, P(31 + footSpan * 0.58), y + 9, 2),
        );
      add(
        `distal-phalanx-foot-${i + 1}`,
        shaft(
          P(31 + footSpan * (i === 0 ? 0.5 : 0.58)),
          y + 9,
          2.1,
          P(31 + footSpan * (i === 0 ? 0.6 : 0.66)),
          y + 10,
          1.8,
        ),
      );
    }
  };

  paired(farSide, -6, -6, "far");
  paired(nearSide, 0, 0, "near");

  return shapes;
}

/* ------------------------------------------------------------------ */

const buildAge = (p: AgeProfile): Record<SkeletonView, ViewShape[]> => ({
  anterior: buildFrontal(p, "anterior"),
  posterior: buildFrontal(p, "posterior"),
  "left-lateral": buildPediatricLateral(p, 1, "left"),
  "right-lateral": buildPediatricLateral(p, -1, "right"),
});

export const PEDIATRIC_GEOMETRY: Record<
  Exclude<SkeletonAgeGroup, "adult">,
  Record<SkeletonView, ViewShape[]>
> = {
  infant: buildAge(AGE_PROFILES.infant),
  child: buildAge(AGE_PROFILES.child),
  adolescent: buildAge(AGE_PROFILES.adolescent),
};
