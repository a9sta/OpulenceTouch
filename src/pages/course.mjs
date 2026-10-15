import { layout, frame } from '../lib/html.mjs';
import { esc, hash, won, josa, km2, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { statTiles, faqBlock, stepCards, stepSet, noticeBlock, hailStrip, courseRoll, topicLinks, guIndex } from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, shapeName, fm } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동 × 코스는 만들지 않는다. 1,232 × 9 이면 만 쪽을 넘는데 구역이 바뀌어도
   코스 설명이 같아 전부 얇은 조합 안내문이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '오일이 들어갑니다. 마치고 씻을 수 있는 시각인지만 한 번 보고 골라 주십시오.',
  false: '오일이 빠집니다. 옷을 그대로 두고 받으니 마치고 바로 움직이셔도 됩니다.',
};
const PRESSURE_NOTE = [
  '세기는 받는 동안 맞춰 갑니다. 십 분쯤 지나면 어느 쪽이 맞는지 서로 알게 됩니다.',
  '표의 등급은 출발점입니다. 아프면 참지 말고 그 자리에서 말씀해 주십시오.',
  '같은 힘이라도 느끼는 정도는 사람마다 다릅니다. 표에 적힌 글자보다 그날의 컨디션이 앞섭니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 찾으시는 분은 주로 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 쓰시라고 맞춘 코스입니다. 사정이 다르면 통화하면서 다른 코스로 바꿔 드립니다.`,
  (c) => `${c.for} 이쪽이 맞습니다. 정했다가 바꾸셔도 되고 셈은 끝에 받은 코스로 합니다.`,
];

