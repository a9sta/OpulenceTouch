/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **움푹함**이다. 땅 둘레를 고무줄로 팽팽하게 감쌌을 때(볼록 껍질)
 *   껍질 안에서 땅이 아닌 칸이 어디에 얼마나 깊이 들어와 있는지를 잰다.
 *     껍질 채움  : 땅 넓이 ÷ 껍질 넓이(%) — 머리말로 쓰지 않는다
 *     패임       : 껍질 변에서 시작해 땅 쪽으로 파고든 빈 덩어리. 가장 깊은 곳까지의 거리(m)
 *     패임 개수  : 얕은 흠집을 뺀 덩어리 수
 *     입 벌린 쪽 : 가장 깊은 패임이 껍질 가운데에서 어느 쪽에 놓였는가(여덟 방위)
 *     갇힌 빈칸  : 껍질 안에 있으되 어느 변에도 닿지 않는 빈 덩어리(남의 땅이 박힌 자리)
 *   ★칸 격자로 푼다. 땅 고리를 칸 위에 채우고(동마다 짝수·홀수 규칙으로 구멍을 살린 뒤 겹침),
 *     껍질 안의 빈 칸을 이웃끼리 묶는다. 껍질 밖과 맞닿은 칸까지의 거리를 두 번 훑어(체임퍼)
 *     덩어리마다 가장 깊은 칸을 찾는다. 칸 크기는 껍질 크기에 맞춰 4~450m.
 *   앞선 열여덟 사이트는 중심점 거리·방위·면적순위·행정동 수·끝과 끝·경계 맞닿음·가로세로·
 *   둘레·뭉침 정도·안쪽 깊이·매듭점·바깥선까지 거리·이름 세기·해의 자리·테두리의 결·다리 수·
 *   누운 방향·테두리 분담·쏠림·원 안 점유를 썼다. 껍질 안의 빈 칸을 재는 축은 처음이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ──────────────────────────────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

function signedArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** 볼록 껍질(반시계) — 단조 사슬 */
function convexHull(points) {
  const P = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [];
  for (const p of P) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  const up = [];
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  lo.pop(); up.pop();
  return lo.concat(up);
}

const DIRS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * features: 동 하나마다의 고리 묶음 배열. 반환: 움푹함 한 벌.
 * 같은 동 안의 고리는 짝수·홀수 규칙으로(구멍이 살도록), 동끼리는 합친다.
 */
