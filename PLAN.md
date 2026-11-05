# Monopoly Realtime Arena – Ausbauplan

1. **Spieloberfläche und Orientierung (umgesetzt):** Originalprojekt vollständig übernommen; bestehendes Gold-/Dunkeldesign, alle Grafiken und Spielfunktionen erhalten. Startseite um zwei umschaltbare Grafikvorschauen und eine Spielstart-Anleitung ergänzt. Profil und Raumeinstieg deutsch beschriftet; Kopierfehler in der Lobby sichtbar gemacht. Vorschauen verändern weder Brettregeln noch die bestehende Brettauswahl.
2. **Bestandsaufnahme und Regelkorrekturen:** Bestehende Engine und Tests fachlich prüfen. Kleine und große Brettvariante ausdrücklich den jeweiligen Modi zuordnen; derzeit sind Grafikdateien und 2D-/3D-Komponenten vorhanden, eine separate Regellogik für beide Größen ist noch zu bestätigen. Gefängnis, Karten, Bankrott und Handel mit Regressionstests absichern.
3. **Verlässliche Räume bis 20 Spieler:** Bestehende Netlify-Datenbankanbindung, Sitzungssicherheit und atomare Spielaktionen prüfen und härten. Gleichzeitige Beitritte, volle Räume, Wiederverbindung und Zustandsrevisionen unter Last testen. Einladungen und Übernahme des Hosts bei Ausfällen absichern.
4. **Strategische Bots:** Schwierigkeitsstufen und nachvollziehbare Entscheidungen für Käufe, Liquiditätsreserve, Bauen, Hypotheken und Handel entwickeln. Deterministische Simulationen mit verschiedenen Spielerzahlen und beiden Brettern ergänzen.
5. **Abwechslung und Balance:** Auktionen, optionale Ereignisse, Missionen, Belohnungen und Gebäude-Upgrades als klar abgegrenzte Erweiterungen umsetzen. Aufholmechanismen und ein zeitlich begrenztes Spielende durch Simulationen abstimmen; bestehende Modi erhalten.
6. **Erfolge und Ranglisten:** Bestehende Rangliste prüfen und um nachvollziehbare Ergebnisse, Erfolge und Schutz gegen manipulierte Ergebnisse ergänzen.
7. **Freigabe und Gesamtarchiv:** Regeltests, Bot-Simulationen, Browserprüfungen beider Brettvarianten und Lastprüfungen mit 20 Spielern durchführen. Typecheck und Build in der Pipeline auswerten. Neues vollständiges ZIP und detaillierten Prüfbericht bereitstellen.

Jeder Meilenstein erhält eigene überprüfbare Abnahmekriterien. Keine Originaldateien, Grafiken, Texturen, Modi oder Funktionen löschen. Änderungen gezielt ergänzen; Backend und Spiellogik werden in dieser Oberflächenetappe nicht umgebaut.


## Umgesetztes Brett- und Handelsupgrade (5. November 2026)

Die Lobby erhielt die Auswahl 40/80/120 Felder. Die Engine, gespeicherte Räume, Käufe, Farbgruppen, Gebäude, Hypotheken, Handel, Bot-Ausbau und Vermögensberechnung wurden um die zusätzlichen Stadtviertel ergänzt. Die Varianten erhielten 1.500/3.000/4.500 Startgeld, 200/400/600 LOS-Bonus und 1/2/3 reguläre Würfe. Klassische Ansichten und Originaldaten blieben erhalten. Große Bretter erhielten eine zusätzliche flache bzw. CSS-perspektivische Ansicht mit Zoom, Übersicht, Figurenbewegung und Kamerafokus. Das Handelsmenü erhielt Partnersuche, sichtbare Hypotheken und Geldvorschau.

Abnahme: 40 automatisierte Tests und Typecheck bestanden. Deterministische Simulationen liefen auf jedem Brett mit 20 Bots für bis zu 1.600 Engine-Aktionen und prüften gültige Positionen, Käufe und gespeicherte Zustände. Statische React-Render-Prüfungen für Lobby, große Bretter, Besitzverwaltung, Handel und HUD bestanden mit simuliertem Browser-Standort. Diese Prüfungen ersetzten keine Browser-Interaktion und keinen Netzwerk-Lasttest. Kein lokaler Build wurde ausgeführt.

Nächste Schritte blieben echte Browserprüfungen auf Desktop und Mobilgeräten, parallele Raumanfragen mit 20 echten Clients und menschliche Balance-Runden. Die weitere Umsetzung der langfristigen Meilensteine (Bot-Schwierigkeitsstufen, neue Ereignisse/Missionen und Erfolge) blieb offen. Bereits angewandte Datenbankmigrationen wurden nicht verändert; die Erweiterung nutzte die bestehenden gespeicherten Raumzustände.

## Miniaturstadt und Materialgestaltung (5. November 2026)

Eine zusätzliche spielbare Three.js-Stadtansicht wurde für 40/80/120 Felder ergänzt und als anfängliche Ansicht gewählt. Die bisherigen 2D-/3D-Ansichten blieben über die Ansichtsauswahl erreichbar. Prozedurale Gebäude erhielten Fassaden, Fensterrahmen, Gesimse, Dachaufbauten und Türme; ihre Geometrie wurde pro Material zusammengefasst. Ein Holzsockel mit Messingkante, eine grüne Tischfläche, gerichtetes Licht und Schatten ergänzten die Darstellung. Grundstücke blieben anklickbar, Figuren spiegelten den Spielstand, Kameras boten Stadtansicht, Draufsicht, Fokus, Drehen und Zoom. Dekorative Architektur wurde ausdrücklich von Besitzstreifen und tatsächlichen Ausbau-Markern getrennt. Kauf- und Handelsvorschauen erhielten dieselbe Architektur; additive Stile verbanden Menü, Lobby und Spieloberfläche.

