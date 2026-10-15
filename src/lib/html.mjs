import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { MARK } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   머리 — 신문 제호 한 칸(윗줄 날짜 자리 + 가운데 상호 + 메뉴 줄)
 *   발   — 먹빛 바탕. 출처·최신성·수집 경로 + AI 활용 고지
 *
 * ★전화번호는 callBox() 로만 찍는다. 라벨은 '예약 문의' 하나다.
 * ★칸 머리는 로마 숫자와 겹선이다. 상자나 알약을 쓰지 않는다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#1A1714">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/ot.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="hop" href="#main">본문으로 가기</a>
${header(ctx, path)}
${crumbs.length > 1 ? wayHtml(crumbs) : ''}
<main id="main">
<h1 class="ot-h1">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${floatBar(cfg)}
<script src="/assets/ot.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/** 예약 문의 전표. size: s(머리) · m(본문) · l(아래 붙는 것) — 오른쪽 위 귀가 깎여 있다. */
export function callBox(cfg, { size = 'm' } = {}) {
  return `<a class="callbox callbox-${size}" href="tel:${cfg.telRaw}"><span class="callbox-t"><span class="callbox-k">${esc(cfg.telLabel)}</span><span class="callbox-v">${esc(cfg.tel)}</span></span></a>`;
}

function header(ctx, path) {
  const { cfg, updated } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '방문 지역'], ['/course/', '코스'], ['/price/', '비용'], ['/guide/', '이용 순서'], ['/magazine/', '도해 노트']];
  return `<header class="ot-mast"><div class="ot-mast-in">
  <div class="ot-mast-top"><span>출장마사지 · 홈타이</span><span>${esc(updated)} 판</span>${callBox(cfg, { size: 's' })}</div>
  <a class="ot-brand" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">${MARK()}<b>${esc(cfg.brand.ko)}</b><small>${esc(cfg.brand.en)}</small></a>
  <nav aria-label="주요 메뉴"><ul class="ot-nav">${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
</div></header>`;
}

function wayHtml(crumbs) {
  return `<nav class="ot-trail" aria-label="여기까지 온 길"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 — 먹빛 바탕. 윗줄 상호·번호, 가운데 세 칸, 맨 아래 고지 */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business || {};
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 담당자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="ot-foot">
  <div class="ot-foot-top">
    <div>
      <p class="ot-foot-nm">${esc(cfg.brand.ko)}</p>
      <p class="ot-foot-say">연락이 닿으면 관리사가 적어 주신 주소로 갑니다. 시군구 ${counts.gu}곳, 동 ${counts.spot}구역 어디에서도 접수는 번호 하나로 받습니다.</p>
    </div>
    ${callBox(cfg, { size: 'm' })}
    <p class="ot-foot-run">${esc(cfg.hours)} / ${esc(cfg.pay)} / 선입금 없음</p>
  </div>
  <div class="ot-foot-grid">
    <nav aria-label="지역 바로가기">
      <h2>동까지 적은 곳</h2>
      <ul class="ot-run">${main.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <h2>시군구까지 적은 곳</h2>
      <ul class="ot-run">${sub.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="ot-foot-sm"><a href="/area/">방문 지역 전체</a> · 읍·면 ${counts.rural}곳은 이름만 올려 두었습니다</p>
    </nav>
    <div>
      <h2>문서</h2>
      <ul class="ot-foot-ul">
        <li><a href="/guide/">이용 순서</a></li>
        <li><a href="/price/">비용</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
    </div>
    <div>
      <h2>최근 도해 노트</h2>
      <ul class="ot-foot-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <h2>가져가는 길</h2>
      <ul class="ot-run"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="ot-foot-sm">마지막 수정 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="ot-foot-end"><div>
    ${biz ? `<p class="s-biz">${biz}</p>` : ''}
    <p class="s-ai">지역 안내문의 홈 깊이와 방향은 공개된 행정동 경계에서 기계로 잰 값이고, 문장은 <strong>AI 도구로 초안을 쓴 뒤</strong> 사람이 고쳐 올렸습니다. 후기·체험담·별점은 받지도 싣지도 않으며 인물 사진도 쓰지 않습니다. 밑자료: ${esc(data.source)}</p>
    <p class="s-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 치료를 하는 곳이 아니며 성적인 서비스는 하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 전표 띠 */
function floatBar(cfg) {
  return `<div class="ot-float">
  <span class="ot-float-s">문 앞까지<br>${esc(cfg.arrive)}</span>
  ${callBox(cfg, { size: 'l' })}
</div>`;
}

/**
 * 칸 틀 — 왼쪽에 로마 숫자, 오른쪽에 제목, 위는 겹선.
 * n 은 '01' 같은 두 자리 글자로 오며 로마 숫자로 바꿔 쓴다.
 */
const ROMAN = ['', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ'];
export function frame(id, label, h2, inner, sub, n) {
  const k = parseInt(n, 10);
  return `<section class="ot-part" id="${id}" aria-labelledby="${id}-h">
  <header class="ot-part-h">
    <span class="ot-no" aria-hidden="true">${ROMAN[k] || '·'}</span>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="ot-part-s">${sub}</p>` : ''}
  </header>
  <div class="ot-part-b">${inner}</div>
</section>`;
}
