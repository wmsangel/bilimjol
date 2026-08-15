"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Helper, Locale, Task, Topic } from "@izn-study/shared";
import type { ProgressMap } from "@/lib/progress";
import { Mascot } from "./Mascot";

// Карта-приключение: у каждого класса свой мир. Высокая вьющаяся дорога
// сверху вниз через локацию к цели. Движок портирован из дизайн-макета.

const NODE = 66, STEP = 176, TOP = 120, PAD = 78;

function shade(hex: string, a: number): string {
  if (!hex || hex[0] !== "#") return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + a));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + a));
  const b = Math.max(0, Math.min(255, (n & 255) + a));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function rnd(seed: number): number {
  const s = seed * 9301 + 49297;
  return (s % 233280) / 233280;
}

// ── библиотека объектов ──
/* eslint-disable @typescript-eslint/no-explicit-any */
const D: Record<string, (...a: any[]) => string> = {
  tree: (x, y, s = 1, c = "#57B85A") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="6" rx="20" ry="5" fill="rgba(0,0,0,.12)"/><rect x="-5" y="-14" width="10" height="22" rx="4" fill="#8a5a34"/><circle cx="0" cy="-30" r="24" fill="${c}"/><circle cx="-15" cy="-16" r="17" fill="${shade(c as string, -14)}"/><circle cx="15" cy="-16" r="17" fill="${shade(c as string, -14)}"/><circle cx="0" cy="-20" r="20" fill="${c}"/><circle cx="-7" cy="-30" r="7" fill="rgba(255,255,255,.25)"/></g>`,
  pine: (x, y, s = 1, c = "#2E8B57") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="6" rx="16" ry="4" fill="rgba(0,0,0,.12)"/><rect x="-4" y="-8" width="8" height="14" fill="#7a5230"/><path d="M0 -58 L20 -18 H-20 Z" fill="${c}"/><path d="M0 -38 L26 6 H-26 Z" fill="${shade(c as string, 10)}"/><path d="M0 -58 L8 -34 H-8 Z" fill="rgba(255,255,255,.2)"/></g>`,
  palm: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="6" rx="16" ry="4" fill="rgba(0,0,0,.12)"/><path d="M-4 6 Q-10 -30 2 -46" stroke="#A9743E" stroke-width="8" fill="none" stroke-linecap="round"/><g fill="#3FA96B"><path d="M2 -46 Q-30 -54 -40 -40 Q-20 -50 2 -44z"/><path d="M2 -46 Q34 -54 44 -38 Q22 -50 2 -44z"/><path d="M2 -46 Q-16 -70 -34 -66 Q-10 -60 2 -44z"/><path d="M2 -46 Q20 -70 38 -64 Q12 -60 2 -44z"/></g><circle cx="2" cy="-44" r="4" fill="#8B5A2B"/></g>`,
  cactus: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="6" rx="12" ry="4" fill="rgba(0,0,0,.12)"/><rect x="-7" y="-40" width="14" height="46" rx="7" fill="#3FA96B"/><rect x="-22" y="-30" width="12" height="10" rx="5" fill="#3FA96B"/><rect x="-22" y="-40" width="10" height="14" rx="5" fill="#3FA96B"/><rect x="10" y="-24" width="12" height="10" rx="5" fill="#3FA96B"/><rect x="12" y="-34" width="10" height="14" rx="5" fill="#3FA96B"/></g>`,
  bush: (x, y, s = 1, c = "#5FC06A") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="8" rx="18" ry="4" fill="rgba(0,0,0,.1)"/><circle cx="-13" cy="0" r="14" fill="${c}"/><circle cx="13" cy="0" r="14" fill="${c}"/><circle cx="0" cy="-7" r="17" fill="${shade(c as string, 8)}"/></g>`,
  flower: (x, y) => `<g transform="translate(${x} ${y})"><rect x="-1.5" y="0" width="3" height="12" fill="#4CA054"/><g fill="#FF7BA6"><circle cx="0" cy="-3" r="4"/><circle cx="-4" cy="0" r="4"/><circle cx="4" cy="0" r="4"/><circle cx="0" cy="3" r="4"/></g><circle r="2.6" fill="#FFE07A"/></g>`,
  rock: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-18 8 Q-22 -12 -2 -14 Q18 -18 22 0 Q26 10 6 10 Z" fill="#B8B2A6"/><path d="M-2 -14 Q18 -18 22 0 Q10 -8 -2 -14 Z" fill="#D3CDC1"/></g>`,
  barn: (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="30" rx="42" ry="7" fill="rgba(0,0,0,.13)"/><rect x="-34" y="-6" width="68" height="36" rx="3" fill="#C0492E"/><path d="M-40 -6 L0 -34 L40 -6 Z" fill="#9E3A24"/><rect x="-10" y="6" width="20" height="24" fill="#EEDFC6"/><path d="M-40 -6 L0 -34 L40 -6" fill="none" stroke="#EEDFC6" stroke-width="3"/><g stroke="#EEDFC6" stroke-width="2"><line x1="-8" y1="6" x2="8" y2="30"/><line x1="8" y1="6" x2="-8" y2="30"/></g></g>`,
  haystack: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="14" rx="22" ry="5" fill="rgba(0,0,0,.1)"/><path d="M-22 14 Q-24 -14 0 -18 Q24 -14 22 14 Z" fill="#E7C24E"/><g stroke="#C9A63A" stroke-width="2" opacity=".6"><path d="M-16 0 H16"/><path d="M-18 8 H18"/></g></g>`,
  sheep: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="10" rx="16" ry="4" fill="rgba(0,0,0,.1)"/><circle cx="-6" cy="0" r="9" fill="#fff"/><circle cx="6" cy="-2" r="10" fill="#fff"/><circle cx="0" cy="2" r="10" fill="#fff"/><circle cx="12" cy="-4" r="6" fill="#3A3040"/><rect x="-9" y="8" width="3" height="7" fill="#3A3040"/><rect x="6" y="8" width="3" height="7" fill="#3A3040"/></g>`,
  house: (x, y, s = 1, c = "#F0D9B5") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="28" rx="30" ry="6" fill="rgba(0,0,0,.12)"/><rect x="-22" y="-4" width="44" height="32" rx="3" fill="${c}"/><path d="M-28 -4 L0 -30 L28 -4 Z" fill="#C0512E"/><rect x="-8" y="10" width="16" height="18" rx="2" fill="#8a5a34"/><rect x="10" y="2" width="10" height="10" fill="#9FD3F0"/></g>`,
  cottage: (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="26" rx="34" ry="6" fill="rgba(0,0,0,.12)"/><rect x="-26" y="-2" width="52" height="30" rx="3" fill="#F3E3C5"/><path d="M-32 -2 L0 -30 L32 -2 Z" fill="#7C9A54"/><rect x="20" y="-24" width="7" height="14" fill="#8a5a34"/><rect x="-9" y="8" width="18" height="20" rx="2" fill="#8a5a34"/><g fill="#9FD3F0"><rect x="-20" y="2" width="9" height="9"/><rect x="12" y="2" width="9" height="9"/></g></g>`,
  windmill: (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="34" rx="20" ry="5" fill="rgba(0,0,0,.12)"/><path d="M-14 34 L-8 -18 H8 L14 34 Z" fill="#E8E1D2"/><circle cx="0" cy="-18" r="6" fill="#C0512E"/><g fill="#D8CDB6" stroke="#B7A98A"><path d="M0 -18 L-2 -46 L2 -46 Z"/><path d="M0 -18 L26 -20 L26 -16 Z"/><path d="M0 -18 L2 10 L-2 10 Z"/><path d="M0 -18 L-26 -16 L-26 -20 Z"/></g></g>`,
  tower: (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="40" rx="26" ry="6" fill="rgba(0,0,0,.15)"/><rect x="-20" y="-30" width="40" height="70" rx="4" fill="#C9C3D6"/><rect x="-24" y="-42" width="48" height="14" rx="3" fill="#A79FC0"/><g fill="#5B78D8"><rect x="-8" y="-16" width="16" height="20" rx="8"/></g><path d="M0 -54 l14 5 l-14 6z" fill="#EF4E5B"/></g>`,
  building: (x, y, s = 1, c = "#8FA0C4") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="46" rx="26" ry="6" fill="rgba(0,0,0,.14)"/><rect x="-20" y="-40" width="40" height="86" rx="3" fill="${c}"/><g fill="#FCE38A" opacity=".85">${[-12, -2, 8].flatMap((cx) => [-28, -16, -4, 8, 20, 32].map((cy) => `<rect x="${cx}" y="${cy}" width="8" height="8" rx="1"/>`)).join("")}</g></g>`,
  lighthouse: (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="42" rx="24" ry="6" fill="rgba(0,0,0,.15)"/><path d="M-16 42 L-11 -26 H11 L16 42 Z" fill="#F4F2ED"/><g fill="#E24C4C"><path d="M-14 26 L14 26 L13 16 L-13 16 Z"/><path d="M-12 6 L12 6 L11 -4 L-11 -4 Z"/></g><rect x="-12" y="-40" width="24" height="16" rx="3" fill="#FCE38A"/><path d="M-14 -40 h28 l-6 -10 h-16 z" fill="#C0392B"/></g>`,
  boat: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-26 0 Q0 16 26 0 L20 8 Q0 18 -20 8 Z" fill="#B5652E"/><rect x="-1" y="-30" width="3" height="30" fill="#7a5230"/><path d="M2 -28 L24 -8 L2 -8 Z" fill="#fff"/><path d="M-2 -24 L-20 -8 L-2 -8 Z" fill="#EF6B6B"/></g>`,
  island: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="12" rx="46" ry="14" fill="#E9D8A6"/><ellipse cx="0" cy="6" rx="40" ry="12" fill="#F3E7BE"/></g>`,
  cloud: (x, y, s = 1, o) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${(o as number) || 0.92}"><circle cx="0" cy="0" r="18"/><circle cx="22" cy="6" r="15"/><circle cx="-22" cy="6" r="15"/><rect x="-22" y="0" width="44" height="16" rx="8"/></g>`,
  sun: (x, y) => `<g transform="translate(${x} ${y})"><circle r="46" fill="#FFE07A" opacity=".3"/><circle r="32" fill="#FFD84D"/><circle cx="-8" cy="-8" r="10" fill="#FFF0B0" opacity=".7"/></g>`,
  moon: (x, y) => `<g transform="translate(${x} ${y})"><circle r="30" fill="#EDE7C8"/><circle cx="10" cy="-6" r="6" fill="#D6CFA8"/><circle cx="-8" cy="10" r="4" fill="#D6CFA8"/></g>`,
  mountain: (x, base, w, h, c, cap) => `<g><path d="M${x} ${base} L${(x as number) + (w as number) / 2} ${(base as number) - (h as number)} L${(x as number) + (w as number)} ${base} Z" fill="${c}"/><path d="M${(x as number) + (w as number) / 2 - (h as number) * 0.24} ${(base as number) - (h as number) * 0.55} L${(x as number) + (w as number) / 2} ${(base as number) - (h as number)} L${(x as number) + (w as number) / 2 + (h as number) * 0.24} ${(base as number) - (h as number) * 0.55} Q${(x as number) + (w as number) / 2} ${(base as number) - (h as number) * 0.4} ${(x as number) + (w as number) / 2 - (h as number) * 0.24} ${(base as number) - (h as number) * 0.55} Z" fill="${cap}"/></g>`,
  volcano: (x, base, w, h) => { const X = x as number, B = base as number, W = w as number, H = h as number; return `<g><path d="M${X} ${B} L${X + W * 0.36} ${B - H} Q${X + W / 2} ${B - H + 8} ${X + W * 0.64} ${B - H} L${X + W} ${B} Z" fill="#6E5A56"/><path d="M${X + W * 0.36} ${B - H} Q${X + W / 2} ${B - H + 8} ${X + W * 0.64} ${B - H} L${X + W * 0.6} ${B - H - 14} Q${X + W / 2} ${B - H - 22} ${X + W * 0.4} ${B - H - 14} Z" fill="#E4562B"/><g fill="#FFB13B"><circle cx="${X + W / 2}" cy="${B - H - 18}" r="5"/><circle cx="${X + W * 0.42}" cy="${B - H - 26}" r="4"/></g></g>`; },
  planet: (x, y, r, c, ring) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${c}"/><circle cx="${-(r as number) * 0.3}" cy="${-(r as number) * 0.3}" r="${(r as number) * 0.5}" fill="rgba(255,255,255,.14)"/>${ring ? `<ellipse rx="${(r as number) * 1.8}" ry="${(r as number) * 0.5}" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="5" transform="rotate(-22)"/>` : ""}</g>`,
  portal: (x, y) => `<g transform="translate(${x} ${y})"><ellipse rx="46" ry="60" fill="none" stroke="#B06BFF" stroke-width="10" opacity=".5"/><ellipse rx="34" ry="46" fill="none" stroke="#7BE0FF" stroke-width="8"/><ellipse rx="20" ry="30" fill="#8A5CFF" opacity=".6"/></g>`,
  flag: (x, y) => `<g transform="translate(${x} ${y})"><rect x="-2" y="-46" width="4" height="52" fill="#cfd8e0"/><path d="M2 -44 l30 8 l-30 10z" fill="#EF4E5B"/></g>`,
  station: (x, y) => `<g transform="translate(${x} ${y})"><rect x="-30" y="-8" width="60" height="20" rx="6" fill="#8FA0C4"/><rect x="-6" y="-26" width="12" height="20" fill="#6C7B9E"/><circle cx="0" cy="-32" r="10" fill="#33D6EA"/><rect x="-40" y="-2" width="14" height="6" fill="#5B6B8E"/><rect x="26" y="-2" width="14" height="6" fill="#5B6B8E"/></g>`,
};

interface World {
  name: string; sub: string; sky: [string, string]; ground: [string, string]; road: [string, string];
  goal: string; night?: boolean; water?: string | null; cloudy?: boolean;
  set: { far: [string, number, string?][]; mid: [string, number, string?][]; near: [string, number, string?][] };
  nodeGrad: string;
}
const LAND = "from-emerald-400 to-green-500", NIGHT = "from-cyan-400 to-blue-600";
const WORLDS: World[] = [
  { name: "Ферма", sub: "0", sky: ["#BFE6FF", "#EAF6D8"], ground: ["#BFE39A", "#A7DA86"], road: ["#E7C99B", "#C29A66"], goal: "barn", water: null, nodeGrad: LAND, set: { far: [["windmill", 1]], mid: [["haystack", 1], ["sheep", 1]], near: [["flower", 1], ["bush", 1], ["haystack", 0.8], ["sheep", 0.9]] } },
  { name: "Луг и лес", sub: "1", sky: ["#BFE6FF", "#E8F6E2"], ground: ["#B7E39D", "#9ED98D"], road: ["#E7C99B", "#C29A66"], goal: "cottage", water: "river", nodeGrad: LAND, set: { far: [["tree", 1, "#5FA85B"]], mid: [["house", 1], ["tree", 1], ["bush", 1]], near: [["flower", 1], ["tree", 0.8], ["bush", 1], ["flower", 1]] } },
  { name: "Река", sub: "2", sky: ["#BFE9FF", "#DAF3EC"], ground: ["#A9DE9C", "#8FD48C"], road: ["#E7C99B", "#C29A66"], goal: "lighthouse", water: "lake", nodeGrad: LAND, set: { far: [["tree", 0.9, "#5FA85B"]], mid: [["boat", 1], ["bush", 1]], near: [["flower", 1], ["bush", 1], ["boat", 0.8], ["rock", 0.8]] } },
  { name: "Пустыня", sub: "3", sky: ["#FFE7B0", "#FFD98C"], ground: ["#F2D79B", "#E7C783"], road: ["#D9B36A", "#B98F44"], goal: "tower", water: null, nodeGrad: LAND, set: { far: [["cactus", 1]], mid: [["palm", 1], ["cactus", 1], ["rock", 1]], near: [["cactus", 0.9], ["rock", 1], ["palm", 0.8]] } },
  { name: "Джунгли", sub: "4", sky: ["#CFEFD6", "#B7E3BE"], ground: ["#7FC98A", "#63B972"], road: ["#C7A46A", "#A07E48"], goal: "tower", water: "river", nodeGrad: LAND, set: { far: [["tree", 1.1, "#2F8F52"]], mid: [["palm", 1.1], ["tree", 1, "#3AA05F"], ["bush", 1.1, "#4FB86A"]], near: [["bush", 1.1, "#4FB86A"], ["palm", 0.9], ["flower", 1]] } },
  { name: "Горы", sub: "5", sky: ["#CFE3FF", "#E6EEFA"], ground: ["#DDE7F0", "#CBD8E6"], road: ["#CFC2E4", "#A794C9"], goal: "summit", water: null, nodeGrad: LAND, set: { far: [["pine", 1, "#4E7A5C"]], mid: [["pine", 1.1, "#3E6B4C"], ["rock", 1.2], ["cottage", 1]], near: [["pine", 0.9, "#3E6B4C"], ["rock", 1.1], ["rock", 0.9]] } },
  { name: "Море", sub: "6", sky: ["#BFEAFF", "#D6F3F7"], ground: ["#7FD3E8", "#63C4DE"], road: ["#E7C99B", "#C29A66"], goal: "island", water: "ocean", nodeGrad: LAND, set: { far: [["island", 1]], mid: [["boat", 1.1], ["palm", 1]], near: [["island", 0.8], ["boat", 0.9], ["palm", 0.85]] } },
  { name: "Город", sub: "7", sky: ["#CFE0FF", "#E6ECF7"], ground: ["#B9C2D4", "#A6B0C6"], road: ["#8A8F9E", "#6C7182"], goal: "tower", water: null, nodeGrad: LAND, set: { far: [["building", 1, "#93A3C6"]], mid: [["building", 1.1, "#8496BE"], ["building", 0.9, "#9AA9CC"], ["tree", 0.9]], near: [["building", 1, "#7E90BA"], ["tree", 0.8], ["bush", 1]] } },
  { name: "Вулкан", sub: "8", sky: ["#F3D2C0", "#E7B7A0"], ground: ["#8A6A62", "#75564F"], road: ["#5E4A46", "#3E302D"], goal: "volcano", water: null, nodeGrad: LAND, set: { far: [["rock", 1.2]], mid: [["rock", 1.4], ["pine", 1, "#5A6B54"]], near: [["rock", 1.2], ["rock", 1.5]] } },
  { name: "Небо", sub: "9", sky: ["#9FD0FF", "#CFE9FF"], ground: ["#CFE9FF", "#B7DCFB"], road: ["#EDE8FA", "#C7B9E4"], goal: "skyCastle", water: null, cloudy: true, nodeGrad: NIGHT, set: { far: [["cloud", 1.4]], mid: [["cloud", 1.2], ["island", 1]], near: [["cloud", 1], ["island", 0.8]] } },
  { name: "Космос", sub: "10", sky: ["#1B2440", "#0E1226"], ground: ["#141A33", "#0E1226"], road: ["#33D6EA", "#1596B8"], goal: "station", night: true, water: null, nodeGrad: NIGHT, set: { far: [], mid: [], near: [] } },
  { name: "Галактика", sub: "11", sky: ["#241143", "#120A26"], ground: ["#180B33", "#0C0620"], road: ["#B06BFF", "#6A2FB0"], goal: "portal", night: true, water: null, nodeGrad: NIGHT, set: { far: [], mid: [], near: [] } },
];
const worldFor = (grade: number): World => WORLDS[grade] ?? WORLDS[1];

function nodePositions(w: number, n: number): { x: number; y: number }[] {
  const amp = Math.min((w - 2 * PAD) / 2, 290);
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const sw = 0.72 * Math.sin(i * 0.85 + 0.6) + 0.28 * Math.sin(i * 2.1 + 1);
    out.push({ x: Math.max(PAD, Math.min(w - PAD, w / 2 + amp * sw)), y: TOP + i * STEP });
  }
  return out;
}
function roadPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d;
}
function goalMark(t: World, x: number, y: number): string {
  if (t.goal === "barn") return D.barn(x, y);
  if (t.goal === "cottage") return D.cottage(x, y);
  if (t.goal === "lighthouse") return D.lighthouse(x, y);
  if (t.goal === "tower") return D.tower(x, y);
  if (t.goal === "summit") return D.mountain(x - 60, y + 40, 120, 120, "#B7C2DA", "#fff") + D.flag(x, y - 70);
  if (t.goal === "island") return D.island(x, y + 20, 1.4) + D.palm(x, y, 1);
  if (t.goal === "volcano") return D.volcano(x - 70, y + 30, 140, 120);
  if (t.goal === "skyCastle") return D.cloud(x, y + 30, 2.2, 1) + D.tower(x, y - 6);
  if (t.goal === "station") return D.station(x, y);
  if (t.goal === "portal") return D.portal(x, y - 6);
  return D.flag(x, y);
}
function sceneSvg(t: World, w: number, h: number, pts: { x: number; y: number }[]): string {
  const Y = (f: number) => Math.round(f * h), X = (f: number) => Math.round(f * w);
  const P: string[] = [];
  const gid = "sk" + t.sub;
  P.push(`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/></linearGradient></defs>`);
  P.push(`<rect width="${w}" height="${h}" fill="url(#${gid})"/>`);
  if (t.night) {
    for (let i = 0; i < 110; i++) {
      const gx = ((i * 137.5) % 100) / 100, gy = ((i * 61.7) % 100) / 100;
      P.push(`<circle cx="${X(gx)}" cy="${Y(gy)}" r="${0.6 + ((i * 53) % 20) / 12}" fill="#dff6ff" opacity="${0.3 + ((i * 29) % 10) / 20}"/>`);
    }
    P.push(D.planet(X(0.82), Y(0.16), 26, t.goal === "portal" ? "#7C6BE0" : "#5B78D8", t.goal === "station" ? 1 : 0));
    P.push(D.planet(X(0.15), Y(0.46), 17, "#4FA6E0"));
    P.push(D.planet(X(0.72), Y(0.72), 13, "#E08A6B"));
  } else {
    const skyH = Math.round(h * 0.05);
    P.push(`<rect y="${skyH}" width="${w}" height="${h - skyH}" fill="${t.ground[0]}"/>`);
    for (let k = 0; k < 6; k++) {
      const yy = skyH + Math.round(h * (0.09 + k * 0.15));
      P.push(`<path d="M0 ${yy} Q${X(0.3)} ${yy - 40} ${X(0.62)} ${yy} T${w} ${yy - 20} L${w} ${h} L0 ${h} Z" fill="${k % 2 ? t.ground[1] : t.ground[0]}" opacity=".5"/>`);
    }
    P.push(D.sun(w - 70, 56), D.cloud(X(0.2), 40, 0.9), D.cloud(X(0.7), 30, 0.75));
    if (t.cloudy) P.push(D.cloud(X(0.45), Y(0.4), 1.3, 0.85), D.cloud(X(0.15), Y(0.62), 1, 0.8));
    if (t.water) {
      const wy = Y(0.55);
      P.push(`<path d="M-20 ${wy} C${X(0.3)} ${wy - 16} ${X(0.62)} ${wy + 18} ${w + 20} ${wy} L${w + 20} ${wy + 26} C${X(0.62)} ${wy + 40} ${X(0.3)} ${wy + 8} -20 ${wy + 30} Z" fill="#7FCBEF" opacity=".9"/><path d="M-20 ${wy + 6} Q${X(0.5)} ${wy - 6} ${w + 20} ${wy + 8}" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>`);
    }
    const place = (list: [string, number, string?][], band: number, sizeMul: number) => {
      list.forEach((it, idx) => {
        const type = it[0]; const s = (it[1] || 1) * sizeMul; const col = it[2];
        const seed = (parseInt(t.sub) + 1) * 97 + band * 31 + idx * 13;
        for (let rep = 0; rep < (band === 2 ? 3 : 2); rep++) {
          const fx = 0.08 + rnd(seed + rep * 7) * 0.84;
          const fy = band === 0 ? 0.1 + rnd(seed + rep * 3) * 0.18 : band === 1 ? 0.3 + rnd(seed + rep * 5) * 0.28 : 0.62 + rnd(seed + rep * 9) * 0.3;
          if (D[type]) P.push(D[type](X(fx), Y(fy), s, col));
        }
      });
    };
    place(t.set.far, 0, 0.7); place(t.set.mid, 1, 1); place(t.set.near, 2, 1.2);
    if (!t.water && t.goal !== "volcano" && t.goal !== "summit") {
      P.push(D.mountain(X(0.02), Y(0.82), X(0.4), 170, "#AEBBD6", "#F3F6FC"), D.mountain(X(0.44), Y(0.85), X(0.5), 210, "#98A8CC", "#F3F6FC"));
    }
  }
  const last = pts[pts.length - 1];
  if (last) P.push(goalMark(t, last.x, last.y + 96));
  const rd = roadPath(pts);
  if (rd) {
    P.push(`<path d="${rd}" fill="none" stroke="${t.road[1]}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" opacity="${t.night ? 0.5 : 1}"/>`);
    P.push(`<path d="${rd}" fill="none" stroke="${t.road[0]}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"${t.night ? ` style="filter:drop-shadow(0 0 7px ${t.road[0]})"` : ""}/>`);
    P.push(`<path d="${rd}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 20" stroke-linecap="round" opacity=".8"/>`);
  }
  return P.join("");
}

interface Stop { topic: Topic; x: number; y: number; done: number; total: number; unlocked: boolean; mastered: boolean }

export function LearningPath({
  grade, topics, allTasks, results, premium, locale, helper, onPick, masteredLabel,
}: {
  grade: number; topics: Topic[]; allTasks: Task[]; results: ProgressMap;
  premium: boolean; locale: Locale; helper: Helper; onPick: (t: string) => void; masteredLabel: string;
}) {
  const world = worldFor(grade);
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stops = useMemo<Stop[]>(() => {
    if (width === 0) return [];
    const pos = nodePositions(width, topics.length);
    let prevPassed = true;
    return topics.map((topic, i) => {
      const avail = allTasks.filter((t) => t.topic === topic.id && (premium || t.free));
      const total = avail.length;
      const done = avail.filter((t) => t.id in results).length;
      const passed = total > 0 && done >= Math.ceil(total / 2);
      const mastered = total > 0 && done === total;
      const unlocked = prevPassed;
      prevPassed = passed;
      return { topic, x: pos[i].x, y: pos[i].y, done, total, unlocked, mastered };
    });
  }, [topics, allTasks, results, premium, width]);

  const currentIdx = useMemo(() => {
    const idx = stops.findIndex((s) => s.unlocked && !s.mastered);
    return idx === -1 ? Math.max(0, stops.length - 1) : idx;
  }, [stops]);

  const height = TOP + Math.max(0, topics.length - 1) * STEP + 230;
  const labelBg = world.night ? "bg-black/45" : "bg-white/90 dark:bg-black/45";
  const titleC = world.night ? "text-cyan-50" : "text-emerald-950 dark:text-emerald-50";
  const subC = world.night ? "text-cyan-200/70" : "text-emerald-800/70 dark:text-emerald-200/60";

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-[2rem] shadow-inner" style={{ height: width === 0 ? 560 : height }}>
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="pointer-events-none absolute inset-0" aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: sceneSvg(world, width, height, stops) }} />
      )}

      {stops.map((s, i) => {
        const stateName = !s.unlocked ? "locked" : s.mastered ? "mastered" : "open";
        const isCurrent = i === currentIdx;
        const isOlympiad = s.topic.subject === "olympiad";
        return (
          <div key={s.topic.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: s.x, top: s.y, width: 150 }}>
            {isCurrent && (
              <div className="pointer-events-none absolute -top-[78px] left-1/2 -translate-x-1/2 scale-[.62]">
                <Mascot helper={helper} mood="happy" size="md" />
              </div>
            )}
            <button type="button" disabled={stateName === "locked"} onClick={() => onPick(s.topic.id)} aria-label={s.topic.title[locale]}
              style={{ height: NODE, width: NODE }}
              className={
                "relative flex items-center justify-center rounded-full border-[6px] text-3xl transition " +
                (stateName === "locked"
                  ? "cursor-not-allowed border-white/70 bg-white/80 text-black/25 dark:border-white/15 dark:bg-white/10 dark:text-white/25"
                  : stateName === "mastered"
                    ? "border-white bg-gradient-to-br from-amber-300 to-yellow-400 text-amber-900 shadow-xl"
                    : isOlympiad
                      ? `border-amber-200 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl hover:scale-110 ${isCurrent ? "ring-4 ring-amber-200/90 animate-pulse" : ""}`
                      : `border-white bg-gradient-to-br ${world.nodeGrad} text-white shadow-xl hover:scale-110 ${isCurrent ? "ring-4 ring-white/80 animate-pulse" : ""}`)
              }>
              {stateName === "locked" ? "🔒" : s.topic.icon}
              {stateName === "mastered" && <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow">⭐</span>}
              {isOlympiad && stateName !== "locked" && stateName !== "mastered" && <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow">🏆</span>}
            </button>
            <div className={`mt-2 max-w-[146px] truncate rounded-full px-3 py-1 text-center text-sm font-bold shadow-sm ${labelBg} ${stateName === "locked" ? subC : titleC}`}>
              {s.topic.title[locale]}
            </div>
            {s.unlocked && s.total > 0 && (
              <div className={`mt-1 rounded-full px-2 text-[11px] font-bold ${labelBg} ${subC}`}>
                {s.mastered ? `⭐ ${masteredLabel}` : `${s.done}/${s.total}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