function dentOf(features) {
  const pts = [];
  let A = 0, X = 0, Y = 0;
  for (const rings of features) for (const r of rings) {
    const sgn = r.outer ? 1 : -1;
    const sa = signedArea(r.pts);
    const a = Math.abs(sa);
    if (!a) continue;
    let sx = 0, sy = 0;
    for (let i = 0, n = r.pts.length; i < n; i++) {
      const p = r.pts[i], o = r.pts[(i + 1) % n];
      const f = p[0] * o[1] - o[0] * p[1];
      sx += (p[0] + o[0]) * f; sy += (p[1] + o[1]) * f;
    }
    A += sgn * a; X += sgn * a * (sx / (6 * sa)); Y += sgn * a * (sy / (6 * sa));
    if (r.outer) for (const p of r.pts) pts.push(p);
  }
  if (A <= 0) return null;
  const hull = convexHull(pts);
  const hullArea = Math.abs(signedArea(hull));
  const size = Math.sqrt(hullArea);
  const cell = clamp(size / 140, 4, 450);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of hull) {
    if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
  }
  const nx = Math.ceil((maxX - minX) / cell) + 2, ny = Math.ceil((maxY - minY) / cell) + 2;
  const x0 = minX - cell, y0 = minY - cell;
  const land = new Uint8Array(nx * ny);
  const inHull = new Uint8Array(nx * ny);

  /* 껍질 칸 — 줄마다 껍질 변과 만나는 구간 */
  for (let j = 0; j < ny; j++) {
    const y = y0 + (j + 0.5) * cell;
    let xl = Infinity, xr = -Infinity;
    for (let i = 0, n = hull.length; i < n; i++) {
      const p = hull[i], q = hull[(i + 1) % n];
      if ((p[1] <= y) === (q[1] <= y)) continue;
      const x = p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]);
      if (x < xl) xl = x; if (x > xr) xr = x;
    }
    if (xl > xr) continue;
    const ia = Math.ceil((xl - x0) / cell - 0.5), ib = Math.floor((xr - x0) / cell - 0.5);
    for (let i = Math.max(0, ia); i <= Math.min(nx - 1, ib); i++) inHull[j * nx + i] = 1;
  }

  /* 땅 칸 — 동마다 줄을 훑고 짝수·홀수로 채운 뒤 합친다 */
  for (const rings of features) {
    const bb = rings.map((r) => r);
    for (let j = 0; j < ny; j++) {
      const y = y0 + (j + 0.5) * cell;
      const xs = [];
      for (const r of bb) {
        if (y < r.minY || y > r.maxY) continue;
        const P = r.pts;
        for (let i = 0, n = P.length; i < n; i++) {
          const p = P[i], q = P[(i + 1) % n];
          if ((p[1] <= y) === (q[1] <= y)) continue;
          xs.push(p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
        }
      }
      if (xs.length < 2) continue;
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const ia = Math.ceil((xs[k] - x0) / cell - 0.5), ib = Math.floor((xs[k + 1] - x0) / cell - 0.5);
        for (let i = Math.max(0, ia); i <= Math.min(nx - 1, ib); i++) land[j * nx + i] = 1;
      }
    }
  }

  /* 껍질 밖까지의 거리(체임퍼) */
  const N = nx * ny, INF = 1e9;
  const dt = new Float32Array(N);
  for (let k = 0; k < N; k++) dt[k] = inHull[k] ? INF : 0;
  const D1 = 1, D2 = Math.SQRT2;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i; if (!dt[k]) continue;
    let v = dt[k];
    if (i > 0) v = Math.min(v, dt[k - 1] + D1);
    if (j > 0) { v = Math.min(v, dt[k - nx] + D1); if (i > 0) v = Math.min(v, dt[k - nx - 1] + D2); if (i < nx - 1) v = Math.min(v, dt[k - nx + 1] + D2); }
    dt[k] = v;
  }
  for (let j = ny - 1; j >= 0; j--) for (let i = nx - 1; i >= 0; i--) {
    const k = j * nx + i; if (!dt[k]) continue;
    let v = dt[k];
    if (i < nx - 1) v = Math.min(v, dt[k + 1] + D1);
    if (j < ny - 1) { v = Math.min(v, dt[k + nx] + D1); if (i < nx - 1) v = Math.min(v, dt[k + nx + 1] + D2); if (i > 0) v = Math.min(v, dt[k + nx - 1] + D2); }
    dt[k] = v;
  }

  /* 빈 칸 덩어리 */
  const label = new Int32Array(N).fill(-1);
  const comps = [];
  let hullCells = 0, sx = 0, sy = 0;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i;
    if (!inHull[k]) continue;
    hullCells++; sx += i; sy += j;
    if (land[k] || label[k] >= 0) continue;
    const id = comps.length;
    const stack = [k]; label[k] = id;
    const c = { cells: 0, depth: 0, cx: 0, cy: 0, rim: false };
    while (stack.length) {
      const u = stack.pop();
      const ui = u % nx, uj = (u - ui) / nx;
      c.cells++; c.cx += ui; c.cy += uj;
      if (dt[u] > c.depth) c.depth = dt[u];
      if (dt[u] <= 1.5) c.rim = true;
      if (ui > 0 && inHull[u - 1] && !land[u - 1] && label[u - 1] < 0) { label[u - 1] = id; stack.push(u - 1); }
      if (ui < nx - 1 && inHull[u + 1] && !land[u + 1] && label[u + 1] < 0) { label[u + 1] = id; stack.push(u + 1); }
      if (uj > 0 && inHull[u - nx] && !land[u - nx] && label[u - nx] < 0) { label[u - nx] = id; stack.push(u - nx); }
      if (uj < ny - 1 && inHull[u + nx] && !land[u + nx] && label[u + nx] < 0) { label[u + nx] = id; stack.push(u + nx); }
    }
    comps.push(c);
  }
  const hcx = sx / (hullCells || 1), hcy = sy / (hullCells || 1);
  const minDepth = Math.max(3, 0.05 * (size / cell));
  const minHole = Math.max(12, 0.005 * hullCells);
  const pockets = comps.filter((c) => c.rim && c.depth >= minDepth).sort((a, b) => b.depth - a.depth);
  const holes = comps.filter((c) => !c.rim && c.cells >= minHole);
  let dir = -1, depth = 0, drel = 0;
  if (pockets.length) {
    const p = pockets[0];
    depth = Math.round(Math.max(0, p.depth - 0.5) * cell);
    drel = Math.round((depth / size) * 1000) / 10;
    const dx = p.cx / p.cells - hcx, dy = p.cy / p.cells - hcy;
    const ang = (Math.atan2(dx, dy) * 180) / Math.PI;
    dir = ((Math.round(ang / 45) % 8) + 8) % 8;
  }
  const fill = Math.min(100, (A / hullArea) * 100);
  return {
    area: A / 1e6, gx: X / A, gy: Y / A,
    hull: hullArea / 1e6, fill: r1(fill),
    pockets: pockets.length, holes: holes.length,
    depth, drel, dir,
    shape: shapeOf(fill),
  };
}

