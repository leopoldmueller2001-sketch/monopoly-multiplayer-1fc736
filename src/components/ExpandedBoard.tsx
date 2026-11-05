import { TokenArt } from './TokenArt';
import { useEffect, useRef, useState } from 'react';
import { Focus, Minus, Plus } from 'lucide-react';
import type { BoardTile, GameState } from '../types/game';
import { boardRules, getBoardTiles } from '../data/boardVariants';
import { movementPath, STEP_DURATION } from '../utils/gamePresentation';
import { PROPERTY_COLORS } from '../utils/propertyModel';

export function ExpandedBoard({ gameState, onTileClick, perspective }: { gameState: GameState; onTileClick: (tile: BoardTile) => void; perspective: boolean }) {
  const [zoom, setZoom] = useState(1);
  const [displayPlayers, setDisplayPlayers] = useState(gameState.players);
  const previousPlayers = useRef(gameState.players);
  useEffect(() => {
    const paths = gameState.players.map(player => {
      const before = previousPlayers.current.find(p => p.id === player.id);
      return before ? movementPath(before.position, player, gameState.boardSize ?? 40) : [];
    });
    previousPlayers.current = gameState.players;
    const steps = Math.max(0, ...paths.map(path => path.length - 1));
    if (!steps || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplayPlayers(gameState.players); return; }
    let frame = 0;
    const renderFrame = () => setDisplayPlayers(gameState.players.map((player, i) => ({ ...player, position: paths[i].length ? paths[i][Math.min(frame, paths[i].length - 1)] : player.position })));
    renderFrame();
    const timer = window.setInterval(() => { frame++; renderFrame(); if (frame >= steps) window.clearInterval(timer); }, STEP_DURATION);
    return () => window.clearInterval(timer);
  }, [gameState.players, gameState.boardSize]);
  const viewport = useRef<HTMLDivElement>(null);
  const tiles = getBoardTiles(gameState.boardSize);
  const side = tiles.length / 4;
  const active = gameState.players[gameState.activePlayerIndex];
  const displayedActive = displayPlayers.find(p => p.id === active?.id);
  const rules = boardRules(gameState.boardSize);
  const focus = () => viewport.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  useEffect(() => {
    viewport.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
  }, [displayedActive?.position, active?.id]);
  return <div className="arena-city-stage">
    <header className="arena-city-toolbar"><div><small>REALTIME ARENA / {tiles.length} FELDER</small><h2>{tiles.length === 120 ? 'Die Metropole' : 'Die Großstadt'}</h2><small>{active?.name} · {gameState.bonusRoll ? 'Pasch-Zusatzwurf' : `Wurf ${Math.min((gameState.rollsTaken ?? 0) + (gameState.phase === 'ROLL' ? 1 : 0), rules.rollsPerTurn)}/${rules.rollsPerTurn}`}</small></div><div className="arena-city-tools"><button aria-label="Brett verkleinern" disabled={zoom <= .5} onClick={() => setZoom(z => Math.max(.5, z - .25))}><Minus size={16} /></button><span>{Math.round(zoom * 100)}%</span><button aria-label="Brett vergrößern" disabled={zoom >= 1.5} onClick={() => setZoom(z => Math.min(1.5, z + .25))}><Plus size={16} /></button><button onClick={() => { const el = viewport.current; if (el) { setZoom(Math.max(.12, Math.min(el.clientWidth - 60, el.clientHeight - 60) / ((side + 1) * 85))); el.scrollTo(0, 0); } }}>Übersicht</button><button onClick={focus}><Focus size={16} /> Aktive Figur</button></div></header>
    <div ref={viewport} className="arena-city-viewport" tabIndex={0} aria-label="Spielbrett, horizontal und vertikal scrollbar">
      <div className={`arena-city-board ${perspective ? 'arena-city-perspective' : ''}`} style={{ gridTemplateColumns: `repeat(${side + 1}, ${82 * zoom}px)`, gridTemplateRows: `repeat(${side + 1}, ${82 * zoom}px)` }}>
        <div className="arena-city-center" style={{ gridColumn: `2 / ${side + 1}`, gridRow: `2 / ${side + 1}` }}><small>MONOPOLY</small><h3>REALTIME<br />ARENA</h3><p>{tiles.length} Felder · {gameState.players.length} Spieler</p><div className="arena-city-rules"><span>${rules.startingCash}<small>Startkapital</small></span><span>{rules.rollsPerTurn}<small>Würfe / Zug</small></span><span>${rules.salary}<small>über LOS</small></span></div><p className="arena-city-turn"><TokenArt token={active?.token} /> {active?.name}<br /><small>Wurf {Math.min((gameState.rollsTaken ?? 0) + (gameState.phase === 'ROLL' ? 1 : 0), rules.rollsPerTurn)} / {rules.rollsPerTurn} · {gameState.phase}</small></p><p>Grundstück anklicken: ansehen, bauen und Hypotheken verwalten.<br />Farbgruppen gelten jeweils innerhalb eines Stadtviertels.</p></div>
        {tiles.map(tile => {
          const edge = Math.floor(tile.id / side), offset = tile.id % side;
          const [row, col] = edge === 0 ? [side + 1, side + 1 - offset] : edge === 1 ? [side + 1 - offset, 1] : edge === 2 ? [1, 1 + offset] : [1 + offset, side + 1];
          const property = gameState.properties[tile.id];
          const owner = gameState.players.find(p => p.id === property?.ownerId);
          const occupants = displayPlayers.filter(p => !p.bankrupt && p.position === tile.id);
          return <button key={tile.id} data-active={displayedActive?.position === tile.id} className="arena-city-tile" style={{ gridRow: row, gridColumn: col, borderColor: owner?.color }} onClick={() => onTileClick(tile)} title={`${tile.name}${owner ? ` · ${owner.name}` : ''}`} aria-label={`${tile.name}, ${tile.price ? `$${tile.price}` : tile.type}${owner ? `, Besitzer ${owner.name}` : ''}`}>
            <span className="arena-city-band" style={{ background: PROPERTY_COLORS[tile.color || tile.type] || '#ad8950' }} />
            <small>#{tile.id + 1}</small><strong style={{ fontSize: `${Math.max(7, 10 * zoom)}px` }}>{tile.name}</strong><span>{tile.price ? `$${tile.price}` : tile.type === 'go' ? `+$${rules.salary}` : tile.type === 'chance' ? '?' : tile.type === 'community' ? 'Karte' : tile.type === 'gotojail' ? 'Gefängnis →' : tile.type === 'tax' ? `−$${tile.taxAmount}` : '◆'}</span>
            {property?.houses ? <span className="arena-city-houses">{property.houses === 5 ? '▰ Hotel' : '⌂'.repeat(property.houses)}</span> : null}
            {property?.mortgaged && <small>Hypothek</small>}
            {owner && <i style={{ background: owner.color }} aria-label={`Besitzer ${owner.name}`} />}
            <span className="arena-city-tokens">{occupants.map(p => <span key={p.id} title={p.name} style={{ background: p.color }}><TokenArt token={p.token} /></span>)}</span>
          </button>;
        })}
      </div>
    </div>
    <footer className="arena-city-legend"><span>Farbiger Rand = Besitzer</span><span>⌂ Häuser · ▰ Hotel</span><span>Scrollen zum Erkunden · Aktive Figur zum Zentrieren</span></footer>
  </div>;
}
