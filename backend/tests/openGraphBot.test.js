import test from 'node:test';
import assert from 'node:assert/strict';
import { isSocialBot } from '../src/controllers/openGraphController.js';

test('isSocialBot mengenali WhatsApp crawler', () => {
  assert.equal(isSocialBot('WhatsApp/2.21.12.21 A'), true);
  assert.equal(isSocialBot('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'), true);
  assert.equal(isSocialBot('Twitterbot/1.0'), true);
  assert.equal(isSocialBot('TelegramBot (like TwitterBot)'), true);
});

test('isSocialBot mengabaikan browser standar', () => {
  assert.equal(isSocialBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'), false);
  assert.equal(isSocialBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'), false);
  assert.equal(isSocialBot(''), false);
});
