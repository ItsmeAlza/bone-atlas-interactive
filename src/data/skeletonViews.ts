/**
 * View-specific SVG geometry.
 *
 * Every view is authored with its OWN anatomical geometry — nothing here is a
 * rotation, scale or CSS transform of the anterior drawing. What is shared
 * across views is the anatomical identity: a bone keeps the id `left-femur`
 * whether it is drawn from the front, the back or the side, so selection and
 * clinical data are view independent.
 */
import { BONES, VIEWBOX, blob, n, shaft } from "@/data/bones";
import type { SkeletonView, ViewShape } from "@/types/bone";

const M = VIEWBOX.width / 2; // 200

/* ================================================================== */
/* ANTERIOR — the original drawing                                     */
/* ================================================================== */

const anterior: ViewShape[] = BONES.map((b) => ({
  id: b.id,
  d: b.d,
  mirrored: b.mirrored,
  layer: "near",
}));

/* ================================================================== */
/* POSTERIOR — spinous processes, scapulae, heel bones                 */
/* ================================================================== */

/** vertebra seen from behind: laminae + a downward spinous process */
const spinous = (y: number, w: number, h: number) =>
  `M${n(M - w)},${n(y)} L${n(M + w)},${n(y)} L${n(M + w * 0.55)},${n(y + h * 0.6)} ` +
  `L${n(M + 2.4)},${n(y + h)} L${n(M - 2.4)},${n(y + h)} L${n(M - w * 0.55)},${n(y + h * 0.6)} Z ` +
  `${blob(M - w - 5, y + 3, 4.2, 2.6)} ${blob(M + w + 5, y + 3, 4.2, 2.6)}`;

/** posterior rib: leaves the spine almost horizontally then sweeps steeply down */
const ribPosterior = (i: number) => {
  const y0 = 202 + i * 10;
  const spread = 22 + Math.sin(((i + 1) / 13) * Math.PI) * 52;
  const xOut = 192 - spread;
  const yf = y0 + 28 + i * 1.8;
  const t = 4.4;
  return (
    `M192,${n(y0)} C${n(192 - spread * 0.45)},${n(y0 - 5)} ${n(xOut - 5)},${n(y0 + 10)} ${n(xOut + 7)},${n(yf)} ` +
    `L${n(xOut + 7 + t)},${n(yf - 1)} C${n(xOut + 2 + t)},${n(y0 + 10)} ${n(192 - spread * 0.45)},${n(y0 - 5 + t)} 192,${n(y0 + t)} Z`
  );
};

const posteriorMidline: { id: string; d: string }[] = [
  {
    id: "occipital",
    d: "M164,50 C166,80 180,100 200,106 C220,100 234,80 236,50 C214,60 186,60 164,50 Z",
  },
  { id: "sphenoid", d: blob(200, 62, 7, 3) },
  { id: "ethmoid", d: blob(200, 74, 4, 2.4) },
  { id: "vomer", d: blob(200, 84, 2.6, 3) },
  {
    id: "mandible",
    d: "M178,96 C184,114 216,114 222,96 L217,94 C212,108 188,108 183,94 Z",
  },
  { id: "hyoid", d: "M189,120 C195,116 205,116 211,120 L210,124 C205,121 195,121 190,124 Z" },
  {
    id: "sacrum",
    d: "M181,402 L219,402 C216,424 210,442 200,452 C190,442 184,424 181,402 Z M191,410 L209,410 L207,438 L200,444 L193,438 Z",
  },
  { id: "coccyx", d: "M195,453 L205,453 L203,468 L197,468 Z" },
];

// posterior vertebral column
for (let i = 0; i < 7; i++) posteriorMidline.push({ id: `c${i + 1}`, d: spinous(114 + i * 8.5, 9, 7.5) });
for (let i = 0; i < 12; i++)
  posteriorMidline.push({ id: `t${i + 1}`, d: spinous(176 + i * 11.5, 11 + i * 0.25, 10.5) });
for (let i = 0; i < 5; i++) posteriorMidline.push({ id: `l${i + 1}`, d: spinous(320 + i * 15, 16, 13.5) });

