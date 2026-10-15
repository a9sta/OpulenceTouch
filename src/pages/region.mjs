import { layout, frame } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepCards, stepSet, statTiles, faqBlock, noticeBlock,
  shapeKin, spotIndex, ruralList, dongNameList, guIndex, kinList, hailStrip,
  topicLinks, courseTopic, stamp,
} from '../lib/blocks.mjs';
import { plate } from '../assets.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  shapeName, shapeTalk, depthWord, fillWord, fm, dirName,
  ANCHOR, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

const FIG_PLAIN = [
  '점선 네모가 겉선, 색칠한 면이 땅입니다. 파인 곳이 없어 네모가 그대로 남았습니다.',
  '겉선과 땅이 겹쳐 홈을 낼 자리가 없었습니다. 그림은 네모 그대로입니다.',
  '점선은 겉선입니다. 안쪽을 파낸 흔적이 없는 동이라 면이 꽉 찼습니다.',
];
const FIG_NOTCH = [
  (d, w) => `점선 네모가 겉선, 색칠한 면이 땅입니다. ${w} 변에서 ${d}만큼 파고든 자리가 가장 깊은 홈입니다.`,
  (d, w) => `${w}${josa(w, '으로/로')} 열린 홈이 점선 안쪽을 ${d} 깊이로 잘라 냈습니다. 비율만 같게 줄인 그림입니다.`,
  (d, w) => `색칠한 면 한쪽이 ${w}에서 ${d}만큼 잘려 들어갔습니다. 그림은 실제 깊이의 비율을 따랐습니다.`,
];
function figure(x, h, who) {
  const plain = !x.pockets;
  const cap = plain ? at(h, FIG_PLAIN, 3) : at(h, FIG_NOTCH, 3)(fm(x.depth), dirName(x.dir));
  return `<figure class="ot-fig">${plate(x.dir, x.drel)}<figcaption><b>${esc(who)} 겉선 도해</b><br>${esc(cap)}</figcaption></figure>`;
}

function common(ctx) {
  const { cfg, courses } = ctx;
  return {
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive, tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };
}

/* ── 동 안내문 — 메인 네 시도에서만 낸다 ─────────────────────── */
function spotCtx(ctx, sd, g, s) {
  const { counts } = ctx;
  const n = g.shapeCount[s.shape] || 1;
  const plain = !s.pockets;
  const dirW = dirName(s.dir);
  return {
    ...common(ctx),
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, place: `${g.name} ${s.name}`,
    area: km2(s.area), hull: km2(s.hull), fill: s.fill, pockets: s.pockets, plain,
    depthTxt: plain ? '' : fm(s.depth), drel: s.drel, dirW,
    depthNote: depthWord(s.depth), fillNote: fillWord(s.fill),
    shapeW: shapeName(s.shape), shapeNote: shapeTalk(s.shape),
    guRank: s.guDepthRank, nat: s.depthRank,
    allSpots: counts.spot, guSpotCount: g.spotCount, plainRound: counts.plainRound,
    guDeepSpot: g.deepSpot, guDeepTxt: fm(g.deepSpotV),
    guRoundSpot: g.roundSpot, guMultiSpot: g.multiSpot, guMultiV: g.multiSpotV,
    guFill: g.fill, guShapeW: shapeName(g.shape),
    sameNote: n > 1
      ? `${g.name}에서 ${shapeName(s.shape)} 땅으로 갈린 구역은 ${n}곳이고 ${s.name}도 그중 하나입니다.`
      : `${g.name}에서 ${shapeName(s.shape)} 땅은 ${s.name} 하나뿐입니다.`,
    kindWord: '겉선·홈',
    measure: plain
      ? `${s.name}${josa(s.name, '은/는')} 겉선 안 땅이 ${s.fill}%이고 홈이 없습니다`
      : `${s.name}${josa(s.name, '은/는')} 겉선 안 땅이 ${s.fill}%이고 가장 깊은 홈이 ${dirW}${josa(dirW, '으로/로')} ${fm(s.depth)}입니다`,
  };
}

