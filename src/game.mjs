import { SKILL_CATALOG, SKILLS_BY_ID, SKILL_GROUPS, DEV_SKILL_FIXTURE } from './skills.mjs';
export { SKILL_CATALOG, SKILLS_BY_ID, SKILL_GROUPS, DEV_SKILL_FIXTURE } from './skills.mjs';
/** F-rank test build. Development fixtures are not permanent rules. */
export const STAT_KEYS = ['STR', 'VIT', 'AGI', 'PER', 'INT', 'MAG'];
export const STAT_LABELS = { STR:'근력', VIT:'체력', AGI:'민첩', PER:'감각', INT:'판단', MAG:'마력' };
export const F_RANK_RULES = Object.freeze({
  statPairs:{attack:['STR','AGI'],defense:['VIT','STR'],explore:['PER','INT'],tactics:['INT','PER']},
  failureRisk:{attack:12,defense:10,explore:10,tactics:10},
  partialRisk:3,tacticalNextBonus:5,bossResponseMinimum:'partial',
  damage:{attack:[5,9,15],explore:[2,5,9],tactics:[4,8,13],defense:[1,3,6]},
  f02DamageBonus:1,recoveryMinutes:3,recoveryRisk:5,
  spawnInterval:30,spawn:{'F-01':{chance:.6,maxOpen:3,guaranteeAfterMisses:3},'F-02':{chance:.25,maxOpen:1,guaranteeAfterMisses:4}},
});
export const F_RESOURCE_NODES = Object.freeze({
  'F-01':[[{id:'금속 파편',quantity:1}],[{id:'금속 파편',quantity:1},{id:'고철 마석',quantity:1}]],
  'F-02':[[{id:'짐승 가죽',quantity:2},{id:'응고 점액',quantity:1}],[{id:'짐승 가죽',quantity:2},{id:'응고 점액',quantity:2}]],
});
export const DEV_FIXTURE = Object.freeze({
  label: 'MVP-0 개발용 임시값 · 최종 게임 밸런스 아님',
  initialGold: 200, // legacy provisional design
  startingWorldMinute: 9*60, // starting time not specified in original
  gateInstances: 3, // test seeds; NOT gate spawn policy
  // Missing from original: basic-action stat pairings, failure consequences,
  // integer rounding on partial success and numeric tactical next-turn bonus.
  statPairs: F_RANK_RULES.statPairs,
  failureRisk: F_RANK_RULES.failureRisk,
  partialRisk: F_RANK_RULES.partialRisk,
  tacticalNextBonus: F_RANK_RULES.tacticalNextBonus,
  bossResponseMinimum: F_RANK_RULES.bossResponseMinimum,
  // Blueprint access ONLY in this development build. Actual unlock rules are P0 unknown.
  testBlueprints: ['F-01','F-02'],
  // Mapping obvious F-series equipment categories into 8 slots; no stat buffs assumed.
  testEquipmentSlots: {'F-01':'GLOVES','F-02':'OFFHAND'},
});

// Existing association shop / material-buyback values from MASTER v2 §7.4/§7.7.
// Buying an item does not implicitly determine its *use* rules: non-combat item
// use, combat action-slot/time consumption, and damage are still unresolved.
export const CONSUMABLES = Object.freeze({
  'hp-f': Object.freeze({id:'hp-f',name:'F급 HP 회복약',rank:'F',kind:'HP',restore:35,price:25}),
  'mp-f': Object.freeze({id:'mp-f',name:'F급 MP 회복약',rank:'F',kind:'MP',restore:15,price:35}),
});
export const MATERIAL_BUYBACK = Object.freeze({
  '고철 마석':18,'금속 파편':12,
  '응고 점액':15,'짐승 가죽':20,'포식자의 송곳니':110,
  '발광 분말':32,'자철광 파편':25,'방수 가죽':30,'조류 구슬':38,'수문핵':190,
  '독선 섬유':58,'변이 씨앗':45,'청광석':60,'결정 실':48,'진동 정수':320,
  '반사편':90,'왜곡 결정':110,'잔상 잉크':105,'기록 파편':75,'망각의 서명':560,
  '용암 분진':170,'내열 합금':135,'붉은 포자':155,'균사 조직':180,'재생 인자':950,
  '폭풍석':290,'천공 섬유':235,'성역의 잔광':310,'봉인 파편':240,'서약편':1600,
  '백야 결정':500,'공간 분말':390,'위상 파편':520,'공간 결정':410,'영점핵':2600,
});

/** Source: MASTER v2 §8.2 (14 recipes). Costs and materials are source data.
 * Unlock criteria, equipment modifiers and most slot assignments are NOT defined.
 * Do not turn development blueprint/slot fixtures into permanent game rules.
 */
