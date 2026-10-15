/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막을 잇는 기호는 겹꺾쇠(»)다. 앞선 열여섯 사이트는 세로줄·줄표·가운뎃점·쌍점·쉼표·
 *   슬래시·괄호·대괄호·꺾쇠(›)를 썼다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 100자 안쪽. 가운데 토막은 그 자리에서만 나오는 값(홈 깊이·향한 쪽·홈 수·겉선 안 땅)으로 채운다.
 *   홈이 없는 동은 '홈 없음' 갈래로 따로 쓴다.
 */
import { hash, josa } from './util.mjs';
import { fm, dirName } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '오퓰런스터치';
const KEY = '출장마사지 홈타이';
const COURSE_WORD = ['스웨디시', '아로마', '딥티슈', '타이', '경락', '건식', '림프', '지압', '스포츠'];
const ACT = ['오늘 방문', '비용 보기', '늦은 밤도', '바로 통화', '시각 조율'];
const won = (n) => n.toLocaleString('ko-KR');

export const title = {
  home: () => `${BRAND} » ${KEY} » 서울 인천 경기 부산 동 방문 » 24시 후불`,
  areaHub: (c) => `방문 지역 » 동 ${c.spot}구역·시군구 ${c.gu}곳 » ${KEY} » ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} » ${sd.main ? `동 ${sd.spotCount}구역` : `시군구 ${sd.gu.length}곳`} » ${at(hash(sd.name, 'sdt'), ACT)} » ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.spotCount ? `동 ${g.spotCount}구역` : g.main ? `읍면 ${g.ruralCount}구역` : `행정동 ${g.dongCount}구역`;
    return `${g.name} ${KEY} » ${sd.name} ${unit} » ${at(h, ACT, 0)} » ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY} » ${g.name} ${at(h, COURSE_WORD, 0)} » ${at(h, ACT, 1)} » ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} » ${c.min}분 ${won(c.price)}원 » 압 ${c.pressure} » ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} » ${sd.name} 방문 » ${at(hash(sd.name, c.slug), ACT)} » ${BRAND}`,
  page: (t) => `${t} » ${BRAND} ${KEY}`,
  post: (p) => `${p.title} » ${BRAND} 도해 노트`,
};

function spotMiddle(g, s, h) {
  const frames = s.pockets
    ? [
      () => `가장 깊은 홈은 ${dirName(s.dir)}으로 ${fm(s.depth)}입니다`,
      () => `겉선 안 땅은 ${s.fill}%, 홈은 ${s.pockets}곳입니다`,
      () => `${dirName(s.dir)}에서 ${fm(s.depth)} 파고든 홈이 있습니다`,
      () => `홈 ${s.pockets}곳에 깊이는 최대 ${fm(s.depth)}입니다`,
      () => `${g.name}에서 홈 깊이 ${s.guDepthRank}번째입니다`,
      () => `겉선 안 땅 ${s.fill}%에 ${dirName(s.dir)} 홈 ${fm(s.depth)}입니다`,
    ]
    : [
      () => `홈이 없고 겉선 안 땅은 ${s.fill}%입니다`,
      () => `겉선에 딱 붙은 동으로 파인 곳이 없습니다`,
      () => `파고든 홈 없이 겉선 안 땅이 ${s.fill}%입니다`,
    ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = ['비용은 마치고 치릅니다', '선입금을 받지 않습니다', '거리로 비용표를 바꾸지 않습니다', '늦은 밤에도 같은 비용입니다', '셈은 끝에 한 번뿐입니다'];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () => '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 땅이 안으로 파인 정도를 구역마다 재었습니다.',
  areaHub: (c) => `출장마사지 홈타이로 찾아가는 동 ${c.spot}구역과 시군구 ${c.gu}곳. 구역마다 홈 깊이와 향한 쪽을 적었습니다.`,
  sido: (sd) => sd.main
    ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}구역에 안내문이 있고 겉선 안 땅 평균은 ${sd.avgFill}%입니다.`
    : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이고 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const dirOk = g.dir != null && g.dir >= 0 && g.depth;
    const mid = g.spotCount
      ? [
        `동 ${g.spotCount}구역에 안내문이 있고 가장 깊은 홈은 ${g.deepSpot}입니다`,
        `겉선 안 땅 ${g.fill}%에 홈이 ${g.pockets}곳 있습니다`,
        dirOk ? `가장 깊은 홈은 ${dirName(g.dir)}으로 ${fm(g.depth)}입니다` : `겉선 안 땅은 ${g.fill}%입니다`,
        `겉선에 가장 가까운 동은 ${g.roundSpot}입니다`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}구역이 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}구역과 면 ${g.myeonCount}구역을 이름으로 올렸습니다`,
          `겉선 안 땅은 ${g.fill}%입니다`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}구역이 들어 있고 겉선 안 땅은 ${g.fill}%입니다`,
          dirOk ? `가장 깊은 홈은 ${dirName(g.dir)}으로 ${fm(g.depth)}입니다` : `홈 ${g.pockets}곳에 겉선 안 땅 ${g.fill}%입니다`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}구역 모두 찾아갑니다` : `동 ${g.dongNames.length}구역 어디나 한 번호로`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) => `${c.ko} 출장 방문. ${c.focus}에 시간을 몰아 쓰고 압은 ${c.pressure}입니다. ${c.min}분 ${won(c.price)}원, 지역을 가리지 않습니다.`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY}. ${c.focus}${josa(c.focus, '을/를')} 오래 다룹니다. ${sd.name} 어디서나 ${c.min}분 ${won(c.price)}원.`,
  post: (p) => p.summary,
};

export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
