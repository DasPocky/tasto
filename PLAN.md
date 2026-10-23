# Tasto – Ausbauplan

Ziel: ein vollständiger Tipptrainer für das 10-Finger-System und schnelles Schreiben am Computer.
Läuft auf Cloudflare (Worker + D1) unter `endlab.de/tasto`.

## Grundsätze

- **Desktop zuerst.** Geübt wird mit echter Tastatur. Auf Handy/Tablet bleiben Startseite, Ergebnisse
  und Bestenliste lesbar; Tipp-Test und Training zeigen dort einen Hinweis statt der Übung.
- **Schlichtes Design:** Weiß, Grau, Marineblau, IBM Plex Sans/Mono, feine Linien statt Karten.
- **Ehrliche Zahlen:** Der Server rechnet jedes Ergebnis aus dem Tastenprotokoll nach.
- **Datensparsam:** kein Tracking, nur technisch nötige Cookies → kein Cookie-Banner nötig.
- **Eigene Inhalte:** Texte, Grafiken, Wortlisten und Lernregeln sind selbst erstellt bzw. frei lizenziert.

## Stand

| Bereich | Status |
|---|---|
| Tipp-Engine (Fehlerkorrektur erzwungen/frei, Tastenprotokoll, Statistik je Zeichen) | ✅ |
| QWERTZ-Tastatur mit Fingerfarben und Zieltaste | ✅ |
| Tipp-Test 60 s, Ergebnisseite mit Tempoverlauf, Bestenliste Top/Neueste | ✅ |
| Worker-API, D1, Deployment auf endlab.de/tasto | ✅ |
| Design Weiß/Grau/Marineblau | ✅ |

## Phasen

### 1 · Fundament
- Gast-Identität: beim ersten Besuch anonymes Konto, Sitzung per httpOnly-Cookie (Token-Hash in D1)
- Mobil-Hinweis für Tipp-Test und Training (Bildschirm zu klein / keine Tastatur erkannt)
- Tests (Vitest) für Tipp-Engine, Statistik und Lernmodell
- GitHub Actions: Build, Tests, automatisches Deployment bei Push auf `main`
  (braucht das Repo-Secret `CLOUDFLARE_API_TOKEN`)
- Rate-Limit für schreibende API-Aufrufe

### 2 · Lernmodell und Kurs
- Kurs „Deutsch QWERTZ“ in Stufen: Grundreihe (a s d f j k l ö + Leertaste) → g h →
  obere Reihe → untere Reihe → Großbuchstaben/Shift → Satzzeichen (, . - ? !) → ä ü ß → Zahlen
- Lernstand je Taste: Genauigkeit und Tempo (gleitender Mittelwert), XP, Rang 1–10
- XP je Übung und Taste aus Tempo × Genauigkeit (max. 100), Ränge mit wachsendem XP-Bedarf
- Freischaltregel: nächste Taste, sobald alle aktiven Tasten ≥ 90 % Genauigkeit und ein Mindesttempo erreichen
- Übungstexte serverseitig: Wörter nur aus freigeschalteten Buchstaben, schwache Tasten häufiger,
  bei zu wenigen echten Wörtern Silben/Buchstabenfolgen
- Größere deutsche Wortliste (frei lizenzierte Häufigkeitsliste, Lizenz vorher prüfen)

### 3 · Training
- Einstieg: „Neu im 10-Finger-System?“ oder „Ich kann schon etwas“ (→ Einstufungstest, Phase 8)
- Einführung Grundstellung in kurzen Schritten (Tastatur, Tastmarken F/J, Finger ablegen, Daumen, erste Übung)
- Neue Taste vorstellen: Position + Finger zeigen, 5× hintereinander richtig tippen
- Übungen (eine Zeile, Fehler müssen korrigiert werden), danach kurze Auswertung
- Ereignisse: „Taste freigeschaltet“, „Neuer Rang“, Hinweise bei 50/70/90 % der Zeit
- Session = Tagesziel (Standard 10 Minuten, einstellbar), Pause und Session-Ergebnis

### 4 · Hände, Finger, Shift
- Eigene SVG-Grafik beider Hände über/unter der Tastatur, aktiver Finger hervorgehoben
- Shift-Logik: Umschalttaste mit dem kleinen Finger der Gegenhand, Hinweis vor Großbuchstaben
- Einstellung: Hände/Fingerfarben ein- oder ausblenden (für Fortgeschrittene)

### 5 · Fortschritt
- Trainingsübersicht: Ränge aller Tasten auf der Tastatur, Gesamtfortschritt, aktuelles Tempo
- Verlauf: Tempo und Genauigkeit über die letzten Sessions, Tagesziel-Serie (Streak)
- Schwächste Tasten mit Direktübung

### 6 · Konten
- Registrierung mit Benutzername + Passwort (E-Mail optional), Login, Logout
- Gast-Fortschritt wird beim Registrieren übernommen
- Einstellungen: Benutzername, Passwort, Tagesziel, Anzeigeoptionen
- Passwort-Hashing mit PBKDF2 (Web Crypto)
- Später mit Mail-Anbieter: E-Mail bestätigen, Passwort zurücksetzen

### 7 · Wettbewerb
- Challenges: gegen einen gespeicherten Lauf antreten, der Gegner läuft als „Geist“ mit
- Bestenliste mit Benutzernamen, Filter (heute/Woche/gesamt), eigener Rang
- Strengere Plausibilitätsprüfung (Anschlagsrhythmus, Mindestgenauigkeit)

### 8 · Einstufungstest
- Kurzer Test für Fortgeschrittene, der den Lernstand je Taste schätzt und passende Tasten freischaltet

### 9 · Seiten und Betrieb
- Impressum, Datenschutz, Kontakt/Feedback (in D1 gespeichert, ohne Mail)
- „Was ist neu“ (Changelog)
- Fehler-Logging über Cloudflare Observability, einfache Nutzungszahlen ohne Tracking

## Datenmodell (D1, wächst mit den Phasen)

| Tabelle | Inhalt |
|---|---|
| `tests`, `performances` | Tipp-Tests und Ergebnisse ✅ |
| `users`, `sessions_auth` | Gast-/Benutzerkonten, Login-Sitzungen |
| `learners` | Kurs, Tagesziel, Einstellungen |
| `unit_stats` | Lernstand je Benutzer und Taste |
| `training_sessions`, `exercises` | Trainings-Sessions und einzelne Übungen inkl. Tastenprotokoll |
| `feedback` | Kontakt/Feedback |

## Offene Entscheidungen

1. E-Mail bei der Registrierung: optional oder ganz weglassen, bis ein Mail-Anbieter steht?
2. Name in der Bestenliste: nur registrierte Konten oder auch Gäste mit frei wählbarem Spitznamen?
3. Tagesziel-Standard: 10 Minuten?
4. Zusatzinhalte wie Tastenkombinationen-Ratgeber oder Blog: gewünscht oder weglassen?
