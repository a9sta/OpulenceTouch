import { esc, hash, shuffle, won, josa } from './util.mjs';
import { frame, callBox } from './html.mjs';
import { plate } from '../assets.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC, COURSE_ANCHOR, DOC_LINKS, fm, shapeName, dirName } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 한글 첫소리 — 동 이름을 묶을 때 쓴다. */
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MERGE = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };
export function choOf(name) {
  const c = name.codePointAt(0) - 0xac00;
  if (c < 0 || c >= 11172) return '#';
  const k = CHO[Math.floor(c / 588)];
  return MERGE[k] || k;
}

const SHAPE_ORDER = ['convex', 'smooth', 'dent', 'bay', 'cleft', 'ragged'];
/** 깊이 표기. 0 은 홈 없음. */
export const depthLabel = (m) => (m ? fm(m) : '홈 없음');

/* ── 예약 문의 띠 = 전보 ────────────────────────────────────── */
export function hailStrip(cfg, place, seedKey) {
  const h = hash(seedKey, 'hs');
  const lines = [
    `${place}${josa(place, '이라/라')}는 말씀만 주셔도 됩니다. 남은 주소는 통화하면서 채웁니다.`,
    `${place}에 지금 나갈 수 있는지는 통화하는 동안 알려 드립니다.`,
    `${place}${josa(place, '으로/로')} 가려면 코스, 시각, 주소 세 가지만 있으면 됩니다.`,
    `${place}에서 받는 창구는 이 번호 하나입니다. 다른 길은 만들지 않았습니다.`,
  ];
  return `<section class="ot-wire" aria-label="${esc(place)} 예약 문의">
  <p class="ot-wire-p">${esc(at(h, lines))}</p>
  ${callBox(cfg, { size: 'l' })}
  <p class="ot-wire-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 = 값이 왼쪽에 서는 쪽지 목록 ──────────────────────────
   ★쪽마다 아홉 가지를 통째로 되풀이하면 그 덩어리가 본문에서 가장 커진다.
     동·시군구에서는 시드로 고른 셋만 보이고 나머지는 코스 안내문으로 보낸다. */
export function courseRoll(courses, seedKey, place, num = '01', { full = true } = {}) {
  const h = hash(seedKey, 'cr');
  const show = full ? courses : shuffle(courses.slice(), h).slice(0, 3);
  const withText = new Set(shuffle(show.map((c) => c.slug), h).slice(0, full ? 2 : 1));
  const list = show.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li><a href="/course/${c.slug}/"><span class="ot-pr">${won(c.price)}<i>원</i></span><span class="ot-nm">${esc(c.ko)}</span><span class="ot-mt">${c.min}분 · 압 ${esc(c.pressure)} · ${c.oil ? '오일 씀' : '오일 없음'}</span></a>${withText.has(c.slug) ? `<p>${esc(line)}</p>` : ''}</li>`;
  }).join('\n');
  const short = [
    `${esc(place)}에서도 아홉 가지를 똑같이 들고 갑니다. 나머지 여섯은 <a href="/course/">코스 안내</a>에, 값은 <a href="/price/">비용</a>에 있습니다.`,
    `${esc(place)}에서 통화로 자주 나오는 셋만 올렸습니다. <a href="/course/">아홉 가지 전부</a>와 <a href="/price/">값만 추린 쪽</a>도 따로 있습니다.`,
    `${esc(place)}${josa(place, '이라/라')}고 고를 수 있는 폭이 줄지는 않습니다. <a href="/course/">남은 여섯</a>과 <a href="/price/">비용 전체</a>를 걸어 두었습니다.`,
    `압이나 길이가 맞지 않으면 <a href="/course/">아홉 가지</a>를 펼쳐 보세요. 어느 구역이든 <a href="/price/">쓰는 표는 하나</a>입니다.`,
  ];
  const tail = full
    ? `${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}`
    : at(h, short, 4);
  return frame('course', 'courses', full ? `${esc(place)}까지 들고 가는 아홉 가지` : `${esc(place)}${josa(place, '으로/로')} 많이 부르는 세 가지`,
    `<ul class="ot-tags">\n${list}\n</ul>
     <p class="ot-x">${tail}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 = 영수증 전표 ─────────────────────────────────── */
export function stepSet(seedKey) {
  return at(hash(seedKey, 'st'), STEP_SETS);
}
export function stepCards(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  const slip = `<div class="ot-slip">
  <p class="ot-slip-h"><span>접수 전표</span><span>NO.${String(parseInt(h.substr(0, 4), 16) % 9000 + 1000)}</span></p>
  <ol>\n${steps.map((s, i) => `<li><span class="ot-ln">${String(i + 1).padStart(2, '0')}</span><b>${esc(s.t)}</b><span>${esc(s.d)}</span></li>`).join('\n')}\n</ol>
  <p class="ot-slip-f">합계는 끝난 뒤 한 번 · 선입금 0원</p>
</div>`;
  return frame('step', 'order', esc(at(h, SEC.stepTitle, 1)), slip, esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 제원표 — rows: [라벨, 값(HTML)] ─────────────────────────── */
export function statTiles(rows) {
  return `<table class="ot-spec"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 — 말풍선. 질문은 h3 ───────────────────────── */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'fq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = frame('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="ot-chat">\n${qa.map((x) => `<div class="ot-q"><h3>${esc(x.q)}</h3></div><div class="ot-a"><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 주의 = 빗금 가장자리 메모 ───────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return frame('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<div class="ot-memo"><ul>\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul></div>`, null, num);
}

/* ── 롱테일 주제 묶음 — 책 색인처럼 가운뎃점으로 이어 붙인다 ──────── */
export function topicLinks(groups, seedKey, num, heading, sub) {
  const h = hash(seedKey, 'tp');
  const body = groups.filter((g) => g.items && g.items.length).map((g, gi) => {
    const picked = (g.pick ? shuffle(g.items, hash(seedKey, 'tp', gi)) : g.items).slice(0, g.pick || g.items.length);
    const li = picked.map((p) => {
      const base = p.labels ? p.labels[parseInt(hash(seedKey, p.href).substr(0, 3), 16) % p.labels.length] : p.label;
      const tpl = g.anchor ? g.anchor[parseInt(hash(seedKey, g.label, base).substr(0, 3), 16) % g.anchor.length] : null;
      return `<li><a href="${p.href}">${esc(tpl ? tpl(base) : base)}</a></li>`;
    }).join('');
    return `<div>
      <h3>${esc(g.label)}</h3>
      <ul class="ot-run">${li}</ul>
    </div>`;
  }).join('\n');
  return frame('topic', 'ways in', heading, `<div class="ot-ways">${body}</div>`,
    sub || esc(at(h, SEC.ltSub, 6)), num);
}

/** 코스 묶음 — 시도별 코스 안내문으로 가는 롱테일. */
export function courseTopic(sd, courses) {
  return courses.map((c) => ({ label: `${sd.name} ${c.ko}`, href: `/${sd.slug}/course/${c.slug}/` }));
}

/* ── 도장 칸 한 장 ─────────────────────────────────────────── */
export function stamp(href, name, x, current) {
  return `<li><a href="${href}"${current ? ' aria-current="page"' : ''}>${plate(x.dir, x.drel, { mini: true })}<b>${esc(name)}</b><span>${x.pockets === 0 ? '홈 없음' : `홈 ${fm(x.depth)} · 땅 ${x.fill}%`}</span></a></li>`;
}

/* ── 같은 모양의 구역 ─────────────────────────────────────────
   같은 시군구 안에서 모양이 같은 구역부터, 그다음 겉선 안 땅 비율이 가까운 차례로. */
export function shapeKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const rank = (o) => (o.shape === s.shape ? 0 : 1);
  const sorted = pool.slice().sort((a, b) => rank(a) - rank(b) || Math.abs(a.fill - s.fill) - Math.abs(b.fill - s.fill) || a.name.localeCompare(b.name, 'ko'));
  const pick = sorted.slice(0, 8);
  return frame('kin', 'same shape', `${esc(s.name)} 겉선과 판이 비슷한 ${esc(g.name)} 안의 동`,
    `<ul class="ot-stamps">\n${pick.map((x) => stamp(`/${sd.slug}/${g.slug}/${x.slug}/`, x.name, x, false)).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'lk'), SEC.kinSub)), num);
}

/* ── 시군구 안의 구역 목록 — 모양별로 묶는다 ──────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const groups = new Map();
  for (const s of g.spots) {
    if (!groups.has(s.shape)) groups.set(s.shape, []);
    groups.get(s.shape).push(s);
  }
  const body = SHAPE_ORDER.filter((k) => groups.has(k)).map((k) => {
    const list = groups.get(k).slice().sort((a, b) => b.depth - a.depth || a.name.localeCompare(b.name, 'ko'));
    return `<section><h3>${esc(shapeName(k))} 땅<em>${list.length}</em></h3><ul class="ot-stamps">${list
      .map((s) => stamp(`/${sd.slug}/${g.slug}/${s.slug}/`, s.name, s, s.slug === currentSlug)).join('')}</ul></section>`;
  }).join('\n');
  return frame('spotidx', 'places', `${esc(g.name)}의 동 ${g.spotCount}곳`,
    `<div class="ot-grp">${body}</div>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 쪽을 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return frame('rural', 'rural', `${esc(g.name)}의 ${esc(label)}`,
    `<ul class="ot-run">${shuffle(g.rural.slice(), hash(seedKey, 'rur')).map((m) => `<li><span>${esc(m.name)}</span></li>`).join('')}</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ───────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  const names = shuffle(g.dongNames.slice(), hash(seedKey, 'dnl'));
  return frame('dongidx', 'dong', `${esc(g.name)}에 든 동 ${g.dongNames.length}곳`,
    `<ul class="ot-run">${names.map((d) => `<li><span>${esc(d)}</span></li>`).join('')}</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 = 장부 표 ──────────────────────────────────
   ★깊이 들어온 쪽에서는 시드로 고른 일부만 걸고 나머지는 시도 쪽으로 보낸다. */
export function guIndex(sd, seedKey, currentSlug, num, { pick = 0 } = {}) {
  let list = sd.gu;
  if (pick && sd.gu.length > pick) {
    const keep = new Set(shuffle(sd.gu.map((g) => g.slug), hash(seedKey, 'gi')).slice(0, pick));
    if (currentSlug) keep.add(currentSlug);
    list = sd.gu.filter((g) => keep.has(g.slug));
  }
  list = list.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const rows = list.map((g) => `<tr${g.slug === currentSlug ? ' aria-current="page"' : ''}><th scope="row"><a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a></th><td>${g.fill}%</td><td>${fm(g.depth)}</td><td>${esc(dirName(g.dir))}</td></tr>`).join('\n');
  const partial = list.length < sd.gu.length;
  return frame('guidx', 'districts', partial ? `${esc(sd.name)}에서 고른 시군구 ${list.length}곳` : `${esc(sd.name)}의 시군구 ${sd.gu.length}곳`,
    `<table class="ot-ledger"><thead><tr><th>시군구</th><th>겉선 안 땅</th><th>가장 깊은 홈</th><th>향한 쪽</th></tr></thead><tbody>\n${rows}\n</tbody></table>${partial ? `\n<p class="ot-x">${esc(sd.name)}에 든 시군구는 모두 ${sd.gu.length}곳입니다. <a href="/${sd.slug}/">${esc(sd.name)} 쪽</a>에 전부 펼쳐 두었습니다.</p>` : ''}`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 모양이 닮은 시군구 = 맞대어 보는 표 ─────────────────────── */
export function kinList(sd, g, seedKey, num) {
  if (!g.kinCount) return '';
  const rows = g.kin.map((t) => `<tr><th scope="row"><a href="/${t.sidoSlug}/${t.slug}/">${esc(t.gu)}</a></th><td>${t.fill}%</td><td>${fm(t.depth)}</td><td>${esc(shapeName(t.shape))}${t.same ? '' : ' · 시도 밖'}</td></tr>`).join('\n');
  return frame('kin2', 'alike', `${esc(g.name)}${josa(g.name, '과/와')} 모양이 닮은 시군구`,
    `<div class="vs-w"><table class="vs"><thead><tr><th>시군구</th><th>겉선 안 땅</th><th>가장 깊은 홈</th><th>모양</th></tr></thead><tbody>
<tr class="me"><th scope="row">${esc(g.name)}</th><td>${g.fill}%</td><td>${fm(g.depth)}</td><td>${esc(shapeName(g.shape))}</td></tr>
${rows}
</tbody></table></div>`,
    esc(at(hash(seedKey, 'kl'), SEC.nearSub)), num);
}

/* ── 아래쪽 안내 링크 ─────────────────────────────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return frame('also', 'more', '이어서 볼 곳',
    `<ul class="ot-run">
      <li><a href="/area/">방문 지역 전부</a></li>
      <li><a href="/guide/">이용 순서</a></li>
      <li><a href="/price/">비용</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">도해 노트</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '시도 밑에 시군구가 있고 수도권과 부산만 동이 한 겹 더 있습니다. 그 밖 지역의 동과 읍·면은 이름으로만 올렸습니다.');
}

/** 문서·글 쪽에 다는 주제 묶음 */
export function docTopics(ctx, seedKey, num, heading, sub) {
  const { regions, courses } = ctx;
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  return topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 12, anchor: COURSE_ANCHOR },
    { label: '시군구로', items: guList, pick: 14, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 14, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seedKey, num, heading, sub);
}