/** 모양을 한 낱말로 — 껍질 채움으로 가른다 */
function shapeOf(fill) {
  if (fill >= 98) return 'convex';
  if (fill >= 94) return 'smooth';
  if (fill >= 89) return 'dent';
  if (fill >= 83) return 'bay';
  if (fill >= 74) return 'cleft';
  return 'ragged';
}

function ringsOf(geom, lat0) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
  const rings = [];
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const pts = ring.slice(0, -1).map((c) => [c[0] * kx, c[1] * ky]);
      if (pts.length < 3) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const p of pts) {
        if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
      }
      rings.push({ pts, outer: idx === 0, minX, maxX, minY, maxY, area: Math.abs(signedArea(pts)) });
    });
  }
  return { rings, kx, ky };
}

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 시도별 투영 기준 위도 — 한 시도 안은 같은 평면을 쓴다 ──────
   ★동마다 기준 위도를 달리 두면 이웃 동의 가로 좌표가 수 km 어긋난다. */
const LAT0 = new Map();
{
  const acc = new Map();
  for (const ft of geo.features) {
    const p = ft.properties;
    const [sidoKey] = sidoOf(p);
    if (!sidoKey) continue;
    const g = ft.geometry;
    const first = g.type === 'Polygon' ? g.coordinates[0][0] : g.coordinates[0][0][0];
    const a = acc.get(sidoKey) || [0, 0];
    a[0] += first[1]; a[1] += 1;
    acc.set(sidoKey, a);
  }
  for (const [k, [s, n]] of acc) LAT0.set(k, s / n);
}

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
for (const ft of geo.features) {
  const p = ft.properties;
  const [sidoKey, m, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const lat0 = LAT0.get(sidoKey);
  const { rings, kx, ky } = ringsOf(ft.geometry, lat0);
  const kind = kindOf(name);
  const wantSpot = isMain && kind === '동';
  const t = wantSpot ? dentOf([rings]) : null;
  let areaOnly = 0, X = 0, Y = 0;
  if (!t) {
    for (const r of rings) {
      const sgn = r.outer ? 1 : -1;
      areaOnly += sgn * r.area;
    }
  }
  const rec = {
    code: String(p.adm_cd2), name, kind, sidoKey, isMain, sggnm: p.sggnm,
    rings, kx, ky, wantSpot,
  };
  if (t) {
    Object.assign(rec, {
      lat: r6(t.gy / ky), lng: r6(t.gx / kx), area: r2(t.area),
      hull: r2(t.hull), fill: t.fill, pockets: t.pockets, holes: t.holes,
      depth: t.depth, drel: t.drel, dir: t.dir, shape: t.shape,
    });
  }
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
const byName = (a, b) => a.name.localeCompare(b.name, 'ko');
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort(byName);

  const gt = dentOf(list.map((d) => d.rings));
  const ky = 110574, kx = list[0].kx;
  if (!gt) continue;

  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(gt.gy / ky), lng: r6(gt.gx / kx),
    area: r1(gt.area),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    hull: r1(gt.hull), fill: gt.fill, pockets: gt.pockets, holes: gt.holes,
    depth: gt.depth, drel: gt.drel, dir: gt.dir, shape: gt.shape,
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      if (d.fill === undefined) continue;
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        hull: d.hull, fill: d.fill, pockets: d.pockets, holes: d.holes,
        depth: d.depth, drel: d.drel, dir: d.dir, shape: d.shape,
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  g._list = list;
  guAll.push(g);
}

/* ── 시군구 안 차례 ───────────────────────────────────────── */
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byDepth = g.spots.slice().sort((a, b) => b.depth - a.depth || a.fill - b.fill || byName(a, b));
  byDepth.forEach((s, i) => { s.guDepthRank = i + 1; });
  g.deepSpot = byDepth[0].name; g.deepSpotSlug = byDepth[0].slug; g.deepSpotV = byDepth[0].depth;
  const byFill = g.spots.slice().sort((a, b) => b.fill - a.fill || byName(a, b));
  g.roundSpot = byFill[0].name; g.roundSpotSlug = byFill[0].slug; g.roundSpotV = byFill[0].fill;
  const lo = byFill[byFill.length - 1];
  g.thinSpot = lo.name; g.thinSpotSlug = lo.slug; g.thinSpotV = lo.fill;
  const byPk = g.spots.slice().sort((a, b) => b.pockets - a.pockets || b.depth - a.depth || byName(a, b));
  g.multiSpot = byPk[0].name; g.multiSpotSlug = byPk[0].slug; g.multiSpotV = byPk[0].pockets;
  const withHole = g.spots.filter((s) => s.holes > 0).sort((a, b) => b.holes - a.holes || byName(a, b));
  g.holeCount = withHole.length;
  if (withHole.length) { g.holeSpot = withHole[0].name; g.holeSpotSlug = withHole[0].slug; }
  const cnt = {};
  for (const s of g.spots) cnt[s.shape] = (cnt[s.shape] || 0) + 1;
  g.shapeCount = cnt;
  g.plainRound = g.spots.filter((s) => s.pockets === 0).length;
}

