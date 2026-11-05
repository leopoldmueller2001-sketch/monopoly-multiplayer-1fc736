# Monopoly Realtime Arena

Bestehendes React-/TypeScript-Multiplayer-Brettspiel mit Lobby, Bots, Handel, Rangliste und 2D-/3D-Ansichten. Die Startseite ergänzt den vorhandenen Gold-/Dunkelstil um Brettgrafik-Vorschauen, deutsche Einstiegstexte und eine kurze Anleitung. Beide Vorschauen sind Präsentationen bestehender Assets, keine neue Modusumschaltung.

Verwendet werden Vite, React, Tailwind CSS, Three.js, Netlify Functions und die bereits enthaltene Netlify-Database-/Drizzle-Anbindung.

## Lokal arbeiten

Abhängigkeiten mit `npm install` installieren. Mit `netlify dev --port 8889` die Anwendung einschließlich Funktions-Emulation starten. Die bestehende Datenbankkonfiguration benötigt eine mit dem Netlify-Projekt verknüpfte Umgebung. Keine Zugangsdaten in Dateien eintragen.

Vorhandene Prüfskripte: `npm test`, `npm run lint` (Typecheck), `npm run build`. Für das Brett-Upgrade bestanden 40 automatisierte Tests und der Typecheck. Zusätzlich wurden Komponenten mit React serverseitig probeweise gerendert (Browser-Standort simuliert). Ein lokaler Build und echte Browser-/Netzwerklasttests wurden nicht ausgeführt; die Bereitstellungspipeline übernimmt die Build-Prüfung.

## Weiterentwicklung

[PLAN.md](PLAN.md) beschreibt die nächsten Etappen für Regeln beider Bretter, sichere Mehrspieler-Räume, Bot-Strategien, Balance und neue Spielfunktionen. Das aktuelle Brett-Upgrade ergänzt die unten beschriebenen Varianten samt Engine-Anbindung. Weitere Erweiterungen des langfristigen Plans, etwa neue Missionen und zusätzliche Bot-Schwierigkeitsstufen, stehen weiterhin aus.

Das Originalarchiv bleibt unter `.netlify/assets/` erhalten. `downloads/monopoly-realtime-arena-improved.zip` enthält alle ursprünglichen Projektdateien an ihren relativen Pfaden sowie die Ergänzungen. Archiv- und Dateivergleiche sind in `.netlify/results.md` dokumentiert.

## Reparatur der Migrationskonfiguration

`drizzle.config.ts` verwendet einen reinen Typimport von `Config` anstelle eines Laufzeitimports von `defineConfig`. Dadurch benötigt das Einlesen der Konfiguration keine lokal auflösbare `drizzle-kit`-Installation. Die bereits deklarierten Beta-Abhängigkeiten, das Schema und der Migrationspfad bleiben erhalten. Die automatische Pipeline führt die Migrationsgenerierung aus; sie wurde bei dieser Reparatur nicht lokal gestartet.

## Abhängigkeiten bei CLI-Deploys

Der konfigurierte Deploy-Befehl führt vor dem Vite-Build `bun install --frozen-lockfile` aus. Damit werden die im bestehenden Bun-Lockfile festgelegten Abhängigkeiten auch dann installiert, wenn der CLI-Deploy keine vorherige Installationsphase ausgeführt hat. Das behebt die Ursache von `vite: command not found`, ohne Paketversionen oder das Lockfile zu verändern. Der Build selbst wurde bei dieser Reparatur nicht lokal ausgeführt.


## Spielbare Brettgrößen und Handel

Der Host wählt in der Lobby zwischen 40, 80 und 120 Feldern. Die Auswahl wird mit dem Raum in Netlify Database gespeichert und beim Spielstart verbindlich übernommen. Bestehende Räume ohne Brettgrößen-Angabe verwenden weiterhin 40 Felder.

| Brett | Startgeld | Bonus beim Überqueren von LOS | Reguläre Würfe pro Zug |
| --- | ---: | ---: | ---: |
| Klassisch · 40 Felder | $1.500 | $200 | 1 |
| Großstadt · 80 Felder | $3.000 | $400 | 2 |
| XXL-Metropole · 120 Felder | $4.500 | $600 | 3 |

