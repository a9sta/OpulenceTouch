import { layout, frame, callBox } from '../lib/html.mjs';
import { esc, hash, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepCards, stepSet, statTiles, faqBlock, noticeBlock,
  hailStrip, siteLinks, topicLinks, docTopics, themeCards, spotPool,
} from '../lib/blocks.mjs';
import { plate } from '../assets.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, shapeName, fm } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
  measure: '겉선 안 땅 비율과 가장 깊은 홈',
  kindWord: '겉선·홈',
});
const dt = (ctx, key) => docTopics(ctx, key, '11', esc(at(hash(key, 'dt'), SEC.topicHead, 8)), esc(at(hash(key, 'dt'), SEC.topicSub, 3)));
const AREA = { '@type': 'Country', name: '대한민국' };

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="ot-door" aria-label="첫 안내">
  <p class="ot-door-sl">${esc(cfg.brand.slogan)}</p>
  <p class="ot-door-p">가게 문을 열어 두고 기다리는 곳이 아닙니다. 전화를 주시면 관리사가 도구를 챙겨 말씀하신 주소로 갑니다. 서울·인천·경기·부산은 동마다, 대전·대구·울산과 정한 시·군은 시군구까지 도해를 두었습니다.</p>
  ${callBox(cfg, { size: 'l' })}
  <ul class="ot-door-f">
    <li><b>${esc(cfg.hours)}</b>접수를 쉬는 시각이 없습니다</li>
    <li><b>${esc(cfg.pay)}</b>마친 뒤 한 번만 셈합니다</li>
    <li><b>${esc(cfg.arrive)}</b>문 앞까지 보통 이만큼입니다</li>
    <li><b>동 ${counts.spot}구역</b>시군구 ${counts.gu}곳 안에 있습니다</li>
  </ul>
