import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game/GameEngine';
import { BOARD_TILES, CHANCE_CARDS } from '../src/data/monopolyBoard';
import { BOARD_SIZE_OPTIONS, boardRules, getBoardTiles, propertyGroup } from '../src/data/boardVariants';
import { movementPath } from '../src/utils/gamePresentation';
import type { Player } from '../src/types/game';
const player = (id: string, isBot = false): Player => ({ id, name: id, isBot, token: '🎩', color: '#cba76c', money: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, bankrupt: false, isHost: id === 'a', isReady: true, connected: true });
const game = (boardSize: number) => new GameEngine('CITY', [player('a'), player('b'), player('c')], { boardSize });
function finishLanding(engine: GameEngine) {
  for (let i = 0; i < 5; i++) {
    if (engine.getState().phase === 'ACTION') engine.declineProperty(engine.getActivePlayer()!.id);
    else if (engine.getState().phase === 'RESOLVING_CARD') engine.resolveCard(engine.getActivePlayer()!.id);
    else break;
  }
}
for (const size of BOARD_SIZE_OPTIONS) {
  test(`${size} fields: original tiles retained, correct property state and economy`, () => {
    const engine = game(size), tiles = getBoardTiles(size);
    assert.equal(tiles.length, size);
    assert.deepEqual(tiles.slice(0, 40), BOARD_TILES);
    assert.equal(new Set(tiles.map(t => t.id)).size, size);
    assert.equal(Object.keys(engine.getState().properties).length, 28 * size / 40);
    assert.equal(engine.getActivePlayer()!.money, 1500 * size / 40);
    for (const tile of tiles.filter(t => t.type === 'street')) {
      assert.ok(propertyGroup(tile.color!, tile.id).every(id => tiles[id]?.color === tile.color));
    }
  });
  test(`${size} fields: lap salary, additional rolls and restoration across each request`, context => {
    const values = [.1, .3]; let index = 0;
    context.mock.method(Math, 'random', () => values[index++ % 2]); // 1 + 2, no doubles
    let engine = game(size);
    engine.getActivePlayer()!.position = size - 1;
    engine.rollDice('a');
    assert.equal(engine.getActivePlayer()!.position, 2);
    assert.equal(engine.getActivePlayer()!.money, boardRules(size).startingCash + boardRules(size).salary);
    finishLanding(engine);
    for (let roll = 1; roll <= size / 40; roll++) {
      engine = GameEngine.restore(JSON.parse(JSON.stringify(engine.snapshot())));
      assert.equal(engine.getState().boardSize, size);
      assert.equal(engine.getState().rollsTaken, roll);
      assert.equal(engine.endTurn('a').success, true);
      if (roll < size / 40) {
        assert.equal(engine.getActivePlayer()!.id, 'a');
        assert.equal(engine.rollDice('b').success, false);
        assert.equal(engine.rollDice('a').success, true);
        finishLanding(engine);
      }
    }
    assert.equal(engine.getActivePlayer()!.id, 'b');
    assert.equal(engine.getState().rollsTaken, 0);
  });
  test(`${size} fields: seeded 20-bot simulation stays valid across saved requests`, context => {
    let seed = 806;
    context.mock.method(Math, 'random', () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; });
    let engine = new GameEngine('SIM', Array.from({ length: 20 }, (_, i) => player(`bot${i}`, true)), { boardSize: size });
    let turns = new Set<string>(), boughtExpansion = false;
    for (let step = 0; step < 1600 && engine.getState().phase !== 'GAME_OVER'; step++) {
      turns.add(engine.getActivePlayer()!.id);
      assert.equal(engine.botStep(), true);
      const state = engine.getState();
      assert.ok(state.players.every(p => Number.isFinite(p.money) && p.position >= 0 && p.position < size));
      assert.ok(Object.values(state.properties).every(p => p.houses >= 0 && p.houses <= 5));
      boughtExpansion ||= Object.values(state.properties).some(p => p.tileId >= 40 && p.ownerId);
      if (step % 25 === 0) engine = GameEngine.restore(JSON.parse(JSON.stringify(engine.snapshot())));
    }
    assert.equal(turns.size, 20);
    if (size > 40) assert.ok(boughtExpansion);
  });
}
test('XXL colour groups develop separately, trade and mortgages include new properties', () => {
  const engine = game(120), state = engine.getState();
  state.properties[81].ownerId = 'a';
  assert.equal(engine.buildHouse('a', 81).success, false);
  state.properties[83].ownerId = 'a';
  assert.equal(engine.buildHouse('a', 81).success, true);
  assert.equal(engine.buildHouse('a', 81).success, false); // even building
  assert.equal(engine.sellHouse('a', 81).success, true);
  assert.equal(engine.mortgageProperty('a', 81).success, true);
  assert.equal(engine.buildHouse('a', 83).success, false);
  assert.equal(engine.proposeTrade({ fromPlayerId: 'a', toPlayerId: 'b', offeredMoney: 0, requestedMoney: 50, offeredProperties: [81], requestedProperties: [] }).success, true);
  assert.equal(engine.respondTrade(engine.pendingTrades()[0].id, 'b', true).success, true);
  assert.equal(state.properties[81].ownerId, 'b');
  assert.equal(state.properties[81].mortgaged, true);
});
test('XXL doubles add a bonus roll without consuming the three regular rolls', context => {
  context.mock.method(Math, 'random', () => .2);
  const engine = game(120);
  engine.rollDice('a'); finishLanding(engine); engine.endTurn('a');
  assert.equal(engine.getState().bonusRoll, true);
  engine.rollDice('a'); finishLanding(engine);
  assert.equal(engine.getState().rollsTaken, 1);
  engine.endTurn('a'); engine.rollDice('a');
  assert.equal(engine.getActivePlayer()!.inJail, true);
  engine.endTurn('a');
  assert.equal(engine.getActivePlayer()!.id, 'b');
});
test('jail attempts consume the XXL turn, bankruptcy resets the next player budget', context => {
  context.mock.method(Math, 'random', () => .2);
  const engine = game(120);
  engine.sendToJail(engine.getActivePlayer()!);
  engine.rollDice('a'); finishLanding(engine); engine.endTurn('a');
  assert.equal(engine.getActivePlayer()!.id, 'b');
  engine.getState().rollsTaken = 2;
  engine.declareBankruptcy('b');
  assert.equal(engine.getState().rollsTaken, 0);
});
test('cards and movement wrap around the XXL board and find expansion railroads', () => {
  const engine = game(120), state = engine.getState();
  state.players[0].position = 119;
  state.pendingCard = CHANCE_CARDS.find(c => c.action === 'go_back_3')!;
  state.phase = 'RESOLVING_CARD'; engine.resolveCard('a');
  assert.equal(state.players[0].position, 116);
  state.players[0].position = 84;
  state.pendingCard = CHANCE_CARDS.find(c => c.action === 'advance_nearest_railroad')!;
  state.phase = 'RESOLVING_CARD'; engine.resolveCard('a');
  assert.equal(state.players[0].position, 85);
  assert.deepEqual(movementPath(118, { ...state.players[0], position: 2 }, 120), [118, 119, 0, 1, 2]);
});
test('older snapshots default to classic rules and unsupported sizes fall back safely', () => {
  const engine = game(40); delete engine.getState().boardSize; delete engine.getState().rollsTaken;
  const restored = GameEngine.restore(JSON.parse(JSON.stringify(engine.snapshot())));
  assert.equal(getBoardTiles(restored.getState().boardSize).length, 40);
  assert.equal(game(999).getState().boardSize, 40);
});

test('XXL timeout preserves extra rolls and refreshes the deadline after each action', context => {
  let draw = 0;
  context.mock.method(Math, 'random', () => [.1, .3][draw++ % 2]);
  const engine = game(120);
  delete engine.getState().turnClockKey;
  engine.syncTurnClock(1000);
  assert.equal(engine.timeoutStep(26_000), true);
  assert.equal(engine.getState().rollsTaken, 1);
  assert.equal(engine.timeoutStep(51_000), true);
  assert.equal(engine.getActivePlayer()!.id, 'a');
  assert.equal(engine.getState().phase, 'ROLL');
  assert.equal(engine.getState().turnDeadline, 76_000);
  assert.equal(engine.timeoutStep(51_001), false);
});
