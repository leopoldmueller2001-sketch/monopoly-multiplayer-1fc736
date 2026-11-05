import { BOARD_TILES, COLOR_GROUPS } from './monopolyBoard';
import type { BoardTile } from '../types/game';

export const BOARD_SIZE_OPTIONS = [40, 80, 120] as const;
export function boardRules(size = 40) {
  const boardSize = BOARD_SIZE_OPTIONS.includes(size as 40 | 80 | 120) ? size : 40;
  const scale = boardSize / 40;
  return { boardSize, startingCash: 1500 * scale, salary: 200 * scale, rollsPerTurn: scale };
}
// Every district retains its own complete, buildable colour groups.
const districts = ['Altstadt', 'Hafenviertel', 'Metropole'];
const expanded: BoardTile[] = districts.flatMap((district, block) => BOARD_TILES.map(tile => ({
  ...tile, id: block * 40 + tile.id,
  name: block ? `${tile.name} · ${district}` : tile.name,
  ...(block && tile.type === 'go' ? { type: 'freeparking' as const, name: `${district} · Stadtplatz`, description: 'Jackpot-Stadtplatz' } : {}),
})));
const boards: Record<number, BoardTile[]> = { 40: BOARD_TILES, 80: expanded.slice(0, 80), 120: expanded };
export function getBoardTiles(size = 40): BoardTile[] { return boards[boardRules(size).boardSize]; }
export function propertyGroup(color: string, tileId = 0): number[] {
  return (COLOR_GROUPS[color] ?? []).map(id => id + Math.floor(tileId / 40) * 40);
}
