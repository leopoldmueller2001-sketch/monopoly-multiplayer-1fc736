# Architektur und Arbeitsregeln

Das Projekt wurde aus dem bereitgestellten Original-ZIP übernommen. Keine Dateien, Assets, Bretter, Modi oder Funktionen entfernen, verschieben oder umbenennen. Originale Gestaltung erhalten; Änderungen gezielt ergänzen.

- `src/App.tsx`: bestehende Menü-, Lobby- und Spielansicht sowie Anbindung an GameClient.
- `src/components/ArenaIntro.tsx`: zusätzliche Startseiten-Präsentation und Anleitung. Importiert bestehende PNGs, ohne Originale zu verschieben; hat keinen Einfluss auf Spielregeln oder Moduswahl.
- `src/components/Board.tsx`, `ThreeBoardScene.tsx`: vorhandene Brettdarstellungen.
- `src/game/GameEngine.ts`: vorhandene Spiellogik.
- `src/lib/gameClient.ts`: vorhandener HTTP-Client mit Ereignisschnittstelle.
- `netlify/functions`, `db`: bestehende serverseitige Implementierung, in der Oberflächenetappe unverändert.
- `tests`: vorhandene Tests unverändert erhalten.
- `src/index.css`: bestehende Stile plus abgegrenzte additive `.arena-*`-Klassen.

React-Funktionskomponenten und TypeScript verwenden. UI-Zustand lokal in React halten; dauerhafte Daten ausschließlich über Netlify-Plattformdienste. Grafikvorschauen niemals als funktionierende neue Brettmodi ausgeben. Zukünftige Arbeiten anhand von PLAN.md fortsetzen. Keine Secrets ausgeben oder in Archive aufnehmen.

Prüfstatus ehrlich dokumentieren: In dieser Etappe wurden nur Dateien statisch gelesen und die Archivintegrität sowie Erhaltung der Originaldateien geprüft. Keine Behauptungen über erfolgreich ausgeführte Spieltests oder Builds aufstellen.
