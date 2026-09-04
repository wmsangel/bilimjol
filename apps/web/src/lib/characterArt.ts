// Полноростовые персонажи izn.study (SVG-строки). Портировано из студии-прототипа.
// Общий «скелет» 220×232; вид отличается головой/цветом/ушами; одежда садится на всех.

export type Slot = "head" | "face" | "body" | "neck";
export type Outfit = Partial<Record<Slot, string>>;

type PartFn = (f: string, b: string, d: string, hair?: string) => string;

interface Spec {
  name: string;
  type: string;
  fur: string;
  belly: string;
  darkAmt?: number;
  bodyColor?: string;
  headShape?: "square";
  hair?: string;
  noCheeks?: boolean;
  ears?: PartFn;
  tail?: PartFn;
  face?: PartFn;
  /** Пятна/розетки на открытом торсе (прячутся под одеждой). */
  bodyMarks?: () => string;
  eyes: string;
  mouth?: () => string;
  fit?: Record<string, string>;
  wear?: Record<string, (S: Spec) => string>;
}

interface Clothing {
  slot: Slot;
  name: string;
  draw?: () => string;
  color?: string;
  style?: "tee" | "robe" | "sweater";
  inner?: string;
  trim?: string;
}

const PINK = "#FF9DB0";
const EYE = "#2C2540";

function sh(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + a));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + a));
  const b = Math.max(0, Math.min(255, (n & 255) + a));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function eye(cx: number, withWhite: boolean): string {
  const cy = 100;
  const white = withWhite ? `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="16" fill="#fff"/>` : "";
  const d = withWhite ? { rx: 8, ry: 10 } : { rx: 12, ry: 15 };
  return `<g class="blink"><g class="pupils">${white}<ellipse cx="${cx}" cy="${cy}" rx="${d.rx}" ry="${d.ry}" fill="${EYE}"/><ellipse cx="${cx - 4}" cy="${cy - 6}" rx="4.4" ry="5.4" fill="#fff"/><circle cx="${cx + 4}" cy="${cy + 5}" r="2.2" fill="rgba(255,255,255,.6)"/></g></g>`;
}
function cheeks(): string {
  return `<g fill="${PINK}" opacity=".7"><ellipse cx="72" cy="120" rx="12" ry="7.5"/><ellipse cx="148" cy="120" rx="12" ry="7.5"/></g>`;
}
function smile(d: string): string {
  return `<path d="${d}" fill="none" stroke="${EYE}" stroke-width="3.2" stroke-linecap="round"/>`;
}

// уши / рога / антенны
function foxEars(f: string, b: string): string {
  return `<g class="earL"><path d="M78 58 Q56 8 46 44 Q46 66 82 62 Z" fill="${f}"/><path d="M74 56 Q60 28 54 48 Q54 60 74 58 Z" fill="${b}"/></g><g class="earR"><path d="M142 58 Q164 8 174 44 Q174 66 138 62 Z" fill="${f}"/><path d="M146 56 Q160 28 166 48 Q166 60 146 58 Z" fill="${b}"/></g>`;
}
function catEars(f: string): string {
  return `<g class="earL"><path d="M84 56 Q64 4 50 40 Q52 60 86 60 Z" fill="${f}"/><path d="M80 54 Q68 26 60 44 Q62 56 80 55 Z" fill="${PINK}"/></g><g class="earR"><path d="M136 56 Q156 4 170 40 Q168 60 134 60 Z" fill="${f}"/><path d="M140 54 Q152 26 160 44 Q158 56 140 55 Z" fill="${PINK}"/></g>`;
}
function roundEars(inner: string): PartFn {
  return (f: string) =>
    `<g class="earL"><circle cx="64" cy="54" r="22" fill="${f}"/><circle cx="64" cy="54" r="11" fill="${inner}"/></g><g class="earR"><circle cx="156" cy="54" r="22" fill="${f}"/><circle cx="156" cy="54" r="11" fill="${inner}"/></g>`;
}
function pandaEars(): string {
  const k = "#2C2C34";
  return `<g class="earL"><circle cx="62" cy="52" r="21" fill="${k}"/></g><g class="earR"><circle cx="158" cy="52" r="21" fill="${k}"/></g>`;
}
function bunnyEars(f: string): string {
  return `<g class="earL"><g transform="rotate(-9 84 46)"><ellipse cx="84" cy="34" rx="15" ry="42" fill="${f}"/><ellipse cx="84" cy="34" rx="7" ry="30" fill="${PINK}"/></g></g><g class="earR"><g transform="rotate(9 136 46)"><ellipse cx="136" cy="34" rx="15" ry="42" fill="${f}"/><ellipse cx="136" cy="34" rx="7" ry="30" fill="${PINK}"/></g></g>`;
}
function horns(f: string, b: string, d: string): string {
  return `<g class="earL"><path d="M74 52 Q60 20 56 44 Q62 56 78 54 Z" fill="${d}"/></g><g class="earR"><path d="M146 52 Q160 20 164 44 Q158 56 142 54 Z" fill="${d}"/></g>`;
}
function antenna(f: string, b: string, d: string): string {
  return `<g class="antenna"><rect x="107" y="20" width="6" height="24" rx="3" fill="${d}"/><circle cx="110" cy="16" r="7" fill="#FF6B6B"/><circle cx="107" cy="13" r="2.5" fill="#fff"/></g>`;
}
function dogEars(f: string, b: string, d: string): string {
  return `<g class="earL"><path d="M66 60 Q40 60 42 106 Q56 118 74 100 Q64 80 72 64 Z" fill="${d}"/></g><g class="earR"><path d="M154 60 Q180 60 178 106 Q164 118 146 100 Q156 80 148 64 Z" fill="${d}"/></g>`;
}