/** authored for the patient's LEFT side, which is the viewer's left in a posterior view */
const posteriorSide: { base: string; d: string }[] = [
  { base: "parietal", d: "M196,14 C176,15 163,30 163,52 C176,58 190,60 197,58 Z" },
  { base: "temporal", d: "M163,54 C163,70 170,86 181,94 L188,84 C178,76 172,66 172,54 Z" },
  { base: "zygomatic", d: blob(173, 88, 5, 4) },
  { base: "nasal", d: blob(193, 74, 2.6, 3.2) },
  { base: "lacrimal", d: blob(188, 80, 2.4, 2.4) },
  { base: "maxilla", d: blob(188, 96, 6, 4) },
  { base: "palatine", d: blob(193, 104, 3.4, 2.6) },

  // shoulder girdle from behind — the scapula dominates
  { base: "clavicle", d: "M196,188 C182,182 166,180 152,183 L151,187 C166,184 182,186 196,192 Z" },
  {
    base: "scapula",
    d:
      "M150,190 C130,193 118,203 117,215 C121,240 136,258 147,260 C152,240 154,212 150,190 Z " +
      "M120,206 L150,199 L150,205 L121,213 Z",
  },

  { base: "humerus", d: `${blob(124, 212, 9.5, 8.5)} ${shaft(122, 216, 6.8, 118, 338, 5.8)} ${blob(118, 344, 9, 7)}` },
  {
    base: "ulna",
    d: `${blob(124, 348, 7.5, 7)} ${shaft(123, 354, 5.2, 121, 449, 4.2)}`,
  },
  { base: "radius", d: `${blob(109, 358, 4.4, 4.4)} ${shaft(109, 359, 3.6, 107, 450, 5.4)}` },

  { base: "scaphoid", d: blob(111, 458, 4.8, 4) },
  { base: "lunate", d: blob(118.5, 457, 4.4, 4) },
  { base: "triquetrum", d: blob(125, 461, 4, 3.5) },
  { base: "pisiform", d: blob(129.5, 464, 2.8, 2.4) },
  { base: "trapezium", d: blob(106, 468, 4.4, 4) },
  { base: "trapezoid", d: blob(112.5, 469, 3.8, 3.4) },
  { base: "capitate", d: blob(119, 468, 4.8, 4.2) },
  { base: "hamate", d: blob(126, 471, 4.4, 3.8) },

  { base: "ilium", d: "M190,398 C170,392 146,402 139,420 C142,436 154,446 168,447 C182,438 191,418 190,402 Z" },
  { base: "ischium", d: "M160,447 C150,458 153,472 166,474 C175,469 179,458 176,450 Z" },
  { base: "pubis", d: "M177,452 C186,456 194,462 194,468 C186,472 176,468 170,462 Z" },

  {
    base: "femur",
    d: `${blob(180, 454, 9.5, 9.5)} ${shaft(174, 462, 8.8, 168, 626, 7.8)} ${blob(161, 636, 10.5, 9.5)} ${blob(177, 636, 9.5, 9)}`,
  },
  { base: "tibia", d: `${blob(172, 662, 13, 6.5)} ${shaft(172, 664, 10.5, 176, 796, 6)} ${blob(178, 801, 7.5, 6)}` },
  { base: "fibula", d: `${blob(154, 666, 5.2, 5.2)} ${shaft(154, 668, 4.2, 158, 796, 4.4)} ${blob(158, 802, 5.4, 6.4)}` },

  // from behind, the heel is the dominant foot structure
  { base: "calcaneus", d: "M156,812 C146,824 146,852 156,864 C170,868 182,858 182,842 C182,826 172,812 164,809 Z" },
  { base: "talus", d: blob(168, 806, 10, 6) },
  { base: "navicular", d: blob(182, 820, 5, 4.4) },
  { base: "cuboid", d: blob(152, 828, 5.4, 5) },
  { base: "medial-cuneiform", d: blob(186, 834, 4.2, 3.6) },
  { base: "intermediate-cuneiform", d: blob(178, 838, 4, 3.4) },
  { base: "lateral-cuneiform", d: blob(170, 842, 4, 3.4) },
];

