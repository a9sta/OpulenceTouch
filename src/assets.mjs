import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **한쪽이 파인 네모판**이다. 이 사이트가 재는 값(볼록 껍질 안에서 땅이 파인 정도)이
 *   그대로 화면 장치가 된다. 점선 네모가 껍질, 실선 판이 땅이고 홈은 잰 방향에 잰 깊이로 뚫린다.
 *   모서리는 전부 각지고, 칸 머리는 로마 숫자와 겹선, 접수는 영수증 전표, 물음은 말풍선이다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#FBF8F1', card: '#FFFDF8', soft: '#F1E9D6', ink: '#1A1714', dim: '#5C554B',
  acc: '#B7791F', accDk: '#8A5A12', accLt: '#E3B25A', line: '#CFC4AA',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accLt:${t.accLt};--line:${t.line};
  --w:1020px;
  --serif:"Noto Serif KR","Nanum Myeongjo","AppleMyungjo","Batang",Georgia,"Times New Roman",serif;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;color-scheme:light}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);line-height:1.8;font-size:16px;padding-bottom:74px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}
a:hover{color:var(--ink)}
:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
strong{font-weight:700;background:linear-gradient(transparent 62%,rgba(227,178,90,.45) 0)}
.hop{position:absolute;left:-9999px}
.hop:focus{position:fixed;left:10px;top:10px;z-index:70;background:var(--ink);color:var(--paper);padding:9px 14px}

/* ── 머리 = 신문 제호 ─────────────────────────────── */
.ot-mast{border-top:6px solid var(--ink);border-bottom:1px solid var(--ink);background:var(--card)}
.ot-mast-in{max-width:var(--w);margin:0 auto;padding:0 18px}
.ot-mast-top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:11px;color:var(--dim);letter-spacing:.04em}
.ot-brand{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 0 10px;color:var(--ink);text-decoration:none}
.ot-brand b{font-family:var(--serif);font-size:30px;font-weight:700;letter-spacing:.02em}
.ot-brand small{font-family:var(--mono);font-size:10px;letter-spacing:.32em;color:var(--accDk);text-transform:uppercase;align-self:flex-end;padding-bottom:5px}
.ot-mk{width:34px;height:34px;flex:none}
.ot-nav{list-style:none;margin:0;padding:0 0 10px;display:flex;justify-content:center;flex-wrap:wrap;gap:2px 22px}
.ot-nav a{color:var(--ink);text-decoration:none;font-size:14px;padding:3px 0;border-bottom:2px solid transparent}
.ot-nav a:hover,.ot-nav a[aria-current]{border-bottom-color:var(--acc)}
.ot-trail{max-width:var(--w);margin:0 auto;padding:12px 18px 0;font-size:12.5px;color:var(--dim)}
.ot-trail ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap}
.ot-trail li+li::before{content:"/";margin:0 9px;color:var(--line)}
.ot-trail a{color:var(--dim)}