export const EQUIPMENT_SLOTS = Object.freeze({
  MAIN_HAND:'주무기',OFFHAND:'보조 장비',TOP:'상의',BOTTOM:'하의',
  GLOVES:'장갑',BOOTS:'신발',ACCESSORY_1:'장신구 1',ACCESSORY_2:'장신구 2',
});
export const EQUIPMENT_STATUSES = Object.freeze(['INVENTORY','EQUIPPED','AUCTION_ESCROW','CRAFTING_LOCKED','DESTROYED']);
export const CRAFT_RECIPES = Object.freeze([
  ['F-01','정비용 감응 장갑',100,[['금속 파편',4],['고철 마석',2]]],
  ['F-02','경골 방패',100,[['짐승 가죽',4],['응고 점액',3],['포식자의 송곳니',1]]],
  ['E-01','발광 탐색 렌즈',300,[['발광 분말',4],['자철광 파편',2]]],
  ['E-02','수문 파수꾼의 방패',400,[['방수 가죽',4],['조류 구슬',2],['수문핵',1]]],
  ['D-01','해독섬유 망토',650,[['독선 섬유',4],['변이 씨앗',3]]],
  ['D-02','청광 탐지 렌즈',800,[['청광석',4],['결정 실',2],['진동 정수',1]]],
  ['C-01','균열면 장화',1000,[['반사편',4],['왜곡 결정',3]]],
  ['C-02','봉인 책갈피',1500,[['잔상 잉크',4],['기록 파편',3],['망각의 서명',1]]],
  ['B-01','잿빛 수호 갑옷',2200,[['내열 합금',5],['용암 분진',3]]],
  ['B-02','균사 회복 갑옷',2500,[['균사 조직',4],['붉은 포자',3],['재생 인자',1]]],
  ['A-01','폭풍 유도 반지',4000,[['폭풍석',4],['천공 섬유',3]]],
  ['A-02','서약의 보호구',5500,[['성역의 잔광',4],['봉인 파편',3],['서약편',1]]],
  ['S-01','백야 관측경',8000,[['백야 결정',4],['공간 분말',3]]],
  ['S-02','영점 인장',10000,[['위상 파편',4],['공간 결정',3],['영점핵',1]]],
].map(([id,name,cost,materials])=>Object.freeze({id,name,cost,materials:Object.freeze(materials.map(([name,quantity])=>Object.freeze({name,quantity})))})));
const recipeById = Object.fromEntries(CRAFT_RECIPES.map(x=>[x.id,x]));
function equipmentById(player,id){return player.equipment?.find(item=>item.id===id);}
function hasEquippedEquipment(player,definitionId){
  return Boolean(player?.id&&player.equipment?.some(item=>
    item.definitionId===definitionId&&item.ownerId===player.id&&item.status==='EQUIPPED'));
}
/** Apply approved item protection after gate-specific damage, never below zero. */
export function applyEquipmentDamage(player,gateTemplateId,type,rawDamage){
  const shield=gateTemplateId==='F-02'&&type==='defense'&&hasEquippedEquipment(player,'F-02');
  return Math.max(0,rawDamage-(shield?1:0));
}
export function canCraftEquipment(state,recipeId){
  const recipe=recipeById[recipeId],player=state.player;
  return Boolean(recipe&&player&&!isForcedRest(state)&&!player.activeExpeditionId&&
    DEV_FIXTURE.testBlueprints.includes(recipeId)&&availableGold(player)>=recipe.cost&&
    recipe.materials.every(({name,quantity})=>(player.materials?.[name]??0)>=quantity));
}
/** The transaction is committed with a single saved snapshot, or not at all. */
export function craftEquipment(state,recipeId,commandId,{makeId=idFactory}={}){
  requireActivity(state);
  if(state.commandResults[commandId])return state.commandResults[commandId];
  const player=state.player,recipe=recipeById[recipeId];
  if(!player)throw Error('헌터 등록이 필요합니다.');
  if(player.activeExpeditionId)throw Error('공략 중에는 제작할 수 없습니다.');
  if(!recipe)throw Error('확인되지 않은 제작 도면입니다.');
  if(!DEV_FIXTURE.testBlueprints.includes(recipeId))throw Error('도면 해금 조건 미정: 현재 제작할 수 없습니다.');
  if(availableGold(player)<recipe.cost)throw Error('제작비가 부족합니다.');
  for(const {name,quantity} of recipe.materials){
    if(!Number.isSafeInteger(player.materials?.[name])||player.materials[name]<quantity)
      throw Error(`제작 재료 부족: ${name}`);
  }
  const newId=makeId();
  if(typeof newId!=='string'||!newId||equipmentById(player,newId))throw Error('중복되거나 유효하지 않은 장비 ID입니다.');
  player.equipment??=[];state.transactions??=[];
  player.gold-=recipe.cost;
  for(const {name,quantity} of recipe.materials){
    player.materials[name]-=quantity;
    if(player.materials[name]===0)delete player.materials[name];
  }
  const item={id:newId,definitionId:recipe.id,ownerId:player.id,
    status:'INVENTORY',equippedSlot:null,enhancement:0,
    sourceCommandId:commandId,createdMinute:state.world.minute};
  player.equipment.push(item);
  const transaction={id:`transaction-${commandId}`,commandId,type:'CRAFT',itemId:recipeId,
    itemInstanceId:newId,quantity:1,total:recipe.cost,
    materials:recipe.materials.map(x=>({...x})),worldMinute:state.world.minute};
  state.transactions.push(transaction);
  const result={type:'CRAFT_EQUIPMENT',itemInstanceId:newId,recipeId,total:recipe.cost,transactionId:transaction.id};
  state.commandResults[commandId]=result;
  return result;
}
/** F-series slot assignments are development-only. No unverified passive buffs. */
export function equipEquipment(state,itemId,commandId){
  requireActivity(state);
  if(state.commandResults[commandId])return state.commandResults[commandId];
  const p=state.player;
  if(!p||p.activeExpeditionId)throw Error('공략 중이거나 헌터가 등록되지 않았습니다.');
  const item=equipmentById(p,itemId);
  if(!item||item.ownerId!==p.id||item.status!=='INVENTORY')throw Error('장착 가능한 소유 장비가 아닙니다.');
  const slot=DEV_FIXTURE.testEquipmentSlots[item.definitionId];
  if(!slot)throw Error('해당 장비의 슬롯 연결이 확정되지 않았습니다.');
  if(p.equipment.some(x=>x.status==='EQUIPPED'&&x.equippedSlot===slot))
    throw Error('해당 슬롯에 이미 장비가 있습니다. 먼저 장착을 해제해 주세요.');
  item.status='EQUIPPED';item.equippedSlot=slot;
  const result={type:'EQUIP_EQUIPMENT',itemInstanceId:item.id,slot};
  state.commandResults[commandId]=result;
  return result;
}
export function unequipEquipment(state,itemId,commandId){
  requireActivity(state);
  if(state.commandResults[commandId])return state.commandResults[commandId];
  const p=state.player;
  if(!p||p.activeExpeditionId)throw Error('공략 중이거나 헌터가 등록되지 않았습니다.');
  const item=equipmentById(p,itemId);
  if(!item||item.ownerId!==p.id||item.status!=='EQUIPPED'||!item.equippedSlot)
    throw Error('장착 중인 소유 장비가 아닙니다.');
  const oldSlot=item.equippedSlot;
  item.status='INVENTORY';item.equippedSlot=null;
  const result={type:'UNEQUIP_EQUIPMENT',itemInstanceId:item.id,slot:oldSlot};
  state.commandResults[commandId]=result;
  return result;
}