// хвосты
function foxTail(f: string, b: string): string {
  return `<path d="M150 176 C206 168 210 104 172 96 C196 128 176 168 146 190 Z" fill="${f}"/><path d="M172 96 C186 100 190 122 182 138 C182 118 176 106 168 100 Z" fill="${b}"/>`;
}
function catTail(f: string): string {
  return `<path d="M154 180 C210 184 208 116 186 104" fill="none" stroke="${f}" stroke-width="15" stroke-linecap="round"/>`;
}
function nub(col: string): PartFn {
  return () => `<circle cx="162" cy="192" r="14" fill="${col}"/>`;
}
function dogTail(f: string): string {
  return `<path d="M150 180 C190 184 198 148 184 130" fill="none" stroke="${f}" stroke-width="17" stroke-linecap="round"/>`;
}

// мордочки / лица
function foxFace(f: string, b: string): string {
  return `<ellipse cx="110" cy="122" rx="26" ry="19" fill="${b}"/><ellipse cx="110" cy="112" rx="6" ry="4.6" fill="${EYE}"/>`;
}
function bearFace(f: string, b: string): string {
  return `<ellipse cx="110" cy="126" rx="26" ry="20" fill="${b}"/><ellipse cx="110" cy="116" rx="8" ry="6" fill="${EYE}"/>`;
}
function catFace(f: string, b: string): string {
  return `<ellipse cx="110" cy="120" rx="22" ry="15" fill="${b}"/><path d="M104 114 h12 l-6 6 z" fill="${PINK}"/><path d="M110 120 v4" stroke="${EYE}" stroke-width="2" stroke-linecap="round"/><g stroke="${sh(f, -46)}" stroke-width="2" stroke-linecap="round" opacity=".8"><line x1="72" y1="118" x2="44" y2="112"/><line x1="72" y1="124" x2="46" y2="126"/><line x1="72" y1="130" x2="48" y2="138"/><line x1="148" y1="118" x2="176" y2="112"/><line x1="148" y1="124" x2="174" y2="126"/><line x1="148" y1="130" x2="172" y2="138"/></g>`;
}
function bunnyFace(f: string): string {
  return `<path d="M105 116 h10 l-5 5 z" fill="${PINK}"/><path d="M110 121 v6" stroke="${sh(f, -30)}" stroke-width="2"/><rect x="104" y="127" width="5" height="7" rx="1.5" fill="#fff"/><rect x="111" y="127" width="5" height="7" rx="1.5" fill="#fff"/>`;
}
function pandaFace(): string {
  const k = "#2C2C34";
  return `<ellipse cx="84" cy="98" rx="17" ry="21" fill="${k}" transform="rotate(-12 84 98)"/><ellipse cx="136" cy="98" rx="17" ry="21" fill="${k}" transform="rotate(12 136 98)"/><ellipse cx="110" cy="120" rx="6" ry="4.6" fill="${k}"/>`;
}
function robotFace(f: string, b: string, d: string): string {
  return `<rect x="70" y="78" width="20" height="14" rx="4" fill="#26E0F0"/><rect x="130" y="78" width="20" height="14" rx="4" fill="#26E0F0"/><rect x="73" y="80" width="6" height="5" rx="2" fill="#fff" opacity=".8"/><rect x="133" y="80" width="6" height="5" rx="2" fill="#fff" opacity=".8"/><rect x="90" y="112" width="40" height="10" rx="5" fill="${d}"/><g stroke="${f}" stroke-width="2"><line x1="98" y1="112" x2="98" y2="122"/><line x1="110" y1="112" x2="110" y2="122"/><line x1="122" y1="112" x2="122" y2="122"/></g><circle cx="60" cy="98" r="5" fill="${d}"/><circle cx="160" cy="98" r="5" fill="${d}"/>`;
}
function monsterFace(): string {
  return `<path d="M92 126 Q110 148 128 126 Q120 138 110 132 Q100 138 92 126 Z" fill="#7A1E5A"/><path d="M100 130 l3 8 l4 -7 z" fill="#fff"/>`;
}
function dogFace(f: string, b: string): string {
  return `<ellipse cx="110" cy="120" rx="26" ry="19" fill="${b}"/><ellipse cx="110" cy="110" rx="8" ry="6" fill="${EYE}"/><path d="M110 116 v7" stroke="${EYE}" stroke-width="2.5" stroke-linecap="round"/>`;
}
function steveFace(f: string, b: string, d: string): string {
  const hc = "#49331F", brow = "#3A281A", ns = sh(f, -24), bd = "#8E6E4C", mth = "#7A5A3E";
  return `<rect x="54" y="38" width="112" height="18" fill="${hc}"/><rect x="54" y="56" width="12" height="10" fill="${hc}"/><rect x="154" y="56" width="12" height="10" fill="${hc}"/><path d="M62 108 v20 q48 18 96 0 v-20 h-9 v12 h-78 v-12 z" fill="${bd}" opacity=".42"/><rect x="80" y="80" width="17" height="5" fill="${brow}"/><rect x="123" y="80" width="17" height="5" fill="${brow}"/><rect x="104" y="98" width="12" height="11" fill="${ns}"/><rect x="94" y="120" width="32" height="4" rx="1" fill="${mth}"/>`;
}
function blockyFace(f: string, b: string, d: string, hair?: string): string {
  return `<path d="M54 54 Q54 40 72 40 L148 40 Q166 40 166 54 L166 64 Q110 52 54 64 Z" fill="${hair}"/>`;
}
function frogFace(f: string): string {
  return `<circle cx="82" cy="60" r="22" fill="${f}"/><circle cx="138" cy="60" r="22" fill="${f}"/>`;
}