/* ── 예약 문의 = 한쪽 귀가 깎인 전표 ───────────────── */
.callbox{display:inline-flex;align-items:center;gap:12px;background:var(--ink);color:var(--paper);text-decoration:none;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%);padding:9px 22px 9px 14px;border-left:5px solid var(--accLt)}
.callbox:hover{color:var(--paper);background:#000}
.callbox-t{display:flex;flex-direction:column;line-height:1.2}
.callbox-k{font-family:var(--mono);font-size:10.5px;letter-spacing:.2em;color:var(--accLt)}
.callbox-v{font-family:var(--serif);font-size:20px;font-weight:700;letter-spacing:.02em}
.callbox-s{padding:5px 18px 5px 11px}
.callbox-s .callbox-v{font-size:15px}
.callbox-s .callbox-k{font-size:9px}
.callbox-l{padding:11px 26px 11px 16px}
.callbox-l .callbox-v{font-size:23px}

/* ── 글 머리 ──────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:6px 18px 8px}
.ot-h1{margin:24px 0 20px;font-family:var(--serif);font-size:clamp(26px,5vw,40px);line-height:1.28;font-weight:700;letter-spacing:-.01em}
.ot-h1-s{display:block;margin-top:12px;font-family:var(--sans);font-size:15px;font-weight:400;color:var(--accDk);letter-spacing:0;line-height:1.6;padding-top:10px;border-top:1px solid var(--ink)}
.ot-lead{max-width:46rem;font-size:16.5px}
.ot-lead p{margin:0 0 1em}
.ot-lead p:first-child::first-letter{font-family:var(--serif);font-size:2.3em;float:left;line-height:.9;padding:4px 8px 0 0;color:var(--accDk)}
.ot-top{display:grid;gap:18px;align-items:start}
@media (min-width:760px){.ot-top{grid-template-columns:1fr 240px}}
.ot-fig{margin:0;border:1px solid var(--ink);background:var(--card);padding:12px 12px 10px}
.ot-fig svg{display:block;width:100%;height:auto}
.ot-fig figcaption{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);font-size:12px;line-height:1.6;color:var(--dim)}

/* ── 칸 = 겹선과 로마 숫자 ────────────────────────── */
.ot-part{margin:38px 0 0;border-top:5px double var(--ink);padding-top:16px}
.ot-part-h{display:grid;grid-template-columns:54px 1fr;gap:4px 12px;align-items:start;margin-bottom:16px}
.ot-no{font-family:var(--serif);font-size:30px;line-height:1;color:var(--acc);font-weight:700;text-align:right;padding-top:3px;letter-spacing:-.04em}
.ot-part-h h2{margin:0;font-family:var(--serif);font-size:22px;line-height:1.38;font-weight:700}
.ot-part-s{grid-column:2;margin:0;font-size:13.5px;color:var(--dim)}
.ot-part-b{padding-left:0}
@media (min-width:720px){.ot-part-b{padding-left:66px}}
.ot-x{margin:14px 0 0;font-size:14px;color:var(--dim)}

/* ── 제원표 ──────────────────────────────────────── */
.ot-spec{width:100%;border-collapse:collapse;font-size:14.5px;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
.ot-spec th,.ot-spec td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.ot-spec tr:last-child th,.ot-spec tr:last-child td{border-bottom:0}
.ot-spec th{width:36%;font-weight:600;color:var(--dim);font-size:13px;background:var(--soft)}
.ot-spec small{display:block;color:var(--dim);font-size:12px;line-height:1.55;margin-top:2px}
.ot-spec b{font-family:var(--serif);font-size:17px}

/* ── 코스 = 값표 쪽지 ────────────────────────────── */
.ot-tags{list-style:none;margin:0;padding:0;border-top:1px solid var(--ink)}
.ot-tags li{border-bottom:1px solid var(--line);padding:12px 0}
.ot-tags a{display:grid;grid-template-columns:124px 1fr;gap:2px 14px;align-items:baseline;color:var(--ink);text-decoration:none}
.ot-pr{grid-row:span 2;font-family:var(--serif);font-size:23px;font-weight:700;color:var(--accDk);text-align:right;letter-spacing:-.02em}
.ot-pr i{font-style:normal;font-size:13px;margin-left:2px;color:var(--dim)}
.ot-nm{font-family:var(--serif);font-size:18px;font-weight:700}
.ot-tags a:hover .ot-nm{text-decoration:underline;text-decoration-color:var(--acc)}
.ot-mt{font-size:12.5px;color:var(--dim)}
.ot-tags p{margin:6px 0 0 138px;font-size:13.5px;color:var(--dim)}
@media (max-width:520px){.ot-tags a{grid-template-columns:96px 1fr}.ot-pr{font-size:19px}.ot-tags p{margin-left:0}}

/* ── 접수 = 영수증 전표 ──────────────────────────── */
.ot-slip{max-width:34rem;border:2px dashed var(--ink);background:var(--card);padding:16px 20px 12px;font-family:var(--mono)}
.ot-slip-h{margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--ink);font-size:11px;letter-spacing:.22em;color:var(--dim);display:flex;justify-content:space-between}
.ot-slip ol{list-style:none;margin:0;padding:0}
.ot-slip li{display:grid;grid-template-columns:28px 1fr;gap:0 6px;padding:6px 0;font-size:13px;border-bottom:1px dotted var(--line)}
.ot-slip li:last-child{border-bottom:0}
.ot-ln{color:var(--acc);font-weight:700}
.ot-slip li b{font-family:var(--sans);font-size:14.5px;display:block}
.ot-slip li span:not(.ot-ln){grid-column:2;color:var(--dim);font-family:var(--sans);font-size:13px;line-height:1.65}
.ot-slip-f{margin:8px 0 0;padding-top:8px;border-top:1px solid var(--ink);font-size:11.5px;color:var(--dim)}

/* ── 물음 = 말풍선 ───────────────────────────────── */
.ot-chat{display:grid;gap:10px;max-width:46rem}
.ot-q,.ot-a{max-width:88%;padding:10px 14px;position:relative}
.ot-q{justify-self:start;background:var(--ink);color:var(--paper)}
.ot-q h3{margin:0;font-family:var(--serif);font-size:16px;font-weight:700;line-height:1.55}
.ot-q::before{content:"";position:absolute;left:-8px;top:12px;border:8px solid transparent;border-left:0;border-right-color:var(--ink)}
.ot-a{justify-self:end;background:var(--soft);border:1px solid var(--line);margin-bottom:8px}
.ot-a p{margin:0;font-size:14.5px}
.ot-a::after{content:"";position:absolute;right:-8px;top:12px;border:8px solid transparent;border-right:0;border-left-color:var(--line)}

/* ── 주의 = 빗금 가장자리 메모 ───────────────────── */
.ot-memo{border:1px solid var(--ink);background:var(--card);padding:14px 18px 14px 26px;position:relative;
  background-image:repeating-linear-gradient(135deg,var(--line) 0 2px,transparent 2px 7px);background-size:10px 100%;background-repeat:no-repeat}
.ot-memo ul{margin:0;padding:0 0 0 14px;font-size:14.5px;display:grid;gap:6px}
.ot-memo li::marker{color:var(--acc)}

/* ── 접수 띠 = 전보 ──────────────────────────────── */
.ot-wire{margin:34px 0 0;border:2px solid var(--ink);padding:16px 18px;display:grid;gap:10px;position:relative;background:var(--soft)}
.ot-wire::before{content:"접수";position:absolute;top:-11px;left:14px;background:var(--ink);color:var(--paper);font-size:11px;letter-spacing:.24em;padding:1px 10px}
@media (min-width:760px){.ot-wire{grid-template-columns:1fr auto;align-items:center}.ot-wire-s{grid-column:1/-1}}
.ot-wire-p{margin:0;font-family:var(--serif);font-size:17px;line-height:1.6}
.ot-wire-s{margin:0;font-size:12.5px;color:var(--dim);font-family:var(--mono)}

/* ── 링크 묶음 = 책 색인 ─────────────────────────── */
.ot-run{list-style:none;margin:0;padding:0;font-size:14.5px;line-height:2}
.ot-run li{display:inline}
.ot-run li+li::before{content:"·";margin:0 7px;color:var(--acc);font-weight:700}
.ot-run small{margin-left:4px;font-size:11.5px;color:var(--dim)}
.ot-run span{color:var(--ink)}
.ot-ways{display:grid;gap:18px}
@media (min-width:720px){.ot-ways{grid-template-columns:1fr 1fr}}
.ot-ways h3{margin:0 0 5px;font-family:var(--serif);font-size:14.5px;font-weight:700;padding-bottom:4px;border-bottom:1px solid var(--ink)}
.ot-grp{display:grid;gap:14px}
.ot-grp h3{margin:0 0 4px;font-family:var(--serif);font-size:15px;font-weight:700}
.ot-grp h3 em{font-style:normal;font-family:var(--mono);font-size:11px;color:var(--acc);margin-left:8px}

/* ── 구역 = 도장 칸 ──────────────────────────────── */
.ot-stamps{list-style:none;margin:0;padding:0;display:grid;gap:8px;grid-template-columns:repeat(2,1fr)}
@media (min-width:560px){.ot-stamps{grid-template-columns:repeat(3,1fr)}}
@media (min-width:860px){.ot-stamps{grid-template-columns:repeat(4,1fr)}}
.ot-stamps a{display:grid;grid-template-columns:36px 1fr;gap:0 8px;align-items:center;border:1px solid var(--ink);background:var(--card);padding:7px 9px;color:var(--ink);text-decoration:none;height:100%}
.ot-stamps a:hover{background:var(--soft)}
.ot-stamps a[aria-current]{background:var(--ink);color:var(--paper)}
.ot-stamps svg{grid-row:span 2;width:36px;height:36px}
.ot-stamps b{font-family:var(--serif);font-size:14.5px;line-height:1.3}
.ot-stamps span{font-size:11.5px;color:var(--dim);line-height:1.4}
.ot-stamps a[aria-current] span{color:var(--accLt)}

/* ── 값 장부 표 ──────────────────────────────────── */
.ot-ledger{width:100%;border-collapse:collapse;font-size:14px}
.ot-ledger caption{text-align:left;font-size:12px;color:var(--dim);padding-bottom:6px}
.ot-ledger th,.ot-ledger td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left}
.ot-ledger thead th{border-bottom:2px solid var(--ink);font-size:12px;color:var(--dim);font-weight:600}
.ot-ledger td:nth-child(n+2){font-family:var(--mono);font-size:13px;white-space:nowrap}
.ot-ledger tr[aria-current] th,.ot-ledger tr[aria-current] td{background:var(--soft)}
.vs{width:100%;border-collapse:collapse;font-size:14px}
.vs th,.vs td{padding:8px 9px;border-bottom:1px solid var(--line);text-align:left}
.vs thead th{border-bottom:2px solid var(--ink);font-size:12px;color:var(--dim)}
.vs tr.me th,.vs tr.me td{background:var(--soft);font-weight:700}
.vs-w{overflow-x:auto}

