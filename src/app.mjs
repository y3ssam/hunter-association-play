import {
  ACTIONS, DEV_FIXTURE, STAT_KEYS, STAT_LABELS, createGame, getScene, upgradeGame, allocateStats, STAT_CAPS,
  registerHunter, startExpedition, executeAction, retreatExpedition,
  computeProbability, xpForLevel, maxHp, maxMp, worldClock, tickWorld, idFactory,
  resultLabels, endLabels, CONSUMABLES, MATERIAL_BUYBACK, availableGold,
  purchaseConsumable, sellMaterial, CRAFT_RECIPES, EQUIPMENT_SLOTS, canCraftEquipment,
  craftEquipment, equipEquipment, unequipEquipment, enhancementQuote, enhanceEquipment,
  ENHANCEMENT_STEPS, ENHANCEMENT_STONE_PRICES, enhancementStoneKey, purchaseEnhancementStones,
  SKILL_CATALOG, SKILLS_BY_ID, SKILL_GROUPS, DEV_SKILL_FIXTURE, canLearnSkill, learnSkill,
  F_RANK_RULES, F_RESOURCE_NODES, useRecoveryItem, useInventoryRecoveryItem, startTreatment, stopTreatment, isForcedRest,
} from './game.mjs';

const STORAGE_KEY='hunter-association:m0:v1';
const LEASE_KEY='hunter-association:m0:lease';
const TAB_ID=idFactory();
const app=document.querySelector('#app');
const ui={name:'',alloc:Object.fromEntries(STAT_KEYS.map(x=>[x,0])),selected:null,
  showRetreatConfirm:false,toast:null,loadError:null,locked:false,menu:false,stagedAP:{},
  tradeQty:{},pendingTrade:null,pendingEquipment:null,pendingEnhancement:null,pendingStone:null,pendingSkill:null,pendingRecovery:null,treatmentMinutes:''};