// одежда (общие координаты)
function wCap(): string {
  return `<g><path d="M50 86 Q110 20 170 86 Q110 100 50 86 Z" fill="#EF4E5B"/><path d="M110 88 Q152 84 192 100 Q150 98 108 96 Z" fill="#D23A47"/><path d="M50 86 Q110 100 170 86 Q110 108 50 90 Z" fill="#D23A47"/><circle cx="110" cy="46" r="5.5" fill="#D23A47"/></g>`;
}
function wBow(): string {
  return `<g transform="translate(150 50)"><path d="M0 0 L-20 -12 L-20 12 Z" fill="#FF5C8A"/><path d="M0 0 L20 -12 L20 12 Z" fill="#FF5C8A"/><circle r="6" fill="#E23A6E"/></g>`;
}
function wGlasses(): string {
  return `<g stroke="#2A2233" stroke-width="3" fill="rgba(120,150,230,.28)"><circle cx="84" cy="100" r="15"/><circle cx="136" cy="100" r="15"/><line x1="99" y1="100" x2="121" y2="100"/></g>`;
}
function wScarf(): string {
  return `<g><path d="M82 138 Q110 156 138 138 L138 152 Q110 168 82 152 Z" fill="#22B473"/><rect x="112" y="150" width="15" height="26" rx="5" fill="#1B9160"/></g>`;
}
function wCrown(): string {
  return `<g><path d="M62 80 L72 46 L92 68 L110 40 L128 68 L148 46 L158 80 Q110 94 62 80 Z" fill="#F7C948" stroke="#D8A838" stroke-width="2.5" stroke-linejoin="round"/><path d="M62 80 Q110 94 158 80 L158 88 Q110 102 62 88 Z" fill="#E0A82E"/><circle cx="72" cy="46" r="4.5" fill="#FF5C8A"/><circle cx="110" cy="40" r="5" fill="#4F86F7"/><circle cx="148" cy="46" r="4.5" fill="#22B473"/></g>`;
}
function wMedal(): string {
  return `<g><path d="M98 130 L106 166" stroke="#4F86F7" stroke-width="7" stroke-linecap="round"/><path d="M122 130 L114 166" stroke="#E23A6E" stroke-width="7" stroke-linecap="round"/><circle cx="110" cy="178" r="17" fill="#F7C948" stroke="#D8A838" stroke-width="2.5"/><path d="M110 168 l3.4 6.9 7.6 1.1 -5.5 5.4 1.3 7.6 -6.8 -3.6 -6.8 3.6 1.3 -7.6 -5.5 -5.4 7.6 -1.1 z" fill="#E0A82E"/></g>`;
}

// ── Новые вещи ──
function wSunglasses(): string {
  return `<g><path d="M64 95 h92 v3.5 h-92 z" fill="#2A2233"/><path d="M68 98 q-2 20 20 20 q19 0 18 -19 q-19 -5 -38 -1 z" fill="#1C1830"/><path d="M114 98 q19 -4 38 1 q2 19 -18 19 q-22 0 -20 -20 z" fill="#1C1830"/><path d="M104 100 q6 -3 12 0" stroke="#2A2233" stroke-width="3" fill="none"/><path d="M74 103 q-1 9 9 12" stroke="#5b6a8a" stroke-width="2.5" fill="none" opacity=".5"/></g>`;
}
function wBowtie(): string {
  return `<g transform="translate(110 146)"><path d="M0 0 L-22 -13 L-22 13 Z" fill="#E23A6E"/><path d="M0 0 L22 -13 L22 13 Z" fill="#E23A6E"/><path d="M-22 -13 L-22 13 M22 -13 L22 13" stroke="#B92C55" stroke-width="2" opacity=".5"/><rect x="-6" y="-9" width="12" height="18" rx="3.5" fill="#B92C55"/></g>`;
}
function ushankaOn(): string {
  const fur = "#9B7B57", dk = sh(fur, -24), band = "#EFE7DA";
  return `<g><path d="M56 72 Q56 30 110 26 Q164 30 164 72 Q110 82 56 72 Z" fill="${fur}"/><path d="M52 66 Q46 94 58 114 Q72 110 70 88 Q68 76 64 70 Z" fill="${fur}"/><path d="M168 66 Q174 94 162 114 Q148 110 150 88 Q152 76 156 70 Z" fill="${fur}"/><ellipse cx="56" cy="114" rx="10" ry="7" fill="${band}"/><ellipse cx="164" cy="114" rx="10" ry="7" fill="${band}"/><path d="M48 74 Q110 94 172 74 Q170 88 110 92 Q50 88 48 74 Z" fill="${band}"/><g stroke="${dk}" stroke-width="1.8" fill="none" opacity=".4"><path d="M80 40 Q78 56 74 70"/><path d="M110 30 V80"/><path d="M140 40 Q142 56 146 70"/></g></g>`;
}
function helmetOn(): string {
  const ring = "#E8ECF2", glass = "rgba(150,200,240,.28)", edge = "#B7C2D4";
  return `<g><circle cx="110" cy="100" r="66" fill="${glass}" stroke="${ring}" stroke-width="7"/><circle cx="110" cy="100" r="66" fill="none" stroke="${edge}" stroke-width="1.5"/><path d="M70 62 Q100 46 140 60" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/><rect x="150" y="90" width="15" height="18" rx="4" fill="${ring}"/><rect x="153" y="94" width="9" height="4" rx="2" fill="#26E0F0"/></g>`;
}
function partyhatOn(): string {
  return `<g><path d="M110 18 L84 80 Q110 90 136 80 Z" fill="#F26D9D"/><path d="M110 18 L98 80 M110 18 L110 84 M110 18 L122 80" stroke="#fff" stroke-width="3" opacity=".45"/><circle cx="110" cy="16" r="7" fill="#F7C948"/><g fill="#4F86F7"><circle cx="97" cy="68" r="3.2"/><circle cx="123" cy="66" r="3.2"/><circle cx="110" cy="76" r="3.2"/></g></g>`;
}