/* ── 홈: 큰 판과 색인 ───────────────────────────── */
.ot-door{margin:20px 0 0;padding:22px 0 18px;border-bottom:1px solid var(--ink)}
.ot-door-sl{margin:0 0 12px;font-family:var(--serif);font-size:clamp(20px,3.6vw,28px);line-height:1.45;font-weight:700;max-width:40rem}
.ot-door-p{margin:0 0 16px;max-width:42rem;font-size:15.5px;color:var(--dim)}
.ot-door-f{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:0;grid-template-columns:repeat(2,1fr);border-top:1px solid var(--line)}
@media (min-width:760px){.ot-door-f{grid-template-columns:repeat(4,1fr)}}
.ot-door-f li{padding:10px 12px 10px 0;font-size:12.5px;color:var(--dim);line-height:1.5}
.ot-door-f b{display:block;font-family:var(--serif);font-size:16px;color:var(--ink)}
.ot-big{list-style:none;margin:0 0 20px;padding:0;display:grid;gap:10px;grid-template-columns:repeat(2,1fr)}
@media (min-width:760px){.ot-big{grid-template-columns:repeat(4,1fr)}}
.ot-big a{display:block;border:2px solid var(--ink);background:var(--card);padding:12px;color:var(--ink);text-decoration:none;height:100%}
.ot-big a:hover{background:var(--soft)}
.ot-big svg{display:block;width:84px;height:84px;margin:0 auto 6px}
.ot-big b{display:block;font-family:var(--serif);font-size:19px;text-align:center}
.ot-big span{display:block;font-size:12px;color:var(--dim);text-align:center;line-height:1.5}
.ot-toc{list-style:none;margin:0;padding:0;font-size:15px}
.ot-toc a{display:flex;align-items:baseline;gap:6px;color:var(--ink);text-decoration:none;padding:5px 0}
.ot-toc a:hover b{text-decoration:underline;text-decoration-color:var(--acc)}
.ot-toc b{font-family:var(--serif);font-weight:700}
.ot-toc i{flex:1;border-bottom:2px dotted var(--line);transform:translateY(-4px)}
.ot-toc span{font-size:12.5px;color:var(--dim);white-space:nowrap}
.ot-key{margin:14px 0 0;font-size:13px;color:var(--dim);max-width:46rem}
.ot-notes{list-style:none;margin:0;padding:0;display:grid;gap:0;counter-reset:no}
.ot-notes li{counter-increment:no;border-top:1px solid var(--line)}
.ot-notes li:last-child{border-bottom:1px solid var(--line)}
.ot-notes a{display:grid;grid-template-columns:48px 1fr;gap:2px 8px;padding:12px 0;color:var(--ink);text-decoration:none}
.ot-notes a::before{content:"No." counter(no,decimal-leading-zero);font-family:var(--mono);font-size:11px;color:var(--acc);padding-top:5px;grid-row:span 3}
.ot-notes b{font-family:var(--serif);font-size:16.5px}
.ot-notes a:hover b{text-decoration:underline;text-decoration-color:var(--acc)}
.ot-notes p{margin:0;font-size:13.5px;color:var(--dim)}
.ot-notes time{font-family:var(--mono);font-size:10.5px;color:var(--dim)}