/** Source design table (MASTER §9); D-07 still controls probabilistic settlement. */
export const ENHANCEMENT_STEPS = Object.freeze([
  [100,15,0],[100,25,0],[100,35,0],[85,55,1],[75,85,1],
  [65,130,1],[55,200,2],[45,300,2],[35,450,2],[25,700,3],
].map(([rate,baseGold,stones],index)=>Object.freeze({targetLevel:index+1,rate,baseGold,stones})));
export const ENHANCEMENT_MULTIPLIERS = Object.freeze({F:1,E:1.6,D:2.5,C:4,B:7,A:12,S:20});
export const ENHANCEMENT_STONE_PRICES = Object.freeze({F:15,E:25,D:40,C:65,B:110,A:185,S:300});
export function enhancementStoneKey(rank){return `enhancement-stone:${rank}`;}
function enhancementRank(item){return recipeById[item.definitionId]?.id[0];}
/** Current target's consecutive failures. Legacy saves can recover the streak from saved results. */
function enhancementFailureCount(state,item,targetLevel){
  if(targetLevel<=3)return 0;
  const saved=item.enhancementFailureStreak;
  if(saved!==undefined){
    return saved?.targetLevel===targetLevel&&Number.isSafeInteger(saved.count)&&saved.count>=0?saved.count:0;
  }
  let count=0;
  for(let i=(state.enhancementHistory?.length??0)-1;i>=0;i--){
    const result=state.enhancementHistory[i];
    if(result.itemInstanceId!==item.id)continue;
    if(result.beforeLevel!==targetLevel-1||result.success!==false)break;
    count++;
  }
  return count;
}
export function enhancementQuote(state,itemId){
  const player=state.player;
  if(!player)throw Error('헌터 등록이 필요합니다.');
  const item=equipmentById(player,itemId);
  if(!item||item.ownerId!==player.id)throw Error('소유 장비가 아닙니다.');
  if(!['INVENTORY','EQUIPPED'].includes(item.status))throw Error('잠금 상태 장비는 강화할 수 없습니다.');
  if(!Number.isSafeInteger(item.enhancement)||item.enhancement<0||item.enhancement>=10)
    throw Error('최대 강화 단계이거나 장비 데이터가 유효하지 않습니다.');
  const rank=enhancementRank(item),step=ENHANCEMENT_STEPS[item.enhancement];
  if(!rank||!Object.hasOwn(ENHANCEMENT_MULTIPLIERS,rank))throw Error('강화 등급을 확인할 수 없습니다.');
  const gold=Math.ceil(step.baseGold*ENHANCEMENT_MULTIPLIERS[rank]);
  const failureCount=enhancementFailureCount(state,item,step.targetLevel);
  const bonus=Math.min(100-step.rate,failureCount*5);
  const rate=step.rate+bonus;
  const errors=[];
  if(failureCount>=Number.MAX_SAFE_INTEGER)errors.push('강화 실패 기록을 처리할 수 없습니다.');
  if(!Number.isSafeInteger(gold))errors.push('강화비가 유효 범위를 벗어났습니다.');
  if(player.activeExpeditionId)errors.push('공략 중에는 강화할 수 없습니다.');
  if(isForcedRest(state))errors.push('응급 치료 중에는 강화할 수 없습니다.');
  if(availableGold(player)<gold)errors.push('사용 가능 골드가 부족합니다.');
  const stoneKey=enhancementStoneKey(rank),stonesOwned=player.materials?.[stoneKey]??0;
  if(stonesOwned<step.stones)errors.push('강화석이 부족합니다.');
  const eliteMaterial=step.targetLevel===10?recipeById[`${rank}-02`]?.materials.at(-1)?.name:null;
  if(step.targetLevel===10&&(!eliteMaterial||(player.materials?.[eliteMaterial]??0)<1))
    errors.push('정예 재료가 부족합니다.');
  return {itemInstanceId:item.id,rank,beforeLevel:item.enhancement,targetLevel:step.targetLevel,
    baseRate:step.rate,rate,bonus,failureCount,gold,stones:step.stones,stoneKey,stonesOwned,eliteMaterial,
    ready:errors.length===0,errors,policy:'원본 §9 단계·비용 설계안; 최종 강화비 올림, 실패 비용과 동일 장비·목표 단계별 실패 +5%p 보정은 2026-10-09 사용자 확정'};
}
export function enhanceEquipment(state,itemId,commandId,{rng=Math.random,expectedLevel,expectedFailureCount}={}){
  if(state.commandResults[commandId])return state.commandResults[commandId];
  requireActivity(state);
  const player=state.player;
  if(!player)throw Error('헌터 등록이 필요합니다.');
  if(player.activeExpeditionId)throw Error('공략 중에는 강화할 수 없습니다.');
  const quote=enhancementQuote(state,itemId);
  if(expectedLevel!==undefined&&expectedLevel!==quote.beforeLevel)
    throw Error('장비 강화 단계가 변경되었습니다. 다시 확인해 주세요.');
  if(expectedFailureCount!==undefined&&expectedFailureCount!==quote.failureCount)
    throw Error('강화 실패 보정이 변경되었습니다. 다시 확인해 주세요.');
  if(!quote.ready)throw Error(quote.errors.join(' '));
  const item=equipmentById(player,itemId);
  let roll=null,success=true;
  if(quote.rate<100){
    const draw=rng();
    if(!Number.isFinite(draw)||draw<0||draw>=1)throw Error('강화 난수 범위 오류');
    roll=draw*100;
    success=roll<quote.rate;
  }
  // Preflight is complete. Both outcomes spend gold and ordinary stones once.
  state.enhancementHistory??=[];
  state.transactions??=[];
  player.gold-=quote.gold;
  if(quote.stones){
    player.materials[quote.stoneKey]-=quote.stones;
    if(player.materials[quote.stoneKey]===0)delete player.materials[quote.stoneKey];
  }
  if(quote.eliteMaterial){
    player.materials[quote.eliteMaterial]--;
    if(player.materials[quote.eliteMaterial]===0)delete player.materials[quote.eliteMaterial];
  }
  if(success){item.enhancement=quote.targetLevel;item.enhancementFailureStreak=null;}
  else item.enhancementFailureStreak={targetLevel:quote.targetLevel,count:quote.failureCount+1};
  const result={type:'ENHANCE_EQUIPMENT',itemInstanceId:itemId,success,
    beforeLevel:quote.beforeLevel,afterLevel:item.enhancement,baseRate:quote.baseRate,rate:quote.rate,
    bonus:quote.bonus,failureCountBefore:quote.failureCount,
    roll,goldSpent:quote.gold,stonesSpent:quote.stones,
    eliteMaterialSpent:quote.eliteMaterial??null,commandId};
  state.enhancementHistory.push({...result,worldMinute:state.world.minute});
  state.transactions.push({id:`transaction-${commandId}`,commandId,type:'ENHANCE',
    itemId:item.definitionId,itemInstanceId:itemId,quantity:1,total:quote.gold,
    stonesSpent:quote.stones,eliteMaterialSpent:quote.eliteMaterial??null,success,beforeLevel:quote.beforeLevel,
    afterLevel:item.enhancement,worldMinute:state.world.minute});
  state.commandResults[commandId]=result;
  return result;
}
export function purchaseEnhancementStones(state,rank,quantity,commandId){
  if(state.commandResults[commandId])return state.commandResults[commandId];
  requireActivity(state);
  const player=state.player;
  if(!player)throw Error('헌터 등록이 필요합니다.');
  if(player.activeExpeditionId)throw Error('공략 중에는 구매할 수 없습니다.');
  if(rank!==player.rank||!Object.hasOwn(ENHANCEMENT_STONE_PRICES,rank))
    throw Error('현재 등급의 강화석만 구매할 수 있습니다.');
  quantityCheck(quantity);
  const total=ENHANCEMENT_STONE_PRICES[rank]*quantity;
  goldCheck(total);
  if(availableGold(player)<total)throw Error('사용 가능 골드가 부족합니다.');
  const key=enhancementStoneKey(rank),before=player.materials?.[key]??0;
  if(!Number.isSafeInteger(before+quantity))throw Error('강화석 수량을 처리할 수 없습니다.');
  player.materials??={};state.transactions??=[];
  player.gold-=total;player.materials[key]=before+quantity;
  const result={type:'PURCHASE_ENHANCEMENT_STONES',rank,quantity,total,key,commandId};
  state.transactions.push({id:`transaction-${commandId}`,commandId,type:'STONE_PURCHASE',
    itemId:key,quantity,unitPrice:ENHANCEMENT_STONE_PRICES[rank],total,worldMinute:state.world.minute});
  state.commandResults[commandId]=result;
  return result;
}

export function availableGold(player){
  return player.gold-(player.auctionEscrowGold??0)-(player.reservedGold??0);
}
function quantityCheck(quantity){
  if(!Number.isSafeInteger(quantity)||quantity<=0)throw Error('거래 수량은 1 이상의 정수여야 합니다.');
}
function goldCheck(amount){
  if(!Number.isSafeInteger(amount)||amount<0)throw Error('거래 금액이 유효 범위를 벗어났습니다.');
}
/** Single-state atomic command. The UI persists the entire updated snapshot or none. */
export function purchaseConsumable(state,itemId,quantity,commandId){
  requireActivity(state);
  if(state.commandResults[commandId])return state.commandResults[commandId];
  if(!state.player)throw Error('헌터 등록이 필요합니다.');
  if(state.player.activeExpeditionId)throw Error('공략 중에는 보급품을 구매할 수 없습니다.');
  const item=CONSUMABLES[itemId];
  if(!item||item.rank!==state.player.rank)throw Error('현재 구매할 수 없는 보급품입니다.');
  quantityCheck(quantity);
  const cost=item.price*quantity;goldCheck(cost);
  if(availableGold(state.player)<cost)throw Error('사용 가능 골드가 부족합니다.');
  const before=state.player.consumables?.[itemId]??0;
  if(!Number.isSafeInteger(before+quantity))throw Error('보유 수량을 처리할 수 없습니다.');
  state.player.consumables??={};
  state.transactions??=[];
  state.player.gold-=cost;
  state.player.consumables[itemId]=before+quantity;
  const transaction={id:`transaction-${commandId}`,commandId,type:'PURCHASE',itemId,quantity,
    unitPrice:item.price,total:cost,worldMinute:state.world.minute};
  state.transactions.push(transaction);
  const result={type:'PURCHASE_CONSUMABLE',transactionId:transaction.id,itemId,quantity,total:cost};
  state.commandResults[commandId]=result;
  return result;
}