let state=null, clockAnchor=performance.now(), shouldRerender=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('ko-KR');
const newCommand=()=>idFactory();
const viewPath=()=>decodeURIComponent(location.hash.replace(/^#/,''))||'/home';
const inActiveBattle=()=>Boolean(state?.player?.activeExpeditionId);
const badge=(s,cls='')=>`<span class="badge ${cls}">${esc(s)}</span>`;
function readState(){
  const raw=localStorage.getItem(STORAGE_KEY);
  if(!raw){const init=createGame();localStorage.setItem(STORAGE_KEY,JSON.stringify(init));return init;}
  const parsed=JSON.parse(raw);
  if(upgradeGame(parsed))localStorage.setItem(STORAGE_KEY,JSON.stringify(parsed));
  return parsed;
}
function assertLease(){
  const raw=localStorage.getItem(LEASE_KEY),lease=raw?JSON.parse(raw):null;
  if(ui.locked||!lease||lease.owner!==TAB_ID||lease.expires<Date.now())
    throw Error('현재 탭에는 저장 권한이 없습니다. 다른 탭의 게임을 닫고 다시 접속해 주세요.');
}
function acquireLease(){
  const now=Date.now();
  let lease;
  try{lease=JSON.parse(localStorage.getItem(LEASE_KEY)||'null');}catch{lease=null;}
  if(lease&&lease.owner!==TAB_ID&&lease.expires>now){ui.locked=true;return false;}
  localStorage.setItem(LEASE_KEY,JSON.stringify({owner:TAB_ID,expires:now+4000}));
  const stored=JSON.parse(localStorage.getItem(LEASE_KEY));
  ui.locked=stored.owner!==TAB_ID;
  return !ui.locked;
}
function refreshLease(){
  if(ui.locked){if(!document.hidden&&acquireLease()){state=readState();clockAnchor=performance.now();render();}return;}
  if(document.hidden) return;
  try{assertLease();localStorage.setItem(LEASE_KEY,JSON.stringify({owner:TAB_ID,expires:Date.now()+4000}));}
  catch{ui.locked=true;render();}
}
function releaseLease(){
  try{const l=JSON.parse(localStorage.getItem(LEASE_KEY)||'null');if(l?.owner===TAB_ID)localStorage.removeItem(LEASE_KEY);}catch{}
}
function commit(fn){
  assertLease();
  const draft=structuredClone(state);
  const outcome=fn(draft);
  draft.revision=(draft.revision||0)+1;
  // Transaction: state is published only *after* durable localStorage write.
  // Browser quota/serialisation failure leaves the in-memory model untouched.
  localStorage.setItem(STORAGE_KEY,JSON.stringify(draft));
  state=draft;
  return outcome;
}
function notify(message){ui.toast=message;render();}
function dispatchCommit(action){try{const result=commit(action);ui.toast=null;render();return result;}
  catch(e){notify(`저장/작업 실패: ${e.message}`);return null;}}
function goto(path){if(viewPath()===path)render();else location.hash=path;}
function doClock(){
  const now=performance.now();
  const diff=Math.floor((now-clockAnchor)/1000);
  if(diff<1)return;
  clockAnchor+=diff*1000;
  if(ui.locked||document.hidden||inActiveBattle()||state?.world?.paused)return;
  try{const changed=commit(s=>tickWorld(s,diff,{visible:!document.hidden,inBattle:inActiveBattle()}));
    if(changed)shouldRerender=true;
  }catch(e){ui.toast=`시각 저장 실패: ${e.message}`;}
}
const icon=(name)=>({home:'⌂',gates:'◈',hunter:'◉',menu:'☰',back:'←'}[name]||'◇');
function header(combat=false){
  const clock=worldClock(state.world.minute);
  return `<header class="site-header ${combat?'battle-site-header':''}">
    <div class="shell header-inner">
      <a href="#/home" class="identity" aria-label="헌터 협회 홈"><span class="logo-mark"><span>H</span></span>
        <span class="identity-text"><strong>HUNTER <em>ASSOCIATION</em></strong><small>대한민국 헌터 협회 · 공식 포털</small></span></a>
      <div class="header-right"><span class="live-dot"></span><span class="server-indicator">협회 시스템 정상</span>
        <span class="clock-chip" title="게임 내 시간"><span class="tiny-text">WORLD TIME</span> D+${clock.day-1} ${clock.label}</span>
        ${state.player&&!combat?`<button class="pause-clock" data-action="pause-world" title="${state.world.paused?'세계 시간 재개':'세계 시간 수동 정지'}" aria-label="${state.world.paused?'세계 시간 재개':'세계 시간 정지'}">${state.world.paused?'▶':'Ⅱ'}</button>`:''}
        ${state.player?`<a href="#/hunter" class="header-user"><span class="mini-avatar">${esc(state.player.name.slice(0,1))}</span><span class="desktop-only">${esc(state.player.name)} 헌터</span></a>`:''}</div>
    </div>
  </header>`;
}
function topnav(active){
 const entries=[['/home','협회 홈'],['/gates','게이트 관리'],['/hunter','헌터 관리'],['/soon/business','협회 업무'],['/facilities','협회 시설'],['/soon/society','헌터 사회'],['/records','기록관']];
 return `<nav class="global-nav" aria-label="상단 메뉴"><div class="shell nav-items">${entries.map(([path,label])=>`<a class="nav-item ${active===path?'active':''}" href="#${path}">${label}</a>`).join('')}</div></nav>`;
}
function mobileNav(active){
 return `<nav class="mobile-nav" aria-label="모바일 메뉴">
 ${[['/home','home','홈'],['/gates','gates','게이트'],['/hunter','hunter','내 헌터'],['/soon/menu','menu','전체']].map(([path,i,label])=>`<a href="#${path}" class="${active===path?'active':''}"><span class="nav-icon">${icon(i)}</span>${label}</a>`).join('')}</nav>`;
}
function sidebar(active){
 const values=[['/home','▦','종합 현황'],['/gates','◇','게이트 발생 현황'],['/hunter','◉','헌터 정보'],['/skills/AT','✧','전투 기술'],['/inventory','▥','인벤토리'],['/equipment','◈','장비'],['/enhance','✦','강화'],['/craft','⚒','제작'],['/facilities','♧','협회 시설'],['/infirmary','✚','의무실'],['/records','▤','공략 기록']];
 return `<aside class="sidebar"><div class="sidebar-heading">QUICK ACCESS</div>${values.map(([path,i,label])=>`<a href="#${path}" class="sidebar-link ${active===path?'active':''}"><span>${i}</span>${label}<span class="sidebar-caret">›</span></a>`).join('')}
 <div class="sidebar-bottom"><span class="mini-blue-label">M1 · SKILL CATALOG</span><strong>게이트 · 장비 · 기술 습득</strong><small>미정인 게임 수치는 개발용 설정으로만 적용됩니다.</small></div></aside>`;
}
function page(body,{active='/home',side=true}={}){
  return `${header()}${topnav(active)}<div class="shell ${side?'page-with-side':'full-content'}">${side?sidebar(active):''}<main class="page-main">${infirmaryNotice()}${body}</main></div>${mobileNav(active)}${footer()}${tradeModal()}${equipmentModal()}${enhancementModal()}${stoneModal()}${skillModal()}${toast()}`;
}
function infirmaryNotice(){
  const t=state.infirmary;
  if(!t?.mode)return '';
  const emergency=t.mode==='EMERGENCY';
  return `<div class="info-band" role="status"><span>✚</span><div><b>${emergency?'응급 치료 중':'의무실 치료 중'}</b> · HP ${state.player.hp}/${maxHp(state.player)} · MP ${state.player.mp}/${maxMp(state.player)}${emergency?` · 활동 재개 기준 HP ${Math.ceil(maxHp(state.player)/2)}`:` · 남은 치료 ${t.remainingMinutes}분`}<br><a href="#/infirmary">의무실에서 확인 →</a></div></div>`;
}
function footer(){return `<footer class="site-footer"><div class="shell footer-content"><span>HUNTER ASSOCIATION <b>· M1 SKILLS</b></span><span>개발용 실행 빌드 · 실제 게임 서비스 아님</span></div></footer>`;}
function toast(){return ui.toast?`<div class="toast" role="alert">${esc(ui.toast)}<button data-action="clear-toast" aria-label="알림 닫기">×</button></div>`:'';}
function titleBlock(kicker,title,description,extra=''){
 return `<div class="page-heading"><div><div class="eyebrow">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${extra}</div>`;
}
function gateStatus(g){return g.status==='OPEN'?badge('입장 가능','available'):g.status==='IN_PROGRESS'?badge('공략 진행 중','running'):g.status==='CLOSED'?badge('폐쇄 완료','quiet'):badge('미폐쇄 · 불안정','warning');}
function progress(value,cls){return `<div class="progress-track"><span class="${cls}" style="width:${Math.max(0,Math.min(100,value))}%"></span></div>`;}
function statEntry(key,val){return `<div class="stat-entry"><span class="stat-abbr">${key}</span><span>${STAT_LABELS[key]}</span><strong>${val}</strong></div>`;}
function registration(){
 const used=Object.values(ui.alloc).reduce((a,b)=>a+b,0),left=3-used;
 return `${header()}<main class="register-wrap shell"><section class="welcome-pane"><div class="welcome-overline"><span class="live-dot"></span> NATIONAL HUNTER REGISTRATION</div><div class="welcome-emblem"><div class="emblem-ring"><span>H</span><small>HA</small></div></div>
 <div><span class="welcome-no">REGISTRATION / 001</span><h1>당신의 첫 번째<br/><em>헌터 등록.</em></h1><p>대한민국 헌터 협회의 공식 등록 절차입니다.<br/>신규 헌터의 활동 기록은 이곳에서 시작됩니다.</p></div>
 <div class="welcome-bottom"><span>F등급 · Lv.1</span><span>HUNTER ASSOCIATION / KR</span></div></section>
 <section class="registration-panel"><div class="reg-step">01 <span></span> 최초 등록 신청</div><h2>신규 헌터 등록</h2><p class="muted">기본 정보를 입력하고 초기 능력치 3포인트를 배분하세요.</p>
 <label class="field-label" for="hunterName">헌터 식별명 <span class="required">필수</span></label><input id="hunterName" class="text-input" type="text" maxlength="40" placeholder="헌터 이름을 입력하세요" value="${esc(ui.name)}" autocomplete="off" />
 <div class="allocation-heading"><div><h3>초기 능력치 배분</h3><small>전체 능력치 기본 3 · F등급 상한 5</small></div><div class="points-chip">잔여 <strong>${left}</strong> / 3 PT</div></div>
 <div class="allocation-grid">${STAT_KEYS.map(k=>`<div class="allocation-stat"><div class="stat-name"><b>${k}</b><span>${STAT_LABELS[k]}</span></div><div class="stat-controls"><button data-action="stat-minus" data-key="${k}" aria-label="${STAT_LABELS[k]} 감소" ${ui.alloc[k]===0?'disabled':''}>−</button><strong>${3+ui.alloc[k]}</strong><button data-action="stat-plus" data-key="${k}" aria-label="${STAT_LABELS[k]} 증가" ${left===0||ui.alloc[k]===2?'disabled':''}>+</button></div></div>`).join('')}</div>
 <div class="reg-preview"><span>등록 후 능력치</span><strong>HP ${80+5+8*(3+ui.alloc.VIT)} <i>·</i> MP ${25+1+6*(3+ui.alloc.MAG)}</strong></div>
 <p class="dev-note"><span>ⓘ</span> 이름 형식·초기 골드(200G)는 MVP 임시 처리입니다. 정식 정책은 아직 미정입니다.</p>
 <button class="btn btn-primary btn-wide" data-action="register" ${left!==0||!ui.name.trim()?'disabled':''}>헌터 등록 확정 <span>→</span></button>
 </section></main>${toast()}`;
}
function home(){
 const p=state.player,gates=state.gateInstances,active=p.activeExpeditionId;
 const closed=gates.filter(g=>g.status==='CLOSED').length,open=gates.filter(g=>g.status==='OPEN').length;
 return page(`<div class="welcome-banner"><div class="banner-copy"><div class="eyebrow eyebrow-light"><span class="live-dot"></span> HUNTER ASSOCIATION · FIELD OPERATIONS</div><div class="banner-salutation">안녕하세요, <strong>${esc(p.name)}</strong> 헌터.</div><h1>협회 활동 현황</h1><p>등록된 헌터님의 정보와 현재 발생한 게이트 현황을 확인할 수 있습니다.</p><div class="banner-actions"><a class="btn btn-white" href="#/gates">게이트 발생 현황 <span>↗</span></a>${active?`<a class="btn btn-ghost-white" href="#/expedition/${active}">진행 공략 재개 →</a>`:''}</div></div><div class="hero-design"><div class="hero-orbit o1"></div><div class="hero-orbit o2"></div><span>HA</span></div></div>
 <div class="section-eyebrow">OVERVIEW <span>·</span> 헌터 현황</div><div class="overview-grid">
 <div class="metric-card"><span class="metric-name">공식 헌터 등급</span><div class="metric-main"><strong>${p.rank}</strong><span>RANK</span></div><small>승급 심사 통과 시 변경</small></div>
 <div class="metric-card"><span class="metric-name">현재 레벨</span><div class="metric-main"><strong>${p.level}<small>Lv.</small></strong></div><small>${fmt(p.xp)} / ${fmt(xpForLevel(p.level))} XP</small>${progress(p.xp/xpForLevel(p.level)*100,'fill-blue')}</div>
 <div class="metric-card"><span class="metric-name">보유 골드</span><div class="metric-main"><strong>${fmt(p.gold)}</strong><span>G</span></div><small>초기 200G는 개발용 가안</small></div>
 <div class="metric-card"><span class="metric-name">게이트 폐쇄 실적</span><div class="metric-main"><strong>${closed}</strong><span>건</span></div><small>F-01 / F-02 · 발생 기록 ${gates.length}개</small></div></div>
 <div class="dashboard-columns"><section class="panel"><div class="panel-top"><div><div class="eyebrow">GATE MONITORING</div><h2>현재 게이트 발생 현황</h2></div><a href="#/gates" class="text-link">전체 보기 ↗</a></div>
 <div class="gate-summary-row"><div class="gate-symbol">◇</div><div><b>F급 게이트 공략</b><small>일반 F-01 · 정예 F-02 · ${open}개 입장 가능</small></div>${badge('30분마다 발생 판정','available')}</div>
 ${gates.map((g,i)=>`<a href="#/gate/${g.id}" class="list-row"><div><b>${esc(g.templateId)} · 발생 개체 ${String(i+1).padStart(2,'0')}</b><small>${g.id}</small></div>${gateStatus(g)}<span>›</span></a>`).join('')}</section>
 <section class="panel news-panel"><div class="panel-top"><div><div class="eyebrow">HUNTER SERVICES</div><h2>헌터 업무 바로가기</h2></div></div>
 <a href="#/hunter" class="service-link"><span class="service-icon">◉</span><span><b>헌터 기본 정보</b><small>능력치 포인트 분배 · 레벨 · 골드</small></span><span>↗</span></a>
 <a href="#/skills/AT" class="service-link"><span class="service-icon">✧</span><span><b>전투 기술</b><small>45개 스킬 · SP · 개발용 습득</small></span><span>↗</span></a>
 <a href="#/gates" class="service-link"><span class="service-icon">◇</span><span><b>게이트 공략 신청</b><small>게이트 조회 · 준비 · 출발</small></span><span>↗</span></a>
 ${active?`<a href="#/expedition/${active}" class="service-link special"><span class="service-icon">↻</span><span><b>중단한 공략 재개</b><small>저장된 행동 후보 복원</small></span><span>↗</span></a>`:''}
 <a href="#/records" class="service-link"><span class="service-icon">▤</span><span><b>공략 기록관</b><small>종료된 공략 · 확정 행동 로그 열람</small></span><span>↗</span></a>
 <a href="#/inventory" class="service-link"><span class="service-icon">▥</span><span><b>인벤토리</b><small>회복약 · 획득 재료 · 보유량</small></span><span>↗</span></a>
 <a href="#/infirmary" class="service-link"><span class="service-icon">✚</span><span><b>협회 의무실</b><small>무료 치료 · HP/MP 회복</small></span><span>↗</span></a>
  <a href="#/facilities" class="service-link"><span class="service-icon">♧</span><span><b>협회 시설</b><small>F급 보급소 · 부산물 매입소</small></span><span>↗</span></a><div class="service-footnote">NPC·경매는 후속 구현 범위입니다. 장비 강화는 협회 시설에서 이용할 수 있습니다.</div></section></div>`,{active:'/home',side:false});
}
function gatesPage(){
 return page(`${titleBlock('GATE MANAGEMENT / STATUS','게이트 발생 현황','등록된 게이트 인스턴스의 상태와 상세 정보를 조회합니다.',badge('F-01 / F-02 개발 운영','available'))}
 <div class="list-toolbar"><div><strong>현재 조회 ${state.gateInstances.length}건</strong><small>F-01 일반 ${state.gateInstances.filter(g=>g.templateId==='F-01').length}개 · F-02 정예 ${state.gateInstances.filter(g=>g.templateId==='F-02').length}개</small></div><span class="filter-chip">등급 F <b>⌄</b></span></div>
 <div class="gate-table"><div class="gate-table-head"><span>게이트 정보</span><span>등급 / 유형</span><span>발생 개체</span><span>현재 상태</span><span></span></div>${state.gateInstances.map((g,i)=>{
  const template=state.gateTemplates.find(t=>t.id===g.templateId);
  return `<a class="gate-table-row" href="#/gate/${g.id}"><div class="gate-identity"><div class="gate-tile">◇</div><div><b>${esc(template.name)}</b><small>${esc(template.id)} · ${esc(g.id)}</small></div></div><div class="gate-type">${badge(template.rank+'등급','rank')} ${template.kind}</div><div class="instance-no">${String(i+1).padStart(2,'0')} / DEV</div><div>${gateStatus(g)}</div><span class="row-arrow">→</span></a>`;
 }).join('')}</div><div class="info-band"><span>ⓘ</span> 게임 시간 30분마다 F-01 60%, F-02 25% 발생 판정. 입장 가능 개체 상한은 각각 3개·1개이며 연속 미발생 3회·4회 뒤에는 다음 판정에서 보장됩니다. 최초 3+1개는 시작용 개체입니다.</div>`,{active:'/gates'});
}
function gateDetail(instanceId,preparation=false){
 const g=state.gateInstances.find(x=>x.id===instanceId);
 if(!g)return missing('게이트 개체를 찾을 수 없습니다.','/gates');
 const t=state.gateTemplates.find(x=>x.id===g.templateId);
 if(!t)return missing('게이트 정의가 없습니다.','/gates');
 const canStart=g.status==='OPEN'&&!inActiveBattle()&&!state.infirmary?.mode;
 return page(`<div class="breadcrumb"><a href="#/gates">게이트 발생 현황</a><span>›</span>${preparation?'공략 준비':'게이트 상세'}</div>
 ${titleBlock('GATE MANAGEMENT / '+(preparation?'PREPARATION':'DETAIL'),preparation?'공략 출발 준비':'게이트 상세 정보',preparation?'공략 대상과 입장 가능 상태를 마지막으로 확인합니다.':'발생한 게이트의 위치 및 공략 정보를 확인합니다.')}
 <div class="detail-grid"><section class="panel detail-main"><div class="gate-cover"><div class="cover-lines"></div><span>ASSOCIATION GATE RECORD</span><strong>${esc(t.id.replace('-', '—'))}</strong><div><b>${esc(t.name)}</b><small>F RANK · ${t.kind==='정예'?'ELITE':'GENERAL'} GATE</small></div></div>
 <div class="gate-details"><div class="section-heading"><h2>게이트 정보</h2>${gateStatus(g)}</div><div class="definition-grid"><div><small>템플릿 ID</small><strong>${t.id}</strong></div><div><small>실제 발생 ID</small><strong class="id-value">${esc(g.id)}</strong></div><div><small>등급</small><strong>${t.rank}급</strong></div><div><small>유형</small><strong>${t.kind} 게이트</strong></div></div>
 <h3 class="subsection-heading">확인된 출현 개체</h3><div class="monster-grid">${t.monsters.map((m,i)=>`<div class="monster-card"><div class="monster-icon">${i?'◈':'◇'}</div><div><small>일반 몬스터 · ${String(i+1).padStart(2,'0')}</small><strong>${esc(m)}</strong></div></div>`).join('')}${t.boss?`<div class="monster-card elite-monster"><div class="monster-icon">◆</div><div><small>정예 보스 · 70%에 등장</small><strong>${esc(t.boss)}</strong></div></div>`:''}</div>
 <div class="info-band subdued"><span>ⓘ</span> 전투 행동에 따라 HP 피해를 받고, 성공한 탐색으로 이 게이트의 자원 지점을 최대 2개 확보할 수 있습니다. F-02 보스는 방어·탐색·전술의 부분 성공 이상으로 대응합니다.</div></div></section>
 <aside class="panel prepare-side"><div class="eyebrow">EXPEDITION CONTROL</div><h2>${preparation?'출발 확인':'공략 신청'}</h2><div class="prepare-meta"><span>공략 방식 <b>단독 공략</b></span><span>참가 헌터 <b>${esc(state.player.name)}</b></span><span>공식 등급 <b>${state.player.rank}급</b></span><span>입장 대상 <b>${esc(g.id)}</b></span></div>
 ${preparation?`<div class="prepare-notice">출발을 확정하면 행동 카드 3개가 생성되어 즉시 저장됩니다. NPC 파티 기능은 추후 추가됩니다.</div>`:''}
 ${g.status==='IN_PROGRESS'?`<a class="btn btn-primary btn-wide" href="#/expedition/${g.expeditionId}">진행 중 공략 재개 →</a>`:canStart?`<button class="btn btn-primary btn-wide" data-action="${preparation?'start':'prepare'}" data-id="${g.id}">${preparation?'단독 공략 시작 →':'공략 준비하기 →'}</button>`:`<button class="btn btn-primary btn-wide" disabled>현재 입장 불가</button>`}
 ${inActiveBattle()&&g.status==='OPEN'?`<a class="text-link" href="#/expedition/${state.player.activeExpeditionId}">기존 공략 재개 ↗</a>`:''}
 ${preparation?`<a href="#/gate/${g.id}" class="secondary-back">← 상세 정보로 돌아가기</a>`:''}</aside></div>`,{active:'/gates'});
}
function recoveryModal(){
 if(!ui.pendingRecovery)return '';
 const p=state.player;
 const choices=Object.values(CONSUMABLES).filter(item=>(p.consumables?.[item.id]||0)>0&&
   (item.kind==='HP'?p.hp<maxHp(p):p.mp<maxMp(p)));
 return `<div class="modal-backdrop" role="presentation"><div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="recoveryTitle"><div class="modal-mark">✚</div><h2 id="recoveryTitle">회복약 사용 확인</h2><p>약 1개를 사용합니다. 게임 시간 +${F_RANK_RULES.recoveryMinutes}분 · 위험도 +${F_RANK_RULES.recoveryRisk}. 확정 회복이며 판정 주사위는 없습니다.</p><div class="modal-buttons"><button data-action="recovery-cancel" class="btn btn-secondary">취소</button>${choices.map(item=>`<button data-action="recovery-confirm" data-id="${item.id}" class="btn btn-primary">${esc(item.name)} · +${item.restore} ${item.kind}</button>`).join('')}</div></div></div>`;
}
function combat(expId){
 const e=state.expeditions[expId];
 if(!e)return missing('공략 기록이 없습니다.','/gates');
 if(e.status!=='ACTIVE')return resultPage(expId);
 const g=state.gateTemplates.find(t=>t.id===e.gateTemplateId);
 const scene=getScene(e);
 const latest=e.actionResults.at(-1);
 const currentSelected=e.candidates.find(c=>c.id===ui.selected);
 return `${header(true)}<div class="combat-root"><div class="combat-top shell"><a class="combat-back" href="#/home">← 협회 홈</a><span>FIELD OPERATION / ${esc(g.id)} <span class="combat-small-dot">●</span> WORLD TIME PAUSED</span><button class="combat-retreat" data-action="show-retreat">철수 신청 ↗</button></div>
 <main class="combat-layout shell"><aside class="combat-side"><div class="combat-side-top"><span class="eyebrow">GATE OPERATION</span><h2>${esc(g.name)}</h2><p>${esc(e.gateInstanceId)}</p>${badge(`F급 · ${g.kind}`,'rank')}</div>
 <div class="combat-meter"><div><span>게이트 폐쇄율</span><strong>${e.closure}<small>%</small></strong></div>${progress(e.closure,'fill-blue')}</div>
 ${e.boss?`<div class="boss-status"><b>◆ ${esc(g.boss)}</b><span>${!e.boss.active?'폐쇄율 70%부터 등장':e.boss.resolved?'수압 대응 완료 · 100% 폐쇄 가능':'수압 분출 진행 중 · 폐쇄 상한 99%'}</span></div>`:''}
 <div class="combat-meter danger-meter"><div><span>위험도</span><strong>${e.danger}<small>%</small></strong></div>${progress(e.danger,'fill-danger')}</div>
 <div class="combat-party"><span class="eyebrow">EXPEDITION PARTY</span><div class="party-row"><div class="mini-avatar">${esc(state.player.name.slice(0,1))}</div><span><b>${esc(state.player.name)}</b><small>F급 · Lv.${state.player.level} · 단독 공략</small></span></div><div class="party-hp">HP ${state.player.hp} / ${maxHp(state.player)} <span>·</span> MP ${state.player.mp} / ${maxMp(state.player)}</div></div>
 <div class="combat-fixture">F급 피해·자원·회복 규칙 적용 · 이 게이트의 자원 지점 ${state.gateInstances.find(x=>x.id===e.gateInstanceId)?.resourceClaims?.length||0}/${F_RESOURCE_NODES[e.gateTemplateId]?.length||0} 확보</div></aside>
 <section class="combat-main"><div class="combat-scene"><div class="scene-number">SCENE ${String(e.turn).padStart(2,'0')} <span> / ACTIVE</span></div><div class="scene-abstract"><div class="scene-rings"></div><span>◇</span></div><h1>${esc(scene.title)}</h1><p>${esc(scene.text)}</p><div class="scene-tags"><span>◉ ${esc(scene.detail)}</span><span>↻ 행동 ${e.turn}회차</span></div></div>
 ${latest?`<div class="latest-result"><span class="result-tag outcome-${latest.outcome}">${resultLabels[latest.outcome]}</span><div><b>${esc(latest.candidate.title)}</b><small>${latest.roll===null?'회복 확정':`판정 ${latest.roll.toFixed(2)}/100`} · 폐쇄율 ${latest.closureDelta>=0?'+':''}${latest.closureDelta} · 위험도 ${latest.riskDelta>=0?'+':''}${latest.riskDelta} · HP 피해 ${latest.damage||0} · ${latest.elapsedMinutes}분 경과${latest.resourceNode?` · 자원 지점 ${latest.resourceNode.index} 확보`:''}${latest.itemUsed?` · ${esc(CONSUMABLES[latest.itemUsed]?.name||latest.itemUsed)} 사용`:''}${latest.bossActivated?' · 정예 보스 등장':''}${latest.bossResponse?' · 수압 대응 완료':''}</small></div></div>`:''}
 <div class="action-heading"><div><span class="eyebrow">SELECT YOUR ACTION</span><h2>다음 행동을 선택하세요</h2></div><span>${e.candidates.length}개 중 1개 선택</span></div>
 <div class="action-grid">${e.candidates.map((c,i)=>{
   if(c.type==='recovery')return `<button class="action-card ${ui.selected===c.id?'selected':''}" data-action="select-card" data-id="${c.id}" aria-pressed="${ui.selected===c.id}"><div class="action-card-head"><span class="action-glyph">✚</span><span class="card-index">0${i+1}</span></div><span class="action-type">회복</span><strong>회복약 사용</strong><div class="action-rule"><span>확정 회복 · 위험도 +${F_RANK_RULES.recoveryRisk}</span><span>소요 시간 <b>${c.duration}분</b></span></div><span class="select-indicator">${ui.selected===c.id?'● 선택됨':'○ 선택'}</span></button>`;
   const a=ACTIONS[c.type],prob=computeProbability(state.player,c.type,{bonus:e.nextBonus,gateTemplateId:e.gateTemplateId});
   return `<button class="action-card ${ui.selected===c.id?'selected':''}" data-action="select-card" data-id="${c.id}" aria-pressed="${ui.selected===c.id}"><div class="action-card-head"><span class="action-glyph">${a.icon}</span><span class="card-index">0${i+1}</span></div><span class="action-type">${a.label}</span><strong>${esc(c.title)}</strong><div class="action-rule"><span>정상 성공률 <b>${prob.normal}%</b></span><span>소요 시간 <b>${c.duration}분</b></span></div><span class="select-indicator">${ui.selected===c.id?'● 선택됨':'○ 선택'}</span></button>`;
 }).join('')}</div>
 <div class="combat-execute"><div><strong>${currentSelected?esc(currentSelected.title):'실행할 행동을 선택해 주세요.'}</strong><small>행동은 실행을 확정한 뒤에만 판정됩니다. 후보와 결과는 저장됩니다.</small></div><button data-action="execute" class="btn btn-primary btn-execute" ${!currentSelected?'disabled':''}>행동 실행 <span>→</span></button></div></section>
 <aside class="combat-log"><div class="log-header"><span class="eyebrow">OPERATION LOG</span><h2>공략 기록</h2><small>${e.actionResults.length}건의 확정 행동</small></div><div class="log-list">${e.actionResults.length?e.actionResults.slice().reverse().map(r=>`<div class="log-entry"><div class="log-index">TURN ${String(r.turn).padStart(2,'0')} <span>${r.elapsedMinutes} MIN</span></div><strong>${esc(r.candidate.title)}</strong><span class="${'outcome-'+r.outcome}">${resultLabels[r.outcome]}</span><small>폐쇄율 ${r.after.closure}% · 위험도 ${r.after.danger}%</small></div>`).join(''):`<div class="empty-log"><span>⌁</span><p>아직 실행한 행동이 없습니다.<br/>첫 행동을 선택해 주세요.</p></div>`}</div></aside></main></div>
 ${ui.showRetreatConfirm?`<div class="modal-backdrop" role="presentation"><div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="retreatTitle"><div class="modal-mark">!</div><h2 id="retreatTitle">공략에서 철수할까요?</h2><p>자발적 철수 시 게이트 폐쇄 보상은 지급되지 않습니다. 현재 공략은 종료되며, 미완료 게이트는 폐쇄되지 않습니다.</p><div class="modal-buttons"><button data-action="cancel-retreat" class="btn btn-secondary">공략 계속</button><button data-action="confirm-retreat" data-id="${e.id}" class="btn btn-danger">철수 확정</button></div></div></div>`:''}${recoveryModal()}${toast()}`;
}
function resultPage(expId){
 const e=state.expeditions[expId];
 if(!e||!e.settlement)return missing('확정된 정산 결과를 찾을 수 없습니다.','/gates');
 const s=e.settlement,success=s.reason==='SUCCESS';
 const label=endLabels[s.reason]||'공략 종료';
 const resultCls=success?'succeeded':s.reason==='RETREAT'?'withdrew':'failed';
 return page(`<div class="breadcrumb"><a href="#/gates">게이트 발생 현황</a><span>›</span>공략 결과</div><div class="result-hero ${resultCls}"><div class="eyebrow">EXPEDITION RESULT / CONFIRMED</div><span class="result-icon">${success?'✓':s.reason==='RETREAT'?'↩':'!'}</span><h1>${label}</h1><p>${success?'게이트 폐쇄가 완료되었습니다. 정산금과 경험치가 지급되었습니다.':s.reason==='RETREAT'?'공략을 자발적으로 종료했습니다. 폐쇄 보상은 지급되지 않습니다.':s.reason==='INCAPACITATED'?'HP가 0이 되어 공략이 종료되었습니다. 확보한 일반 재료의 절반만 지급됩니다.':'위험도가 한계에 도달해 강제 공략 실패 처리되었습니다.'}</p><small>${esc(e.gateInstanceId)} · ${e.actionResults.length}회 행동 · 확정 기록</small></div>
 <div class="result-awards"><div><span>정산 금액</span><strong>${fmt(s.gold)}<small> G</small></strong><small>${success?'F등급 보상 범위 100~160G':'폐쇄 보상 미지급'}</small></div><div><span>획득 경험치</span><strong>+${fmt(s.xp)}<small> XP</small></strong><small>${success?'F등급 보상 범위 80~120XP':'폐쇄 보상 미지급'}</small></div><div><span>레벨 상승</span><strong>${s.levels?`+${s.levels}`:'—'}</strong><small>현재 Lv.${state.player.level} · 등급 ${state.player.rank}</small></div></div>
 <div class="result-bottom"><section class="panel"><div class="panel-top"><div><div class="eyebrow">EXPEDITION RECORD</div><h2>공략 결과 세부사항</h2></div>${badge('정산 완료','quiet')}</div><div class="result-detail-row"><span>최종 폐쇄율</span><strong>${e.closure}%</strong></div><div class="result-detail-row"><span>최종 위험도</span><strong>${e.danger}%</strong></div><div class="result-detail-row"><span>확정 행동 기록</span><strong>${e.actionResults.length}건</strong></div><div class="result-detail-row"><span>수집 전리품</span><strong>${s.loot.length?s.loot.map(x=>`${esc(x.id)} ×${x.quantity}`).join(', '):'없음'}</strong></div><div class="result-detail-row"><span>정산 ID</span><strong class="id-value">${esc(s.id)}</strong></div></section>
 <div class="result-links"><a class="btn btn-secondary btn-wide" href="#/record/${e.id}">행동 기록 상세 ↗</a><a class="btn btn-primary btn-wide" href="#/gates">다른 게이트 확인 →</a><a class="btn btn-secondary btn-wide" href="#/hunter">헌터 성장 확인 ↗</a><a href="#/home" class="secondary-back">협회 홈으로 돌아가기</a></div></div>`,{active:'/gates'});
}
function hunterPage(){
 const p=state.player;
 return page(`${titleBlock('HUNTER MANAGEMENT / PROFILE','헌터 기본 정보','등록된 헌터의 공식 등급, 성장과 능력치 상태를 조회합니다.')}
 <div class="economy-shortcuts"><a href="#/inventory" class="btn btn-secondary">인벤토리 확인 ↗</a><a href="#/equipment" class="btn btn-secondary">장비 관리 ↗</a><a href="#/skills/AT" class="btn btn-secondary">전투 기술 ↗</a><a href="#/facilities" class="btn btn-secondary">협회 시설 ↗</a></div>
 <div class="hunter-profile-head"><div class="profile-avatar">${esc(p.name.slice(0,1))}</div><div><div class="eyebrow">REGISTERED HUNTER</div><h2>${esc(p.name)}</h2><span>대한민국 헌터 협회 정식 등록 · ${p.rank}등급 Lv.${p.level}</span></div>${badge('등록 완료','available')}</div>
 <div class="hunter-stat-grid"><div class="panel"><div class="eyebrow">RANK / LEVEL</div><div class="profile-rank"><strong>${p.rank}</strong><span>Lv.${p.level}</span></div><small>공식 등급은 심사를 통과해야 변경됩니다.</small></div><div class="panel"><div class="eyebrow">GROWTH / XP</div><div class="profile-number">${fmt(p.xp)}<span> / ${fmt(xpForLevel(p.level))} XP</span></div>${progress(p.xp/xpForLevel(p.level)*100,'fill-blue')}<small>미배분 AP ${p.unspentAP} · SP ${p.sp}</small></div><div class="panel"><div class="eyebrow">FUNDS / GOLD</div><div class="profile-number">${fmt(p.gold)}<span> G</span></div><small>공략 정상 폐쇄 정산금 누적 반영</small></div></div>
 <div class="profile-details"><section class="panel"><div class="panel-top"><div><div class="eyebrow">HUNTER ATTRIBUTES</div><h2>기본 능력치</h2></div>${badge('6종 능력치','quiet')}</div>${p.unspentAP>0?`<div class="ap-editor"><p>보유 AP <b>${p.unspentAP}</b> · 배분 선택 <b>${STAT_KEYS.reduce((n,k)=>n+(ui.stagedAP[k]||0),0)}</b> · 등급 ${p.rank} 상한 ${STAT_CAPS[p.rank]}</p><div class="ap-edit-grid">${STAT_KEYS.map(k=>`<div class="ap-edit-row"><span><b>${k}</b> ${STAT_LABELS[k]}</span><div><button data-action="ap-minus" data-key="${k}" aria-label="${STAT_LABELS[k]} 배분 취소" ${!ui.stagedAP[k]?'disabled':''}>−</button><strong>${p.stats[k]}${ui.stagedAP[k]?` + ${ui.stagedAP[k]}`:''}</strong><button data-action="ap-plus" data-key="${k}" aria-label="${STAT_LABELS[k]} 포인트 추가" ${p.stats[k]+(ui.stagedAP[k]||0)>=STAT_CAPS[p.rank]||STAT_KEYS.reduce((n,x)=>n+(ui.stagedAP[x]||0),0)>=p.unspentAP?'disabled':''}>+</button></div></div>`).join('')}</div><p class="dev-note">3레벨마다 +1 AP, F등급 개별 능력치 상한 5. 확정 시 되돌릴 수 없습니다.</p><button data-action="ap-confirm" class="btn btn-primary" ${!STAT_KEYS.some(k=>ui.stagedAP[k])?'disabled':''}>선택한 능력치 적용 →</button></div>`:`<div class="stat-readonly-grid">${STAT_KEYS.map(k=>statEntry(k,p.stats[k])).join('')}</div><p class="ap-empty">현재 배분할 AP가 없습니다. 3레벨마다 능력치 포인트 +1 (기존 설계안).</p>`}</section>
 <section class="panel"><div class="panel-top"><div><div class="eyebrow">CURRENT STATUS</div><h2>생존 · 공략 현황</h2></div></div><div class="vitals-row"><span>HP</span><strong>${p.hp} / ${maxHp(p)}</strong></div>${progress(p.hp/maxHp(p)*100,'fill-blue')}<div class="vitals-row"><span>MP</span><strong>${p.mp} / ${maxMp(p)}</strong></div>${progress(p.mp/maxMp(p)*100,'fill-blue')}
 <div class="current-op">${p.activeExpeditionId?`<span>진행 중인 공략이 있습니다.</span><a href="#/expedition/${p.activeExpeditionId}">공략 재개 →</a>`:'<span>현재 진행 중인 공략이 없습니다.</span>'}</div></section></div>`,{active:'/hunter'});
}

function currencyPanel(){
 const p=state.player;
 return `<div class="economy-balance"><div><small>보유 골드</small><strong>${fmt(p.gold)} <span>G</span></strong></div><div><small>사용 가능 골드</small><strong>${fmt(availableGold(p))} <span>G</span></strong></div><div><small>거래 / 제작 내역</small><strong>${(state.transactions||[]).length}<span>건</span></strong></div></div>`;
}
function quantityFor(key,max){return Math.max(1,Math.min(ui.tradeQty[key]||1,max||1));}
function quantityControls(key,max){
 const q=quantityFor(key,max);
 return `<div class="trade-quantity"><button data-action="trade-minus" data-key="${esc(key)}" data-max="${max}" aria-label="수량 감소" ${q<=1?'disabled':''}>−</button><strong aria-label="선택 수량">${q}</strong><button data-action="trade-plus" data-key="${esc(key)}" data-max="${max}" aria-label="수량 증가" ${q>=max?'disabled':''}>+</button></div>`;
}
function inventoryPage(){
 const p=state.player;
 const potions=Object.entries(p.consumables||{}).filter(([,count])=>count>0);
 const materials=Object.entries(p.materials||{}).filter(([,count])=>count>0);
 const tx=(state.transactions||[]).slice(-8).reverse();
 return page(`${titleBlock('HUNTER MANAGEMENT / INVENTORY','인벤토리','보유 재료·소모품과 고유 장비를 실제 저장 상태에서 조회합니다. 열람만으로 수량은 바뀌지 않습니다.')}
 ${currencyPanel()}
 <div class="economy-shortcuts"><a class="btn btn-secondary" href="#/hunter">← 헌터 정보</a><a class="btn btn-secondary" href="#/shop">협회 보급소 ↗</a><a class="btn btn-secondary" href="#/craft">장비 제작 ↗</a><a class="btn btn-primary" href="#/equipment">장비 관리 ↗</a></div>
 <div class="economy-two"><section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">ITEM STORAGE</div><h2>소모품</h2></div>${badge(`${potions.length}종 보관`,'quiet')}</div>
 ${potions.length?potions.map(([id,count])=>{const item=CONSUMABLES[id],usable=item&&!isForcedRest(state)&&!p.activeExpeditionId&&(item.kind==='HP'?p.hp<maxHp(p):p.mp<maxMp(p));return `<div class="stock-row"><div><b>${esc(item?.name||id)}</b><small>${item?`${item.kind} +${item.restore} · 구매품`:'상세 미확인'}</small></div><strong>×${fmt(count)}</strong>${item?`<button class="btn btn-secondary" data-action="inventory-recovery" data-id="${esc(id)}" ${usable?'':'disabled'}>사용</button>`:''}</div>`}).join(''):'<p class="stock-empty">보관된 소비품이 없습니다.</p>'}
 <p class="economy-footnote">공략 밖에서는 인벤토리에서 즉시 사용하며 게임 시간은 소모하지 않습니다. 강제 요양 중에는 사용할 수 없습니다. 공략 중 사용은 행동 카드로 게임 시간 3분·위험도 5를 소모합니다.</p></section>
 <section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">MATERIAL STORAGE</div><h2>부산물 · 제작 재료</h2></div>${badge(`${materials.length}종 보관`,'quiet')}</div>
 ${materials.length?materials.map(([id,count])=>`<div class="stock-row"><div><b>${esc(id)}</b><small>${Object.hasOwn(MATERIAL_BUYBACK,id)?`협회 매입가 ${fmt(MATERIAL_BUYBACK[id])} G /개`:'매입가 확인 필요'}</small></div><strong>×${fmt(count)}</strong></div>`).join(''):'<p class="stock-empty">아직 확보한 재료가 없습니다. F-02 정예 게이트 정상 폐쇄 시 보스 재료를 지급합니다.</p>'}</section></div>
 <section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">EQUIPMENT INSTANCES</div><h2>보유한 개별 장비</h2></div><a href="#/equipment" class="text-link">장착 관리 ↗</a></div>
 ${(p.equipment||[]).length?p.equipment.map(item=>{const recipe=CRAFT_RECIPES.find(r=>r.id===item.definitionId);return `<div class="stock-row"><div><b>${esc(recipe?.name||item.definitionId)} ${item.enhancement?`+${item.enhancement}`:''}</b><small>${esc(item.id)} · ${item.status==='EQUIPPED'?'장착 중':'보관 중'} ${item.equippedSlot?`· ${EQUIPMENT_SLOTS[item.equippedSlot]}`:''}</small></div>${badge(item.status==='EQUIPPED'?'장착':'보관',item.status==='EQUIPPED'?'available':'quiet')}</div>`}).join(''):'<p class="stock-empty">제작된 장비가 없습니다. 재료와 제작비가 모이면 장비 제작에서 생성할 수 있습니다.</p>'}</section>
 <section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">TRANSACTION HISTORY</div><h2>확정 거래·제작 기록</h2></div><a href="#/facilities" class="text-link">시설 안내 ↗</a></div>
 ${tx.length?tx.map(t=>`<div class="stock-row transaction-row"><div><b>${t.type==='PURCHASE'?'보급품 구매':t.type==='CRAFT'?'장비 제작':'부산물 매입'} · ${esc(CONSUMABLES[t.itemId]?.name||CRAFT_RECIPES.find(r=>r.id===t.itemId)?.name||t.itemId)}</b><small>${t.type==='CRAFT'?`장비 ${esc(t.itemInstanceId)} ·`: `×${fmt(t.quantity)} · ${t.unitPrice!==undefined?`단가 ${fmt(t.unitPrice)} G ·`:''}`} 거래 ID ${esc(t.id)}</small></div><strong class="${t.type==='BUYBACK'?'income':'cost'}">${t.type==='BUYBACK'?'+':'-'}${fmt(t.total)} G</strong></div>`).join(''):'<p class="stock-empty">거래 기록이 없습니다.</p>'}</section>`,{active:'/hunter'});
}
function infirmaryPage(){
  const p=state.player,t=state.infirmary,emergency=t?.mode==='EMERGENCY';
  const mode=emergency?'응급 치료 중':t?.mode==='NORMAL'?'일반 치료 중':'치료 대기';
  return page(`${titleBlock('ASSOCIATION INFIRMARY / CARE','협회 의무실','무료 치료 · 현실 1초마다 게임 1분이 지나며 최대 HP·MP의 각 0.5%를 회복합니다.')}
  <section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">CURRENT STATUS</div><h2>${mode}</h2></div>${badge('이용료 0 G','available')}</div>
  <div class="definition-grid"><div><small>HP</small><strong>${p.hp} / ${maxHp(p)}</strong></div><div><small>MP</small><strong>${p.mp} / ${maxMp(p)}</strong></div><div><small>세계 시간</small><strong>${worldClock(state.world.minute).label}</strong></div><div><small>치료 진행</small><strong>${emergency?'HP 50%까지 자동':t?.mode==='NORMAL'?`남은 ${t.remainingMinutes}분`:'대기 중'}</strong></div></div>
  <div class="infirmary-controls">${emergency?`<p>HP가 ${Math.ceil(maxHp(p)/2)} 이상이 되면 응급 치료와 활동 제한이 자동으로 끝납니다. 조회 화면은 이용할 수 있습니다.</p>`:t?.mode==='NORMAL'?`<p>다른 조회 화면을 열어도 치료가 계속됩니다. 중단하면 이미 회복한 HP·MP가 유지됩니다.</p><button class="btn btn-secondary" data-action="treatment-stop">치료 중단</button>`:`<label for="treatmentMinutes">치료할 게임 시간(분)</label><input id="treatmentMinutes" type="number" min="1" max="200" step="1" value="${esc(ui.treatmentMinutes)}" placeholder="1~200분"><div class="economy-shortcuts">${[10,30,60,120].map(minutes=>`<button class="btn btn-secondary" data-action="treatment-quick" data-minutes="${minutes}">${minutes}분</button>`).join('')}</div><button class="btn btn-primary" data-action="treatment-start">무료 치료 시작</button>`}
  <p class="economy-footnote">게임 일시정지 또는 브라우저 비활성·종료 중에는 치료도 멈춥니다.</p></div></section>`,{active:'/infirmary'});
}
function facilitiesPage(){return page(`${titleBlock('ASSOCIATION FACILITIES / SERVICES','협회 시설','기존 확정 가격과 보유 자산으로 동작하는 시설부터 개방했습니다.')}
 ${currencyPanel()}<div class="facility-cards"><a href="#/shop" class="panel facility-card"><span>▣</span><div class="eyebrow">SUPPLY OFFICE</div><h2>협회 보급소</h2><p>F등급 HP·MP 회복약 구매. 보유 수량과 골드가 즉시 반영됩니다.</p><b>보급품 조회 →</b></a><a href="#/buyback" class="panel facility-card"><span>◇</span><div class="eyebrow">MATERIAL BUYBACK</div><h2>부산물 매입소</h2><p>확보한 재료만 협회 고시 매입가로 판매합니다.</p><b>매입 신청 →</b></a></div>
 <div class="facility-cards"><a href="#/infirmary" class="panel facility-card"><span>✚</span><div class="eyebrow">INFIRMARY</div><h2>협회 의무실</h2><p>무료 치료와 응급 치료 상태를 확인합니다.</p><b>의무실로 이동 →</b></a><a href="#/craft" class="panel facility-card"><span>⚒</span><div class="eyebrow">EQUIPMENT WORKSHOP</div><h2>장비 제작</h2><p>원문 14개 도면·재료·제작비 조회. 개발용 F급 2개 도면으로 제작 가능합니다.</p><b>정비소로 이동 →</b></a><a href="#/equipment" class="panel facility-card"><span>◈</span><div class="eyebrow">EQUIPMENT MANAGEMENT</div><h2>장비 관리</h2><p>고유 아이템 장착·해제, 8개 슬롯 점유 확인. F-01 장갑은 탐색 성공률 +5%p, F-02 방패는 방어 HP 피해 -1을 각 게이트에서 적용합니다.</p><b>장비 슬롯 조회 →</b></a><a href="#/enhance" class="panel facility-card"><span>✦</span><div class="eyebrow">ENHANCEMENT</div><h2>장비 강화</h2><p>+1~+10 강화와 강화석 구매. 실패 시 자원 소비와 결과가 함께 저장됩니다.</p><b>강화 정비소로 이동 →</b></a></div><div class="info-band"><span>ⓘ</span> F-01 장갑과 F-02 방패 효과는 신규 사용자 확정 규칙입니다. 장착 슬롯 매핑은 개발용이며 다른 장비 효과와 강화 단계별 전투 효과는 아직 확인되지 않았습니다.</div>`,{active:'/facilities'});}
function shopPage(){
 const gold=availableGold(state.player);
 return page(`<div class="breadcrumb"><a href="#/facilities">협회 시설</a><span>›</span>보급소</div>
 ${titleBlock('SUPPLY OFFICE / F-RANK','협회 보급소','현재 F등급에서 구매 가능한 회복약. 공략 중 회복 행동으로 사용합니다.')}
 ${currencyPanel()}<section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">ASSOCIATION STOCK</div><h2>F등급 회복약</h2></div>${badge('원문 가격 적용','available')}</div>
 ${Object.values(CONSUMABLES).map(item=>{const max=Math.floor(gold/item.price),q=quantityFor(`buy:${item.id}`,max);
  return `<div class="trade-row"><div class="trade-item"><div class="trade-symbol">${item.kind==='HP'?'✚':'✧'}</div><div><h3>${esc(item.name)}</h3><p>${item.kind} ${item.restore} 회복 · ${fmt(item.price)} G/개</p><small>보유 ${fmt(state.player.consumables?.[item.id]||0)}개</small></div></div>
  <div class="trade-actions">${max>0?quantityControls(`buy:${item.id}`,max):'<span class="muted">골드 부족</span>'}<button class="btn btn-primary" data-action="trade-propose" data-kind="buy" data-id="${esc(item.id)}" ${max<1?'disabled':''}>${fmt(item.price*q)} G 구매</button></div></div>`;}).join('')}
 <p class="economy-footnote">회복약의 수치와 가격은 원문 §7.7 설계안입니다. 아직 HP/MP 소모가 없는 전투에서 임의의 회복 행동을 추가하지 않습니다.</p></section>
 <div class="economy-shortcuts"><a href="#/inventory" class="btn btn-secondary">보관함 확인 ↗</a></div>`,{active:'/facilities'});
}
function buybackPage(){
 const rows=Object.entries(state.player.materials||{}).filter(([,count])=>count>0);
 return page(`<div class="breadcrumb"><a href="#/facilities">협회 시설</a><span>›</span>부산물 매입소</div>
 ${titleBlock('MATERIAL BUYBACK / ASSOCIATION','부산물 매입소','보유 재료의 매입 수량을 선택하고 판매를 확정하세요. 임의 드롭은 생성하지 않습니다.')}
 ${currencyPanel()}<section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">OWNED MATERIALS</div><h2>매입 가능한 보유 재료</h2></div>${badge(`${rows.length}종 보유`,'quiet')}</div>
 ${rows.length?rows.map(([id,count])=>{const price=MATERIAL_BUYBACK[id],q=quantityFor(`sell:${id}`,count);
  return `<div class="trade-row"><div class="trade-item"><div class="trade-symbol">◇</div><div><h3>${esc(id)}</h3><p>${price===undefined?'협회 고시가 확인되지 않음':`${fmt(price)} G/개`} · 보유 ${fmt(count)}개</p><small>${price===undefined?'매입 미지원':'판매 후 인벤토리·골드 동시 변경'}</small></div></div><div class="trade-actions">${price===undefined?'':quantityControls(`sell:${id}`,count)}<button class="btn btn-primary" data-action="trade-propose" data-kind="sell" data-id="${esc(id)}" ${price===undefined?'disabled':''}>${price===undefined?'매입 보류':`${fmt(price*q)} G 매입`}</button></div></div>`;}).join(''):'<p class="stock-empty">현재 보유한 재료가 없습니다. 공략 중 탐색에 성공하면 자원 지점의 재료를 확보할 수 있습니다.</p>'}
 <p class="economy-footnote">원문 §7.4의 협회 매입 단가를 사용합니다. 해당 재료는 판매 즉시 차감되며 이후 제작에 사용할 수 없습니다.</p></section>
 <div class="economy-shortcuts"><a href="#/inventory" class="btn btn-secondary">인벤토리 돌아가기 ↗</a></div>`,{active:'/facilities'});
}
function craftPage(){
 const p=state.player;
 return page(`<div class="breadcrumb"><a href="#/facilities">협회 시설</a><span>›</span>장비 정비소</div>
 ${titleBlock('WORKSHOP / CRAFTING','장비 정비소 · 제작','원문에 존재하는 14개 레시피를 조회합니다. F-01/F-02 도면 개방은 개발용 fixture로만 적용합니다.')}
 ${currencyPanel()}
 <div class="info-band"><span>ⓘ</span> F-01/F-02의 일반 재료는 각 게이트의 자원 지점 탐색으로 얻습니다. 다른 등급 도면의 해금 규칙과 장비 효과는 별도로 보류합니다.</div>
 <section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">SOURCE RECIPE DATA</div><h2>제작 도면 · 14종</h2></div>${badge('원문 비용 / 재료','quiet')}</div>
 ${CRAFT_RECIPES.map(recipe=>{const open=DEV_FIXTURE.testBlueprints.includes(recipe.id),enough=canCraftEquipment(state,recipe.id);
  return `<div class="recipe-row"><div class="recipe-name"><span class="recipe-gate">${esc(recipe.id)}</span><div><h3>${esc(recipe.name)}</h3><p>${open?'DEV · 임시 도면 열람 허용':'도면 해금 조건 미정 / 제작 잠금'}</p></div></div><div class="recipe-materials">${recipe.materials.map(m=>{const owned=p.materials?.[m.name]??0;return `<span class="material-chip ${owned>=m.quantity?'satisfied':''}">${esc(m.name)} <strong>${fmt(owned)}/${m.quantity}</strong></span>`}).join('')}</div><div class="recipe-side"><strong>${fmt(recipe.cost)} G</strong><button class="btn btn-primary" data-action="equipment-propose" data-kind="craft" data-id="${recipe.id}" ${!enough?'disabled':''}>제작 신청</button></div></div>`;
 }).join('')}</section><a href="#/inventory" class="btn btn-secondary">인벤토리로 돌아가기 ↗</a>`,{active:'/facilities'});
}
function equipmentPage(){
 const p=state.player,items=p.equipment||[];
 const bySlot=slot=>items.find(x=>x.status==='EQUIPPED'&&x.equippedSlot===slot);
 const itemName=item=>CRAFT_RECIPES.find(r=>r.id===item.definitionId)?.name||item.definitionId;
 return page(`${titleBlock('HUNTER MANAGEMENT / EQUIPMENT','장비 관리','8개 장비 슬롯과 개별 ItemInstance를 관리합니다. F-01 장갑과 F-02 방패의 신규 확정 효과를 전투에 적용합니다. 다른 장비 효과는 원문 확인이 필요합니다.')}
 <div class="economy-shortcuts"><a href="#/inventory" class="btn btn-secondary">인벤토리 ↗</a><a href="#/craft" class="btn btn-secondary">장비 제작 ↗</a><a href="#/enhance" class="btn btn-primary">장비 강화 ↗</a></div>
 <section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">EQUIPMENT SLOTS</div><h2>장착 슬롯 · 8개</h2></div>${badge(`${items.filter(x=>x.status==='EQUIPPED').length}개 장착`,'quiet')}</div>
 <div class="equipment-slot-grid">${Object.entries(EQUIPMENT_SLOTS).map(([key,label])=>{const item=bySlot(key);return `<div class="equipment-slot"><small>${label}</small>${item?`<b>${esc(itemName(item))}</b><span class="item-id">${esc(item.id)}</span><button class="btn btn-secondary" data-action="equipment-propose" data-kind="unequip" data-id="${esc(item.id)}" ${p.activeExpeditionId?'disabled':''}>장착 해제</button>`:'<span class="muted">비어 있음</span>'}</div>`}).join('')}</div></section>
 <section class="panel economy-panel"><div class="panel-top"><div><div class="eyebrow">OWNED INSTANCES</div><h2>보관 장비</h2></div>${badge(`${items.length}개 소유`,'quiet')}</div>
 ${items.length?items.map(item=>{const slot=DEV_FIXTURE.testEquipmentSlots[item.definitionId],canEquip=item.status==='INVENTORY'&&!!slot&&!bySlot(slot)&&!p.activeExpeditionId;return `<div class="stock-row equipment-stock"><div><b>${esc(itemName(item))}${item.enhancement?` +${item.enhancement}`:''}</b><small>${esc(item.id)} · ${esc(item.status)} · ${slot?`${EQUIPMENT_SLOTS[slot]} (DEV 슬롯)`:'슬롯 미정'}</small><small>${item.definitionId==='F-01'?'장착 시 F-01 탐색 정상 성공률 +5%p · 강화 단계 추가 효과 미정':item.definitionId==='F-02'?'장착 시 F-02 방어 최종 HP 피해 -1 (최소 0) · 강화 단계 추가 효과 미정':'고유 효과·수치 원문 미확인 — 효과 미적용'}</small></div>${item.status==='INVENTORY'?`<button class="btn btn-primary" data-action="equipment-propose" data-kind="equip" data-id="${esc(item.id)}" ${!canEquip?'disabled':''}>${slot?'장착 신청':'장착 보류'}</button>`:badge(item.status==='EQUIPPED'?'장착 중':'사용 불가','quiet')}</div>`}).join(''):'<p class="stock-empty">소유한 제작 장비가 없습니다.</p>'}
 </section><div class="info-band"><span>ⓘ</span> 장착 시 다른 슬롯의 장비는 바뀌지 않습니다. 같은 슬롯에 장비가 있으면 먼저 해제해야 합니다. 두 F급 슬롯 매핑은 개발용입니다.</div>`,{active:'/hunter'});
}
function enhancementPage(){
 const p=state.player,items=p.equipment||[],rank=p.rank,stonePrice=ENHANCEMENT_STONE_PRICES[rank];
 const stoneKey=enhancementStoneKey(rank),stoneMax=Math.floor(availableGold(p)/stonePrice);
 const stoneQty=stoneMax>0?quantityFor(`stone:${rank}`,stoneMax):1;
 return page(`${titleBlock('WORKSHOP / ENHANCEMENT','장비 강화','원본 §9 설계안의 단계·비용을 표시합니다. 실패 시 골드와 일반 강화석 소비는 사용자 확정 규칙입니다.')}
 <div class="info-band"><span>ⓘ</span> +1~+3은 확정 성공, +4~+10은 표시된 확률로 판정합니다. 실패해도 장비 파괴·단계 하락은 없습니다. 같은 장비의 같은 목표 단계에서 실패할 때마다 다음 성공률이 +5%p씩 올라가며 최대 100%입니다. 성공하면 보정이 초기화됩니다. +10의 정예 재료 1개는 성공·실패 모두 매 시도마다 소비합니다. 강화비는 기본 비용과 등급 계수를 곱한 최종 금액에서 한 번 올림합니다. 강화 단계의 전투 효과는 미구현입니다.</div>
 ${currencyPanel()}
 <section class="panel economy-panel"><div class="panel-top"><h2>보유 장비 강화</h2>${badge(`${items.length}개 보유`,'quiet')}</div>
 ${items.length?items.map(item=>{
   let q;try{q=enhancementQuote(state,item.id)}catch(e){return `<div class="stock-row enhance-row"><div><b>${esc(item.definitionId)} +${item.enhancement||0}</b><small>${esc(e.message)}</small></div></div>`;}
   const name=CRAFT_RECIPES.find(x=>x.id===item.definitionId)?.name||item.definitionId;
   return `<div class="stock-row enhance-row"><div><b>${esc(name)} +${q.beforeLevel} → +${q.targetLevel}</b><small>성공률 ${q.rate}% (기본 ${q.baseRate}% + 실패 ${q.failureCount}회 보정 ${q.bonus}%p) · ${fmt(q.gold)} G · ${q.stones} 강화석${q.eliteMaterial?` · ${esc(q.eliteMaterial)} ×1`:''}</small><small>${q.errors.length?esc(q.errors.join(' ')):'실패 시 시도 비용 소비 · 단계 유지'}</small></div><button class="btn btn-primary" data-action="enhance-propose" data-id="${esc(item.id)}" ${q.ready?'':'disabled'}>강화 신청</button></div>`;
 }).join(''):'<p class="stock-empty">제작 또는 획득한 장비가 없습니다.</p>'}</section>
 <section class="panel economy-panel"><div class="panel-top"><h2>${esc(rank)}급 강화석</h2>${badge(`${fmt(p.materials?.[stoneKey]||0)}개 보유`,'quiet')}</div>
 <p>원본 §9 설계 가격: 1개 ${fmt(stonePrice)} G. +4 이상에서 사용합니다.</p>
 <div class="trade-actions">${stoneMax>0?quantityControls(`stone:${rank}`,stoneMax):'<span>골드 부족</span>'}<button class="btn btn-secondary" data-action="stone-propose" data-id="${esc(rank)}" ${stoneMax<1?'disabled':''}>${fmt(stonePrice*stoneQty)} G 구매</button></div></section>
 <section class="panel economy-panel"><div class="panel-top"><h2>강화 결과 기록</h2></div>
 ${(state.enhancementHistory||[]).length?state.enhancementHistory.slice().reverse().slice(0,20).map(x=>`<div class="stock-row"><div><b>${esc(x.itemInstanceId)} · ${x.success?'성공':'실패'}</b><small>+${x.beforeLevel} → +${x.afterLevel} · ${fmt(x.goldSpent)} G · 강화석 ${x.stonesSpent}개</small></div></div>`).join(''):'<p class="stock-empty">확정된 강화 결과가 없습니다.</p>'}</section>
 <div class="economy-shortcuts"><a href="#/equipment" class="btn btn-secondary">장비 관리 ↗</a><a href="#/craft" class="btn btn-secondary">장비 제작 ↗</a></div>`,{active:'/hunter'});
}
function enhancementModal(){
 const pending=ui.pendingEnhancement;if(!pending)return '';
 const item=state.player.equipment.find(x=>x.id===pending.id);
 if(!item)return '';
 const q=pending.quote;
 return `<div class="modal-backdrop"><div class="confirm-modal" role="dialog" aria-modal="true"><h2>장비 강화 확인</h2><p>${esc(item.definitionId)} +${q.beforeLevel} → +${q.targetLevel}<br>성공률 ${q.rate}% (기본 ${q.baseRate}% + 실패 ${q.failureCount}회 보정 ${q.bonus}%p) · ${fmt(q.gold)} G · 강화석 ${q.stones}개${q.eliteMaterial?` · ${esc(q.eliteMaterial)} ×1`:''}</p><p>${q.rate===100?'확정 성공입니다.':`실패해도 골드·일반 강화석${q.eliteMaterial?'·정예 재료':''}가 소비되고 장비 단계는 유지됩니다.`}</p><div class="modal-buttons"><button class="btn btn-secondary" data-action="enhance-cancel">취소</button><button class="btn btn-primary" data-action="enhance-confirm">강화 1회 실행</button></div></div></div>`;
}
function stoneModal(){
 const pending=ui.pendingStone;if(!pending)return '';
 const total=ENHANCEMENT_STONE_PRICES[pending.rank]*pending.quantity;
 return `<div class="modal-backdrop"><div class="confirm-modal" role="dialog" aria-modal="true"><h2>강화석 구매 확정</h2><p>${esc(pending.rank)}급 강화석 ×${pending.quantity} · ${fmt(total)} G</p><div class="modal-buttons"><button class="btn btn-secondary" data-action="stone-cancel">취소</button><button class="btn btn-primary" data-action="stone-confirm">구매 확정</button></div></div></div>`;
}
function skillPage(groupId='AT'){
 const group=SKILL_GROUPS.find(g=>g.id===groupId);
 if(!group)return missing('스킬 계열을 찾을 수 없습니다.','/skills/AT');
 const p=state.player,learned=new Set(p.learnedSkills||[]);
 const rows=SKILL_CATALOG.filter(s=>s.group===groupId);
 return page(`${titleBlock('HUNTER MANAGEMENT / SKILL TREE','전투 기술 관리','5계열 × 9종 = 45종. 습득 결과는 저장되며 전투 중 포인트 사용은 불가합니다.',badge(`잔여 ${p.sp} SP`,'available'))}
 <div class="skills-overview"><div><small>보유 SP</small><strong>${p.sp}</strong></div><div><small>습득 기술</small><strong>${learned.size}<span> / 45</span></strong></div><div><small>등급 / 레벨</small><strong>${p.rank}<span> · Lv.${p.level}</span></strong></div></div>
 <nav class="skill-tabs" aria-label="기술 계열">${SKILL_GROUPS.map(g=>`<a href="#/skills/${g.id}" class="${g.id===groupId?'selected':''}" ${g.id===groupId?'aria-current="page"':''}><b>${g.name}</b><span>${g.id} · ${SKILL_CATALOG.filter(x=>x.group===g.id&&learned.has(x.id)).length}/9</span></a>`).join('')}</nav>
 <section class="panel skill-section"><div class="panel-top"><div><div class="eyebrow">${group.id} / SOURCE CATALOG</div><h2>${group.name}</h2></div><small>${group.summary}</small></div>
 <div class="skill-list">${rows.map(s=>{
   const owned=learned.has(s.id),can=canLearnSkill(state,s.id),isFixture=DEV_SKILL_FIXTURE.learnableIds.includes(s.id);
   const label=owned?'습득 완료':!s.sourceKnown?'원문 누락':isFixture?'개발용 습득 가능':'규칙 미정 · 조회 전용';
   return `<article class="skill-entry ${owned?'owned':''} ${!s.sourceKnown?'unknown':''}" id="skill-${s.id}">
    <div class="skill-code"><b>${s.id}</b><span>${s.sourceKnown?'◆':'?'}</span></div>
    <div class="skill-content"><div class="skill-title"><h3>${esc(s.name||'원문 확인 필요')}</h3>${badge(label,owned?'available':can?'running':'quiet')}</div>
      <p>${esc(s.description||'원본 인수인계에 스킬명·효과가 남아 있지 않습니다.')}</p>
      <div class="skill-meta">${s.prerequisite?`<span>선행 연결: <b>${s.prerequisite}</b></span>`:'<span>확인된 선행 연결 없음</span>'}
      <span>${isFixture?'임시 비용 1 SP (개발용)':'개별 비용/해금 조건 미정'}</span></div></div>
    <div class="skill-controls">${owned?'<span class="skill-owned">✓ 습득</span>':isFixture?`<button type="button" class="btn btn-primary" data-action="skill-propose" data-id="${s.id}" ${!can?'disabled':''}>습득 확인 →</button>`:'<button type="button" class="btn btn-secondary" disabled>습득 보류</button>'}</div></article>`;
 }).join('')}</div></section>
 <div class="info-band"><span>ⓘ</span> EX-01과 TC-01만 개발용 1SP 비용으로 습득 검증할 수 있습니다. 정확한 개별 SP 가격은 미정이며, 두 스킬의 +4%p 효과만 실제 탐색/전술 판정에 적용됩니다. 나머지 기술은 정식 습득·사용이 보류됩니다.</div>
 ${p.skillHistory?.length?`<section class="panel skill-history"><div class="panel-top"><h2>습득 이력</h2><small>확정 저장 내역</small></div>${p.skillHistory.slice().reverse().map(h=>`<div class="stock-row"><div><b>${esc(SKILLS_BY_ID[h.skillId]?.name||h.skillId)} (${esc(h.skillId)})</b><small>개발용 비용 ${h.cost} SP · 저장 ID ${esc(h.commandId)}</small></div>${badge('확정','available')}</div>`).join('')}</section>`:''}`,{active:'/hunter'});
}
function skillModal(){
 const pending=ui.pendingSkill;if(!pending)return '';
 const skill=SKILLS_BY_ID[pending.id];if(!skill)return '';
 return `<div class="modal-backdrop"><div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="skillModalTitle"><div class="modal-mark">✧</div><h2 id="skillModalTitle">전투 기술 습득 확인</h2><p><strong>${esc(skill.id)} · ${esc(skill.name)}</strong><br>${esc(skill.description)}</p><p class="economy-footnote">개발용 비용: ${DEV_SKILL_FIXTURE.learningCost} SP (원문에서 개별 습득 비용 미정)<br>현재 ${state.player.sp} SP → 확정 시 ${state.player.sp-DEV_SKILL_FIXTURE.learningCost} SP. 취소 시 차감 없음.</p><div class="modal-buttons"><button type="button" class="btn btn-secondary" data-action="skill-cancel">취소</button><button type="button" class="btn btn-primary" data-action="skill-confirm">개발용 습득 확정</button></div></div></div>`;
}

function equipmentModal(){
 const q=ui.pendingEquipment;if(!q)return '';
 const recipe=q.kind==='craft'?CRAFT_RECIPES.find(r=>r.id===q.id):null;
 const item=q.kind!=='craft'?state.player.equipment?.find(i=>i.id===q.id):null;
 const name=recipe?.name||CRAFT_RECIPES.find(r=>r.id===item?.definitionId)?.name||'장비';
 const desc=recipe?`필요 골드 ${fmt(recipe.cost)} G · ${recipe.materials.map(m=>`${esc(m.name)} ×${m.quantity}`).join(' / ')}`:
   `고유 장비 ID ${esc(item?.id||q.id)} · ${q.kind==='equip'?'장착':'해제'} 후 상태 저장`;
 return `<div class="modal-backdrop"><div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="equipmentTitle"><div class="modal-mark">⚒</div><h2 id="equipmentTitle">${q.kind==='craft'?'장비 제작':q.kind==='equip'?'장비 장착':'장착 해제'} 확정</h2><p><strong>${esc(name)}</strong><br>${desc}</p><p class="economy-footnote">확정 시 단일 저장 상태로 반영하며 같은 명령은 중복 처리되지 않습니다. 취소하면 어떤 자산도 변경되지 않습니다.</p><div class="modal-buttons"><button class="btn btn-secondary" data-action="equipment-cancel">취소</button><button class="btn btn-primary" data-action="equipment-confirm">${q.kind==='craft'?'제작 확정':'변경 확정'}</button></div></div></div>`;
}
function tradeModal(){
 const p=ui.pendingTrade;if(!p)return '';
 const isBuy=p.kind==='buy',name=isBuy?CONSUMABLES[p.id]?.name:p.id;
 const unit=isBuy?CONSUMABLES[p.id]?.price:MATERIAL_BUYBACK[p.id];
 const total=unit*p.quantity;
 return `<div class="modal-backdrop"><div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="tradeTitle"><div class="modal-mark">₲</div><h2 id="tradeTitle">${isBuy?'보급품 구매':'부산물 판매'} 확정</h2><p><strong>${esc(name)} ×${fmt(p.quantity)}</strong><br>단가 ${fmt(unit)} G · 총 ${fmt(total)} G<br>현재 보유 ${fmt(state.player.gold)} G</p><p class="economy-footnote">취소하면 어떠한 자산도 변경되지 않습니다. 확정 시 저장된 거래 결과를 기준으로 처리합니다.</p><div class="modal-buttons"><button class="btn btn-secondary" data-action="trade-cancel">취소</button><button class="btn btn-primary" data-action="trade-confirm">${isBuy?'구매 확정':'매입 확정'}</button></div></div></div>`;
}
function recordsPage(){
 const rows=state.history.map(id=>state.expeditions[id]).filter(e=>e?.settlement);
 return page(`${titleBlock('ARCHIVE / EXPEDITION HISTORY','공략 기록관','실제 저장된 Expedition 및 ActionResult로 구성한 기록입니다. 조회만으로 상태가 변하지 않습니다.',badge(`${rows.length}건 기록`,'quiet'))}
 <section class="panel record-list"><div class="panel-top"><h2>확정 공략 이력</h2><small>저장된 종료 순서</small></div>${rows.length?rows.map(e=>{const g=state.gateTemplates.find(t=>t.id===e.gateTemplateId);return `<a class="record-row" href="#/record/${e.id}"><div><b>${esc(g?.name||e.gateTemplateId)}</b><small>${esc(e.gateInstanceId)} · ${e.actionResults.length}번 행동 · ${worldClock(e.endedMinute).label} 종료</small></div><span>${badge(endLabels[e.settlement.reason],e.settlement.reason==='SUCCESS'?'available':'warning')}<strong>${fmt(e.settlement.gold)} G · ${e.settlement.xp} XP</strong></span><i>→</i></a>`}).join(''):'<div class="record-empty">아직 종료된 공략이 없습니다. <a href="#/gates">게이트 관리로 이동 →</a></div>'}</section>`,{active:'/records'});
}
function recordDetail(id){
 const e=state.expeditions[id];if(!e?.settlement)return missing('공략 기록을 찾을 수 없습니다.','/records');
 const gate=state.gateTemplates.find(t=>t.id===e.gateTemplateId);
 return page(`<div class="breadcrumb"><a href="#/records">공략 기록관</a><span>›</span>${esc(gate?.name||e.gateTemplateId)}</div>
 ${titleBlock('ARCHIVE / ACTION RESULTS',gate?.name||e.gateTemplateId,`공략 ${e.gateInstanceId} · 총 ${e.actionResults.length}개 행동 기록`,badge(endLabels[e.endReason],e.endReason==='SUCCESS'?'available':'warning'))}
 <section class="panel record-summary"><div><small>확정 결과</small><strong>${esc(endLabels[e.endReason])}</strong></div><div><small>최종 폐쇄율 / 위험도</small><strong>${e.closure}% / ${e.danger}%</strong></div><div><small>정산금 / 경험치</small><strong>${e.settlement.gold} G / ${e.settlement.xp} XP</strong></div><div><small>전리품</small><strong>${e.settlement.loot.length?e.settlement.loot.map(x=>`${esc(x.id)} ×${x.quantity}`).join(', '):'없음'}</strong></div></section>
 <section class="panel record-events"><div class="panel-top"><h2>확정된 행동 로그</h2><a class="text-link" href="#/result/${e.id}">정산 결과 열람 ↗</a></div>${e.actionResults.map(r=>`<article class="record-event"><div><b>TURN ${String(r.turn).padStart(2,'0')}</b><span>${esc(r.scene)}</span>${badge(resultLabels[r.outcome],r.outcome==='failure'?'warning':'available')}</div><h3>${esc(r.candidate.title)}</h3><p>${r.roll===null?`회복약 ${esc(CONSUMABLES[r.itemUsed]?.name||r.itemUsed)} · 회복 +${r.restored}`:`성공률 ${r.probabilities.normal}% · 주사위 ${r.roll.toFixed(2)} / 100`} · 폐쇄율 ${r.before.closure}% → ${r.after.closure}% · 위험도 ${r.before.danger}% → ${r.after.danger}% · HP ${r.before.hp??'—'} → ${r.after.hp??'—'} · ${r.elapsedMinutes}분</p>${r.resourceNode?`<small>◇ 자원 지점 ${r.resourceNode.index}: ${r.resourceNode.items.map(x=>`${esc(x.id)} ×${x.quantity}`).join(', ')}</small>`:''}${r.bossActivated?'<small>◆ 정예 보스 등장</small>':''}${r.bossResponse?'<small>◆ 수압 분출 대응 성공</small>':''}</article>`).join('')||'<div class="record-empty">확정된 행동이 없습니다.</div>'}</section>`,{active:'/records'});
}
function missing(message,path){return page(`<div class="not-found"><div class="big-symbol">◇</div><h1>${esc(message)}</h1><p>대상 ID를 확인하거나 목록 화면으로 돌아가세요.</p><a href="#${path}" class="btn btn-primary">목록으로 이동 →</a></div>`,{active:path});}
function soonPage(){const types={business:'협회 업무',facilities:'협회 시설',society:'헌터 사회',records:'기록관',menu:'전체 메뉴'};
 const key=viewPath().split('/').at(-1);
 return page(`${titleBlock('FUTURE DEVELOPMENT / M1+ ',types[key]||'후속 기능','원본 기획은 유지되며, 현재 개발 빌드에서는 이 메뉴의 실행 기능을 활성화하지 않습니다.')}
 <div class="panel placeholder"><div class="big-symbol">◇</div><h2>다음 구현 단계에서 제공됩니다.</h2><p>현재 빌드에서는 헌터 등록, F-01/F-02 공략, 정산, AP 성장, 기록관과 저장·재개를 플레이할 수 있습니다.</p><a href="#/gates" class="btn btn-primary">게이트 관리로 이동 →</a></div>`,{active:''});}
function fullMenuPage(){
 const pages=[['/home','협회 홈'],['/gates','게이트 발생 현황'],['/hunter','헌터 기본 정보'],['/inventory','인벤토리'],['/equipment','장비 관리'],['/enhance','장비 강화'],['/skills/AT','전투 기술 45종'],['/craft','장비 정비소'],['/facilities','협회 시설'],['/shop','협회 보급소'],['/buyback','부산물 매입소'],['/records','공략 기록관']];
 return page(`${titleBlock('ASSOCIATION / MENU','전체 메뉴','현재 개발 빌드에서 실제 연결된 화면을 모았습니다.')}
 <div class="panel full-menu-list">${pages.map(([path,name])=>`<a class="stock-row" href="#${path}"><b>${name}</b><span>→</span></a>`).join('')}</div>
 <div class="info-band"><span>ⓘ</span> NPC·경매·의뢰·승급 심사는 아직 구현되지 않았습니다. 장비 효과는 F-01 장갑·F-02 방패만 신규 확정 규칙으로 적용합니다.</div>`,{active:''});
}
function lockedPage(){return `<div class="locked-wrapper"><div class="panel locked-card"><div class="big-symbol">⌁</div><h1>다른 탭에서 실행 중입니다.</h1><p>중복 명령 및 저장 충돌을 막기 위해 현재 개발 빌드는 한 탭에서만 조작할 수 있습니다.<br/>기존 게임 탭을 닫은 뒤 다시 시도하세요.</p><button class="btn btn-primary" data-action="retry-lock">접속 다시 시도 →</button></div></div>`;}
function render(){
  if(ui.loadError){app.innerHTML=`<div class="locked-wrapper"><section class="panel locked-card"><h1>저장 데이터 접근 오류</h1><p>${esc(ui.loadError)}</p><small>데이터를 자동 초기화하지 않았습니다. 기존 저장 내용은 유지됩니다.</small></section></div>`;return;}
  if(ui.locked){app.innerHTML=lockedPage();return;}
  if(!state)return;
  const path=viewPath();
  if(!state.player){app.innerHTML=registration();document.body.classList.remove('is-combat');return;}
  document.body.classList.toggle('is-combat',path.startsWith('/expedition/') && state.expeditions[path.split('/')[2]]?.status==='ACTIVE');
  if(path==='/home'||path==='/')app.innerHTML=home();
  else if(path==='/gates')app.innerHTML=gatesPage();
  else if(path.startsWith('/gate/'))app.innerHTML=gateDetail(path.split('/')[2]);
  else if(path.startsWith('/prepare/'))app.innerHTML=gateDetail(path.split('/')[2],true);
  else if(path.startsWith('/expedition/'))app.innerHTML=combat(path.split('/')[2]);
  else if(path.startsWith('/result/'))app.innerHTML=resultPage(path.split('/')[2]);
  else if(path==='/hunter')app.innerHTML=hunterPage();
  else if(path==='/skills')app.innerHTML=skillPage('AT');
  else if(path.startsWith('/skills/'))app.innerHTML=skillPage(path.split('/')[2]);
  else if(path==='/inventory')app.innerHTML=inventoryPage();
  else if(path==='/equipment')app.innerHTML=equipmentPage();
  else if(path==='/enhance')app.innerHTML=enhancementPage();
  else if(path==='/craft')app.innerHTML=craftPage();
  else if(path==='/facilities')app.innerHTML=facilitiesPage();
   else if(path==='/infirmary')app.innerHTML=infirmaryPage();
  else if(path==='/shop')app.innerHTML=shopPage();
  else if(path==='/buyback')app.innerHTML=buybackPage();
  else if(path==='/records')app.innerHTML=recordsPage();
  else if(path.startsWith('/record/'))app.innerHTML=recordDetail(path.split('/')[2]);
  else if(path==='/soon/menu')app.innerHTML=fullMenuPage();
  else if(path.startsWith('/soon/'))app.innerHTML=soonPage();
  else app.innerHTML=missing('요청한 페이지가 없습니다.','/home');
}
app.addEventListener('input',e=>{if(e.target.id==='treatmentMinutes'){ui.treatmentMinutes=e.target.value;return;}if(e.target.id==='hunterName'){ui.name=e.target.value;
  const button=app.querySelector('[data-action="register"]');
  if(button)button.disabled=!ui.name.trim()||Object.values(ui.alloc).reduce((a,b)=>a+b,0)!==3;
}});
app.addEventListener('click',e=>{
  const el=e.target.closest('[data-action]');if(!el)return;
  const action=el.dataset.action,id=el.dataset.id;
  if(action==='clear-toast'){ui.toast=null;render();return;}
   if(action==='treatment-quick'){ui.treatmentMinutes=el.dataset.minutes;render();return;}
   if(action==='treatment-start'){const minutes=Number(ui.treatmentMinutes);if(dispatchCommit(s=>startTreatment(s,minutes,newCommand())))ui.treatmentMinutes='';return;}
   if(action==='treatment-stop'){dispatchCommit(s=>stopTreatment(s,newCommand()));return;}
   if(action==='inventory-recovery'){const result=dispatchCommit(s=>useInventoryRecoveryItem(s,id,newCommand()));if(result){ui.toast=`${CONSUMABLES[id].name} 사용 · ${result.restored} 회복`;render();}return;}
  if(action==='retry-lock'){if(acquireLease()){try{state=readState();render();}catch(err){ui.loadError=err.message;render();}}return;}
  if(ui.locked)return;
  if(action==='skill-propose'){
    if(!canLearnSkill(state,id))return;
    ui.pendingSkill={id,commandId:newCommand()};render();return;
  }
  if(action==='skill-cancel'){ui.pendingSkill=null;render();return;}
  if(action==='skill-confirm'){
    const pending=ui.pendingSkill;if(!pending)return;
    const answer=dispatchCommit(s=>learnSkill(s,pending.id,pending.commandId));
    if(answer){ui.pendingSkill=null;ui.toast=`${SKILLS_BY_ID[pending.id].name} 습득 확정 (개발용)`;render();}
    return;
  }
  if(action==='equipment-propose'){
    if(!['craft','equip','unequip'].includes(el.dataset.kind))return;
    ui.pendingEquipment={kind:el.dataset.kind,id,commandId:newCommand()};render();return;
  }
  if(action==='equipment-cancel'){ui.pendingEquipment=null;render();return;}
  if(action==='equipment-confirm'){
    const pending=ui.pendingEquipment;if(!pending)return;
    const answer=dispatchCommit(s=>pending.kind==='craft'
      ?craftEquipment(s,pending.id,pending.commandId)
      :pending.kind==='equip'?equipEquipment(s,pending.id,pending.commandId)
      :unequipEquipment(s,pending.id,pending.commandId));
    if(answer){ui.pendingEquipment=null;ui.toast=`장비 ${pending.kind==='craft'?'제작':pending.kind==='equip'?'장착':'해제'} 확정`;render();}
    return;
  }
  if(action==='enhance-propose'){
    const quote=enhancementQuote(state,id);
    if(!quote.ready)return;
    ui.pendingEnhancement={id,beforeLevel:quote.beforeLevel,failureCount:quote.failureCount,quote,commandId:newCommand()};render();return;
  }
  if(action==='enhance-cancel'){ui.pendingEnhancement=null;render();return;}
  if(action==='enhance-confirm'){
    const pending=ui.pendingEnhancement;if(!pending)return;
    const result=dispatchCommit(s=>enhanceEquipment(s,pending.id,pending.commandId,{expectedLevel:pending.beforeLevel,expectedFailureCount:pending.failureCount}));
    if(result){ui.pendingEnhancement=null;ui.toast=result.success?'강화 성공':'강화 실패 · 시도 비용 소비';render();}
    return;
  }
  if(action==='stone-propose'){
    const rank=id,price=ENHANCEMENT_STONE_PRICES[rank],max=Math.floor(availableGold(state.player)/price);
    const quantity=quantityFor(`stone:${rank}`,max);
    if(!quantity||!Number.isSafeInteger(quantity))return;
    ui.pendingStone={rank,quantity,commandId:newCommand()};render();return;
  }
  if(action==='stone-cancel'){ui.pendingStone=null;render();return;}
  if(action==='stone-confirm'){
    const pending=ui.pendingStone;if(!pending)return;
    const result=dispatchCommit(s=>purchaseEnhancementStones(s,pending.rank,pending.quantity,pending.commandId));
    if(result){ui.pendingStone=null;ui.toast=`강화석 ${result.quantity}개 구매 확정`;render();}
    return;
  }
  if(action==='trade-minus'||action==='trade-plus'){
    const key=el.dataset.key,max=Number(el.dataset.max);
    const q=quantityFor(key,max)+(action==='trade-plus'?1:-1);
    if(Number.isSafeInteger(max)&&max>0&&q>=1&&q<=max){ui.tradeQty[key]=q;render();}
    return;
  }
  if(action==='trade-propose'){
    const kind=el.dataset.kind;
    if(kind!=='buy'&&kind!=='sell')return;
    const itemId=id,qty=quantityFor(`${kind}:${itemId}`,kind==='buy'
      ?Math.floor(availableGold(state.player)/(CONSUMABLES[itemId]?.price||Infinity))
      :(state.player.materials?.[itemId]||0));
    if(!qty||!Number.isSafeInteger(qty))return;
    ui.pendingTrade={kind,id:itemId,quantity:qty,commandId:newCommand()};render();return;
  }
  if(action==='trade-cancel'){ui.pendingTrade=null;render();return;}
  if(action==='trade-confirm'){
    const pending=ui.pendingTrade;if(!pending)return;
    const answer=dispatchCommit(s=>pending.kind==='buy'
      ?purchaseConsumable(s,pending.id,pending.quantity,pending.commandId)
      :sellMaterial(s,pending.id,pending.quantity,pending.commandId));
    if(answer){ui.pendingTrade=null;ui.toast=`확정: ${pending.kind==='buy'?'구매':'매입'} ${pending.quantity}개 · ${fmt(answer.total)} G`;render();}
    return;
  }
  if(action==='pause-world'){
    const answer=dispatchCommit(s=>{s.world.paused=!s.world.paused;return {paused:s.world.paused};});
    if(answer)clockAnchor=performance.now();
    return;
  }
  if(action==='stat-plus'||action==='stat-minus'){
    const key=el.dataset.key,delta=action==='stat-plus'?1:-1;
    const value=ui.alloc[key]+delta,total=Object.values(ui.alloc).reduce((a,b)=>a+b,0)+delta;
    if(value>=0&&value<=2&&total<=3&&total>=0){const input=document.querySelector('#hunterName');if(input)ui.name=input.value;ui.alloc[key]=value;render();}
    return;
  }
  if(action==='ap-plus'||action==='ap-minus'){
    const key=el.dataset.key,delta=action==='ap-plus'?1:-1;
    const next=(ui.stagedAP[key]||0)+delta;
    const total=STAT_KEYS.reduce((n,k)=>n+(ui.stagedAP[k]||0),0)+delta;
    if(STAT_KEYS.includes(key)&&next>=0&&state.player.stats[key]+next<=STAT_CAPS[state.player.rank]&&total<=state.player.unspentAP){ui.stagedAP[key]=next;render();}
    return;
  }
  if(action==='ap-confirm'){
    const answer=dispatchCommit(s=>allocateStats(s,{...ui.stagedAP},newCommand()));
    if(answer){ui.stagedAP={};render();}return;
  }
  if(action==='register'){
    const answer=dispatchCommit(s=>registerHunter(s,{name:ui.name,allocations:ui.alloc},newCommand()));
    if(answer)goto('/home');return;
  }
  if(action==='prepare'){goto(`/prepare/${id}`);return;}
  if(action==='start'){
    const answer=dispatchCommit(s=>startExpedition(s,id,newCommand()));
    if(answer){ui.selected=null;goto(`/expedition/${answer.expeditionId}`);}return;
  }
  if(action==='select-card'){ui.selected=id;render();return;}
  if(action==='execute'){
    const expId=viewPath().split('/')[2];if(!ui.selected)return;
    if(state.expeditions[expId]?.candidates.find(c=>c.id===ui.selected)?.type==='recovery'){
      ui.pendingRecovery={expId,commandId:newCommand()};render();return;
    }
    const answer=dispatchCommit(s=>executeAction(s,expId,ui.selected,newCommand()));
    if(answer){ui.selected=null; if(answer.endReason)goto(`/result/${expId}`);else render();}return;
  }
  if(action==='recovery-cancel'){ui.pendingRecovery=null;render();return;}
  if(action==='recovery-confirm'){
    const pending=ui.pendingRecovery;if(!pending)return;
    const answer=dispatchCommit(s=>useRecoveryItem(s,pending.expId,id,pending.commandId));
    if(answer){ui.pendingRecovery=null;ui.selected=null;if(answer.endReason)goto(`/result/${pending.expId}`);else render();}return;
  }
  if(action==='show-retreat'){ui.showRetreatConfirm=true;render();return;}
  if(action==='cancel-retreat'){ui.showRetreatConfirm=false;render();return;}
  if(action==='confirm-retreat'){
    const answer=dispatchCommit(s=>retreatExpedition(s,id,newCommand()));
    if(answer){ui.showRetreatConfirm=false;ui.selected=null;goto(`/result/${id}`);}return;
  }
});
window.addEventListener('hashchange',()=>{ui.selected=null;ui.showRetreatConfirm=false;ui.pendingTrade=null;ui.pendingEquipment=null;ui.pendingSkill=null;ui.pendingRecovery=null;render();});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){doClock();releaseLease();ui.locked=true;}
 else{if(acquireLease()){try{state=readState();ui.loadError=null;}catch(e){ui.loadError=e.message;}}clockAnchor=performance.now();render();}
});
window.addEventListener('pagehide',()=>{doClock();releaseLease();});
setInterval(()=>{
  if(document.hidden)return;
  refreshLease();doClock();
  if(shouldRerender){shouldRerender=false;render();}
},1000);
try{
  if(!document.hidden && acquireLease()) state=readState();
  render();
}catch(e){ui.loadError=e.message;render();}