const CLOTHES: Record<string, Clothing> = {
  cap: { slot: "head", name: "Кепка", draw: wCap },
  ushanka: { slot: "head", name: "Ушанка" },
  helmet: { slot: "head", name: "Шлем" },
  partyhat: { slot: "head", name: "Колпак" },
  sunglasses: { slot: "face", name: "Тёмные очки", draw: wSunglasses },
  bowtie: { slot: "neck", name: "Бабочка", draw: wBowtie },
  sweater: { slot: "body", name: "Свитер", color: "#C0574E", style: "sweater" },
  spacesuit: { slot: "body", name: "Скафандр", color: "#E4E9F0", inner: "#C3CDDC", trim: "#5B9BD5", style: "robe" },
  kalpak: { slot: "head", name: "Калпак" },
  tubeteika: { slot: "head", name: "Тюбетейка" },
  beanie: { slot: "head", name: "Шапка" },
  bow: { slot: "head", name: "Бантик", draw: wBow },
  glasses: { slot: "face", name: "Очки", draw: wGlasses },
  tee: { slot: "body", name: "Футболка", color: "#4F86F7", style: "tee" },
  chapan: { slot: "body", name: "Чапан", color: "#B9472E", inner: "#EFE3C6", trim: "#D8A838", style: "robe" },
  scarf: { slot: "neck", name: "Шарф", draw: wScarf },
  crown: { slot: "head", name: "Корона", draw: wCrown },
  medal: { slot: "neck", name: "Медаль", draw: wMedal },
};
const WARD_ORDER = ["cap", "kalpak", "tubeteika", "beanie", "ushanka", "bow", "partyhat", "crown", "helmet", "glasses", "sunglasses", "tee", "sweater", "chapan", "spacesuit", "scarf", "bowtie", "medal"];

function bodyOf(S: Spec, outfit: Outfit): string {
  const f = S.fur, b = S.belly, d = sh(f, S.darkAmt ?? -26);
  const item = outfit.body ? CLOTHES[outfit.body] : null;
  const g: string[] = [];
  g.push(`<ellipse cx="66" cy="170" rx="13" ry="16" fill="${f}"/><ellipse cx="154" cy="170" rx="13" ry="16" fill="${f}"/>`);
  if (item && item.style === "robe") {
    const col = item.color!, tr = item.trim!, inr = item.inner!, cd = sh(col, -30);
    g.push(`<ellipse cx="110" cy="162" rx="54" ry="48" fill="${col}"/>`);
    g.push(`<ellipse cx="62" cy="158" rx="18" ry="16" fill="${col}"/><ellipse cx="158" cy="158" rx="18" ry="16" fill="${col}"/>`);
    g.push(`<path d="M110 146 L130 156 L126 208 Q110 214 94 208 L90 156 Z" fill="${inr}"/>`);
    g.push(`<path d="M60 184 Q110 197 160 184 L160 194 Q110 207 60 194 Z" fill="${tr}"/>`);
    g.push(`<path d="M110 146 L130 156 L126 208 M110 146 L90 156 L94 208 M92 148 L110 158 L128 148" fill="none" stroke="${tr}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>`);
    g.push(`<path d="M60 180 q50 28 100 0 q-8 22 -50 22 q-42 0 -50 -22z" fill="${cd}" opacity=".2"/>`);
  } else if (item) {
    const shirt = item.color!, sd = sh(shirt, -34), sl = sh(shirt, 30);
    g.push(`<ellipse cx="110" cy="162" rx="54" ry="48" fill="${shirt}"/>`);
    g.push(`<ellipse cx="63" cy="158" rx="17" ry="15" fill="${shirt}"/><ellipse cx="157" cy="158" rx="17" ry="15" fill="${shirt}"/>`);
    g.push(`<path d="M49 164 q7 8 16 8" fill="none" stroke="${sd}" stroke-width="2.5" opacity=".5"/><path d="M171 164 q-7 8 -16 8" fill="none" stroke="${sd}" stroke-width="2.5" opacity=".5"/>`);
    g.push(`<ellipse cx="96" cy="150" rx="30" ry="15" fill="${sl}" opacity=".4"/>`);
    g.push(`<path d="M60 178 q50 30 100 0 q-8 24 -50 24 q-42 0 -50 -24z" fill="${sd}" opacity=".3"/>`);
    g.push(`<path d="M88 148 q22 20 44 0 q-8 -14 -22 -14 q-14 0 -22 14z" fill="${f}"/>`);
    g.push(`<path d="M88 148 q22 20 44 0" fill="none" stroke="${sd}" stroke-width="2.5" opacity=".55"/>`);
    if (item.style === "sweater") {
      g.push(`<g stroke="${sl}" stroke-width="3" fill="none" opacity=".5"><path d="M62 158 q48 16 96 0"/><path d="M60 172 q50 18 100 0"/></g>`);
      g.push(`<path d="M60 188 q50 22 100 0" fill="none" stroke="${sd}" stroke-width="3.5" opacity=".4"/>`);
    }
  } else {
    g.push(`<ellipse cx="110" cy="162" rx="54" ry="48" fill="${S.bodyColor ?? f}"/><ellipse cx="110" cy="172" rx="33" ry="32" fill="${b}"/>`);
    if (S.bodyMarks) g.push(S.bodyMarks());
    if (S.type === "robot") g.push(`<rect x="92" y="150" width="36" height="30" rx="7" fill="${sh(f, -18)}"/><circle cx="110" cy="165" r="7" fill="#26E0F0"/>`);
    if (S.type === "monster") g.push(`<circle cx="92" cy="176" r="5" fill="${sh(f, -30)}"/><circle cx="128" cy="182" r="4" fill="${sh(f, -30)}"/><circle cx="118" cy="160" r="3.5" fill="${sh(f, -30)}"/>`);
  }
  g.push(`<ellipse cx="88" cy="202" rx="16" ry="10" fill="${d}"/><ellipse cx="132" cy="202" rx="16" ry="10" fill="${d}"/>`);
  return g.join("");
}
function capOn(S: Spec): string {
  const col = "#EF4E5B", band = sh(col, -26);
  if (S.headShape === "square")
    return `<g><path d="M52 66 Q52 40 82 40 L138 40 Q168 40 168 66 Q110 80 52 66 Z" fill="${col}"/><ellipse cx="86" cy="52" rx="22" ry="9" fill="#fff" opacity=".16"/><path d="M52 66 Q110 80 168 66 Q110 88 52 72 Z" fill="${band}"/><path d="M150 68 Q196 68 192 86 Q168 79 148 79 Z" fill="${band}"/><circle cx="110" cy="38" r="5" fill="${band}"/></g>`;
  return `<g><path d="M53 74 A62 62 0 0 0 167 74 Q110 86 53 74 Z" fill="${col}"/><ellipse cx="88" cy="52" rx="22" ry="10" fill="#fff" opacity=".18"/><path d="M53 74 Q110 86 167 74 Q110 92 53 80 Z" fill="${band}"/><path d="M150 76 Q196 76 192 94 Q168 86 148 86 Z" fill="${band}"/><circle cx="110" cy="42" r="5" fill="${band}"/></g>`;
}
function kalpakOn(): string {
  const wht = "#F3F0E4", wsd = "#D8D1BC", dk = "#26252E";
  return `<g><path d="M58 72 Q56 24 110 12 Q164 24 162 72 Q110 82 58 72 Z" fill="${wht}"/><path d="M110 12 Q164 24 162 72 Q140 78 132 44 Q126 20 110 12 Z" fill="${wsd}" opacity=".55"/><path d="M98 20 Q82 34 80 64" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/><g fill="none" stroke="${dk}" stroke-width="3" stroke-linecap="round"><path d="M104 52 q-8 -5 -4 -15 q2 -5 8 -3"/><path d="M116 52 q8 -5 4 -15 q-2 -5 -8 -3"/></g><path d="M46 74 Q52 57 71 55 Q93 66 105 66 L110 77 L115 66 Q127 66 149 55 Q168 57 174 74 Q110 90 46 74 Z" fill="${dk}"/><path d="M105 66 L110 77 L115 66 Z" fill="${wht}"/></g>`;
}
function beanieOn(): string {
  const col = "#E86A5C", band = sh(col, -22), pom = "#F3E9D8";
  return `<g><path d="M50 76 Q50 30 110 26 Q170 30 170 76 Q110 88 50 76 Z" fill="${col}"/><g stroke="${sh(col, -14)}" stroke-width="2.4" fill="none" opacity=".5"><path d="M72 40 Q70 60 66 78"/><path d="M110 28 V82"/><path d="M148 40 Q150 60 154 78"/></g><path d="M46 72 Q110 94 174 72 Q172 86 110 92 Q48 86 46 72 Z" fill="${band}"/><circle cx="110" cy="20" r="9" fill="${pom}"/><circle cx="107" cy="17" r="2.5" fill="#fff"/></g>`;
}
function tubeteikaOn(): string {
  const dk = "#1F2C35", orn = "#E4C061", wht = "#F3EFE0";
  return `<g><path d="M58 68 Q58 42 110 40 Q162 42 162 68 Q110 78 58 68 Z" fill="${dk}"/><path d="M56 66 Q110 80 164 66 Q110 74 56 70 Z" fill="${orn}"/><g fill="${wht}"><path d="M70 64 l4 -7 l4 7z"/><path d="M91 62 l4 -7 l4 7z"/><path d="M112 62 l4 -7 l4 7z"/><path d="M133 63 l4 -7 l4 7z"/></g><path d="M96 50 q14 -8 28 0" fill="none" stroke="${orn}" stroke-width="2.5"/><circle cx="110" cy="42" r="4" fill="${orn}"/></g>`;
}
const HEADWEAR: Record<string, (S: Spec) => string> = { cap: capOn, kalpak: kalpakOn, tubeteika: tubeteikaOn, beanie: beanieOn, ushanka: ushankaOn, helmet: helmetOn, partyhat: partyhatOn };