/** Outside an expedition the inventory use is immediate and costs no game time. */
export function useInventoryRecoveryItem(state,itemId,commandId){
  if(state.commandResults[commandId])return state.commandResults[commandId];
  if(!state.player)throw Error('헌터 등록이 필요합니다.');
  requireActivity(state);
  if(state.player.activeExpeditionId)throw Error('공략 중에는 행동 카드로 회복약을 사용해 주세요.');
  const item=CONSUMABLES[itemId],player=state.player;
  if(!item||item.rank!==player.rank)throw Error('사용할 수 없는 회복약입니다.');
  const count=player.consumables?.[itemId]??0;
  if(!Number.isSafeInteger(count)||count<1)throw Error('회복약이 없습니다.');
  const field=item.kind==='HP'?'hp':'mp',maximum=item.kind==='HP'?maxHp(player):maxMp(player);
  const restored=Math.min(item.restore,maximum-player[field]);
  if(restored<=0)throw Error('이미 최대치여서 회복약을 사용할 수 없습니다.');
  player.consumables[itemId]=count-1;
  if(!player.consumables[itemId])delete player.consumables[itemId];
  player[field]+=restored;
  const result={type:'USE_INVENTORY_RECOVERY',itemId,restored,worldMinute:state.world.minute};
  state.commandResults[commandId]=result;
  return result;
}

/** Sell only owned stackable materials using the source's exact association price. */
export function sellMaterial(state,materialId,quantity,commandId){
  requireActivity(state);
  if(state.commandResults[commandId])return state.commandResults[commandId];
  if(!state.player)throw Error('헌터 등록이 필요합니다.');
  if(state.player.activeExpeditionId)throw Error('공략 중에는 부산물을 매입할 수 없습니다.');
  if(!Object.hasOwn(MATERIAL_BUYBACK,materialId))throw Error('매입가가 확인되지 않은 부산물입니다.');
  quantityCheck(quantity);
  const owned=state.player.materials?.[materialId]??0;
  if(!Number.isSafeInteger(owned)||quantity>owned)throw Error('보유한 부산물 수량이 부족합니다.');
  const total=MATERIAL_BUYBACK[materialId]*quantity;goldCheck(total);
  goldCheck(state.player.gold+total);
  state.transactions??=[];
  state.player.materials[materialId]=owned-quantity;
  if(state.player.materials[materialId]===0)delete state.player.materials[materialId];
  state.player.gold+=total;
  const transaction={id:`transaction-${commandId}`,commandId,type:'BUYBACK',itemId:materialId,quantity,
    unitPrice:MATERIAL_BUYBACK[materialId],total,worldMinute:state.world.minute};
  state.transactions.push(transaction);
  const result={type:'SELL_MATERIAL',transactionId:transaction.id,itemId:materialId,quantity,total};
  state.commandResults[commandId]=result;
  return result;
}

export const GATE_TEMPLATES = Object.freeze([
  ['F-01','F','일반','녹슨 폐차장','녹슨 슬라임','철부리 쥐',null],
  ['F-02','F','정예','하수관의 둥지','점액쥐','둥지 고블린','배수관 포식자'],
  ['E-01','E','일반','폐쇄된 승강장','등불 박쥐','철로 고블린',null],
  ['E-02','E','정예','침수된 검문소','수초 잠복자','갑각 늪개','수문의 파수꾼'],
  ['D-01','D','일반','침식된 재배실','독화낭충','포자 사냥꾼',null],
  ['D-02','D','정예','푸른 광맥 동굴','광맥 거미','결정 갑주병','진동 채굴자'],
  ['C-01','C','일반','거울 복도','반사충','유리 사냥꾼',null],
  ['C-02','C','정예','검은 도서관','봉인 기록자','책장 망령','망각의 서기'],
  ['B-01','B','일반','잿빛 방벽','잿빛 투사','화염 수호병',null],
  ['B-02','B','정예','붉은 균사림','균사 포식체','포자 괴수','심장균체'],
  ['A-01','A','일반','폭풍의 상공정원','낙뢰 사냥꾼','풍압 수호체',null],
  ['A-02','A','정예','무너진 성역','성역 집행자','균열 사제','무언의 대행자'],
  ['S-01','S','일반','백야 관측소','광원 추적자','영점 유령',null],
  ['S-02','S','정예','무한 회랑 핵구역','위상 포식자','시간절단자','영점 관리자'],
].map(([id,rank,kind,name,...monsters]) => ({id,rank,kind,name,monsters:monsters.slice(0,2),boss:monsters[2]})));

export const ACTIONS = Object.freeze({
  attack: { label:'공격', icon:'⚔', duration:2, closure:[8,12], variants:['잔해를 가르며 타격','균열의 틈새 압박'] },
  defense:{ label:'방어', icon:'⬡', duration:2, closure:[2,4], danger:-5, variants:['폐차 차체 뒤에 엄폐','접근 경로를 방어'] },
  explore:{ label:'탐색', icon:'◎', duration:5, closure:[3,6], variants:['발자국과 흔적 조사','폐차 더미 내부 수색'] },
  tactics:{ label:'전술', icon:'◇', duration:3, closure:[4,7], variants:['지형과 동선 분석','교전 순서 재정비'] },
});

