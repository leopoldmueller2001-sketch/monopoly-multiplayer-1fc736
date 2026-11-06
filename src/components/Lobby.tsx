import { Bot, Crown, Check, Copy, Share2, UserPlus, X } from 'lucide-react';
import { TokenArt, tokenLabel } from './TokenArt';
import { BOARD_SIZE_OPTIONS, boardRules } from '../data/boardVariants';
import React, { useState } from 'react';
import { AVAILABLE_TOKENS, PLAYER_COLORS, MAX_PLAYERS, TURN_LIMIT_OPTIONS } from '../data/monopolyBoard';
import { LobbyRoom, Player, PlayerToken } from '../types/game';
import { playSound } from '../utils/sound';

interface LobbyProps {
  lobby: LobbyRoom;
  currentPlayer: Player;
  onReadyToggle: (ready: boolean) => void;
  onUpdateProfile: (token: PlayerToken, color: string, name: string) => Promise<boolean>;
  onAddBot: () => void;
  onRemovePlayer: (playerId: string) => void;
  onStartGame: () => void;
  onLeaveLobby: () => void;
  onUpdateSettings: (settings: { maxPlayers: number; turnSeconds: number; boardSize?: number }) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  lobby,
  currentPlayer,
  onReadyToggle,
  onUpdateProfile,
  onAddBot,
  onRemovePlayer,
  onStartGame,
  onLeaveLobby,
  onUpdateSettings,
}) => {
  const [copyError, setCopyError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [selectedToken, setSelectedToken] = useState<PlayerToken>(currentPlayer.token);
  const [selectedColor, setSelectedColor] = useState<string>(currentPlayer.color);
  const [nameInput, setNameInput] = useState<string>(currentPlayer.name);

  const [linkCopied, setLinkCopied] = useState(false);
  const isHost = currentPlayer.isHost;
  const settings = { maxPlayers: MAX_PLAYERS, turnSeconds: 25, boardSize: 40, ...lobby.settings };
  const inviteLink = `${window.location.origin}/?room=${lobby.roomId}`;
  const handleCopyLink = async () => {
    playSound('click');
    setCopyError('');
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ title: 'Monopoly Lobby', text: `Spiel mit! Lobbycode ${lobby.roomId}`, url: inviteLink });
      else await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setCopyError('Teile den Raumcode manuell: ' + lobby.roomId); }
  };
  const waitingPlayers = lobby.players.filter(p => !p.isHost && !p.isBot && !p.isReady);
  const readyCount = lobby.players.length - waitingPlayers.length;
  const freeSeats = Math.max(0, settings.maxPlayers - lobby.players.length);
  const startHint = lobby.players.length < 2
    ? 'Lade jemanden ein oder füge einen Bot hinzu. Ihr braucht mindestens zwei Spieler.'
    : waitingPlayers.length > 0
      ? `Noch nicht bereit: ${waitingPlayers.map(p => p.name).join(', ')}.`
      : isHost ? 'Alle sind bereit. Du kannst die Runde starten.' : 'Alle sind bereit. Der Gastgeber startet die Runde.';
  const canStart =
    isHost &&
    lobby.players.length >= 2 &&
    lobby.players.every((p) => p.isHost || p.isBot || p.isReady);

  const handleCopyCode = async () => {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(lobby.roomId);
      setCopied(true);
      playSound('click');
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopyError('Kopieren nicht möglich. Dein Raumcode: ' + lobby.roomId); }
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim() || isSaving) return;
    setIsSaving(true);
    setProfileError('');
    try {
      if (await onUpdateProfile(selectedToken, selectedColor, nameInput.trim())) {
        setIsEditing(false);
        playSound('click');
      } else setProfileError('Speichern fehlgeschlagen. Bitte versuche es erneut.');
    } catch { setProfileError('Speichern fehlgeschlagen. Bitte versuche es erneut.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="arena-lobby w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {copyError && <p role="status" className="rounded-xl border border-amber-500/40 bg-slate-900 p-3 text-sm text-amber-200">{copyError}</p>}
      {/* Header bar */}
      <div className="arena-lobby-header flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-xl shadow-md">
            <TokenArt token="🎩" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Deine Lobby</h1>
            <p className="text-xs text-slate-400">Freunde einladen · Figuren wählen · Gemeinsam starten</p>
          </div>
        </div>

        {/* Raumcode Badge */}
        <div className="arena-lobby-invite-row flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Raumcode</div>
            <div className="text-2xl font-black font-mono tracking-wider text-amber-400">{lobby.roomId}</div>
          </div>
          <button
            onClick={handleCopyCode}
            className="cursor-pointer ml-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Raumcode kopieren"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Kopiert' : 'Code kopieren'}
          </button>
          <button
            onClick={handleCopyLink}
            className="cursor-pointer p-2 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
            title={inviteLink}
          >
            <Share2 size={15} /> {linkCopied ? 'Einladung geteilt' : 'Freunde einladen'}
          </button>
        </div>
      </div>

      <section className="arena-lobby-status" aria-label="Startbereitschaft">
        <div><span className="arena-lobby-eyebrow">DEINE NÄCHSTE RUNDE</span><h2>{lobby.players.length >= 2 && waitingPlayers.length === 0 ? 'Der Tisch ist bereit.' : 'Gleich geht’s los.'}</h2><p role="status">{startHint}</p></div>
        <div className="arena-lobby-summary"><span><strong>{readyCount} / {lobby.players.length}</strong> bereit</span><span><strong>{settings.boardSize}</strong> Felder</span><span><strong>{settings.turnSeconds === 0 ? 'Ohne' : `${settings.turnSeconds} s`}</strong> Zeitlimit</span></div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Player list (2 cols) */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Spieler am Tisch ({lobby.players.length}/{settings.maxPlayers})
              </h2>
              {isHost && lobby.players.length < settings.maxPlayers && (
                <button
                  onClick={() => {
                    playSound('click');
                    onAddBot();
                  }}
                  className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Bot size={15} /> Bot hinzufügen
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
              {lobby.players.map((player) => {
                const isMe = player.id === currentPlayer.id;
                return (
                  <div
                    key={player.id}
                    className={`relative p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isMe
                        ? 'bg-slate-800/90 border-amber-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl shadow-xs"
                        style={{
                          backgroundColor: `${player.color}20`,
                          borderColor: player.color,
                        }}
                      >
                        <TokenArt token={player.token} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-white">
                            {player.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-500/30 px-1 rounded">
                              DU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                          {player.isHost ? (
                            <span className="text-amber-400 font-medium flex items-center gap-1">
                              <Crown size={12} /> Gastgeber
                            </span>
                          ) : player.isBot ? (
                            <span className="text-blue-400 font-medium flex items-center gap-1">
                              <Bot size={12} /> Bot · bereit
                            </span>
                          ) : player.isReady ? (
                            <span className="text-emerald-400 font-medium">Bereit</span>
                          ) : (
                            <span className="text-slate-400">Noch nicht bereit</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Kick action if host */}
                    {isHost && !player.isHost && (
                      <button
                        onClick={() => {
                          playSound('click');
                          onRemovePlayer(player.id);
                        }}
                        className="cursor-pointer text-slate-500 hover:text-red-400 p-1 text-xs transition-colors"
                        title={`${player.name} aus dem Raum entfernen`}
                        aria-label={`${player.name} aus dem Raum entfernen`}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {freeSeats > 0 && <div className="arena-lobby-open-seat"><UserPlus size={18} /><span>{freeSeats === 1 ? 'Ein Platz ist noch frei.' : `${freeSeats} Plätze sind noch frei.`}<small>Teile die Einladung oder den Raumcode mit deinen Freunden.</small></span></div>}
          </div>

          {/* Action bottom row */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                playSound('click');
                onLeaveLobby();
              }}
              className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Lobby verlassen
            </button>

            <div className="flex items-center gap-3">
              {!isHost && (
                <button
                  onClick={() => {
                    playSound('click');
                    onReadyToggle(!currentPlayer.isReady);
                  }}
                  className={`cursor-pointer px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                    currentPlayer.isReady
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {currentPlayer.isReady ? 'Bereit · zurücknehmen' : 'Ich bin bereit'}
                </button>
              )}

              {isHost && (
                <button
                  onClick={() => {
                    playSound('click');
                    onStartGame();
                  }}
                  disabled={!canStart}
                  title={startHint}
                  className={`cursor-pointer px-6 py-2.5 rounded-xl font-black text-sm tracking-wide uppercase transition-all shadow-lg ${
                    canStart
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  Spiel starten
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Customization & Room Settings (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Dein Spielerprofil
            </h2>

            {/* Current preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 mb-5">
              <div
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl shadow-inner"
                style={{
                  backgroundColor: `${currentPlayer.color}25`,
                  borderColor: currentPlayer.color,
                }}
              >
                <TokenArt token={currentPlayer.token} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-base">{currentPlayer.name}</div>
                <div className="text-xs text-slate-400">Startkapital: ${boardRules(settings.boardSize).startingCash}</div>
              </div>
              <button
                disabled={isSaving}
                onClick={() => {
                  setProfileError('');
                  setNameInput(currentPlayer.name);
                  setSelectedToken(currentPlayer.token);
                  setSelectedColor(currentPlayer.color);
                  setIsEditing(!isEditing);
                }}
                className="cursor-pointer text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                {isEditing ? 'Abbrechen' : 'Anpassen'}
              </button>
            </div>

            {/* Customization Form */}
            {isEditing && (
              <div className="space-y-4 pt-2 border-t border-slate-800" aria-busy={isSaving}>
                {profileError && <p role="alert" className="text-xs text-red-500">{profileError}</p>}
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    <span id="lobby-name-label">Dein Name</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    aria-labelledby="lobby-name-label"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* Token Emoji */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Deine Spielfigur
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_TOKENS.map((token) => (
                      <button
                        key={token}
                        aria-label={tokenLabel(token)}
                        aria-pressed={selectedToken === token}
                        type="button"
                        onClick={() => setSelectedToken(token as PlayerToken)}
                        className={`cursor-pointer p-2 rounded-lg text-xl flex items-center justify-center transition-all ${
                          selectedToken === token
                            ? 'bg-amber-500/20 border-2 border-amber-400 scale-105'
                            : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        <TokenArt token={token} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Deine Farbe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLAYER_COLORS.map((color) => (
                      <button
                        key={color}
                        aria-label={`Spielerfarbe ${color}`}
                        aria-pressed={selectedColor === color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`cursor-pointer w-7 h-7 rounded-full transition-transform ${
                          selectedColor === color
                            ? 'ring-4 ring-white/50 scale-110'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={!nameInput.trim() || isSaving}
                  className="cursor-pointer w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  {isSaving ? 'Wird gespeichert …' : 'Profil speichern'}
                </button>
              </div>
            )}

            {/* Room settings (host editable) */}
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Raumeinstellungen</h2>
              <label className="block text-xs font-semibold text-slate-400">Brettgröße
                <select value={settings.boardSize} disabled={!isHost} onChange={e => onUpdateSettings({ ...settings, boardSize: Number(e.target.value) })} className="w-full mt-1 bg-slate-950 border border-amber-700 text-white rounded-lg px-3 py-2">
                  {BOARD_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size} Felder · {size === 40 ? 'Klassisch' : size === 80 ? 'Großstadt' : 'XXL-Metropole'}</option>)}
                </select>
              </label>
              <p className="text-xs text-amber-200">${boardRules(settings.boardSize).startingCash.toLocaleString('de-DE')} Startgeld · ${boardRules(settings.boardSize).salary} beim Überqueren von LOS · {boardRules(settings.boardSize).rollsPerTurn} {boardRules(settings.boardSize).rollsPerTurn === 1 ? 'Wurf' : 'Würfe'} pro Zug. Pasch gibt weiterhin einen Zusatzwurf. Gefängnis beendet die Zusatzwürfe.</p>
              <label className="block text-xs font-semibold text-slate-400">
                Max. Spieler: <span className="text-amber-400">{settings.maxPlayers}</span>
                <input
                  type="range" min={Math.max(2, lobby.players.length)} max={MAX_PLAYERS} value={settings.maxPlayers}
                  disabled={!isHost}
                  onChange={(e) => onUpdateSettings({ ...settings, maxPlayers: Number(e.target.value) })}
                  className="w-full accent-amber-500 mt-1 disabled:opacity-50"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-400">
                Zeit pro Spielaktion
                <select
                  value={settings.turnSeconds}
                  disabled={!isHost}
                  onChange={(e) => onUpdateSettings({ ...settings, turnSeconds: Number(e.target.value) })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-60"
                >
                  {TURN_LIMIT_OPTIONS.map((s) => <option key={s} value={s}>{s === 0 ? 'Aus – kein Zeitlimit' : `${s} Sekunden`}</option>)}
                </select>
              </label>
              {!isHost && <p className="text-[11px] text-slate-500">Der Gastgeber legt Brettgröße, Spielerzahl und Zeitlimit fest.</p>}
            </div>

            <p className="arena-lobby-timer-note">Mit Zeitlimit führt das Spiel ausstehende Aktionen nach Ablauf automatisch aus.</p>
            {/* Quick Game Info */}
            <div className="mt-6 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Spielmodus</span>
                <span className="font-semibold text-slate-300">{settings.boardSize === 40 ? 'Klassisches Monopoly' : `${settings.boardSize} Felder · Arena`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Startkapital</span>
                <span className="font-semibold text-emerald-400">${boardRules(settings.boardSize).startingCash}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>LOS-Bonus</span>
                <span className="font-semibold text-emerald-400">+${boardRules(settings.boardSize).salary}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Jackpot</span>
                <span className="font-semibold text-slate-300">Frei-Parken-Topf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