function fitWrap(S: Spec, item: string, svg: string): string {
  const t = (S.fit && S.fit[item]) || "";
  return t ? `<g transform="${t}">${svg}</g>` : svg;
}
function wear(S: Spec, item: string): string {
  if (!item) return "";
  const t = (S.fit && S.fit[item]) || "";
  const dr = CLOTHES[item]?.draw;
  const g = dr ? dr() : "";
  return t ? `<g transform="${t}">${g}</g>` : g;
}
function drawHead(S: Spec, item: string): string {
  if (item === "bow" || item === "crown") return wear(S, item);
  const fn = HEADWEAR[item];
  if (!fn) return "";
  if (S.wear && S.wear[item]) return S.wear[item](S);
  return fitWrap(S, item, fn(S));
}
function headOf(S: Spec): string {
  const f = S.fur;
  if (S.headShape === "square") return `<rect x="54" y="40" width="112" height="112" rx="30" fill="${f}"/>`;
  return `<circle cx="110" cy="98" r="62" fill="${f}"/>`;
}

// ── Ирбис (снежный барс) — символ Кыргызстана ──
const IRBIS_DARK = "#3C4250";
function irbisRing(x: number, y: number, r: number): string {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${IRBIS_DARK}" stroke-width="2.5"/>`;
}
function irbisEars(f: string): string {
  return `<g class="earL"><path d="M84 56 Q66 12 54 44 Q56 62 86 60 Z" fill="${f}"/><path d="M82 54 Q70 30 62 48 Q64 58 80 56 Z" fill="${IRBIS_DARK}"/></g><g class="earR"><path d="M136 56 Q154 12 166 44 Q164 62 134 60 Z" fill="${f}"/><path d="M138 54 Q150 30 158 48 Q156 58 140 56 Z" fill="${IRBIS_DARK}"/></g>`;
}
function irbisTail(f: string): string {
  return (
    `<path d="M152 184 C216 192 228 114 192 98" fill="none" stroke="${f}" stroke-width="22" stroke-linecap="round"/>` +
    `<g fill="none" stroke="${IRBIS_DARK}" stroke-width="2.8" opacity=".75"><circle cx="178" cy="182" r="6"/><circle cx="208" cy="150" r="6"/><circle cx="206" cy="120" r="5.5"/></g>` +
    `<circle cx="192" cy="98" r="12" fill="${IRBIS_DARK}"/><circle cx="188" cy="94" r="3" fill="rgba(255,255,255,.28)"/>`
  );
}
function irbisFace(f: string, b: string): string {
  const ns = "#8A93A6";
  const spots =
    irbisRing(95, 64, 5) + irbisRing(112, 57, 5) + irbisRing(128, 64, 5) +
    irbisRing(110, 78, 4.5) + irbisRing(70, 84, 4.5) + irbisRing(150, 84, 4.5) +
    irbisRing(58, 106, 4.5) + irbisRing(162, 106, 4.5);
  const muzzle =
    `<ellipse cx="110" cy="122" rx="22" ry="15" fill="${b}"/>` +
    `<path d="M103 116 h14 l-7 7 z" fill="${ns}"/><path d="M110 123 v4" stroke="${EYE}" stroke-width="2" stroke-linecap="round"/>` +
    `<g stroke="${sh(f, -46)}" stroke-width="2" stroke-linecap="round" opacity=".75"><line x1="72" y1="120" x2="44" y2="114"/><line x1="72" y1="126" x2="46" y2="128"/><line x1="148" y1="120" x2="176" y2="114"/><line x1="148" y1="126" x2="174" y2="128"/></g>`;
  return spots + muzzle;
}
function irbisBodyMarks(): string {
  return (
    `<g opacity=".85">` +
    irbisRing(66, 160, 5) + irbisRing(154, 160, 5) +
    irbisRing(72, 184, 4.5) + irbisRing(148, 184, 4.5) +
    irbisRing(94, 136, 4.5) + irbisRing(126, 136, 4.5) +
    `</g>`
  );
}