export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const open = `<div class="ot-top"><div class="ot-lead">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>${figure(s, h, `${g.name} ${s.name}`)}</div>`;

  const facts = frame('fact', 'measured', `${esc(s.name)}의 겉선과 홈`,
    statTiles([
      ['위치', `<a href="/${sd.slug}/">${esc(sd.full)}</a> › <a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['겉선 안 땅', `${s.fill}%<small>${esc(c.fillNote)}</small>`],
      ['땅 넓이', `${km2(s.area)}<small>겉선이 두른 넓이 ${km2(s.hull)}</small>`],
      ['홈의 수', s.pockets ? `${s.pockets}곳` : '없음'],
      ['가장 깊은 홈', s.pockets ? `${esc(c.dirW)} ${fm(s.depth)}<small>${esc(c.depthNote)}</small>` : '홈 없음<small>겉선에 붙은 땅입니다</small>'],
      ['한 변 대비 깊이', s.pockets ? `${s.drel}%` : '0%'],
      ['땅 모양', `${esc(c.shapeW)}<small>${esc(c.shapeNote)}</small>`],
      ['깊이 석차', s.pockets
        ? `${esc(g.name)}에서 ${s.guDepthRank}등<small>전체 ${ctx.counts.spot}곳 가운데 ${s.depthRank}등</small>`
        : `홈 없는 동 ${ctx.counts.plainRound}곳에 듭니다<small>${esc(g.name)}에서는 ${g.plainRound}곳</small>`],
    ]),
    esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) far.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const sameSido = [];
  for (const x of sd.gu) {
    if (x.slug === g.slug) continue;
    for (const y of x.spots) sameSido.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  }
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 안 다른 구역`, items: sameSido, pick: 18, anchor: ANCHOR },
    { label: '모양이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    { label: '다른 시도', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    courseRoll(courses, seed, s.name, '02', { full: false }),
    hailStrip(cfg, `${g.name} ${s.name}`, seed),
    shapeKin(sd, g, s, seed, '03'),
    stepCards(seed, '04'),
    faqHtml,
    spotIndex(sd, g, seed, s.slug, '05'),
    guIndex(sd, seed, g.slug, '07', { pick: 12 }),
    noticeBlock(seed, '08'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="ot-h1-s">출장마사지 홈타이 · ${s.pockets ? `${esc(c.dirW)}${josa(c.dirW, '으로/로')} ${fm(s.depth)} 파인 ${esc(c.shapeW)} 땅` : '파인 곳 없이 겉선에 붙은 땅'}</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${g.name} ${s.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시군구 안내문 ────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다. 안내문을 낼 구역이 0이므로 갈래를 나눈다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  let topShape = '', topN = 0;
  for (const [k, v] of Object.entries(g.shapeCount || {})) if (v > topN) { topShape = k; topN = v; }
  const dirW = dirName(g.dir);
  const c = {
    ...common(ctx),
    sido: sd.name, name: g.name, gu: g.name, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area), fill: g.fill, pockets: g.pockets,
    depthTxt: fm(g.depth), dirW, depthNote: depthWord(g.depth), shapeNote: shapeTalk(g.shape),
    deepSpot: g.deepSpot || '', deepSpotTxt: g.deepSpotV ? fm(g.deepSpotV) : '',
    roundSpot: g.roundSpot || '', multiSpot: g.multiSpot || '', multiSpotV: g.multiSpotV || 0,
    sameNote: g.spotCount
      ? `${g.name}에서 가장 많은 땅 모양은 ${shapeName(topShape)} 쪽이고 ${topN}곳입니다.`
      : `${g.name}${josa(g.name, '은/는')} 안내문을 낸 구역이 없어 한 장에서 받습니다.`,
    kinCount: g.kinCount,
    place: `${sd.name} ${g.name}`,
    kindWord: '겉선·홈',
    measure: `${g.name}${josa(g.name, '은/는')} 겉선 안 땅이 ${g.fill}%이고 가장 깊은 홈이 ${dirW}${josa(dirW, '으로/로')} ${fm(g.depth)}입니다`,
  };

  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const open = `<div class="ot-top"><div class="ot-lead">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>${figure(g, h, g.name)}</div>`;

  const rows = [
    ['위치', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}구역`],
    mode === 'spot' ? ['안내문을 낸 동', `${g.spotCount}구역`]
      : mode === 'rural' ? ['안내문을 낸 동', '없음<small>읍·면만 있는 군입니다</small>']
        : ['끊은 겹', '시군구<small>동 이름은 아래 목록에 있습니다</small>'],
    ['읍·면', g.ruralCount ? `읍 ${g.eupCount}곳, 면 ${g.myeonCount}곳<small>이름 목록만 아래에 둡니다</small>` : '없음'],
    ['겉선 안 땅', `${g.fill}%<small>${esc(fillWord(g.fill))}</small>`],
    ['땅 넓이', `${km2(g.area)}<small>겉선이 두른 넓이 ${km2(g.hull)}</small>`],
    ['홈의 수', `${g.pockets}곳`],
    ['가장 깊은 홈', `${esc(dirW)} ${fm(g.depth)}<small>${esc(depthWord(g.depth))}</small>`],
    ['땅 모양', `${esc(shapeName(g.shape))}<small>${esc(shapeTalk(g.shape))}</small>`],
    ['모양이 닮은 시군구', g.kin.length >= 2 ? `${esc(g.kin[0].gu)} · ${esc(g.kin[1].gu)}<small>외 ${g.kinCount - 2}곳</small>` : g.kin.length ? esc(g.kin[0].gu) : '없음'],
  ];
  if (mode === 'spot' && g.deepSpot) {
    rows.splice(8, 0,
      ['홈이 가장 깊은 동', `<a href="/${sd.slug}/${g.slug}/${g.deepSpotSlug}/">${esc(g.deepSpot)}</a><small>${fm(g.deepSpotV)}</small>`],
      ['겉선에 가장 붙은 동', `<a href="/${sd.slug}/${g.slug}/${g.roundSpotSlug}/">${esc(g.roundSpot)}</a><small>겉선 안 땅 ${g.roundSpotV}%</small>`]);
  }
  const facts = frame('fact', 'measured', `${esc(g.name)}의 겉선과 홈`, statTiles(rows), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const far = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const steps = stepSet(seed);
  const sidoDeep = [];
  for (const x of sd.gu) for (const y of x.spots) if (x.slug !== g.slug) sidoDeep.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '모양이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    ...(sidoDeep.length ? [{ label: `${sd.name} 동으로 바로`, items: sidoDeep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시군구', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '10', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    mode === 'spot' ? spotIndex(sd, g, seed, null, '02') : mode === 'list' ? dongNameList(g, seed, '02') : '',
    ruralList(g, seed, '03'),
    hailStrip(cfg, `${sd.name} ${g.name}`, seed),
    courseRoll(courses, seed, g.name, '04', { full: false }),
    kinList(sd, g, seed, '05'),
    stepCards(seed, '06'),
    faqHtml,
    noticeBlock(seed, '08'),
    guIndex(sd, seed, g.slug, '09', { pick: 20 }),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="ot-h1-s">출장마사지 홈타이 · ${mode === 'spot' ? `겉선 안 땅 ${g.fill}%에 동 ${g.spotCount}곳 도해` : mode === 'rural' ? `겉선 안 땅 ${g.fill}%에 읍·면 ${g.ruralCount}곳 이름` : `겉선 안 땅 ${g.fill}%에 홈 ${g.pockets}곳`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${g.name}에서 부르는 다섯 걸음`, steps, cfg),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 안내문 ──────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDepth = sd.gu.slice().sort((a, b) => b.depth - a.depth || a.name.localeCompare(b.name, 'ko'));

  const c = {
    ...common(ctx),
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    fill: sd.fill, avgFill: sd.avgFill,
    dirW: sd.main ? dirName(sd.dir) : '', depthTxt: sd.main ? fm(sd.depth) : '',
    deepName: sd.deepName, roundName: sd.roundName,
    place: sd.name, kindWord: '겉선·홈',
    measure: sd.main
      ? `${sd.name}${josa(sd.name, '은/는')} 겉선 안 땅이 ${sd.fill}%이고 동 평균은 ${sd.avgFill}%입니다`
      : `${sd.name}의 시군구 평균 겉선 안 땅은 ${sd.avgFill}%이고 가장 깊이 팬 곳은 ${sd.deepName}입니다`,
  };

  const open = `<div class="ot-lead"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;
  const topOpen = sd.main ? `<div class="ot-top">${open}${figure(sd, h, sd.name)}</div>` : open;

  const link = (nm, slug) => (sd.main ? esc(nm) : `<a href="/${sd.slug}/${slug}/">${esc(nm)}</a>`);
  const facts = frame('fact', 'measured', `${esc(sd.name)}의 겉선과 홈`,
    statTiles([
      ['행정 명칭', esc(sd.full)],
      ['안내문을 낸 겹', sd.main ? '시군구 밑에 동까지' : '시군구에서 끊음'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}구역`],
      sd.main ? ['안내문을 낸 동', `${sd.spotCount}구역`] : ['동 이름', '아래 시군구 쪽 목록에 있습니다'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}구역<small>시군구 쪽의 이름 목록으로 대신</small>` : '없음'],
      ...(sd.main
        ? [
          ['겉선 안 땅', `${sd.fill}%<small>${esc(fillWord(sd.fill))}</small>`],
          ['가장 깊은 홈', `${esc(dirName(sd.dir))} ${fm(sd.depth)}<small>${esc(depthWord(sd.depth))}</small>`],
          ['땅 모양', `${esc(shapeName(sd.shape))}<small>${esc(shapeTalk(sd.shape))}</small>`],
          ['동 평균 겉선 안 땅', `${sd.avgFill}%<small>동 ${sd.spotCount}구역 평균</small>`],
        ]
        : [
          ['시군구 평균 겉선 안 땅', `${sd.avgFill}%`],
          ['시군구 평균 홈 깊이', `${fm(sd.avgDepth)}<small>홈은 평균 ${sd.avgPockets}곳</small>`],
          ['받는 시각', `${esc(cfg.hours)}<small>${esc(cfg.pay)}</small>`],
        ]),
      [sd.main ? '홈이 가장 깊은 동' : '홈이 가장 깊은 시군구', `${link(sd.deepName, sd.deepSlug)}<small>${fm(sd.deepV)}</small>`],
      [sd.main ? '겉선에 가장 붙은 동' : '겉선에 가장 붙은 시군구', `${link(sd.roundName, sd.roundSlug)}<small>겉선 안 땅 ${sd.roundV}%</small>`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '06');

  const csLinks = frame('sidocourse', 'courses', `${esc(sd.name)}에서 고르는 코스`,
    `<ul class="ot-run">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스가 달라지면 손이 오래 머무는 자리도 달라집니다. ${esc(sd.name)}에서 보는 비용표는 어느 구역이든 같은 한 장입니다.`, '04');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) if (s.pockets) all.push({ g, s });
    all.sort((a, b) => b.s.depth - a.s.depth || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = frame('deepest', 'deepest', `${esc(sd.name)}에서 홈이 가장 깊은 동`,
      `<ul class="ot-stamps">\n${all.slice(0, 12).map((x) => stamp(`/${sd.slug}/${x.g.slug}/${x.s.slug}/`, `${x.g.name} ${x.s.name}`, x.s, false)).join('\n')}\n</ul>`,
      '깊은 홈이 있는 동은 주소를 끝까지 들어야 길이 섭니다. 여기 없는 동은 시군구를 거쳐 들어가 주세요.', '03');
  } else {
    pickBlock = frame('deepgu', 'deepest', `${esc(sd.name)}에서 홈이 가장 깊은 시군구`,
      `<ul class="ot-run">\n${byDepth.slice(0, 10).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} ${fm(g.depth)}</a></li>`).join('\n')}\n</ul>`,
      '깊이는 겉선에서 안쪽으로 가장 멀리 파고든 거리입니다.', '03');
  }

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const deep = [];
  for (const g of sd.gu) for (const x of g.spots) deep.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} + 코스로`, items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '코스 한 장씩', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    ...(deep.length ? [{ label: `${sd.name} 동으로 바로`, items: deep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시도', items: far, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    topOpen,
    facts,
    hailStrip(cfg, sd.name, seed),
    guIndex(sd, seed, null, '02'),
    pickBlock,
    csLinks,
    courseRoll(courses, seed, sd.name, '05', { full: false }),
    stepCards(seed, '06'),
    faqHtml,
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="ot-h1-s">출장마사지 홈타이 · ${sd.main ? `동 ${sd.spotCount}구역 · 땅 모양 ${esc(shapeName(sd.shape))}` : `시군구 ${sd.gu.length}곳 · 평균 겉선 안 땅 ${sd.avgFill}%`}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.itemList(`${url}#courselist`, `${sd.name} 코스`, courses.map((cc) => ({ name: `${sd.name} ${cc.ko}`, url: `${siteUrl}/${sd.slug}/course/${cc.slug}/` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