export const F02_SCENES = [
  {title:'하수관 입구', text:'습기를 머금은 콘크리트 틈에서 점액쥐들이 움직인다. 통로 깊은 곳에서 불규칙한 물소리가 들린다.',detail:'하수관 / 점액쥐'},
  {title:'침수된 분기점', text:'갈라진 관로 앞에 둥지 고블린의 흔적이 남아 있다. 물길은 빠르게 변하고 있다.',detail:'갈림길 / 둥지 고블린'},
  {title:'주 배수관', text:'수압이 높아지는 진동이 바닥에 전해진다. 배수관 깊숙한 곳에서 거대한 무언가가 움직인다.',detail:'배수관 / 수압 변화'},
];
export const F02_BOSS_SCENE = {title:'배수관 포식자 · 수압 분출', text:'배수관 포식자가 물살을 터뜨리며 길을 막았다. 방어·탐색·전술을 통한 수압 대응이 필요하다.',detail:'정예 보스 / 수압 분출'};
export const F02_AFTER_BOSS_SCENE = {title:'배수관 포식자 · 방어선 붕괴', text:'수압 분출을 견뎌낸 뒤 배수관의 물길이 잠시 열렸다. 남은 균열을 안정화하면 게이트를 폐쇄할 수 있다.',detail:'정예 보스 / 대응 완료'};
export const F02_ACTION_VARIANTS = {
  attack:['좁은 관로에서 공격','물살을 거슬러 전진'],
  defense:['수압이 높은 통로 방어','관로 벽을 이용한 엄폐'],
  explore:['배수관 연결부 조사','침수된 지형의 흔적 탐색'],
  tactics:['수문과 물길의 동선 분석','교전 위치를 재정비'],
};
export function getScene(expedition){
  return expedition.gateTemplateId==='F-02'
    ? (expedition.boss?.active ? (expedition.boss.resolved?F02_AFTER_BOSS_SCENE:F02_BOSS_SCENE) : F02_SCENES[expedition.sceneIndex%F02_SCENES.length])
    : SCENES[expedition.sceneIndex%SCENES.length];
}
export const SCENES = [
  { title:'침식된 진입로', text:'찌그러진 차체 사이로 녹슨 슬라임이 움직인다. 땅에 새겨진 흔적은 안쪽 폐차 더미를 향한다.', detail:'폐차 더미 / 녹슨 슬라임' },
  { title:'폐차 더미 안쪽', text:'겹쳐 쌓인 철판 너머로 철부리 쥐의 발소리가 들린다. 가느다란 통로와 무너진 차체가 시야를 가린다.', detail:'협소한 통로 / 철부리 쥐' },
  { title:'균열 중심부', text:'차체 아래에서 불안정한 마력이 새어 나온다. 흔들리는 잔해 틈으로 균열이 드러나 있다.', detail:'마력 잔류 / 불안정한 지형' },
];
const clamp = (v,lo,hi) => Math.min(hi, Math.max(lo,v));
const randInt = (rng,min,max) => min + Math.floor(rng()*(max-min+1));
const successOutcomes = new Set(['great','success']);
export const resultLabels = {great:'대성공',success:'성공',partial:'부분 성공',failure:'실패',recovery:'회복'};
export const endLabels = {SUCCESS:'정상 폐쇄',DANGER:'강제 실패',INCAPACITATED:'전투 불능',RETREAT:'자발적 철수'};
export function idFactory() { return globalThis.crypto?.randomUUID?.() ?? `dev-${Date.now()}-${Math.random()}`; }
export function xpForLevel(level){ return 100 + 25*(level-1); }
export function maxHp(player) {return 80+5*player.level+8*player.stats.VIT;}
export function maxMp(player) {return 25+player.level+6*player.stats.MAG;}
export const INFIRMARY_RATE_PER_MINUTE = 0.005;
function infirmaryState(state){
  state.infirmary??={mode:null,remainingMinutes:0,hpFraction:0,mpFraction:0};
  return state.infirmary;
}
export function isForcedRest(state){return state.infirmary?.mode==='EMERGENCY';}
function requireActivity(state){
  if(isForcedRest(state))throw Error('응급 치료로 HP 50%에 도달할 때까지 활동할 수 없습니다.');
}
function beginEmergencyTreatment(state){
  const treatment=infirmaryState(state);
  treatment.mode='EMERGENCY';treatment.remainingMinutes=0;
}
export function startTreatment(state,minutes,commandId){
  if(state.commandResults[commandId])return state.commandResults[commandId];
  if(!state.player)throw Error('헌터 등록이 필요합니다.');
  if(state.player.activeExpeditionId)throw Error('공략 중에는 치료를 시작할 수 없습니다.');
  if(isForcedRest(state))throw Error('응급 치료는 HP 50%까지 자동 진행됩니다.');
  if(state.infirmary?.mode)throw Error('진행 중인 치료를 먼저 중단해 주세요.');
  if(!Number.isSafeInteger(minutes)||(minutes<1||minutes>200))throw Error('치료 시간은 1~200분의 정수여야 합니다.');
  const treatment=infirmaryState(state);
  treatment.mode='NORMAL';treatment.remainingMinutes=minutes;
  const result={type:'START_TREATMENT',minutes};
  state.commandResults[commandId]=result;
  return result;
}
export function stopTreatment(state,commandId){
  if(state.commandResults[commandId])return state.commandResults[commandId];
  if(state.infirmary?.mode!=='NORMAL')throw Error('중단할 수 있는 일반 치료가 없습니다.');
  const remainingMinutes=state.infirmary.remainingMinutes;
  state.infirmary.mode=null;state.infirmary.remainingMinutes=0;
  const result={type:'STOP_TREATMENT',remainingMinutes};
  state.commandResults[commandId]=result;
  return result;
}
function advanceTreatment(state,minutes){
  const treatment=state.infirmary;
  if(!treatment?.mode)return;
  const count=treatment.mode==='NORMAL'?Math.min(minutes,treatment.remainingMinutes):minutes;
  for(let i=0;i<count;i++){
    for(const [field,maximum] of [['hp',maxHp(state.player)],['mp',maxMp(state.player)]]){
      const fractionKey=field==='hp'?'hpFraction':'mpFraction';
      if(state.player[field]>=maximum){treatment[fractionKey]=0;continue;}
      const amount=treatment[fractionKey]+maximum*INFIRMARY_RATE_PER_MINUTE;
      const whole=Math.floor(amount+1e-9);
      state.player[field]=Math.min(maximum,state.player[field]+whole);
      treatment[fractionKey]=state.player[field]>=maximum?0:amount-whole;
    }
    if(treatment.mode==='NORMAL'&&--treatment.remainingMinutes===0){treatment.mode=null;break;}
    if(treatment.mode==='EMERGENCY'&&state.player.hp>=maxHp(state.player)*0.5){treatment.mode=null;break;}
  }
}
export function worldClock(minutes){
  const m=Math.floor(minutes), day=Math.floor(m/1440)+1;
  const hm=((m%1440)+1440)%1440;
  return {day, hours:Math.floor(hm/60), minutes:hm%60, label:`${String(Math.floor(hm/60)).padStart(2,'0')}:${String(hm%60).padStart(2,'0')}`};
}
export function createGame(){
  return {
    schemaVersion:1, revision:0, player:null,
    world:{minute:DEV_FIXTURE.startingWorldMinute, paused:false,spawnCheckpoint:Math.floor(DEV_FIXTURE.startingWorldMinute/F_RANK_RULES.spawnInterval),spawnMisses:{'F-01':0,'F-02':0},spawnChecks:[]},
    gateTemplates:GATE_TEMPLATES,
    gateInstances:[...Array.from({length:DEV_FIXTURE.gateInstances},(_,index)=>({
      id:`fixture-F01-${index+1}`, templateId:'F-01', status:'OPEN', fixture:true, expeditionId:null,resourceClaims:[],
    })),{id:'fixture-F02-1', templateId:'F-02', status:'OPEN', fixture:true, expeditionId:null,resourceClaims:[]}],
    expeditions:{}, commandResults:{}, history:[],transactions:[],enhancementHistory:[],infirmary:{mode:null,remainingMinutes:0,hpFraction:0,mpFraction:0},
    metadata:{kind:'MVP_DEV_FIXTURE', build:'f-rank-rules-v1'},
  };
}
/** Add only the new development-only F-02 instance to old MVP-0 saves.
 * Never reconstruct, overwrite or re-roll existing player/expedition/result data.
 */
export function upgradeGame(state){
  if(state.schemaVersion!==1) throw Error('저장 데이터 버전이 호환되지 않습니다.');
  let changed=false;
  if(!state.gateInstances.some(g=>g.id==='fixture-F02-1')){
    state.gateInstances.push({id:'fixture-F02-1',templateId:'F-02',status:'OPEN',fixture:true,expeditionId:null,resourceClaims:[]});
    changed=true;
  }
  for(const gate of state.gateInstances){if(!Array.isArray(gate.resourceClaims)){gate.resourceClaims=[];changed=true;}}
  if(!Number.isSafeInteger(state.world.spawnCheckpoint)){state.world.spawnCheckpoint=Math.floor(state.world.minute/F_RANK_RULES.spawnInterval);changed=true;}
  if(!state.world.spawnMisses){state.world.spawnMisses={'F-01':0,'F-02':0};changed=true;}
  if(!Array.isArray(state.world.spawnChecks)){state.world.spawnChecks=[];changed=true;}
  if(state.player&&!state.player.consumables){state.player.consumables={};changed=true;}
  if(state.player&&!Array.isArray(state.player.equipment)){state.player.equipment=[];changed=true;}
  if(state.player&&!Array.isArray(state.player.learnedSkills)){state.player.learnedSkills=[];changed=true;}
  if(state.player&&!Array.isArray(state.player.skillHistory)){state.player.skillHistory=[];changed=true;}
  if(!Array.isArray(state.transactions)){state.transactions=[];changed=true;}
  if(!Array.isArray(state.enhancementHistory)){state.enhancementHistory=[];changed=true;}
  if(!state.infirmary){infirmaryState(state);changed=true;}
  if(state.player?.hp<=0&&!state.player.activeExpeditionId&&!state.infirmary.mode){beginEmergencyTreatment(state);changed=true;}
  const active=state.expeditions?.[state.player?.activeExpeditionId];
  if(active?.status==='ACTIVE'&&recoveryOptions(state).length&&!active.candidates.some(c=>c.type==='recovery')){
    addRecoveryCandidate(state,active);changed=true;
  }
  if(state.metadata?.build!=='f-rank-rules-v1'){
    state.metadata={...state.metadata,build:'f-rank-rules-v1'};changed=true;
  }
  return changed;
}
/** Only two confirmed passive effects can be tested until exact per-skill cost and
 * prerequisites are approved. A developer-only 1SP price is never implied as policy.
 */