const SPECS: Record<string, Spec> = {
  fox: { name: "Лисёнок", type: "animal", fur: "#F5943C", belly: "#FFF1DE", ears: foxEars, tail: foxTail, face: foxFace, eyes: eye(84, false) + eye(136, false), mouth: () => smile("M96 128 Q110 140 124 128") },
  cat: { name: "Котик", type: "animal", fur: "#9AA6B8", belly: "#EDF0F5", ears: catEars, tail: catTail, face: catFace, eyes: eye(84, true) + eye(136, true), mouth: () => smile("M96 128 Q104 134 110 128 Q116 134 124 128") },
  snowleopard: { name: "Ирбис", type: "animal", fur: "#CBD4E2", belly: "#F4F7FC", darkAmt: -30, ears: irbisEars, tail: irbisTail, face: irbisFace, bodyMarks: irbisBodyMarks, eyes: eye(84, true) + eye(136, true), mouth: () => smile("M96 130 Q104 136 110 130 Q116 136 124 130") },
  dog: { name: "Лабрадор", type: "animal", fur: "#E6C486", belly: "#F7EACB", darkAmt: -30, ears: dogEars, tail: dogTail, face: dogFace, eyes: eye(84, false) + eye(136, false), mouth: () => smile("M96 128 Q110 140 124 128") + '<path d="M105 134 q5 9 10 0 z" fill="#FF8FA3"/>' },
  bear: { name: "Мишка", type: "animal", fur: "#C79668", belly: "#F0E1CB", ears: roundEars("#E8CBA6"), tail: nub("#B7875A"), face: bearFace, eyes: eye(86, false) + eye(134, false), mouth: () => smile("M100 132 Q110 140 120 132") },
  panda: { name: "Панда", type: "animal", fur: "#F4F4F7", belly: "#FFFFFF", darkAmt: -12, ears: pandaEars, tail: nub("#2C2C34"), face: pandaFace, eyes: eye(84, true) + eye(136, true), mouth: () => smile("M100 130 Q110 138 120 130") },
  bunny: { name: "Зайчик", type: "animal", fur: "#F1E4F5", belly: "#FFFFFF", darkAmt: -14, ears: bunnyEars, tail: nub("#FFFFFF"), face: bunnyFace, eyes: eye(84, false) + eye(136, false) },
  frog: {
    name: "Лягушонок", type: "animal", fur: "#78C56A", belly: "#D9F0CF",
    fit: { glasses: "translate(-1 -40)", sunglasses: "translate(-1 -40)", cap: "translate(110 32) scale(.5) translate(-110 -74)", kalpak: "translate(110 30) scale(.5) translate(-110 -60)", beanie: "translate(110 30) scale(.52) translate(-110 -64)", ushanka: "translate(110 30) scale(.52) translate(-110 -64)", tubeteika: "translate(110 30) scale(.52) translate(-110 -60)", partyhat: "translate(110 30) scale(.5) translate(-110 -60)", helmet: "translate(110 34) scale(.62) translate(-110 -100)", scarf: "translate(0 -4)", bowtie: "translate(0 -4)" },
    face: frogFace, eyes: `<g class="blink"><g class="pupils"><circle cx="82" cy="60" r="10" fill="${EYE}"/><circle cx="79" cy="56" r="3.6" fill="#fff"/><circle cx="138" cy="60" r="10" fill="${EYE}"/><circle cx="135" cy="56" r="3.6" fill="#fff"/></g></g>`, mouth: () => smile("M80 122 Q110 150 140 122"),
  },
  blocky: {
    name: "Кубик", type: "human", fur: "#F1C79A", belly: "#F3D2AC", darkAmt: -22, headShape: "square", hair: "#5B3B22",
    face: blockyFace, eyes: `<g class="blink"><g class="pupils"><rect x="83" y="82" width="10" height="20" rx="5" fill="${EYE}"/><rect x="127" y="82" width="10" height="20" rx="5" fill="${EYE}"/></g></g>`, mouth: () => `<path d="M84 110 Q110 138 136 110" fill="none" stroke="${EYE}" stroke-width="4.5" stroke-linecap="round"/>`,
  },
  steve: {
    name: "Стив", type: "game", noCheeks: true, fur: "#C89B6E", belly: "#2FBABA", bodyColor: "#26A9A9", darkAmt: -26, headShape: "square", hair: "#49331F",
    face: steveFace, eyes: `<g class="blink"><g class="pupils"><rect x="80" y="86" width="18" height="13" fill="#D8D8EA"/><rect x="90" y="86" width="8" height="13" fill="#4A3AA0"/><rect x="122" y="86" width="18" height="13" fill="#D8D8EA"/><rect x="122" y="86" width="8" height="13" fill="#4A3AA0"/></g></g>`,
  },
  robot: { name: "Робот", type: "robot", fur: "#AEB6C2", belly: "#D2D8E0", darkAmt: -30, headShape: "square", fit: { glasses: "translate(0 -15)", sunglasses: "translate(0 -15)" }, ears: antenna, face: robotFace, eyes: "" },
  monster: { name: "Монстрик", type: "monster", fur: "#A855F7", belly: "#E7CCFB", darkAmt: -24, ears: horns, tail: nub("#8B3ED6"), face: monsterFace, eyes: eye(84, true) + eye(136, true) },
};