// posterior metatarsals + toes peek out beside the heel
[
  { x1: 188, y1: 840, x2: 190, y2: 866 },
  { x1: 180, y1: 844, x2: 182, y2: 872 },
  { x1: 172, y1: 848, x2: 173, y2: 870 },
  { x1: 163, y1: 848, x2: 164, y2: 866 },
  { x1: 152, y1: 840, x2: 150, y2: 862 },
].forEach((g, i) => {
  posteriorSide.push({ base: `metatarsal-${i + 1}`, d: shaft(g.x1, g.y1, 3.4, g.x2, g.y2, 2.8) });
  posteriorSide.push({ base: `proximal-phalanx-foot-${i + 1}`, d: blob(g.x2, g.y2 + 6, 3, 2.6) });
  if (i > 0) posteriorSide.push({ base: `middle-phalanx-foot-${i + 1}`, d: blob(g.x2, g.y2 + 12, 2.6, 2.2) });
  posteriorSide.push({ base: `distal-phalanx-foot-${i + 1}`, d: blob(g.x2, g.y2 + (i > 0 ? 17 : 12), 2.4, 2) });
});

// dorsum of the hand
[
  { x1: 101, y1: 474, x2: 93, y2: 494 },
  { x1: 111, y1: 474, x2: 107, y2: 504 },
  { x1: 118, y1: 475, x2: 116, y2: 506 },
  { x1: 124, y1: 476, x2: 124, y2: 504 },
  { x1: 129, y1: 478, x2: 131, y2: 500 },
].forEach((g, i) => {
  posteriorSide.push({ base: `metacarpal-${i + 1}`, d: shaft(g.x1, g.y1, 3.8, g.x2, g.y2, 3) });
  posteriorSide.push({
    base: `proximal-phalanx-hand-${i + 1}`,
    d: shaft(g.x2, g.y2 + 2, 3, g.x2 - 2, g.y2 + (i === 0 ? 16 : 20), 2.6),
  });
  if (i > 0)
    posteriorSide.push({
      base: `middle-phalanx-hand-${i + 1}`,
      d: shaft(g.x2 - 2, g.y2 + 22, 2.6, g.x2 - 3, g.y2 + 32, 2.2),
    });
  posteriorSide.push({
    base: `distal-phalanx-hand-${i + 1}`,
    d: shaft(g.x2 - 2, g.y2 + (i === 0 ? 18 : 34), 2.3, g.x2 - 3, g.y2 + (i === 0 ? 28 : 42), 2),
  });
});

for (let i = 0; i < 12; i++) posteriorSide.push({ base: `rib-${i + 1}`, d: ribPosterior(i) });

const posterior: ViewShape[] = [
  ...posteriorMidline.map((b) => ({ id: b.id, d: b.d, mirrored: false, layer: "near" as const })),
  // in a posterior view the patient's left side is on the viewer's left,
  // so the authored (x < 200) geometry is the LEFT side.
  ...posteriorSide.flatMap((b) => [
    { id: `left-${b.base}`, d: b.d, mirrored: false, layer: "near" as const },
    { id: `right-${b.base}`, d: b.d, mirrored: true, layer: "near" as const },
  ]),
];

/* ================================================================== */
/* LATERAL VIEWS — true profile geometry                               */
/* ================================================================== */

/**
 * Builds a profile skeleton.
 * `face` = +1 when the subject faces the right of the image (left lateral view),
 * -1 when the subject faces the left of the image (right lateral view).
 * Anterior structures therefore sit at positive offsets, posterior at negative.
 */