export function canLearnSkill(state,skillId){
  const p=state.player,skill=SKILLS_BY_ID[skillId];
  return Boolean(p&&!isForcedRest(state)&&!p.activeExpeditionId&&skill?.sourceKnown&&
    DEV_SKILL_FIXTURE.learnableIds.includes(skillId)&&
    !p.learnedSkills?.includes(skillId)&&p.sp>=DEV_SKILL_FIXTURE.learningCost &&
    (!skill.prerequisite||p.learnedSkills?.includes(skill.prerequisite)));
}
export function learnSkill(state,skillId,commandId){
  requireActivity(state);
  if(typeof commandId!=='string'||!commandId)throw Error('명령 ID가 필요합니다.');
  if(Object.hasOwn(state.commandResults,commandId))return state.commandResults[commandId];
  const p=state.player,skill=SKILLS_BY_ID[skillId];
  if(!p)throw Error('헌터 등록이 필요합니다.');
  if(p.activeExpeditionId)throw Error('공략 중에는 스킬을 습득할 수 없습니다.');
  if(!skill||!skill.sourceKnown)throw Error('원문이 확인되지 않은 스킬입니다.');
  if(!DEV_SKILL_FIXTURE.learnableIds.includes(skillId))throw Error('개별 습득 비용·해금 규칙 미정으로 습득이 보류되었습니다.');
  if(p.learnedSkills?.includes(skillId))throw Error('이미 습득한 스킬입니다.');
  if(skill.prerequisite&&!p.learnedSkills?.includes(skill.prerequisite))throw Error('선행 스킬 조건이 충족되지 않았습니다.');
  const cost=DEV_SKILL_FIXTURE.learningCost;
  if(!Number.isSafeInteger(p.sp)||p.sp<cost)throw Error('보유한 스킬 포인트가 부족합니다.');
  p.learnedSkills??=[];p.skillHistory??=[];
  p.sp-=cost;p.learnedSkills.push(skillId);
  const result={type:'LEARN_SKILL',skillId,cost,remainingSP:p.sp,fixture:true};
  p.skillHistory.push({id:`skill-${commandId}`,commandId,skillId,cost,worldMinute:state.world.minute,fixture:true});
  state.commandResults[commandId]=result;
  return result;
}