const ORDER = ["fox", "cat", "snowleopard", "dog", "bear", "panda", "bunny", "frog", "blocky", "steve", "robot", "monster"];

function build(id: string, outfit: Outfit): string {
  const S = SPECS[id] || SPECS.fox;
  const f = S.fur, b = S.belly, d = sh(f, S.darkAmt ?? -26);
  const P: string[] = [];
  P.push('<ellipse cx="110" cy="216" rx="54" ry="9" fill="rgba(40,24,80,.13)"/>');
  if (S.tail) P.push(`<g class="tail">${S.tail(f, b, d)}</g>`);
  if (S.ears) P.push(S.ears(f, b, d));
  P.push(bodyOf(S, outfit));
  P.push(headOf(S));
  if (S.face) P.push(S.face(f, b, d, S.hair));
  P.push(S.eyes);
  if (S.type !== "robot" && !S.noCheeks) P.push(cheeks());
  if (S.mouth) P.push(S.mouth());
  if (outfit.neck) P.push(wear(S, outfit.neck));
  if (outfit.face) P.push(wear(S, outfit.face));
  if (outfit.head) P.push(drawHead(S, outfit.head));
  return `<svg class="char-svg" viewBox="0 0 220 232" role="img" aria-label="${S.name}"><g class="breathe">${P.join("")}</g></svg>`;
}

// ── публичный API ──
export function buildCharacter(id: string, outfit: Outfit = {}): string {
  return build(id, outfit);
}
export const CHARACTER_IDS = ORDER;
export function characterName(id: string): string {
  return SPECS[id]?.name ?? id;
}
export interface WardrobeItem {
  id: string;
  slot: Slot;
  name: string;
  /** Сколько всего звёзд нужно, чтобы вещь открылась. */
  unlockAt: number;
}
const UNLOCK_AT: Record<string, number> = {
  tee: 0, scarf: 0, glasses: 4, cap: 6, partyhat: 7, bow: 8, sunglasses: 10, bowtie: 12, beanie: 10, tubeteika: 12, sweater: 14, kalpak: 15, ushanka: 16, chapan: 20, crown: 25, medal: 30, spacesuit: 34, helmet: 35,
};