const common = (ctx) => ({
  hours: ctx.cfg.hours, pay: ctx.cfg.pay, arrive: ctx.cfg.arrive, tel: ctx.cfg.tel, telLabel: ctx.cfg.telLabel,
  minPrice: won(Math.min(...ctx.courses.map((x) => x.price))),
  kindWord: '코스', measure: '코스 값과 길이는 어느 지역에서도 같습니다',
});

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');
  const fc = { ...common(ctx), place: '계신 곳' };

  const open = `<div class="ot-lead">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = frame('fact', 'course', `${esc(c.ko)} 제원`,
    statTiles([
      ['기본 길이', `${c.min}분`],
      ['비용', `${won(c.price)}원<small>지역을 보고 바꾸지 않습니다</small>`],
      ['압', esc(c.pressure)],
      ['손 쓰는 결', esc(c.tempo)],
      ['오래 머무는 자리', esc(c.focus)],
      ['오일', c.oil ? '씁니다' : '쓰지 않습니다'],
      ['준비물', c.oil ? '수건 두 장에 누울 자리' : '누울 공간 하나, 수건은 한 장이면 넉넉합니다'],
      ['받는 때', `${esc(cfg.hours)}<small>${esc(cfg.pay)}, 도착은 ${esc(cfg.arrive)}</small>`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = frame('cmp', 'compare', '나머지 여덟과 한 표에 놓으면',
    `<div class="vs-w"><table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">비용</th><th scope="col">압</th><th scope="col">오일</th></tr></thead>
     <tbody>
      <tr class="me"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table></div>`,
    '길게 받는 것과 깊게 받는 것은 서로 다른 이야기입니다. 두 칸을 따로 봐 주십시오.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '04');

  const bySido = regions.map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const others2 = others.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` }));
  const steps = stepSet(seed);
  const deepAll = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const x of g.spots) deepAll.push({ label: `${g.name} ${x.name}`, href: `/${r.slug}/${g.slug}/${x.slug}/` });
  const topics = topicLinks([
    { label: `${c.ko}${josa(c.ko, '을/를')} 지역에서`, items: bySido, anchor: COURSE_ANCHOR },
    { label: '다른 코스', items: others2, anchor: COURSE_ANCHOR },
    { label: '시군구로 바로', items: guList, pick: 18, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deepAll, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '07', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [open, facts, hailStrip(cfg, c.ko, seed), compare, stepCards(seed, '03'), faqHtml, noticeBlock(seed, '05'), topics].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="ot-h1-s">한 번에 ${c.min}분, ${won(c.price)}원입니다</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');
  const fc = { ...common(ctx), place: sd.name };

  const openLines = [
    `${c.ko}의 값은 ${sd.name} 어디서든 ${c.min}분에 ${won(c.price)}원 하나뿐입니다. 거리를 따져 값을 바꾸지 않습니다.`,
    `${sd.name} 어느 구역에서 불러도 ${c.ko}에 들어가는 내용은 같습니다. 다른 것은 우리가 문 앞에 닿기까지의 시간 하나입니다.`,
    `${c.ko} 접수는 ${sd.name}에서도 같은 번호 하나로 모읍니다. 기본 ${c.min}분, ${won(c.price)}원입니다.`,
  ];
  const secondMain = [
    `${sd.name}의 동 ${sd.spotCount}곳은 하나씩 열 수 있고, 열면 그 동의 겉선과 홈이 도해로 나옵니다.`,
    `${sd.name} 땅 전체의 겉선 안 땅은 ${sd.fill}%입니다. 동 ${sd.spotCount}구역마다 홈의 깊이와 향한 쪽을 따로 적었습니다.`,
    `${sd.name} 동 ${sd.spotCount}구역 가운데 홈이 가장 깊은 곳은 ${sd.deepName}, 겉선에 가장 붙은 곳은 ${sd.roundName}입니다.`,
  ];
  const secondSub = [
    `${sd.name}${josa(sd.name, '은/는')} 시군구 ${sd.gu.length}곳까지만 팠습니다. 동 이름은 시군구 쪽을 열면 줄줄이 나옵니다.`,
    `${sd.name}의 시군구 겉선 안 땅은 평균 ${sd.avgFill}%입니다. 도해는 시군구 ${sd.gu.length}곳에서 끝입니다.`,
    `${sd.name} 행정동 ${sd.dongCount}곳의 이름은 시군구 쪽을 열면 나옵니다. 통화에서는 동 이름을 한 번만 대 주시면 됩니다.`,
  ];
  const second = at(h, sd.main ? secondMain : secondSub, 6);

  const open = `<div class="ot-lead">
  <p>${esc(at(h, openLines, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = frame('fact', 'course', `${esc(sd.name)}에서 고르는 ${esc(c.ko)}`,
    statTiles([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['도해가 내려간 데까지', sd.main ? `시군구 ${sd.gu.length}곳, 그 아래 동 ${sd.spotCount}구역` : `시군구 ${sd.gu.length}곳까지`],
      ['기본 길이', `${c.min}분`],
      ['비용', `${won(c.price)}원<small>${esc(sd.name)} 어디나 같습니다</small>`],
      ['압과 결', `${esc(c.pressure)}<small>${esc(c.tempo)}</small>`],
      ['오래 머무는 자리', esc(c.focus)],
      ['오일', c.oil ? '씁니다' : '쓰지 않습니다'],
      sd.main ? ['이 지역 땅 모양', `${esc(shapeName(sd.shape))}<small>겉선 안 땅 ${sd.fill}%</small>`] : ['시군구 평균 겉선 안 땅', `${sd.avgFill}%`],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '05');

  const guHere = sd.gu.map((g) => ({ label: g.name, href: `/${sd.slug}/${g.slug}/` }));
  const deepHere = [];
  for (const g of sd.gu) for (const x of g.spots) deepHere.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const otherCourse = courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` }));
  const sameCourse = regions.filter((r) => r.slug !== sd.slug).map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name}에서 받는 다른 코스`, items: otherCourse, anchor: COURSE_ANCHOR },
    { label: `${c.ko}${josa(c.ko, '을/를')} 다른 지역에서`, items: sameCourse, anchor: COURSE_ANCHOR },
    { label: '코스 한 장씩', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 시군구`, items: guHere, pick: 16, anchor: ANCHOR },
    ...(deepHere.length ? [{ label: `${sd.name} 동으로 바로`, items: deepHere, pick: 14, anchor: ANCHOR }] : []),
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '06', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  /* ★서브 시도의 시도×코스는 지역 고유 내용이 적어 얇아진다. 그 시도에 든 행정동 이름을 시드로 일부만 깐다. */
  const subNames = [];
  if (!sd.main) for (const g of sd.gu) {
    for (const d of (g.dongNames || [])) subNames.push(`${g.name} ${d}`);
    for (const m of (g.rural || [])) subNames.push(`${g.name} ${m.name}`);
  }
  const nameShow = subNames.length
    ? shuffle(subNames, hash(seed, 'sn')).slice(0, Math.max(10, Math.round(subNames.length * 0.42)))
    : [];
  const namesBlock = nameShow.length
    ? frame('sidodong', 'dong', `${esc(sd.name)}에 든 행정동 가운데 ${nameShow.length}곳`,
      `<ul class="ot-run">${nameShow.map((n) => `<li><span>${esc(n)}</span></li>`).join('')}</ul>`
        + `<p class="ot-x">${esc(sd.name)}에 든 행정동은 모두 ${subNames.length}곳입니다. 시군구 단위로 나눠 보려면 <a href="/${sd.slug}/">${esc(sd.name)} 쪽</a>으로 가십시오.</p>`,
      '이 지역의 도해는 시군구에서 끝납니다. 아래 이름 가운데 하나를 전화로 말씀해 주십시오.', '03')
    : '';

  const body = [
    open, facts,
    hailStrip(cfg, `${sd.name} ${c.ko}`, seed),
    courseRoll(courses, seed, sd.name, '02', { full: false }),
    namesBlock,
    guIndex(sd, seed, null, '04', { pick: 14 }),
    faqHtml,
    stepCards(seed, '06'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="ot-h1-s">집까지 가는 ${c.min}분, 값 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 ${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