</section>`;

  const big = main.map((r) => `<li><a href="/${r.slug}/">${plate(r.dir, r.drel)}<b>${esc(r.name)}</b><span>동 ${r.spotCount}구역<br>겉선 안 땅 ${r.fill}% · 홈 ${fm(r.depth)}</span></a></li>`).join('\n');
  const toc = sub.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><i></i><span>시군구 ${r.gu.length}곳 · 평균 땅 ${r.avgFill}%</span></a></li>`).join('\n');
  const areaBlock = frame('area', 'where', '어느 지역에서 부르시나요',
    `<ul class="ot-big">${big}</ul>
     <ul class="ot-toc">${toc}</ul>
     <p class="ot-key">네모 그림에서 점선은 지역 땅의 바깥 꼭짓점을 팽팽하게 이은 겉선이고, 색칠한 면은 실제 땅입니다. 한쪽이 잘려 들어간 자리가 가장 깊은 홈입니다. 위 네 곳은 동까지, 아래 목록은 시군구까지 도해가 있습니다. 어느 쪽이든 번호와 값은 같으며 <a href="/area/">방문 지역 전체</a>에 모아 두었습니다.</p>`,
    '도해의 깊이가 다를 뿐 찾아가는 범위를 줄인 것은 아닙니다.', '01');

  const whyBlock = frame('why', 'method', '왜 땅의 겉선을 그려 두었나요',
    `<div class="ot-lead">
      <p>지역 도해에는 그 땅을 팽팽한 고무줄로 감쌌을 때 <strong>고무줄 안쪽 가운데 땅이 몇 퍼센트인지</strong>와, 땅이 아닌 칸이 가장 깊이 파고든 길이가 적혀 있습니다. 도해를 낸 ${counts.spot}구역에서 가장 깊은 홈은 ${esc(counts.deepName)}의 ${fm(counts.depthMax)}이고, 한가운데 값은 ${fm(counts.depthMid)}입니다. 겉선 안 땅 비율의 한가운데는 ${counts.fillMid}%입니다.</p>
      <p>이 수를 따로 적어 둔 이유는 한 가지예요. 큰 홈이 파인 동네는 같은 건물 번지여도 큰길에서 돌아 들어가야 하는 경우가 많습니다. 그래서 <strong>번지와 층, 큰길에서 몇 걸음 들어가는지까지 여쭙습니다.</strong> 반대로 겉선에 땅이 꽉 찬 동네는 큰길 이름 하나만 알아도 닿습니다. 가장 둥근 구역은 ${esc(counts.roundName)}이고, 홈이 하나도 없는 구역은 ${counts.plainRound}곳입니다.</p>
      <p>전국 행정동 ${counts.featAll}곳의 경계를 읽어 같은 순서로 쟀기 때문에 다시 돌리면 같은 숫자가 나옵니다. 어떻게 쟀는지는 <a href="/magazine/how-we-drew-the-outline/">측정 메모</a>에 적어 두었습니다.</p>
    </div>`, null, '02');

  const postBlock = frame('note', 'notes', '부르시기 전에 읽어 두실 글',
    `<ul class="ot-notes">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="ot-x"><a href="/magazine/">노트 전부 보기</a></p>`,
    '체험담이 아니라 통화 전에 알면 쓸모 있는 것만 골랐습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, '06');

  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 14, anchor: COURSE_ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 18, anchor: ANCHOR },
    { label: '시군구로', items: guList, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: spotPool(regions, { sidoLabel: true }), noun: '동', seedKey: seed, num: '08',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: 6, per: 3,
  });

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseRoll(courses, seed, '부르시는 곳', '03'),
    stepCards(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    theme.html,
    topics,
    hailStrip(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="ot-h1-s">서울·인천·경기·부산 동 ${counts.spot}구역 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: AREA, courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '찾아가는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.itemList(`${siteUrl}/#themes`, '결이 같은 동 모음', theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 부르는 다섯 걸음', steps, cfg),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const open = `<div class="ot-lead">
  <p>도해가 있는 구역을 한 화면에 모았습니다. 시군구 ${counts.gu}곳 안에 동 ${counts.spot}구역이 들어 있습니다. 읍 ${counts.eup}구역과 면 ${counts.myeon}구역은 쪽을 따로 두지 않았지만 찾아가는 것도 접수도 같습니다.</p>
  <p>수도권과 부산은 시군구를 누르면 동 쪽이 이어집니다. 나머지는 시군구 쪽 안에 동 이름을 적어 두었습니다. 깊이가 둘로 갈린 것은 문의가 몰리는 쪽만 한 겹 더 팠기 때문입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => frame(`sd-${r.slug}`, r.main ? 'to dong' : 'to district',
    `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}구역` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="ot-run">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/">${esc(g.name)}</a><small>${g.fill}%</small></li>`).join('\n')}</ul>`,
    r.main
      ? `${esc(r.name)}${josa(r.name, '은/는')} 시군구를 하나 눌러야 그 안의 동이 보입니다. 이름 옆 숫자는 시군구 겉선 안에서 땅이 차지하는 비율입니다.`
      : `${esc(r.name)}${josa(r.name, '은/는')} 시군구에서 끝납니다. 행정동 ${r.dongCount}구역의 이름은 시군구 쪽마다 적어 두었습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4, '90');

  const body = [open, hailStrip(cfg, '계신 곳', seed), blocks, faqHtml, stepCards(seed, '91')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `방문 지역 <span class="ot-h1-s">시군구 ${counts.gu}곳과 동 ${counts.spot}구역을 한 줄씩</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '방문 지역', url: `${siteUrl}/area/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: title.areaHub(counts), desc: clampDesc(desc.areaHub(counts)), listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '찾아가는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 찾아가는 지역`, desc: clampDesc(desc.areaHub(counts)), areaServed: AREA, courses }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '계신 곳에서 부르는 다섯 걸음', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const open = `<div class="ot-lead">
  <p>코스는 아홉 가지이고 고르실 것은 셋입니다. 압의 세기, 길이, 오일을 쓰느냐 마느냐. 나머지는 통화에서 맞춥니다.</p>
  <p>가장 짧은 코스는 ${esc(shortest.ko)} ${shortest.min}분, 가장 긴 코스는 ${esc(longest.ko)} ${longest.min}분입니다. 오래 받는 것과 깊게 받는 것은 다르며, 값이 높다고 몸에 더 맞는 것도 아닙니다.</p>
</div>`;

  const table = frame('all', 'table', '아홉 가지를 한 표에',
    `<div class="vs-w"><table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">값</th><th scope="col">압</th><th scope="col">손의 결</th><th scope="col">오일</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씁니다' : '안 씁니다'}</td></tr>`).join('\n')}</tbody></table></div>`,
    '값이 낮은 순서로 세웠습니다. 어느 구역에서 부르셔도 같은 표입니다.', '01');

  const pickBy = frame('bycase', 'choose', '어떤 날 무엇을 고르면 되나요',
    `<ul class="ot-cards">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '정한 뒤에 바꾸셔도 됩니다. 값은 마지막에 받은 코스로 셈합니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const lt = topicLinks([{ label: '지역에서 코스 찾기', items: pool, pick: 24, anchor: COURSE_ANCHOR }], seed, '04', '시도마다 코스 한 장씩', '시도를 먼저 고르고 코스를 고르는 길입니다.');

  const body = [open, table, pickBy, hailStrip(cfg, '코스 상담', seed), faqHtml, lt].join('\n');
  const t = title.page(`코스 ${courses.length}가지 출장마사지 홈타이`);
  const d = clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 압·길이·오일 여부로 한 표에 모았습니다. ${won(sorted[0].price)}원부터이며 지역에 따라 달라지지 않습니다.`);

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: t,
      desc: d,
      h1: `코스 ${courses.length}가지 <span class="ot-h1-s">압 · 길이 · 오일 여부를 한 표에</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: t, desc: d, listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/course/`, cfg, name: `${cfg.brand.ko} 코스 ${courses.length}가지`, desc: d, areaServed: AREA, courses }),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 비용 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const open = `<div class="ot-lead">
  <p>표 한 장이 전부입니다. 여기에 적히지 않은 돈은 어떤 이름으로도 받지 않습니다.</p>
  <p>횡단보도 하나 건너는 집이든 한 시간을 달려야 하는 마을이든 코스가 같으면 값도 같습니다. 멀리 가는 수고는 저희가 떠안습니다.</p>
</div>`;

  const table = frame('tbl', 'prices', '코스별 기본 길이와 값',
    `<div class="vs-w"><table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">값</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table></div>`,
    '1분당 숫자는 코스끼리 견주시라고 넣었습니다. 시간을 쪼개 받는 일은 없습니다.', '01');

  const noExtra = frame('nox', 'never', '값에 붙지 않는 것',
    `<ul class="ot-run">
      <li>차비 — 거리가 얼마든 셈에 넣지 않습니다</li>
      <li>심야 할증 — 동트기 전에 부르셔도 같은 표입니다</li>
      <li>명절·휴일 할증 — 달력을 보고 올리지 않습니다</li>
      <li>선금 — 예약금도 보증금도 항목이 없습니다</li>
      <li>취소 수수료 — 미루거나 없던 일로 하셔도 받지 않습니다</li>
      <li>주차비 — 저희가 냅니다</li>
    </ul>`,
    '입금부터 하라는 연락이 오면 저희 쪽이 아닙니다.', '02');

  const pay = frame('how', 'payment', '값은 어떻게 치르나요',
    statTiles([
      ['치르는 때', '마친 그 자리에서'],
      ['방법', '현금이든 카드든 같습니다'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받을 때', '미리 정해 두시면 늘어난 시간만큼만 더합니다'],
      ['두 분이 함께 받으면', '한 분마다 한 건으로 셈하고 묶어서 깎아 주지 않습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4, '04');
  const d = clampDesc(`코스별 기본 길이와 값입니다. ${won(sorted[0].price)}원부터이며 차비·심야 할증·예약금이 없습니다. 마친 뒤 현금이나 카드로 치릅니다.`);

  const body = [open, table, noExtra, pay, hailStrip(cfg, '값 확인', seed), faqHtml, dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`비용 ${won(sorted[0].price)}원부터`),
      desc: d,
      h1: `비용 <span class="ot-h1-s">${won(sorted[0].price)}원에서 시작하고 표 밖의 돈은 붙지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '비용', url: `${siteUrl}/price/` }],
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스별 비용`, desc: d, areaServed: AREA, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 이용 순서 ────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const open = `<div class="ot-lead">
  <p>처음 부르시는 분을 떠올리며 적었습니다. 전화 한 통이면 끝나는 일이라 오래 읽으실 것은 없습니다.</p>
</div>`;

  const what = frame('need', 'ready', '무엇을 두고 기다리시면 되나요',
    `<ul class="ot-run">
      <li>누우실 자리 — 바닥이든 침대든 괜찮습니다</li>
      <li>수건 두 장 — 집에 있는 것으로 충분하고 오일 없는 코스는 한 장이면 넉넉합니다</li>
      <li>방 하나 — 문만 닫히면 가족이 계셔도 됩니다</li>
    </ul>
    <p class="ot-x">접이식 매트와 오일, 향은 관리사가 챙깁니다. 따로 장을 보실 것은 없습니다.</p>`,
    null, '01');

  const timing = frame('when', 'hours', '언제 부를 수 있나요',
    statTiles([
      ['접수', `${esc(cfg.hours)}<br><small>전화 거시는 시각은 따지지 않습니다</small>`],
      ['문 앞까지', `보통 ${esc(cfg.arrive)}<br><small>안쪽 골목이면 더 걸립니다</small>`],
      ['시간 옮기기', '언제든 됩니다. 값은 붙지 않습니다'],
      ['취소', '이미 문 앞이시라면 그 사실만 알려 주십시오'],
      ['몰리는 때', '금요일과 토요일 밤'],
      ['한가한 때', '주중 낮, 기다림이 거의 없습니다'],
    ]), null, '02');

  const refuse = frame('no', 'declined', '받지 못하는 경우도 있나요',
    `<div class="ot-memo"><ul>
      <li>성적인 말이 끼어들 때 — 그 자리에서 통화를 끝냅니다.</li>
      <li>열이 오르거나 상처가 부어 있을 때 — 날짜를 다시 잡습니다.</li>
      <li>주소 끝자리를 알려 주지 않으실 때 — 누구를 어느 길로 보낼지 정할 수 없습니다.</li>
      <li>관리사에게 따로 연락할 번호를 달라고 하실 때.</li>
      <li>병원부터 가셔야 할 상태로 보일 때.</li>
      <li>만 19세가 안 되셨을 때.</li>
    </ul></div>`,
    '받지 못한 건에는 어떤 값도 매기지 않습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, '05');
  const d = clampDesc('처음 부르실 때 필요한 것만 모았습니다. 준비물, 접수 시각, 받지 못하는 경우, 값 치르는 법을 차례로 적었습니다.');

  const body = [open, what, timing, stepCards(seed, '04'), refuse, hailStrip(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('이용 순서 — 부르는 법과 치르는 법'),
      desc: d,
      h1: `이용 순서 <span class="ot-h1-s">통화 한 번이 곧 접수입니다</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용 순서', url: `${siteUrl}/guide/` }],
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 부를 때 거치는 다섯 걸음', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 이용 안내`, desc: d, areaServed: AREA, courses }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';
  const sc = counts.shapeCount;
  const shapeLine = data.shapes.map((k, i) => `${shapeName(k)} ${sc[i]}곳`).join(' · ');

  const open = `<div class="ot-lead">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 없이 방문만 하는 곳입니다. 업소를 늘어놓고 이어 주는 중개가 아니라 저희가 접수를 받고 저희가 찾아갑니다.</p>
  <p>이름은 넉넉하게 오래 머무는 손길을 떠올려 붙였습니다. 땅에도 넉넉한 곳과 움푹 파인 곳이 있다고 보고 지역마다 그 생김새를 숫자로 적어 두었습니다.</p>
</div>`;

  const line = frame('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="ot-run">
      <li>합니다 — 손으로 굳은 데를 풀어 드리는 일</li>
      <li>하지 않습니다 — 성적인 서비스. 어떤 형태로도 두지 않습니다</li>
      <li>하지 않습니다 — 진단과 치료. 의료기관의 몫입니다</li>
      <li>받지 않습니다 — 만 19세가 안 된 분</li>
      <li>싣지 않습니다 — 후기와 별점. 지어 쓴 글을 가려낼 길이 없습니다</li>
      <li>올리지 않습니다 — 인물 사진. 본 사진과 다른 사람이 가는 일이 생깁니다</li>
      <li>받지 않습니다 — 선금. 앞서 받는 돈이 없습니다</li>
    </ul>`, null, '01');

  const how = frame('data', 'sources', '겉선과 홈은 어떻게 쟀나요',
    `<div class="ot-lead">
      <p>공개된 행정동 경계를 전국 ${counts.featAll}곳 모두 읽어, 시도마다 하나의 평평한 좌표에 올렸습니다. 땅의 바깥 꼭짓점을 팽팽하게 이어 <strong>볼록한 겉선</strong>을 만들고, 겉선 안에서 땅이 아닌 칸을 이웃끼리 묶어 덩어리로 삼았습니다.</p>
      <p>덩어리마다 겉선 바깥과 맞닿은 칸까지의 거리를 두 번 훑어 가장 깊은 칸을 찾았고, 그 거리를 홈의 깊이로 적었습니다. 겉선 변에 닿지 않는 갇힌 빈칸은 따로 세었고 너무 얕은 덩어리는 홈으로 치지 않았습니다. 겉선 안 땅 비율의 한가운데는 ${counts.fillMid}%, 홈 깊이의 한가운데는 ${fm(counts.depthMid)}입니다.</p>
      <p>땅 모양은 여섯 가지로 갈랐습니다. ${esc(shapeLine)}. 가장 깊은 홈이 파인 동은 ${esc(counts.deepName)}이고, 홈이 하나도 없는 구역은 ${counts.plainRound}곳입니다.</p>
      <p>이 값은 행정 경계의 생김새일 뿐 집이 실제로 어디에 있는지는 보지 않습니다. 홈이 깊다고 길이 막혀 있다는 뜻도 아닙니다. 그 점을 알고 읽어 주십시오.</p>
    </div>
    ${statTiles([
      ['밑자료', esc(data.source)],
      ['경계를 받은 판', esc(data.version)],
      ['구하는 값', esc(data.axis)],
      ['셈하는 절차', esc(data.method)],
      ['도해를 내는 기준', esc(data.coverageFrom)],
      ['도해를 낸 단위', `시도 ${counts.sido}곳, 시군구 ${counts.gu}곳, 동 ${counts.spot}곳`],
      ['도해가 없는 단위', `읍 ${counts.eup}구역 · 면 ${counts.myeon}구역<br><small>목록에 이름으로만</small>`],
      ['가장 깊은 홈', `${esc(counts.deepName)} ${fm(counts.depthMax)}`],
      ['가장 둥근 구역', esc(counts.roundName)],
    ])}`, null, '02');

  const d = clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 지역 도해의 겉선과 홈 숫자를 어떤 자료로 쟀는지 적었습니다.`);
  const body = [open, line, how, hailStrip(cfg, '문의', seed), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인지`),
      desc: d,
      h1: `${esc(cfg.brand.ko)} 소개 <span class="ot-h1-s">지키는 선과 재는 방법</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
      jsonld: [S.aboutPage({ url: `${siteUrl}/company/`, siteUrl, title: title.page(`${cfg.brand.ko}는 어떤 곳인지`), desc: d })],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (약관의 목적)', '이 약관은 오퓰런스터치(이하 "저희")가 이용자가 지정한 장소로 관리사를 보내 제공하는 방문 관리의 이용 조건과 절차, 저희와 이용자 각자의 책임을 정하는 것을 목적으로 합니다.'],
  ['제2조 (접수 방법)', '접수는 화면에 적힌 번호로 거는 전화로만 받습니다. 이 번호는 중계 번호여서 이용자의 번호가 관리사에게 그대로 전달되지 않습니다. 채팅, 게시판, 전자우편으로는 접수하지 않습니다.'],
  ['제3조 (제공하는 일)', '저희는 이용자가 정한 장소에서 손으로 굳은 근육을 풀어 드립니다. 질병을 진단하거나 치료하는 일은 하지 않으며 성적인 서비스도 제공하지 않습니다.'],
  ['제4조 (이용 연령)', '만 19세 이상만 이용할 수 있습니다. 보호자가 함께 있더라도 연령이 미치지 못하면 접수가 이루어지지 않습니다.'],
  ['제5조 (겉선·홈 수치의 성격)', '화면에 적힌 겉선 안 땅 비율, 홈의 깊이, 홈이 열린 방향, 땅 모양은 공개된 행정동 경계에서 계산한 값입니다. 도로 사정이나 실제 이동 시간을 보증하지 않으며 해당 지역 땅의 생김새를 가늠하는 참고 자료입니다.'],
  ['제6조 (값과 셈)', '값은 비용표에 적힌 대로이고 지역에 따라 달라지지 않습니다. 셈은 관리를 마친 자리에서 현금이나 카드로 합니다. 미리 내는 돈은 예약금이든 보증금이든 이름을 불문하고 받지 않습니다.'],
  ['제7조 (일정 변경과 취소)', '관리사가 출발하기 전에는 언제든 시간을 바꾸거나 취소할 수 있으며 위약금은 없습니다. 관리사가 이미 문 앞에 도착했다면 그 사실을 바로 알려 주셔야 합니다.'],
  ['제8조 (접수 거절과 중단)', '다음 중 하나에 해당하면 접수를 거절하거나 진행 중인 관리를 멈출 수 있습니다. 1. 성적인 서비스를 요구하는 경우. 2. 관리사에게 폭언이나 폭력을 쓰거나 사적인 연락처를 요구하는 경우. 3. 방문할 곳의 상세 주소를 끝까지 알려 주지 않는 경우. 4. 발열이나 아물지 않은 상처가 있어 관리가 맞지 않는 경우.'],
  ['제9조 (이용자의 준비)', '이용자는 관리를 받을 공간과 수건을 준비하고, 관리에 영향을 줄 수 있는 건강 상태를 접수 통화에서 알려야 합니다. 멍이 쉽게 드는 체질이라면 경락을 고르기 전에 먼저 말씀해 주십시오.'],
  ['제10조 (후기와 평점)', '저희는 후기와 평점을 수집하지 않으며 화면에 올리지도 않습니다. 화면의 어떤 문장도 특정 이용자의 경험을 옮겨 적은 것이 아닙니다.'],
  ['제11조 (중도 중단 시 값)', '이용자의 요청이나 건강 상태로 관리가 멈추면 지나간 시간만큼만 셈합니다. 시작하고 십 분이 안 되어 멈추면 값을 받지 않습니다. 제8조 제1호로 멈춘 경우에는 그때까지의 시간을 셈합니다.'],
  ['제12조 (책임의 한계)', '관리 중 저희의 과실로 손해가 생기면 저희가 배상합니다. 알리지 않은 건강 상태에서 비롯된 손해와, 천재지변이나 통신 장애로 늦어진 일에는 책임을 지지 않습니다.'],
  ['제13조 (약관의 변경)', '약관을 고치면 화면에 먼저 게시하고 게시한 날부터 적용합니다. 고친 뒤에 접수하셨다면 바뀐 내용에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="ot-lead"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 거신 때부터 아래 내용을 따르시는 것으로 봅니다.</p></div>`,
    frame('terms', 'terms', '전문', `<div class="ot-doc">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '약관 문의', 'terms'),
    dt(ctx, 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수 방법, 제공하는 일, 값과 셈, 변경과 취소를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="ot-h1-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 기록하는 항목', '접수 통화에서 기록하는 것은 네 가지입니다. 찾아갈 주소, 연락 가능한 번호, 고른 코스, 원하는 시각. 성함과 생년월일은 묻지 않고 주민등록번호는 어떤 경우에도 받지 않습니다.'],
  ['2. 이용 목적', '기록한 내용은 관리사를 배정하고 출발과 도착을 알리는 데에만 씁니다. 그 뒤로 광고 문자를 보내거나 저희가 먼저 연락하는 일은 없습니다.'],
  ['3. 번호의 처리', '화면의 번호는 중계 번호입니다. 따라서 이용자의 번호가 관리사 화면에 그대로 표시되지 않습니다.'],
  ['4. 보관 기간', '방문이 문제없이 끝나면 그날 안에 파기합니다. 분쟁이 생긴 건에 한해 정리가 끝날 때까지 남겨 둡니다.'],
  ['5. 제3자 제공', '외부 업체에 제공하거나 위탁하지 않습니다. 법령에 따른 수사기관의 적법한 요청이 있을 때만 예외입니다.'],
  ['6. 자동 수집', '이 사이트는 미리 만들어 둔 파일을 내보내기만 합니다. 로그인도 장바구니도 댓글도 없고, 광고 추적이나 방문 분석 스크립트를 넣지 않았으며 쿠키도 쓰지 않습니다.'],
  ['7. 이용자의 권리', '저희가 가진 내용의 열람과 삭제를 요청할 수 있습니다. 화면의 번호로 연락하시면 그 통화에서 바로 처리합니다.'],
  ['8. 담당자 표기', '운영자 표기가 확정되면 이 항목과 화면 맨 아래에 함께 게시합니다. 그때까지는 화면의 번호가 창구입니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="ot-lead"><p>길지 않습니다. 기록하는 항목이 네 가지뿐이기 때문입니다.</p></div>`,
    frame('pp', 'privacy', '전문', `<div class="ot-doc">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '개인정보 문의', 'privacy'),
    dt(ctx, 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 기록하는 항목과 쓰임, 보관 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="ot-h1-s">기록하는 것은 네 가지입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 노트 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="ot-lead"><p>전화하기 전에 미리 읽어 두면 통화에서 되묻는 일이 줄어드는 내용만 모았습니다. 소감이나 평점은 싣지 않습니다.</p></div>`,
    frame('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="ot-notes">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS로도 나갑니다.', '01'),
    hailStrip(cfg, '접수', 'magazine'),
    dt(ctx, 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  const d = clampDesc(`부르시기 전에 정해 두면 편한 것들을 ${list.length}편으로 적었습니다. 후기와 체험담은 두지 않습니다.`);
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('도해 노트'),
      desc: d,
      h1: `도해 노트 <span class="ot-h1-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '노트', url: `${siteUrl}/magazine/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: title.page('도해 노트'), desc: d, listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '도해 노트', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="ot-dated"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 도해 노트</p>`,
    `<article class="ot-piece">${html}</article>`,
    hailStrip(cfg, '접수', p.slug),
    frame('more', 'next', '함께 읽을 글',
      `<ul class="ot-notes">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    dt(ctx, p.slug),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '노트', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, regions } = ctx;
  const body = [
    `<div class="ot-lead"><p>이 주소에는 도해가 걸려 있지 않습니다. 옮겨졌거나 처음 만든 적이 없는 쪽입니다. 아래에서 다시 골라 주십시오.</p></div>`,
    frame('back', 'back', '여기서 다시',
      `<ul class="ot-run">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">방문 지역</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">비용</a></li>
        <li><a href="/guide/">이용 순서</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    hailStrip(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 도해가 없습니다. 아래에서 다시 골라 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