/* ── 문서·글 ─────────────────────────────────────── */
.ot-piece{max-width:44rem;font-size:16.5px}
.ot-piece h2{margin:30px 0 10px;font-family:var(--serif);font-size:20px;padding-bottom:5px;border-bottom:1px solid var(--ink)}
.ot-piece p{margin:0 0 1.05em}
.ot-piece ul{margin:0 0 1.05em;padding-left:1.2em;color:var(--dim)}
.ot-doc{max-width:44rem;counter-reset:cl}
.ot-doc h2{margin:22px 0 6px;font-family:var(--serif);font-size:16.5px}
.ot-doc p{margin:0;font-size:14.5px;color:var(--dim)}
.ot-dated{margin:0 0 14px;font-size:12px;color:var(--dim);font-family:var(--mono)}
.ot-cards{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:680px){.ot-cards{grid-template-columns:1fr 1fr}}
.ot-cards li{border:1px solid var(--ink);background:var(--card)}
.ot-cards a{display:block;padding:12px 14px;color:var(--ink);text-decoration:none;height:100%}
.ot-cards a:hover{background:var(--soft)}
.ot-cards b{display:block;font-family:var(--serif);font-size:16px;margin-bottom:4px}
.ot-cards p{margin:0;font-size:13.5px;color:var(--dim)}
.ot-cards time{display:block;margin-top:6px;font-family:var(--mono);font-size:10.5px;color:var(--dim)}