export const STAT_CAPS = Object.freeze({F:5,E:7,D:9,C:11,B:13,A:15,S:17});
/** Confirm a staged AP allocation once; allows partial spending. */
export function allocateStats(state,allocations,commandId){
  requireActivity(state);
  if(state.infirmary?.mode==='NORMAL')throw Error('최대 HP·MP 변경은 치료를 중단한 뒤 진행해 주세요.');
  if(state.commandResults[commandId])return state.commandResults[commandId];
  const p=state.player;
  if(!p)throw Error('헌터 등록이 필요합니다.');
  if(p.activeExpeditionId)throw Error('공략 중에는 능력치를 변경할 수 없습니다.');
  if(!allocations||Object.keys(allocations).some(k=>!STAT_KEYS.includes(k))||
    !STAT_KEYS.every(k=>Number.isInteger(allocations[k]??0)&&(allocations[k]??0)>=0))
    throw Error('능력치 배분 값이 올바르지 않습니다.');
  const spent=STAT_KEYS.reduce((sum,k)=>sum+(allocations[k]??0),0);
  if(spent<1||spent>p.unspentAP)throw Error('보유한 능력치 포인트를 확인해 주세요.');
  const cap=STAT_CAPS[p.rank];
  if(STAT_KEYS.some(k=>p.stats[k]+(allocations[k]??0)>cap))
    throw Error(`현재 ${p.rank}등급 능력치 상한은 ${cap}입니다.`);
  for(const key of STAT_KEYS)p.stats[key]+=allocations[key]??0;
  p.unspentAP-=spent;
  // Keep current absolute HP/MP; an increase in maximum is not free healing.
  p.hp=Math.min(p.hp,maxHp(p));p.mp=Math.min(p.mp,maxMp(p));
  const result={type:'ALLOCATE_STATS',spent,stats:{...p.stats},remaining:p.unspentAP};
  state.commandResults[commandId]=result;
  return result;
}
export function registerHunter(state,{name,allocations},commandId,makeId=idFactory){
  if(state.commandResults[commandId]) return state.commandResults[commandId];
  if(state.player) throw Error('이미 등록된 헌터가 있습니다.');
  const clean=String(name??'').trim();
  if(!clean || clean.length>40) throw Error('헌터 식별명을 1~40자 이내로 입력해 주세요. (MVP 입력 제약)');
  if(!STAT_KEYS.every(k=>Number.isInteger(allocations?.[k])&&allocations[k]>=0&&allocations[k]<=2) ||
     STAT_KEYS.reduce((n,k)=>n+allocations[k],0)!==3) throw Error('추가 능력치 3포인트를 분배해 주세요. 각 능력치는 5를 넘을 수 없습니다.');
  const stats=Object.fromEntries(STAT_KEYS.map(k=>[k,3+allocations[k]]));
  const player={id:makeId(),name:clean,rank:'F',level:1,xp:0,stats,
    unspentAP:0,sp:0,learnedSkills:[],skillHistory:[],gold:DEV_FIXTURE.initialGold,materials:{},consumables:{},equipment:[],hp:0,mp:0,activeExpeditionId:null};
  player.hp=maxHp(player); player.mp=maxMp(player);
  state.player=player;
  const result={type:'REGISTER',playerId:player.id};
  state.commandResults[commandId]=result;
  return result;
}
export function computeProbability(player,type,{bonus=0,equipmentStat=0,gateTemplateId=null}={}){
  if(!ACTIONS[type]) throw Error('지원되지 않는 행동입니다.');
  const [main,sub]=F_RANK_RULES.statPairs[type];
  const effective=player.stats[main]*0.7+player.stats[sub]*0.3 + clamp(equipmentStat,0,2);
  const skillBonus=(type==='explore'&&player.learnedSkills?.includes('EX-01')?4:0)
    +(type==='tactics'&&player.learnedSkills?.includes('TC-01')?4:0);
  // Approved F-01 glove effect is keyed to the owned equipped item, not its temporary slot mapping.
  const equipmentBonus=type==='explore'&&gateTemplateId==='F-01'&&
    hasEquippedEquipment(player,'F-01')?5:0;
  const normal=clamp(Math.floor(65+5*(effective-3)+bonus+skillBonus+equipmentBonus),15,90);
  const partial=Math.min(15,Math.floor((100-normal)/2));
  return {normal, great:5, success:normal-5, partial, failure:100-normal-partial,effective,main,sub,
    modifier:bonus+skillBonus+equipmentBonus,skillBonus,equipmentBonus};
}
export function outcomeFromRoll(roll,prob){
  // One integer draw from 1..100 against the finalized integer probabilities.
  if(!Number.isInteger(roll)||roll<1||roll>100) throw Error('주사위 범위 오류');
  if(roll<=5) return 'great';
  if(roll<=prob.normal) return 'success';
  if(roll<=prob.normal+prob.partial) return 'partial';
  return 'failure';
}
export function drawCandidates(turn,rng=Math.random,templateId='F-01'){
  const types=Object.keys(ACTIONS);
  for(let i=types.length-1;i>0;i--){const j=randInt(rng,0,i);[types[i],types[j]]=[types[j],types[i]];}
  return types.slice(0,3).map((type,i)=>({
    id:`turn-${turn}-card-${i+1}`,type,title:(templateId==='F-02'?F02_ACTION_VARIANTS[type]:ACTIONS[type].variants)[randInt(rng,0,1)],
    duration:ACTIONS[type].duration,
  }));
}
function recoveryOptions(state){
  const player=state.player;
  return Object.values(CONSUMABLES).filter(item=>(player?.consumables?.[item.id]??0)>0&&
    (item.kind==='HP'?player.hp<maxHp(player):player.mp<maxMp(player)));
}
function addRecoveryCandidate(state,expedition){
  if(recoveryOptions(state).length&&expedition.candidates.length<4){
    expedition.candidates.push({id:`turn-${expedition.turn}-recovery`,type:'recovery',title:'회복약 사용',duration:F_RANK_RULES.recoveryMinutes});
  }
}
export function startExpedition(state,instanceId,commandId,{rng=Math.random,makeId=idFactory}={}){
  requireActivity(state);
  if(state.commandResults[commandId]) return state.commandResults[commandId];
  if(!state.player) throw Error('헌터 등록이 필요합니다.');
  if(state.player.activeExpeditionId) throw Error('진행 중인 공략을 먼저 완료하거나 재개해 주세요.');
  if(state.infirmary?.mode==='NORMAL')throw Error('일반 치료를 중단한 뒤 게이트에 입장할 수 있습니다.');
  const gate=state.gateInstances.find(g=>g.id===instanceId);
  if(!gate || gate.status!=='OPEN' || !['F-01','F-02'].includes(gate.templateId)) throw Error('현재 입장할 수 없는 게이트입니다.');
  const id=makeId();
  const expedition={id,gateInstanceId:gate.id,gateTemplateId:gate.templateId,status:'ACTIVE',
    party:[state.player.id],closure:0,danger:0,turn:1,sceneIndex:0,
    candidates:drawCandidates(1,rng,gate.templateId),actionResults:[],nextBonus:0,securedLoot:[],
    boss:gate.templateId==='F-02'?{active:false,resolved:false,activatedTurn:null,resolvedTurn:null}:null,
    startedMinute:state.world.minute,endedMinute:null,endReason:null,settlement:null};
  state.expeditions[id]=expedition;
  addRecoveryCandidate(state,expedition);
  gate.status='IN_PROGRESS';gate.expeditionId=id;
  state.player.activeExpeditionId=id;
  const result={type:'START_EXPEDITION',expeditionId:id,gateInstanceId:instanceId};
  state.commandResults[commandId]=result;
  return result;
}
export function applyExperience(player,amount){
  player.xp+=amount;
  let levels=0;
  while(player.level<70&&player.xp>=xpForLevel(player.level)){
    player.xp-=xpForLevel(player.level);player.level++;levels++;
    if(player.level%3===0) player.unspentAP++;
    if(player.level%2===0) player.sp++;
  }
  return levels;
}
export function finalizeExpedition(state,expedition,reason,rng=Math.random){
  if(expedition.settlement) return expedition.settlement;
  const player=state.player;
  const success=reason==='SUCCESS';
  // Only confirmed closure reward is implemented. Loot rates/quantities unknown.
  const gold=success?randInt(rng,100,160):0;
  const xp=success?randInt(rng,80,120):0;
  const levels=applyExperience(player,xp);
  player.gold+=gold;
  // Loot acquisition rates remain unspecified. Only developer-provided loot
  // fixtures can populate securedLoot; never generate real drops in M0.
  // Rounding down a halved odd quantity is a developer fixture, not policy.
  const lootById=new Map();
  for(const item of expedition.securedLoot)lootById.set(item.id,(lootById.get(item.id)||0)+item.quantity);
  const loot=[...lootById].map(([id,quantity])=>({id,quantity:(reason==='DANGER'||reason==='INCAPACITATED')
    ?Math.floor(quantity/2):quantity})).filter(item=>item.quantity>0);
  // Original: one elite boss crafting material guaranteed on normal closure.
  if(success&&expedition.gateTemplateId==='F-02')loot.push({id:'포식자의 송곳니',quantity:1});
  for(const item of loot)player.materials[item.id]=(player.materials[item.id]||0)+item.quantity;
  player.activeExpeditionId=null;
  expedition.status='FINISHED';expedition.endReason=reason;
  expedition.endedMinute=state.world.minute;
  expedition.candidates=[];
  expedition.settlement={id:`settlement-${expedition.id}`,reason,gold,xp,levels,
    loot,lootPolicy:'F-rank resource nodes; failed loot aggregated by item ID and halved by floor; F02 boss fang on closure only',
    closureRewardPaid:success};
  const gate=state.gateInstances.find(g=>g.id===expedition.gateInstanceId);
  gate.status=success?'CLOSED':reason==='RETREAT'?'OPEN':'UNSTABLE';
  if(reason==='RETREAT')gate.expeditionId=null;
  state.history.unshift(expedition.id);
  if(player.hp<=0)beginEmergencyTreatment(state);
  return expedition.settlement;
}
export function executeAction(state,expeditionId,candidateId,commandId,{rng=Math.random,makeId=idFactory}={}){
  if(state.commandResults[commandId]) return state.commandResults[commandId];
  const expedition=state.expeditions[expeditionId];
  if(!expedition||expedition.status!=='ACTIVE') throw Error('진행 중인 공략이 없습니다.');
  if(state.player.activeExpeditionId!==expeditionId) throw Error('공략 소유 상태가 일치하지 않습니다.');
  const selected=expedition.candidates.find(c=>c.id===candidateId);
  if(!selected) throw Error('이 행동 후보는 이미 처리되었거나 사용할 수 없습니다.');
  const action=ACTIONS[selected.type];
  const actionScene=getScene(expedition).title; // snapshot prior to boss/scene mutations
  const probabilities=computeProbability(state.player,selected.type,{bonus:expedition.nextBonus,gateTemplateId:expedition.gateTemplateId});
  const roll=randInt(rng,1,100);
  const outcome=outcomeFromRoll(roll,probabilities);
  const baseClosure=randInt(rng,...action.closure);
  let closureDelta=0,riskDelta=0,nextBonus=0;
  if(successOutcomes.has(outcome)){
    closureDelta=baseClosure;
    riskDelta=action.danger||0;
    if(selected.type==='tactics') nextBonus=DEV_FIXTURE.tacticalNextBonus;
  } else if(outcome==='partial'){
    closureDelta=Math.floor(baseClosure/2); // temporary rounding fixture
    riskDelta=(action.danger?Math.ceil(action.danger/2):DEV_FIXTURE.partialRisk);
  } else riskDelta=F_RANK_RULES.failureRisk[selected.type];
  const before={closure:expedition.closure,danger:expedition.danger,hp:state.player.hp,worldMinute:state.world.minute};
  const boss=expedition.boss;
  const bossWasActive=Boolean(boss?.active);
  let bossResponse=false;
  if(bossWasActive&&!boss.resolved&&['defense','explore','tactics'].includes(selected.type)&&
      (successOutcomes.has(outcome)||(F_RANK_RULES.bossResponseMinimum==='partial'&&outcome==='partial'))){
    boss.resolved=true;boss.resolvedTurn=expedition.turn;bossResponse=true;
  }
  expedition.closure=clamp(expedition.closure+closureDelta,0,100);
  if(boss&&!boss.active&&expedition.closure>=70){boss.active=true;boss.activatedTurn=expedition.turn;}
  if(boss&&!boss.resolved)expedition.closure=Math.min(expedition.closure,99);
  expedition.danger=clamp(expedition.danger+riskDelta,0,100);
  expedition.nextBonus=nextBonus;
  state.world.minute+=action.duration;
  const rawDamage=F_RANK_RULES.damage[selected.type][outcome==='great'||outcome==='success'?0:outcome==='partial'?1:2]
    +(expedition.gateTemplateId==='F-02'?F_RANK_RULES.f02DamageBonus:0);
  const damage=applyEquipmentDamage(state.player,expedition.gateTemplateId,selected.type,rawDamage);
  state.player.hp=Math.max(0,state.player.hp-damage);
  let resourceNode=null;
  if(selected.type==='explore'&&successOutcomes.has(outcome)){
    const gate=state.gateInstances.find(g=>g.id===expedition.gateInstanceId);
    gate.resourceClaims??=[];
    const nodes=F_RESOURCE_NODES[expedition.gateTemplateId]||[];
    const next=nodes.findIndex((_,index)=>!gate.resourceClaims.includes(index));
    if(next>=0){
      gate.resourceClaims.push(next);
      const items=nodes[next].map(item=>({...item}));
      expedition.securedLoot.push(...items);
      resourceNode={index:next+1,items};
    }
  }
  const record={id:makeId(),commandId,expeditionId,turn:expedition.turn,
    scene:actionScene,candidate:{...selected},probabilities,
    roll,outcome,baseClosure,closureDelta:expedition.closure-before.closure,
    riskDelta:expedition.danger-before.danger,damage,equipmentDamageReduction:rawDamage-damage,
     resourceNode,elapsedMinutes:action.duration,
    before,after:{closure:expedition.closure,danger:expedition.danger,hp:state.player.hp,worldMinute:state.world.minute},
    autoCombo:null, // intentionally not available for solo expeditions
    bossActivated:Boolean(boss&&!bossWasActive&&boss.active),bossResponse,bossResolved:Boolean(boss?.resolved),
    provisionalValuesUsed:[]};
  expedition.actionResults.push(record);
  let settlement=null;
  if(expedition.closure>=100) settlement=finalizeExpedition(state,expedition,'SUCCESS',rng);
  else if(expedition.danger>=100) settlement=finalizeExpedition(state,expedition,'DANGER',rng);
  else if(state.player.hp<=0) settlement=finalizeExpedition(state,expedition,'INCAPACITATED',rng);
  else {
    expedition.turn++;
    expedition.sceneIndex=(expedition.sceneIndex+1)%SCENES.length;
    expedition.candidates=drawCandidates(expedition.turn,rng,expedition.gateTemplateId);
    addRecoveryCandidate(state,expedition);
  }
  const result={type:'EXECUTE_ACTION',expeditionId,actionResultId:record.id,
    endReason:settlement?.reason??null};
  state.commandResults[commandId]=result;
  return result;
}
export function useRecoveryItem(state,expeditionId,itemId,commandId,{rng=Math.random,makeId=idFactory}={}){
  if(state.commandResults[commandId])return state.commandResults[commandId];
  const expedition=state.expeditions[expeditionId],player=state.player;
  if(!expedition||expedition.status!=='ACTIVE'||player?.activeExpeditionId!==expeditionId)throw Error('진행 중인 공략이 없습니다.');
  const candidate=expedition.candidates.find(c=>c.type==='recovery');
  if(!candidate)throw Error('현재 회복 행동을 사용할 수 없습니다.');
  const item=recoveryOptions(state).find(x=>x.id===itemId);
  if(!item)throw Error('사용할 수 있는 회복약이 없습니다.');
  const before={closure:expedition.closure,danger:expedition.danger,hp:player.hp,mp:player.mp,worldMinute:state.world.minute};
  player.consumables[itemId]--;
  if(player.consumables[itemId]===0)delete player.consumables[itemId];
  const field=item.kind==='HP'?'hp':'mp',maximum=item.kind==='HP'?maxHp(player):maxMp(player);
  const restored=Math.min(item.restore,maximum-player[field]);
  player[field]+=restored;
  expedition.danger=clamp(expedition.danger+F_RANK_RULES.recoveryRisk,0,100);
  expedition.nextBonus=0;
  state.world.minute+=F_RANK_RULES.recoveryMinutes;
  const record={id:makeId(),commandId,expeditionId,turn:expedition.turn,scene:getScene(expedition).title,
    candidate:{...candidate},probabilities:null,roll:null,outcome:'recovery',baseClosure:0,closureDelta:0,
    riskDelta:expedition.danger-before.danger,damage:0,resourceNode:null,itemUsed:itemId,restored,
    elapsedMinutes:F_RANK_RULES.recoveryMinutes,before,
    after:{closure:expedition.closure,danger:expedition.danger,hp:player.hp,mp:player.mp,worldMinute:state.world.minute},
    autoCombo:null,bossActivated:false,bossResponse:false,bossResolved:Boolean(expedition.boss?.resolved),provisionalValuesUsed:[]};
  expedition.actionResults.push(record);
  let settlement=null;
  if(expedition.danger>=100)settlement=finalizeExpedition(state,expedition,'DANGER',rng);
  else{
    expedition.turn++;
    expedition.candidates=drawCandidates(expedition.turn,rng,expedition.gateTemplateId);
    addRecoveryCandidate(state,expedition);
  }
  const result={type:'USE_RECOVERY',expeditionId,actionResultId:record.id,itemId,restored,endReason:settlement?.reason??null};
  state.commandResults[commandId]=result;
  return result;
}
export function retreatExpedition(state,expeditionId,commandId){
  if(state.commandResults[commandId]) return state.commandResults[commandId];
  const expedition=state.expeditions[expeditionId];
  if(!expedition||expedition.status!=='ACTIVE'||state.player.activeExpeditionId!==expeditionId)
    throw Error('철수할 수 없는 공략입니다.');
  const settlement=finalizeExpedition(state,expedition,'RETREAT');
  const result={type:'RETREAT',expeditionId,endReason:settlement.reason};
  state.commandResults[commandId]=result;
  return result;
}
export function tickWorld(state,realSeconds,{visible=true,inBattle=false,rng=Math.random,makeId=idFactory}={}){
  if(!visible||inBattle||state.player?.activeExpeditionId||state.world.paused||!state.player) return 0;
  // 1 real second = 1 game minute; only active/visible duration is counted.
  const delta=Math.max(0,Math.floor(realSeconds));
  if(!delta)return 0;
  const interval=F_RANK_RULES.spawnInterval;
  state.world.spawnCheckpoint??=Math.floor(state.world.minute/interval);
  state.world.spawnMisses??={'F-01':0,'F-02':0};
  state.world.spawnChecks??=[];
  state.world.minute+=delta;
  advanceTreatment(state,delta);
  const last=Math.floor(state.world.minute/interval);
  for(let checkpoint=state.world.spawnCheckpoint+1;checkpoint<=last;checkpoint++){
    for(const [templateId,rule] of Object.entries(F_RANK_RULES.spawn)){
      const active=state.gateInstances.filter(g=>g.templateId===templateId&&['OPEN','IN_PROGRESS'].includes(g.status)).length;
      if(active>=rule.maxOpen)continue;
      const roll=rng();
      if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('게이트 발생 난수 범위 오류');
      const misses=(state.world.spawnMisses[templateId]||0)+1;
      const guaranteed=misses>=rule.guaranteeAfterMisses;
      const spawned=roll<rule.chance||guaranteed;
      state.world.spawnMisses[templateId]=spawned?0:misses;
      state.world.spawnChecks.push({minute:checkpoint*interval,templateId,roll,spawned,guaranteed,misses:spawned?0:misses});
      if(spawned)state.gateInstances.push({id:`gate-${templateId}-${checkpoint}-${makeId()}`,templateId,status:'OPEN',
        fixture:false,expeditionId:null,resourceClaims:[],spawnedMinute:checkpoint*interval});
    }
    state.world.spawnCheckpoint=checkpoint;
  }
  if(state.world.spawnChecks.length>200)state.world.spawnChecks=state.world.spawnChecks.slice(-200);
  return delta;
}