/* ── 패임 윤곽이 닮은 시군구 — 이 사이트의 '옆 동네' ──────── */
{
  const sidoSlug = (key) => (MAIN[key] || SUB[key]).slug;
  for (const g of guAll) {
    const pool = guAll.filter((o) => o !== g).map((o) => ({
      o, same: o.sidoKey === g.sidoKey,
      gap: Math.round(Math.abs(o.fill - g.fill) + 4 * Math.abs(o.pockets - g.pockets) + Math.abs(o.drel - g.drel)),
    }));
    pool.sort((a, b) => (a.same === b.same ? (a.gap - b.gap || a.o.name.localeCompare(b.o.name, 'ko')) : a.same ? -1 : 1));
    g.kin = pool.slice(0, 8).map(({ o, same, gap }) => ({
      sidoSlug: sidoSlug(o.sidoKey), gu: o.name, slug: o.slug, same, gap, shape: o.shape, fill: o.fill, depth: o.depth,
    }));
    g.kinCount = g.kin.length;
  }
}

/* ── 전국 차례 ────────────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.depth - a.depth || a.fill - b.fill || byName(a, b)).forEach((s, i) => { s.depthRank = i + 1; });
spotAll.slice().sort((a, b) => a.fill - b.fill || byName(a, b)).forEach((s, i) => { s.thinRank = i + 1; });

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  const isMain = !!MAIN[key];
  let st = null;
  const kx = gus[0]._list[0].kx, ky = 110574;
  if (isMain) {
    const feats = [];
    for (const g of gus) for (const d of g._list) feats.push(d.rings);
    st = dentOf(feats);
  }
  gus.sort(byName);
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort(byName);
    delete g.sidoKey; delete g._list;
  }
  const units = isMain ? allSpots : gus;
  const cnt = {};
  for (const s of units) cnt[s.shape] = (cnt[s.shape] || 0) + 1;
  const byD = units.slice().sort((a, b) => b.depth - a.depth || a.fill - b.fill || byName(a, b));
  const byF = units.slice().sort((a, b) => b.fill - a.fill || byName(a, b));
  const deep = byD[0], round = byF[0], thin = byF[byF.length - 1];
  const avg = (f) => Math.round((units.reduce((s, x) => s + f(x), 0) / units.length) * 10) / 10;
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: isMain,
    lat: st ? r6(st.gy / ky) : r6(gus.reduce((s, g) => s + g.lat, 0) / gus.length),
    lng: st ? r6(st.gx / kx) : r6(gus.reduce((s, g) => s + g.lng, 0) / gus.length),
    area: st ? r1(st.area) : r1(gus.reduce((s, g) => s + g.area, 0)),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    hull: st ? r1(st.hull) : null, fill: st ? st.fill : null, pockets: st ? st.pockets : null,
    holes: st ? st.holes : null, depth: st ? st.depth : null, drel: st ? st.drel : null,
    dir: st ? st.dir : null, shape: st ? st.shape : null,
    shapeCount: cnt,
    avgFill: avg((x) => x.fill), avgDepth: Math.round(avg((x) => x.depth)), avgPockets: avg((x) => x.pockets),
    deepName: deep.name, deepV: deep.depth, deepSlug: deep.slug,
    roundName: round.name, roundV: round.fill, roundSlug: round.slug,
    thinName: thin.name, thinV: thin.fill, thinSlug: thin.slug,
    unitKind: isMain ? '동' : '시군구',
    gu: gus,
  });
}

const dd = spotAll.map((s) => s.depth).sort((a, b) => a - b);
const ff = spotAll.map((s) => s.fill).sort((a, b) => a - b);
const cntAll = {};
for (const s of spotAll) cntAll[s.shape] = (cntAll[s.shape] || 0) + 1;
const SHAPES = ['convex', 'smooth', 'dent', 'bay', 'cleft', 'ragged'];
const out = {
  version: VERSION,
  source: '경계는 admdongkor 행정동 경계(CC BY 4.0)를 썼다. 국가공간정보포털 원본을 다듬어 올린 배포본이다.',
  built: new Date().toISOString().slice(0, 10),
  axis: '움푹함 — 땅 둘레를 팽팽하게 감싼 볼록 껍질 안에서 땅이 아닌 칸이 얼마나 깊이 파고드는가',
  method: '행정동 경계를 시도마다 하나로 맞춘 미터 평면에 옮기고, 땅 꼭짓점을 팽팽하게 감싸는 볼록 껍질을 만들었다. 껍질 크기에 맞춘 칸 격자(4~450m) 위에 땅을 채우고, 껍질 안에서 땅이 아닌 칸을 이웃끼리 묶어 덩어리로 삼았다. 껍질 밖과 맞닿은 칸까지의 거리를 두 번 훑어 덩어리마다 가장 깊은 칸을 찾았다. 껍질 변에 닿지 않는 덩어리는 갇힌 빈칸으로 따로 셌고, 너무 얕은 덩어리는 패임으로 치지 않았다.',
  coverageFrom: '서울·인천·경기·부산은 동 하나마다 쪽이 있다. 대전·대구·울산 전역, 광주 광산구, 고른 시·군은 시군구까지만 쪽이 있고, 읍과 면은 쪽 없이 시군구 목록에 이름으로 실린다.',
  shapes: SHAPES,
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    depthMin: dd[0], depthMid: dd[dd.length >> 1], depthMax: dd[dd.length - 1],
    fillMin: ff[0], fillMid: ff[ff.length >> 1], fillMax: ff[ff.length - 1],
    deepName: spotAll.slice().sort((a, b) => b.depth - a.depth || a.fill - b.fill || byName(a, b))[0].name,
    thinName: spotAll.slice().sort((a, b) => a.fill - b.fill || byName(a, b))[0].name,
    roundName: spotAll.slice().sort((a, b) => b.fill - a.fill || byName(a, b))[0].name,
    shapeCount: SHAPES.map((q) => cntAll[q] || 0),
    plainRound: spotAll.filter((s) => s.pockets === 0).length,
    holeSpots: spotAll.filter((s) => s.holes > 0).length,
    featAll: geo.features.length,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out, (k, v) => (k === 'rings' ? undefined : v)));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`패임 깊이 min ${C.depthMin} · 중앙 ${C.depthMid} · max ${C.depthMax}(${C.deepName}) · 껍질 채움 min ${C.fillMin}(${C.thinName}) · 중앙 ${C.fillMid} · max ${C.fillMax}(${C.roundName})`);
console.log(`패임 없는 동 ${C.plainRound} · 갇힌 빈칸 있는 동 ${C.holeSpots}`);
console.log(`모양 ${SHAPES.map((q, i) => `${q} ${C.shapeCount[i]}`).join(' · ')}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 채움 ${s.fill ?? '-'} · 평균채움 ${s.avgFill} · 평균깊이 ${s.avgDepth}`);