/* ── 발 = 먹빛 ───────────────────────────────────── */
.ot-foot{margin-top:46px;background:var(--ink);color:#E8E1D2}
.ot-foot a{color:var(--accLt)}
.ot-foot a:hover{color:#fff}
.ot-foot-top{max-width:var(--w);margin:0 auto;padding:30px 18px 18px;display:grid;gap:14px}
@media (min-width:820px){.ot-foot-top{grid-template-columns:1fr auto;align-items:end}}
.ot-foot-nm{margin:0;font-family:var(--serif);font-size:26px;color:#fff;letter-spacing:.03em}
.ot-foot-say{margin:6px 0 0;font-size:13.5px;max-width:36rem;color:#CFC6B2}
.ot-foot-run{grid-column:1/-1;margin:0;font-family:var(--mono);font-size:11.5px;color:#A79F8D}
.ot-foot-grid{max-width:var(--w);margin:0 auto;padding:6px 18px 22px;display:grid;gap:22px;border-top:1px solid #4A443B}
@media (min-width:820px){.ot-foot-grid{grid-template-columns:1.4fr 1fr 1fr}}
.ot-foot-grid h2{margin:16px 0 8px;font-family:var(--mono);font-size:10.5px;letter-spacing:.22em;color:#A79F8D;font-weight:400}
.ot-foot-grid .ot-run{font-size:13.5px;line-height:1.9}
.ot-foot-grid .ot-run li+li::before{color:#7E7667}
.ot-foot-ul{list-style:none;margin:0;padding:0;display:grid;gap:5px;font-size:13.5px}
.ot-foot-ul time{display:block;font-family:var(--mono);font-size:10px;color:#A79F8D}
.ot-foot-sm{margin:10px 0 0;font-size:12px;color:#A79F8D}
.ot-foot-end{border-top:1px solid #4A443B}
.ot-foot-end>div{max-width:var(--w);margin:0 auto;padding:16px 18px 24px}
.s-biz{margin:0 0 8px;font-size:12px;color:#A79F8D}
.s-ai{margin:0 0 8px;font-size:12px;color:#B8B09E;line-height:1.72}
.s-cr{margin:0;font-size:11.5px;color:#A79F8D}

/* ── 아래 붙는 전표 띠 ───────────────────────────── */
.ot-float{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:3px solid var(--ink);padding:8px 14px calc(8px + env(safe-area-inset-bottom));
  display:flex;align-items:center;justify-content:space-between;gap:12px;transition:transform .2s}
.ot-float.down{transform:translateY(110%)}
.ot-float-s{font-size:11.5px;color:var(--dim);font-family:var(--mono);line-height:1.4}
@media (min-width:900px){.ot-float{display:none}}
@media print{.ot-float,.ot-mast,.ot-wire{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 붙은 띠를 내린다. 그 밖의 일은 하지 않는다 —
     무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.ot-float'),ft=document.querySelector('.ot-foot');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('down',e.isIntersecting);});
  },{rootMargin:'0px 0px -30px 0px'}).observe(ft);
})();`;

/* ── 홈이 파인 네모판 ─────────────────────────────────────────
   dir 0..7 = 북,북동,동,남동,남,남서,서,북서. dir<0 이거나 깊이가 0이면 홈 없는 판. */
const TL = [20, 20], TM = [60, 20], TR = [100, 20], RM = [100, 60], BR = [100, 100], BM = [60, 100], BL = [20, 100], LM = [20, 60];
export function platePoints(dir, drel) {
  if (dir == null || dir < 0 || !drel) return [TL, TM, TR, RM, BR, BM, BL, LM];
  const d = Math.max(7, Math.min(40, (Math.min(drel, 50) / 50) * 40));
  const b = 22 + d * 0.7;
  const L = Math.round(d * 1.1 + 8);
  const seq = { TL: [TL], TM: [TM], TR: [TR], RM: [RM], BR: [BR], BM: [BM], BL: [BL], LM: [LM] };
  const x = (v) => Math.round(v * 10) / 10;
  if (dir === 0) seq.TM = [[60 - b / 2, 20], [60, 20 + d], [60 + b / 2, 20]];
  if (dir === 1) seq.TR = [[100 - L, 20], [100, 20 + L]];
  if (dir === 2) seq.RM = [[100, 60 - b / 2], [100 - d, 60], [100, 60 + b / 2]];
  if (dir === 3) seq.BR = [[100, 100 - L], [100 - L, 100]];
  if (dir === 4) seq.BM = [[60 + b / 2, 100], [60, 100 - d], [60 - b / 2, 100]];
  if (dir === 5) seq.BL = [[20 + L, 100], [20, 100 - L]];
  if (dir === 6) seq.LM = [[20, 60 + b / 2], [20 + d, 60], [20, 60 - b / 2]];
  if (dir === 7) seq.TL = [[20, 20 + L], [20 + L, 20]];
  return ['TL', 'TM', 'TR', 'RM', 'BR', 'BM', 'BL', 'LM'].flatMap((k) => seq[k]).map(([a, c]) => [x(a), x(c)]);
}
/** 점선 네모가 껍질, 채운 판이 땅. mini 는 글자 없이 작게. */
export function plate(dir, drel, { mini = false, color = THEME.acc } = {}) {
  const pts = platePoints(dir, drel).map((p) => p.join(',')).join(' ');
  return `<svg class="ot-pl" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><rect x="20" y="20" width="80" height="80" fill="none" stroke="${THEME.ink}" stroke-width="${mini ? 3 : 1.4}" stroke-dasharray="${mini ? '6 5' : '4 3'}"/><polygon points="${pts}" fill="${color}" fill-opacity=".34" stroke="${THEME.ink}" stroke-width="${mini ? 4 : 2}" stroke-linejoin="miter"/>${mini ? '' : `<text x="60" y="12" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="${THEME.dim}">N</text>`}</svg>`;
}

const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${t.ink}"/><polygon points="${platePoints(1, 36).map((p) => p.join(',')).join(' ')}" fill="${t.accLt}"/></svg>`;
const LOGO = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 56"><rect width="300" height="56" fill="${t.paper}"/><g transform="translate(6,6) scale(.37)"><rect x="20" y="20" width="80" height="80" fill="none" stroke="${t.ink}" stroke-width="3" stroke-dasharray="6 5"/><polygon points="${platePoints(1, 36).map((p) => p.join(',')).join(' ')}" fill="${t.acc}" fill-opacity=".5" stroke="${t.ink}" stroke-width="4"/></g><text x="56" y="30" font-family="Georgia,serif" font-size="22" font-weight="700" fill="${t.ink}">${cfg.brand.ko}</text><text x="56" y="45" font-family="ui-monospace,monospace" font-size="9" letter-spacing="4" fill="${t.accDk}">${cfg.brand.en.toUpperCase()}</text></svg>`;
const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/><rect x="24" y="24" width="1152" height="582" fill="none" stroke="${t.ink}" stroke-width="3"/><rect x="34" y="34" width="1132" height="562" fill="none" stroke="${t.ink}" stroke-width="1"/>
<g transform="translate(780,110) scale(3.6)"><rect x="20" y="20" width="80" height="80" fill="none" stroke="${t.ink}" stroke-width="1.4" stroke-dasharray="4 3"/><polygon points="${platePoints(2, 40).map((p) => p.join(',')).join(' ')}" fill="${t.acc}" fill-opacity=".4" stroke="${t.ink}" stroke-width="2"/></g>
<text x="96" y="290" font-family="Georgia,serif" font-size="56" font-weight="700" fill="${t.ink}">${cfg.brand.ko}</text>
<text x="96" y="350" font-family="Georgia,serif" font-size="30" fill="${t.ink}">출장마사지 · 홈타이</text>
<text x="96" y="404" font-family="system-ui,sans-serif" font-size="23" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="96" y="450" font-family="ui-monospace,monospace" font-size="19" fill="${t.accDk}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="96" y="486" width="420" height="78" fill="${t.ink}"/>
<text x="124" y="518" font-family="ui-monospace,monospace" font-size="13" letter-spacing="5" fill="${t.accLt}">${cfg.telLabel}</text>
<text x="124" y="550" font-family="Georgia,serif" font-size="30" font-weight="700" fill="${t.paper}">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ot.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'ot.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME, cfg));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const MARK = () => `<svg class="ot-mk" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><rect x="20" y="20" width="80" height="80" fill="none" stroke="${THEME.ink}" stroke-width="5" stroke-dasharray="9 7"/><polygon points="${platePoints(1, 36).map((p) => p.join(',')).join(' ')}" fill="${THEME.acc}" fill-opacity=".55" stroke="${THEME.ink}" stroke-width="7"/></svg>`;
