import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Castle, ChevronRight, Users, BookOpen, X } from 'lucide-react';
import standardBoard from '../../board_final.png';
import arenaBoard from '../../game_3d_arena_updated.png';

// Presentation only: these previews never alter the existing game's board selection.
const previews = [
  { name: 'Klassisches Brett', label: 'DIE KLASSISCHE RUNDE', image: standardBoard, description: 'Grundstücke sammeln, clever handeln und dein Immobilienimperium aufbauen.' },
  { name: 'Große Arena', label: 'BIS ZU 20 SPIELER', image: arenaBoard, description: 'Mehr Mitspieler am Tisch. Die Raumgröße legst du wie gewohnt in der Lobby fest.' },
];

export function ArenaIntro() {
  const [selected, setSelected] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const rulesButtonRef = useRef<HTMLButtonElement>(null);
  const guideRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!rulesOpen) return;
    const previous = rulesButtonRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRulesOpen(false);
      if (event.key !== 'Tab') return;
      const items = guideRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, select, [tabindex="0"]');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [rulesOpen]);
  const board = previews[selected];
  return <section id="arena-welcome" className="arena-intro" aria-label="Willkommen in der Arena">
    <div className="arena-wordmark"><Castle size={25} /><span>MONOPOLY <small>REALTIME ARENA</small></span><span className="arena-edition">DIE DIGITALE SPIELED­ITION<br />FÜR GROSSE PLÄNE.</span></div>
    <div className="arena-intro-copy"><span className="arena-kicker">IMMOBILIEN. VERHANDLUNGEN. EIN BISSCHEN GLÜCK.</span><h2>Freunde am Tisch.<br /><em>Alles auf LOS.</em></h2><p>Straßen kaufen. Miete kassieren. Um den letzten Deal feilschen. Hol deine Freunde dazu — gespielt wird direkt im Browser.</p></div>
    <div className="arena-deed-strip" aria-hidden="true"><span>BADSTRASSE<small>€ 60</small></span><span>BAHNHOF<small>€ 200</small></span><span>SCHLOSSALLEE<small>€ 400</small></span></div>
    <div className="arena-table-details"><span>01 / DER SPIELTISCH</span><span>40 · 80 · 120 FELDER</span></div>
    <div className="arena-preview">
      <div className="arena-preview-tabs" role="group" aria-label="Brettvorschau">
        {previews.map((preview, index) => <button key={preview.name} aria-pressed={selected === index} onClick={() => setSelected(index)}>{index === 0 ? <Castle size={15} /> : <Users size={15} />}{preview.name}<ArrowUpRight size={14} /></button>)}
      </div>
      <div className="arena-preview-image"><img src={board.image} alt={`Illustration: ${board.name}`} /><span>ILLUSTRATION · BRETTAUSWAHL IN DER LOBBY</span></div>
      <div className="arena-preview-caption"><div><span className="arena-kicker">{board.label}</span><p>{board.description}</p></div><span className="arena-preview-number">0{selected + 1}</span></div>
    </div>
    <div className="arena-intro-footer"><span><Users size={15} /> 2–20 Spieler · mit Freunden oder Bots</span><button ref={rulesButtonRef} onClick={() => setRulesOpen(true)}><BookOpen size={15} /> Spielstart erklärt <ChevronRight size={14} /></button></div>
    {rulesOpen && <div className="arena-guide-overlay" onClick={() => setRulesOpen(false)} onKeyDown={event => { if (event.key === 'Escape') setRulesOpen(false); }}><section ref={guideRef} className="arena-guide" role="dialog" aria-modal="true" aria-labelledby="arena-guide-title" onClick={event => event.stopPropagation()}><button autoFocus className="arena-guide-close" aria-label="Anleitung schließen" onClick={() => setRulesOpen(false)}><X size={20} /></button><span className="arena-kicker">IN DREI SCHRITTEN ZUM SPIEL</span><h2 id="arena-guide-title">Der Tisch ist bereit.</h2><ol><li><strong>Deine Spielfigur wählen</strong><p>Trage deinen Namen ein und wähle Figur und Farbe im Spielerprofil.</p></li><li><strong>Freunde an den Tisch holen</strong><p>Erstelle einen Raum und teile den Einladungslink oder Raumcode aus der Lobby. Dort kannst du auch Bots hinzufügen und die Spielerzahl festlegen.</p></li><li><strong>Gemeinsam starten</strong><p>Sobald alle bereit sind, startet der Host. Für einen direkten Einstieg nutzt du das bestehende Schnellspiel gegen drei Bots.</p></li></ol><button className="arena-guide-done" onClick={() => setRulesOpen(false)}>Verstanden — los geht’s <ChevronRight size={16} /></button></section></div>}
  </section>;
}