Prüfstatus dieser Ergänzung: Typecheck und alle 40 vorhandenen Tests bestanden. Eine zusätzliche ausführbare Geometrieprüfung kontrollierte 672 Kombinationen aus Grundstück und Ausbau auf endliche Geometrie und höchstens fünf Materialgruppen. Kein Build und keine visuelle Browserprüfung wurden ausgeführt. Vor Freigabe sind insbesondere Lesbarkeit, WebGL-Darstellung, mobile Kamerabedienung und Bildrate mit 120 Feldern im Browser zu prüfen. Gebäude sind prozedurale Miniaturen; die hochgeladene Referenz wurde nicht als fertiges 3D-Asset ausgegeben. Backend, Regeln, Migrationen und vorhandene Tests blieben unverändert.

## Redaktionelle Oberflächenverfeinerung (5. November 2026)

Der Einstieg erhielt eine additive Gestaltung mit warmem Papier, Tannengrün und rotem Monopoly-Schriftzug. Die Typografie, Abstände und Aktionshierarchie wurden vereinfacht. Das bestehende Wappen blieb als kleines Siegel im Profil erhalten. Beide Grafikvorschauen, Anleitung, sämtliche Figuren und Farben sowie Raumerstellung, Beitritt, Schnellspiel und Rangliste blieben verfügbar. Ergänzende Stile beruhigten Lobby, Spielkopf, Aktionsleiste und Grundstücksoberflächen. Keine Assets, Dateien, Brettansichten oder Modi wurden entfernt, verschoben oder umbenannt. Backend und Spielregeln blieben unverändert.

Prüfstatus dieser Änderung: Typecheck (`npm run lint`), alle 40 vorhandenen automatisierten Tests (`npm test`) und `git diff --check` bestanden. Diese Ergebnisse bestätigen keine visuelle Browserprüfung. Kein lokaler Build wurde ausgeführt. Desktop-/Mobilansichten, WebGL und Bedienabläufe müssen weiterhin im Browser geprüft werden.

## Spieltisch-Edition und Code-Download (5. November 2026)

Die Oberfläche erhielt einen grünen Spieltisch, gedruckte Grundstücksmotive, einen gerahmten Illustrationsbereich und ein helles Spielerprofil mit ausgewählter Figur. Lokal eingebundene, lizenzierte Lucide-Vektorgrafiken ersetzten Emoji-Darstellungen in Menü, Lobby, HUD, Handel, Protokoll, klassischen Brettfeldern und Miniaturstadt. Figurenkennungen und ursprüngliche 3D-Modelle blieben kompatibel. Das Startkapital im Lobbyprofil folgte nun der Brettgröße. Figur- und Farbauswahl erhielten zugängliche Beschriftungen; die Anleitung erhielt Fokusbegrenzung, Escape und Rückkehr zum auslösenden Knopf. Das vollständige Quellprojekt wurde als ZIP mit Download im Menü bereitgestellt. Bestehende Assets, Modi, Tests, Backend und Migrationen blieben erhalten.

Prüfstatus: Typecheck und alle 40 vorhandenen automatisierten Tests bestanden. SVG-Zuordnung und statisches Rendering wurden zusätzlich geprüft, ebenso ZIP-Integrität und Archivinhalt. Kein lokaler Build und keine visuelle Browserprüfung wurden ausgeführt. Mobile Darstellung und WebGL-Bedienung müssen noch visuell geprüft werden.

## Liquid-Glass-Webgestaltung (5. November 2026)

Die bestehenden Oberflächen erhielten eine additive `.arena-glass`-Gestaltung mit transparenten Materialien, Lichtkanten, abgerundeten Panels und kapselförmigen Auswahlleisten. Markenfarben und Materialrezepte wurden als getrennte CSS-Variablen gepflegt. Menü, Profil, Brettvorschauen, Anleitung, Lobby, Spielkopf, Aktionsleiste, Seitenpanels und Dialograhmen wurden verbunden; der grüne Monopoly-Spieltisch und alle bisherigen Inhalte blieben erhalten. Eingaben erhielten relative Schriftgrößen, Bedienelemente sichtbare Fokuszustände und größere Berührungsflächen. Deckende Ersatzflächen unterstützten Browser ohne Hintergrundfilter und die Einstellung für reduzierte Transparenz; reduzierte Bewegung und erzwungene Kontrastfarben wurden berücksichtigt.

Die README und alle vier Anleitungen aus https://github.com/uladluch/figma-to-swiftui wurden als Referenz gelesen. Übertragbare Prinzipien zu Designvariablen, Materialeffekten, semantischen Bedienelementen und Erhaltung bestehender Geschäftslogik wurden für React/CSS adaptiert. Native SwiftUI-APIs, Xcode-Assets und Figma-Rücksynchronisierung wurden nicht als Webfunktionen ausgegeben. Es lag keine konkrete Figma-Datei für einen exakten Designabgleich vor.

Prüfstatus: Typecheck (`npm run lint`), alle 40 vorhandenen Tests (`npm test`), CSS-Parsing mit Lightning CSS und `git diff --check` bestanden. Kein lokaler Build und keine visuelle Browserprüfung wurden ausgeführt. Desktop-/Mobilansichten, Transparenzkontrast über WebGL und Bedienung auf Touchgeräten bleiben visuell zu prüfen. Bestehende Dateien, Assets, Brettmodi, Regeln, Backend, angewandte Migrationen und Tests wurden erhalten.