export interface WardrobeSet {
  id: string;
  emoji: string;
  name: { ru: string; ky: string };
  items: string[];
  /** Сколько звёзд нужно, чтобы открыть весь набор. */
  unlockAt: number;
}
export const SETS: WardrobeSet[] = [
  { id: "national", emoji: "🇰🇬", name: { ru: "Национальный", ky: "Улуттук" }, items: ["kalpak", "chapan"], unlockAt: 20 },
  { id: "winter", emoji: "❄️", name: { ru: "Зимний", ky: "Кышкы" }, items: ["ushanka", "sweater", "scarf"], unlockAt: 16 },
  { id: "space", emoji: "🚀", name: { ru: "Космос", ky: "Космос" }, items: ["helmet", "spacesuit"], unlockAt: 35 },
];
export const WARDROBE: WardrobeItem[] = WARD_ORDER.map((k) => ({
  id: k,
  slot: CLOTHES[k].slot,
  name: CLOTHES[k].name,
  unlockAt: UNLOCK_AT[k] ?? 0,
}));
export function wardrobeIcon(k: string): string {
  let s = '<svg viewBox="0 0 44 40">';
  if (k === "cap") s += '<path d="M4 26 Q22 2 40 26 Q22 16 4 26z" fill="#EF4E5B"/><path d="M34 24 Q44 22 44 30 Q38 26 32 26z" fill="#D23A47"/>';
  else if (k === "kalpak") s += '<path d="M11 24 Q10 5 22 2 Q34 5 33 24 Q22 28 11 24z" fill="#F3F0E4"/><path d="M7 25 Q11 15 16 15 L20 22 L24 15 Q28 15 33 25 Q22 32 7 25z" fill="#26252E"/><path d="M20 22 L22 26 L24 22z" fill="#F3F0E4"/>';
  else if (k === "beanie") s += `<path d="M9 24 Q9 7 22 5 Q35 7 35 24 Q22 28 9 24z" fill="#E86A5C"/><path d="M7 22 Q22 32 37 22 Q35 28 22 30 Q9 28 7 22z" fill="${sh("#E86A5C", -22)}"/><circle cx="22" cy="4" r="3.4" fill="#F3E9D8"/>`;
  else if (k === "tubeteika") s += '<path d="M9 26 Q9 10 22 9 Q35 10 35 26 Q22 30 9 26z" fill="#1F2C35"/><path d="M7 25 Q22 32 37 25 Q22 29 7 26z" fill="#E4C061"/><g fill="#F3EFE0"><path d="M14 24 l2 -4 l2 4z"/><path d="M20 23 l2 -4 l2 4z"/><path d="M26 23 l2 -4 l2 4z"/></g>';
  else if (k === "chapan") s += '<path d="M8 12 Q22 4 36 12 L33 32 Q22 36 11 32z" fill="#B9472E"/><path d="M22 8 L28 12 L26 34 Q22 36 18 34 L16 12z" fill="#EFE3C6"/><path d="M22 8 L28 12 M22 8 L16 12" stroke="#D8A838" stroke-width="2" fill="none"/><path d="M11 26 Q22 30 33 26" stroke="#D8A838" stroke-width="2.5" fill="none"/>';
  else if (k === "bow") s += '<g transform="translate(22 20)"><path d="M0 0 L-14 -9 L-14 9z" fill="#FF5C8A"/><path d="M0 0 L14 -9 L14 9z" fill="#FF5C8A"/><circle r="5" fill="#E23A6E"/></g>';
  else if (k === "glasses") s += '<g stroke="#2A2233" stroke-width="2.5" fill="rgba(120,150,230,.28)"><circle cx="13" cy="20" r="9"/><circle cx="31" cy="20" r="9"/></g><line x1="22" y1="20" x2="22" y2="20" stroke="#2A2233" stroke-width="2.5"/>';
  else if (k === "tee") s += '<path d="M8 12 Q22 3 36 12 L32 30 Q22 35 12 30z" fill="#4F86F7"/>';
  else if (k === "scarf") s += '<path d="M8 14 Q22 24 36 14 L36 22 Q22 30 8 22z" fill="#22B473"/><rect x="24" y="22" width="7" height="12" rx="2" fill="#1B9160"/>';
  else if (k === "crown") s += '<path d="M6 30 L10 13 L16 22 L22 10 L28 22 L34 13 L38 30 Q22 35 6 30z" fill="#F7C948" stroke="#D8A838" stroke-width="1.5" stroke-linejoin="round"/><circle cx="10" cy="13" r="2.4" fill="#FF5C8A"/><circle cx="22" cy="10" r="2.8" fill="#4F86F7"/><circle cx="34" cy="13" r="2.4" fill="#22B473"/>';
  else if (k === "medal") s += '<path d="M17 5 L20 19 M27 5 L24 19" stroke="#4F86F7" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="27" r="9" fill="#F7C948" stroke="#D8A838" stroke-width="1.5"/><path d="M22 21 l1.8 3.7 4.1 .6 -3 3 .7 4.1 -3.6 -1.9 -3.6 1.9 .7 -4.1 -3 -3 4.1 -.6z" fill="#E0A82E"/>';
  else if (k === "ushanka") s += '<path d="M10 22 Q10 6 22 4 Q34 6 34 22 Q22 26 10 22z" fill="#9B7B57"/><path d="M8 20 Q4 30 9 36 Q14 33 13 26z" fill="#9B7B57"/><path d="M36 20 Q40 30 35 36 Q30 33 31 26z" fill="#9B7B57"/><path d="M7 22 Q22 30 37 22 Q35 28 22 30 Q9 28 7 22z" fill="#EFE7DA"/>';
  else if (k === "helmet") s += '<circle cx="22" cy="21" r="15" fill="rgba(150,200,240,.35)" stroke="#E3E8F0" stroke-width="3"/><path d="M12 14 Q22 8 32 13" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6"/><rect x="33" y="18" width="4" height="6" rx="1.5" fill="#E3E8F0"/>';
  else if (k === "partyhat") s += '<path d="M22 3 L12 32 Q22 36 32 32z" fill="#F26D9D"/><path d="M22 3 L17 32 M22 3 L22 34 M22 3 L27 32" stroke="#fff" stroke-width="1.6" opacity=".5"/><circle cx="22" cy="3" r="3" fill="#F7C948"/><g fill="#4F86F7"><circle cx="17" cy="26" r="1.6"/><circle cx="27" cy="24" r="1.6"/></g>';
  else if (k === "sunglasses") s += '<path d="M6 16 h32 v2.4 h-32z" fill="#2A2233"/><path d="M8 18 q-1 10 8 10 q9 0 8 -9 q-8 -3 -16 -1z" fill="#1C1830"/><path d="M20 18 q8 -2 16 1 q1 9 -8 9 q-9 0 -8 -10z" fill="#1C1830"/>';
  else if (k === "bowtie") s += '<g transform="translate(22 20)"><path d="M0 0 L-13 -8 L-13 8 Z" fill="#E23A6E"/><path d="M0 0 L13 -8 L13 8 Z" fill="#E23A6E"/><rect x="-4" y="-6" width="8" height="12" rx="2.5" fill="#B92C55"/></g>';
  else if (k === "sweater") s += '<path d="M8 12 Q22 3 36 12 L32 30 Q22 35 12 30z" fill="#C0574E"/><g stroke="#D98A80" stroke-width="1.6" fill="none" opacity=".6"><path d="M11 18 q11 5 22 0"/><path d="M11 24 q11 5 22 0"/></g>';
  else if (k === "spacesuit") s += '<path d="M8 12 Q22 4 36 12 L33 32 Q22 36 11 32z" fill="#E4E9F0"/><path d="M22 8 L28 12 L26 34 Q22 36 18 34 L16 12z" fill="#C3CDDC"/><circle cx="22" cy="22" r="4" fill="#5B9BD5"/>';
  return s + "</svg>";
}
export const SLOT_LABELS: Record<Slot, { ru: string; ky: string }> = {
  head: { ru: "Голова", ky: "Баш кийим" },
  face: { ru: "На лицо", ky: "Бетке" },
  body: { ru: "Одежда", ky: "Кийим" },
  neck: { ru: "На шею", ky: "Мойунга" },
};