Großstadt und Metropole erweitern die ursprünglichen 40 Felder um zusätzliche Stadtviertel. Grundstücke haben eigene IDs, Besitzer, Gebäude und Hypotheken. Farbgruppen gelten innerhalb des jeweiligen Viertels; Bahnhofs- und Versorgungswerksmieten werden ebenfalls je Viertel berechnet. Die zusätzlichen Stadtplätze sind Jackpot-Felder, keine weiteren LOS-Felder. Karten mit festem Ziel führen zum ursprünglichen Grundstück; die nächste Bahn oder Versorgung kann in jedem Viertel liegen. Gefängnis bleibt auf Feld 10. Grundstückspreise, Mieten und Kartenbeträge bleiben grundsätzlich erhalten; erhöht werden Startgeld und LOS-Bonus. Diese Ausgangsbalance wurde technisch simuliert, noch nicht durch menschliche Spielrunden abgestimmt.

Jeder Wurf wird vollständig abgewickelt, bevor der nächste folgt. Pasch-Zusatzwürfe verbrauchen keinen regulären Wurf; drei aufeinanderfolgende Pasche führen weiterhin ins Gefängnis. Ein Gefängnisversuch ersetzt den gesamten Zug, auch bei erfolgreicher Befreiung durch Pasch. Einzahlungen und Schulden müssen vor dem Weiterwürfeln abgewickelt werden. Zeitlimits und Bot-Aktionen berücksichtigen die zusätzlichen Würfe.

Die klassischen 2D- und Three.js-Bretter bleiben bestehen. Die zusätzlichen Brettgrößen verwenden eine eigene scrollbare Darstellung mit flacher oder CSS-perspektivischer Ansicht, Zoom, Gesamtübersicht und Fokus auf die aktive Figur. Sie verwenden nicht den klassischen Three.js-Renderer. Figuren bewegen sich schrittweise; reduzierte Bewegung wird berücksichtigt. Besitzerfarben, Häuser, Hotels und Hypotheken sind direkt sichtbar. Über ein Feld öffnet sich die vorhandene Besitzverwaltung.

Das Handelsmenü bietet eine Spielersuche, die Gegenüberstellung „Du gibst / Du bekommst“, Grundstückswerte und Hypothekenstatus sowie eine Vorschau der beiden Kontostände nach Annahme. Bestehende Grundstücksmodelle und Angebotsfunktionen bleiben erhalten.

Das ergänzte Gesamtarchiv liegt unter `downloads/monopoly-realtime-arena-xxl.zip`. Es enthält Projektquellen, Tests, Migrationen und Grafiken einschließlich der älteren, nur noch im bisherigen Archiv enthaltenen Medien. Zugangsdaten, Laufzeitkonfiguration, installierte Abhängigkeiten, Build-Ausgaben und verschachtelte ZIP-Dateien werden nicht aufgenommen. Das bisherige Archiv bleibt erhalten.

### Spieltisch-Edition und Quellcode

Die Gestaltung nutzt lokal eingebundene Lucide-SVGs statt Emoji-Anzeigen. Herkunft und Lizenz stehen unter `public/assets/tokens/`. Die bisherigen Spielkennungen und alle Brettmodi bleiben erhalten. Brettillustrationen im Einstieg sind Vorschauen; die tatsächliche Größe wird in der Lobby gewählt.

Der Download im Startmenü liefert `public/downloads/monopoly-design-edition.zip`. Er enthält Quellcode, Originalgrafiken, Tests und die unveränderten Datenbankmigrationen. Abhängigkeiten, Build-Ausgaben, alte ZIPs und lokale Laufzeit-/Zugangskonfiguration sind ausgeschlossen. Nach Änderungen lässt sich das Archiv mit `python3 scripts/package-source.py` neu erstellen. Abhängigkeiten werden mit `bun install --frozen-lockfile` installiert; lokal startet `npm run dev` das Projekt mit Netlify auf Port 8889. Datenbankzugriff erfolgt über die Netlify-Umgebung, Zugangsdaten sind nicht im Archiv enthalten.