function buildLateral(face: 1 | -1, nearSide: "left" | "right"): ViewShape[] {
  const farSide = nearSide === "left" ? "right" : "left";
  const shapes: ViewShape[] = [];

  /* ---- midline / profile-only structures ---- */
  const X = (o: number) => n(M + face * o);

  const push = (id: string, d: string, layer: "near" | "far" = "near") =>
    shapes.push({ id, d, mirrored: false, layer });

  // skull in profile
  push("frontal", `M${X(4)},16 C${X(26)},20 ${X(38)},38 ${X(37)},58 L${X(21)},60 C${X(23)},44 ${X(16)},28 ${X(2)},24 Z`);
  push(
    "occipital",
    `M${X(-32)},26 C${X(-46)},42 ${X(-45)},66 ${X(-32)},78 L${X(-19)},66 C${X(-28)},57 ${X(-30)},44 ${X(-24)},33 Z`,
  );
  push("sphenoid", `M${X(8)},60 C${X(18)},57 ${X(24)},62 ${X(22)},69 L${X(9)},70 C${X(5)},67 ${X(5)},62 ${X(8)},60 Z`);
  push("ethmoid", blob(M + face * 26, 66, 4.4, 3.4));
  push("vomer", `M${X(24)},76 L${X(34)},77 L${X(33)},81 L${X(24)},80 Z`);
  push(
    "mandible",
    `M${X(-14)},68 L${X(-7)},68 L${X(-3)},95 L${X(35)},100 L${X(35)},110 L${X(-8)},104 ` +
      `C${X(-17)},97 ${X(-19)},81 ${X(-14)},68 Z`,
  );
  push("hyoid", `M${X(6)},122 L${X(20)},121 L${X(20)},125 L${X(6)},126 Z`);
  push("sternum", `M${X(44)},214 L${X(50)},215 L${X(48)},254 L${X(45)},276 L${X(42)},254 Z`);

  // curved vertebral column: cervical lordosis, thoracic kyphosis, lumbar lordosis
  const latVert = (y: number, o: number, w: number, h: number, spine: number) =>
    `M${X(o - w)},${n(y)} L${X(o + w)},${n(y + 0.5)} L${X(o + w)},${n(y + h)} L${X(o - w)},${n(y + h - 0.5)} Z ` +
    shaft(X(o - w), y + h * 0.45, h * 0.32, X(o - w - spine), y + h * 0.95, h * 0.16);

  const cervOff = (i: number) => 12 + Math.sin((i / 6) * Math.PI) * 6;
  const thorOff = (i: number) => 4 - Math.sin((i / 11) * Math.PI) * 11;
  const lumbOff = (i: number) => -6 + Math.sin(((i + 0.5) / 5) * Math.PI) * 14 + i * 1.5;

  for (let i = 0; i < 7; i++)
    push(`c${i + 1}`, latVert(126 + i * 9, cervOff(i), 6.5, 7, 9));
  for (let i = 0; i < 12; i++) push(`t${i + 1}`, latVert(192 + i * 12, thorOff(i), 8.5, 10, 13));
  for (let i = 0; i < 5; i++) push(`l${i + 1}`, latVert(336 + i * 14, lumbOff(i), 10.5, 12, 14));

  push(
    "sacrum",
    `M${X(-2)},406 C${X(12)},412 ${X(16)},430 ${X(8)},446 L${X(-12)},438 C${X(-14)},424 ${X(-12)},412 ${X(-2)},406 Z`,
  );
  push("coccyx", `M${X(-11)},440 C${X(-6)},448 ${X(-8)},458 ${X(-14)},460 L${X(-18)},452 Z`);

  /* ---- paired structures: drawn once for the near side and once, offset and
         dimmed, for the far side. Both remain independently clickable. ---- */
  const paired = (side: "left" | "right", ddx: number, ddy: number, layer: "near" | "far") => {
    const P = (o: number) => n(M + face * (o + ddx));
    const Y = (y: number) => n(y + ddy);
    const id = (base: string) => `${side}-${base}`;
    const add = (base: string, d: string) => push(id(base), d, layer);

    // skull halves visible in profile
    add(
      "parietal",
      `M${P(-30)},26 C${P(-14)},13 ${P(8)},15 ${P(10)},22 L${P(4)},${Y(46)} C${P(-12)},${Y(42)} ${P(-24)},${Y(44)} ${P(-30)},${Y(50)} Z`,
    );
    add(
      "temporal",
      `M${P(-25)},${Y(50)} C${P(-13)},${Y(46)} ${P(3)},${Y(49)} ${P(9)},${Y(57)} L${P(4)},${Y(78)} C${P(-10)},${Y(80)} ${P(-21)},${Y(71)} ${P(-25)},${Y(60)} Z`,
    );
    add("nasal", `M${P(33)},${Y(62)} L${P(41)},${Y(68)} L${P(37)},${Y(72)} L${P(31)},${Y(68)} Z`);
    add("lacrimal", blob(M + face * (22 + ddx), Y(66), 3, 3));
    add("zygomatic", `M${P(6)},${Y(72)} L${P(30)},${Y(74)} L${P(30)},${Y(81)} L${P(6)},${Y(79)} Z`);
    add("maxilla", `M${P(16)},${Y(84)} L${P(36)},${Y(82)} L${P(34)},${Y(99)} L${P(16)},${Y(96)} Z`);
    add("palatine", blob(M + face * (14 + ddx), Y(94), 4, 2.6));

    // shoulder girdle in profile
    add("clavicle", `M${P(-6)},${Y(188)} C${P(12)},${Y(186)} ${P(28)},${Y(190)} ${P(36)},${Y(196)} L${P(35)},${Y(200)} C${P(26)},${Y(195)} ${P(10)},${Y(191)} ${P(-6)},${Y(193)} Z`);
    add(
      "scapula",
      `M${P(-14)},${Y(196)} C${P(-30)},${Y(206)} ${P(-32)},${Y(238)} ${P(-18)},${Y(254)} ` +
        `L${P(-4)},${Y(240)} C${P(-10)},${Y(226)} ${P(-8)},${Y(208)} ${P(-4)},${Y(200)} Z`,
    );

    // ribs seen edge-on: they leave the spine posteriorly and sweep forward
    for (let i = 0; i < 12; i++) {
      const yb = Y(204 + i * 11);
      const reach = 44 + Math.sin(((i + 1) / 13) * Math.PI) * 20;
      const yf = Y(204 + i * 11 + 26 + i * 2.2);
      const t = 4;
      add(
        `rib-${i + 1}`,
        `M${P(-8)},${yb} C${P(-8 + reach * 0.6)},${n(yb + 2)} ${P(-8 + reach)},${n(yb + 14)} ${P(-8 + reach * 0.8)},${yf} ` +
          `L${P(-8 + reach * 0.8 - 3)},${n(yf + t)} C${P(-8 + reach - 4)},${n(yb + 16)} ${P(-8 + reach * 0.6)},${n(yb + 2 + t)} ${P(-8)},${n(yb + t)} Z`,
      );
    }

    // arm hanging beside the trunk
    add(
      "humerus",
      `${blob(M + face * (-12 + ddx), Y(210), 9, 8)} ${shaft(P(-14), Y(216), 6.5, P(-18), Y(336), 5.5)} ${blob(M + face * (-18 + ddx), Y(342), 8.5, 6.5)}`,
    );
    add("ulna", `${blob(M + face * (-16 + ddx), Y(350), 6.5, 5.5)} ${shaft(P(-16), Y(354), 5, P(-4), Y(448), 4)}`);
    add("radius", `${blob(M + face * (-4 + ddx), Y(358), 4.5, 4.5)} ${shaft(P(-4), Y(359), 3.6, P(6), Y(449), 5)}`);

    const carpals: [string, number, number, number][] = [
      ["scaphoid", 8, 456, 4.4],
      ["lunate", 2, 455, 4],
      ["triquetrum", -3, 459, 3.6],
      ["pisiform", -7, 463, 2.6],
      ["trapezium", 12, 466, 4.2],
      ["trapezoid", 7, 467, 3.6],
      ["capitate", 2, 467, 4.4],
      ["hamate", -3, 470, 4],
    ];
    carpals.forEach(([base, o, y, r]) => add(base, blob(M + face * (o + ddx), Y(y), r, r * 0.88)));

    for (let i = 0; i < 5; i++) {
      const o1 = 12 - i * 1.6;
      const o2 = 16 - i * 2.2;
      const y1 = 474 + i * 1.5;
      add(`metacarpal-${i + 1}`, shaft(P(o1), Y(y1), 3.4 - i * 0.15, P(o2), Y(y1 + 26), 2.9 - i * 0.1));
      add(
        `proximal-phalanx-hand-${i + 1}`,
        shaft(P(o2), Y(y1 + 28), 2.9, P(o2 + 2), Y(y1 + (i === 0 ? 42 : 46)), 2.5),
      );
      if (i > 0)
        add(
          `middle-phalanx-hand-${i + 1}`,
          shaft(P(o2 + 2), Y(y1 + 48), 2.5, P(o2 + 3), Y(y1 + 58), 2.2),
        );
      add(
        `distal-phalanx-hand-${i + 1}`,
        shaft(P(o2 + 2), Y(y1 + (i === 0 ? 44 : 60)), 2.3, P(o2 + 3), Y(y1 + (i === 0 ? 54 : 68)), 2),
      );
    }

    // pelvis in profile: iliac blade, ischial tuberosity, pubic ramus
    add(
      "ilium",
      `M${P(-16)},${Y(400)} C${P(6)},${Y(396)} ${P(22)},${Y(410)} ${P(22)},${Y(430)} ` +
        `L${P(2)},${Y(444)} C${P(-12)},${Y(434)} ${P(-20)},${Y(418)} ${P(-16)},${Y(400)} Z`,
    );
    add("ischium", `M${P(-10)},${Y(444)} C${P(-2)},${Y(452)} ${P(0)},${Y(466)} ${P(-10)},${Y(470)} L${P(-20)},${Y(458)} Z`);
    add("pubis", `M${P(2)},${Y(448)} C${P(16)},${Y(452)} ${P(22)},${Y(460)} ${P(16)},${Y(466)} L${P(0)},${Y(460)} Z`);

    // leg in profile
    add(
      "femur",
      `${blob(M + face * (-4 + ddx), Y(452), 9.5, 9)} ${shaft(P(-2), Y(462), 8.5, P(4), Y(624), 7.5)} ${blob(M + face * (2 + ddx), Y(634), 10, 9.5)}`,
    );
    add("patella", blob(M + face * (16 + ddx), Y(642), 6.5, 8));
    add(
      "tibia",
      `${blob(M + face * (2 + ddx), Y(658), 9, 6)} ${shaft(P(2), Y(662), 7.5, P(8), Y(794), 5.5)} ${blob(M + face * (8 + ddx), Y(800), 6.5, 5.5)}`,
    );
    add(
      "fibula",
      `${blob(M + face * (-10 + ddx), Y(664), 4.6, 4.6)} ${shaft(P(-10), Y(666), 3.8, P(-2), Y(794), 4)} ${blob(M + face * (-2 + ddx), Y(802), 5, 6)}`,
    );

    // foot profile: heel behind, toes in front
    add("talus", blob(M + face * (2 + ddx), Y(812), 9, 6.5));
    add(
      "calcaneus",
      `M${P(-26)},${Y(818)} C${P(-10)},${Y(812)} ${P(2)},${Y(822)} ${P(0)},${Y(836)} ` +
        `L${P(-22)},${Y(840)} C${P(-30)},${Y(834)} ${P(-32)},${Y(824)} ${P(-26)},${Y(818)} Z`,
    );
    add("navicular", blob(M + face * (14 + ddx), Y(820), 5, 5));
    add("cuboid", blob(M + face * (6 + ddx), Y(834), 5.6, 4.6));
    add("medial-cuneiform", blob(M + face * (24 + ddx), Y(824), 4.4, 4));
    add("intermediate-cuneiform", blob(M + face * (23 + ddx), Y(832), 4, 3.6));
    add("lateral-cuneiform", blob(M + face * (20 + ddx), Y(839), 4, 3.4));

    for (let i = 0; i < 5; i++) {
      const y = 826 + i * 3.4;
      add(`metatarsal-${i + 1}`, shaft(P(30), Y(y), 3.4 - i * 0.15, P(54), Y(y + 6), 2.9 - i * 0.12));
      add(`proximal-phalanx-foot-${i + 1}`, shaft(P(56), Y(y + 6), 2.9, P(68), Y(y + 8), 2.5));
      if (i > 0) add(`middle-phalanx-foot-${i + 1}`, shaft(P(69), Y(y + 8), 2.4, P(75), Y(y + 9), 2.1));
      add(
        `distal-phalanx-foot-${i + 1}`,
        shaft(P(i === 0 ? 69 : 76), Y(y + (i === 0 ? 8 : 9)), 2.2, P(i === 0 ? 77 : 81), Y(y + 10), 1.9),
      );
    }
  };

  paired(farSide, -6, -7, "far");
  paired(nearSide, 0, 0, "near");

  return shapes;
}

const leftLateral = buildLateral(1, "left");
const rightLateral = buildLateral(-1, "right");

/* ================================================================== */

export const VIEW_GEOMETRY: Record<SkeletonView, ViewShape[]> = {
  anterior,
  posterior,
  "left-lateral": leftLateral,
  "right-lateral": rightLateral,
};

export const getViewShapes = (view: SkeletonView): ViewShape[] => VIEW_GEOMETRY[view] ?? anterior;

/** Bones that are actually drawn (and therefore selectable) in a given view. */
export const getViewBoneIds = (view: SkeletonView): string[] =>
  Array.from(new Set(getViewShapes(view).map((s) => s.id)));
