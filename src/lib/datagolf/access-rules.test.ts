import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canUseInternalDataGolf, isDataGolfSource } from './access-rules';
const config = { enabled: true, analystUserId: 'syntetisk-analytiker' };
test('kun konfigurert analytiker med voksen operatorrolle slipper inn', () => {
  assert.equal(canUseInternalDataGolf({ id: config.analystUserId, role: 'ADMIN' }, config), true);
  assert.equal(canUseInternalDataGolf({ id: config.analystUserId, role: 'COACH' }, config), true);
  for (const role of ['PLAYER','PARENT','GUEST','ADMIN','COACH']) assert.equal(canUseInternalDataGolf({ id: 'annen-bruker', role }, config), false);
  assert.equal(canUseInternalDataGolf({ id: config.analystUserId, role: 'PLAYER' }, config), false);
});
test('manglende konfig, avskrudd adgang, slettet eller uinnlogget er stengt', () => {
  const user = { id: config.analystUserId, role: 'ADMIN' };
  assert.equal(canUseInternalDataGolf(user, { enabled: true, analystUserId: null }), false);
  assert.equal(canUseInternalDataGolf(user, { ...config, enabled: false }), false);
  assert.equal(canUseInternalDataGolf({ ...user, deletedAt: new Date() }, config), false);
  assert.equal(canUseInternalDataGolf(null, config), false);
});
test('DG-proveniens omfatter rå og avledede kilder, ikke egne uavhengige kilder', () => {
  for (const s of ['DATAGOLF','datagolf-skill-ratings-global','data_golf','DG_rounds']) assert.equal(isDataGolfSource(s), true);
  for (const s of ['NGF','GolfBox','Broadie-estimate',null]) assert.equal(isDataGolfSource(s), false);
});
