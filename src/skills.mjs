/** Skill catalog. Unknown effects remain unavailable in this test build. */
export const SKILL_GROUPS = Object.freeze([
  {id:'AT',name:'돌파',summary:'공격 및 약점 공략'},
  {id:'GD',name:'수호',summary:'방어 및 피해 억제'},
  {id:'EX',name:'탐사',summary:'탐색과 전리품 확보'},
  {id:'TC',name:'지휘',summary:'전술, 상황 판단, 연계 강화'},
  {id:'SP',name:'지원',summary:'회복과 상태 이상 관리'},
]);
const rows = {
 AT:[
  ['정밀 타격','공격형 기초 스킬. 세부 수치 원문 확인 필요'],
  ['속공 / 빠른 일격','공격 행동 해금형. 원문 명칭 불일치'],
  ['약점 포착','자신의 탐색 이후 공격 관련 조건부 효과. 지속·수치 미정'],
  ['급소 찌르기','약점이 있는 적에게 사용. 성공 시 폐쇄율 +12~16'],
  ['연속 압박','자신의 공격 2회 연속 성공과 관련된 조건부 효과'],
  ['노출된 틈','후속 공격자가 보유해야 하는 연계 강화 스킬'],
  ['파쇄 일격','강적·보스·높은 방어력 대상. 성공 시 폐쇄율 +17~22, 실패 시 위험도 +10'],
  [null,null],
  ['노림수의 완성','전술 → 공격 연계의 추가 폐쇄율 +3'],
 ],
 GD:[
  ['견고한 자세','기본 방어 특화 상시 스킬. 정확한 수치 미정'],
  ['정면 차단','공격·환경 피해 방어 행동 해금. 예시: 폐쇄율 +1, 위험도 -7, 동료 보호'],
  [null,null],
  ['보호 개입','위험에 처한 파티원을 보호하는 행동'],
  ['역습 태세','선행 방어자가 보유하는 연계 강화 효과'],
  [null,null],
  ['철벽 진형','다수·광역 공격에 대응하는 방어 행동'],
  ['정확한 받아내기','후속 방어자가 보유하는 연계 강화 효과'],
  [null,null],
 ],
 EX:[
  ['관찰안','탐색 행동 성공률 +4%p'],
  ['흔적 추적','행동 해금. 성공 시 폐쇄율 +4~6, 숨겨진 경로 발견 판정 1회'],
  ['신속 채집','탐색 성공으로 일반 부산물 획득 시 같은 분류 재료 +1개, 게이트당 최대 2회'],
  ['마력 지질 분석','행동 해금. 성공 시 폐쇄율 +2, 숨겨진 채집 지점 발견, 장면당 1회'],
  ['안전 확보','탐색 → 방어 연계로 물품 확보 성공 시 일반 재료 +1개, 게이트당 1회'],
  ['경로 파악','방어 → 탐색 연계 성공 시 희귀 전리품 발견 확률 +5%p, 게이트당 1회'],
  ['심층 탐사','행동 해금. 폐쇄율 +0~3, 희귀 발견 판정 +10%p, 실패 시 위험도 +8, 게이트당 1회'],
  ['유물 감식','미감정 아이템 1개의 감정 결과를 추가 1회 산출하고 둘 중 선택 가능'],
  ['광맥 지도','탐색 → 전술 연계 성공 시 위험도 -3 추가, 광맥 게이트라면 광석 +1 가능, 게이트당 1회'],
 ],
 TC:[
  ['상황 판단','전술 행동 성공률 +4%p'],
  ['동선 예측','행동 해금. 성공 시 위험도 -3, 다음 행동자 성공률 +6%p'],
  ['정확한 지시','전술 성공 후 다음 행동 실패의 피해·위험도 증가량 20% 감소, 장면당 1회'],
  ['표적 지정','행동 해금. 성공 시 폐쇄율 +4, 다음 공격 성공률 +10%p'],
  ['유연한 전환','전술 성공 후 자신의 다음 후보에서 서로 다른 행동 유형 최소 2개 보정, 장면당 1회'],
  ['연계 해석','다른 파티원 간 행동 연계 성공 시 폐쇄율 +2, 장면당 1회'],
  ['전장 재구성','행동 해금. 성공 시 위험도 -9, 다음 행동자 성공률 +8%p, 장면당 1회'],
  ['작전 설계','전술 → 공격 연계 성공 시 폐쇄율 +3 추가, 장면당 1회'],
  ['판세 장악','전술 행동 대성공 시 폐쇄율 +5, 다음 행동자 성공률 +5%p, 장면당 1회'],
 ],
 SP:[
  ['응급 처치','행동 해금. 대상 최대 HP 12~18% 회복, MP 8'],
  ['정화 처치','행동 해금. 일반 상태 이상 1개 제거, HP 5% 회복, MP 10'],
  ['응급 판단','회복 행동 성공률 +4%p'],
  ['지속 회복','회복 성공 시 다음 장면 진입 때 HP 4% 추가 회복, 장면당 1회'],
  ['방어 지원','회복 → 방어 연계 성공 시 후속 방어 피해량 15% 추가 감소'],
  ['효율 치료','회복 스킬 MP 소모량 20% 감소, 최소 1'],
  ['단체 치료','행동 해금. 파티 전원 최대 HP 8~12% 회복, MP 22, 장면당 1회'],
  ['긴급 소생','자신이 생존 중 HP 0인 파티원 1명 HP 20% 소생, MP 18, 게이트당 1회'],
  ['마력 정화진','행동 해금. 일반 상태 이상 1개 제거, 위험도 -6, MP 18, 장면당 1회'],
 ],
};
// Source §4 explicitly states these three trees' "기본 연결".
const branches = {EX:[[1,4,7],[2,5,8],[3,6,9]],TC:[[1,4,7],[2,5,8],[3,6,9]],SP:[[1,4,7],[2,5,8],[3,6,9]]};
const prerequisite = (group,n)=> {
 const path=branches[group]?.find(b=>b.includes(n));
 const position=path?.indexOf(n)??0;
 return path&&position>0?`${group}-${String(path[position-1]).padStart(2,'0')}`:null;
};
export const SKILL_CATALOG = Object.freeze(SKILL_GROUPS.flatMap(group=>rows[group.id].map(([name,description],i)=>Object.freeze({
  id:`${group.id}-${String(i+1).padStart(2,'0')}`,
  group:group.id,name,description,
  sourceKnown:Boolean(name),
  prerequisite:prerequisite(group.id,i+1),
  // Cost / exact rank prerequisite for a *specific* skill not verified in source.
  cost:null,requiredRank:null,
}))));
export const SKILLS_BY_ID=Object.freeze(Object.fromEntries(SKILL_CATALOG.map(s=>[s.id,s])));
/** Explicitly isolated test-only policy. These are NOT source-confirmed SP prices.
 * Two passive skills have a source-confirmed +4%p effect that can be exercised.
 */
export const DEV_SKILL_FIXTURE = Object.freeze({
  label:'개발용 SP 습득 검증 · 개별 스킬 비용/등급 조건 미확정',
  learningCost:1,
  learnableIds:Object.freeze(['EX-01','TC-01']),
});
