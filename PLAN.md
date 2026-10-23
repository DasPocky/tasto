# Tasto – Ausbauplan

Tipptrainer für das 10-Finger-System und schnelles Schreiben am Computer.
Läuft auf Cloudflare (Worker + D1) unter **endlab.de/tasto**, Code in `DasPocky/tasto`.

Stand dieses Plans: 23.10.2026 · Freigabe durch Björn ausstehend

---

## 1 · Grundsätze

| Thema | Entscheidung |
|---|---|
| Zielgerät | **Computer mit echter Tastatur.** Auf Handy/Tablet bleiben Start, Ergebnisse, Bestenliste und Profil lesbar; Tipp-Test und Training zeigen einen Hinweis statt der Übung. |
| Design | Schlicht: Weiß, Grau, Marineblau · IBM Plex Sans/Mono · feine Linien statt Karten · keine Deko-Grafiken |
| Ehrlichkeit | Jedes Ergebnis wird auf dem Server aus dem Tastenprotokoll nachgerechnet |
| Datenschutz | Kein Tracking, nur technisch nötige Cookies/Speicher → kein Cookie-Banner |
| Inhalte | Texte, Grafiken (auch Hände), Wortlisten und Lernregeln sind selbst erstellt bzw. frei lizenziert |
| Steuerung | Funktionen per Admin-Schalter ein-/ausschaltbar, ohne neues Deployment (wie beim Spieltisch) |
| Zusatzinhalte | Blog, Tastenkombinationen-Ratgeber u. Ä. **vorerst nicht** |

## 2 · Bereits umgesetzt

- Tipp-Engine (Fehlerkorrektur erzwungen/frei, Tastenprotokoll, Statistik je Zeichen)
- QWERTZ-Tastatur mit Fingerfarben, Zieltaste, Fingerhinweis
- Tipp-Test 60 s, Ergebnisseite mit Tempoverlauf, Bestenliste Top/Neueste
- Worker-API (Hono), D1-Datenbank, Deployment unter endlab.de/tasto
- Design Weiß/Grau/Marineblau

---

## 3 · Konten und Identität

### 3.1 Gäste (Geräteprofil)
- Beim ersten Besuch entsteht automatisch ein **Gastprofil**: Profil-ID + zufälliger Geräteschlüssel.
  Der Schlüssel bleibt im Browser, der Server speichert nur seinen Hash.
- Der komplette Trainingsfortschritt gehört zum Profil – ohne Anmeldung nutzbar.
- **Übertragen auf einen anderen Computer:** „Code zum Übertragen“ (8 Zeichen, 15 Minuten gültig, einmalig).
  Fehlversuche werden gebremst.
- **Aufräumen:** Gastprofile ohne Aktivität werden nach einstellbarer Frist gelöscht (Standard 180 Tage).

### 3.2 Registrierung und Login
- Registrierung mit **E-Mail, Benutzername, Passwort**. Ein bestehendes Gastprofil wird dabei übernommen
  (kein Fortschritt geht verloren).
- Login mit E-Mail oder Benutzername + Passwort; Logout; „angemeldet bleiben“.
- Passwort-Hashing: PBKDF2-SHA-256 (Web Crypto), Salt je Konto, Login-Versuche gebremst.
- Sitzung über httpOnly-Cookie (SameSite=Lax, Pfad `/tasto`), Token-Hash in D1.
- Einstellungen: Benutzername, E-Mail, Passwort ändern, Konto löschen (inkl. aller Daten).

### 3.3 E-Mail (vorbereitet, kein Versand)
- Mail-Modul für einen **normalen SMTP-Account** (STARTTLS/SSL über Cloudflare TCP-Sockets, Port 587/465).
- Zugangsdaten nur als Worker-Secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- Vorlagen: E-Mail bestätigen, Passwort zurücksetzen, E-Mail-Adresse geändert.
- Abläufe (Bestätigen, Zurücksetzen) sind fertig gebaut, aber hinter dem Schalter **„E-Mail-Versand“ (aus)**.
  Solange aus: keine Mails, E-Mail dient nur zum Login; „Passwort vergessen“ zeigt einen Hinweis.
- Test-Modus: Mails werden statt versendet im Admin-Bereich angezeigt.

### 3.4 Rollen
- `guest`, `user`, `admin`. Erster Admin wird per Einmal-Befehl (Wrangler) gesetzt.

---

## 4 · Kurs und Lernmodell

### 4.1 Kurs „Deutsch QWERTZ“
| Stufe | Tasten |
|---|---|
| 1 Grundstellung | a s d f j k l ö, Leertaste |
| 2 Grundreihe | g h |
| 3 Obere Reihe | e i r u t z o w p q |
| 4 Untere Reihe | n m v b c , . x y - |
| 5 Großbuchstaben | linke und rechte Umschalttaste |
| 6 Umlaute & ß | ä ü ß |
| 7 Satzzeichen | ? ! : ; " ' ( ) |
| 8 Zahlen | 1–0 |
Reihenfolge innerhalb der Stufen nach Häufigkeit im Deutschen.

### 4.2 Lernstand je Taste
- **Genauigkeit** und **Tempo** (Zeit bis zum Anschlag): gleitender Mittelwert über die Übungen
- **XP je Übung und Taste:** `100 × Tempofaktor × Genauigkeitsfaktor`, unabhängig davon, wie oft die Taste vorkam
  - Tempofaktor: 1,0 bis 200 ms, linear fallend, mindestens 0,4
  - Genauigkeitsfaktor: 1,0 bei 100 %, steil fallend unter 90 %, 0 unter 50 %
- **Ränge 1–10** je Taste, XP-Bedarf wächst je Rang (1000, 1100, 1200 …); Rang 10 = gemeistert
- **Freischaltung:** nächste Taste, sobald alle aktiven Tasten ≥ 90 % Genauigkeit und ≤ 450 ms erreichen
  und die zuletzt neue Taste mindestens Rang 2 hat
- Alle Werte als Konstanten an einer Stelle, per Tests abgesichert, später feinjustierbar

### 4.3 Übungstexte
- Serverseitig erzeugt, nur aus freigeschalteten Zeichen
- Gewichtung: schwache Tasten (niedrige Genauigkeit / langsames Tempo / neu) kommen häufiger vor
- Quellen: frei lizenzierte deutsche Wortliste (Häufigkeit; Lizenz wird vor Nutzung geprüft und vermerkt),
  bei zu wenig echten Wörtern Silben und Buchstabenfolgen
- Ab Stufe 5: Großschreibung von Nomen und Satzanfängen, später kurze Sätze mit Satzzeichen
- Tipp-Test: bleibt bei Pseudo-Wörtern, zusätzlich Option „echte Wörter“

---

## 5 · Training

### 5.1 Einstieg
- „Neu im 10-Finger-System?“ → Einführung
- „Ich kann schon etwas“ → **Einstufungstest** (siehe 5.5)

### 5.2 Einführung Grundstellung
Kurze Schritte mit Tastatur und Händen: Das ist die Tastatur → Tastmarken auf F und J →
Finger daneben ablegen → Daumen auf die Leertaste → erste Übung.

### 5.3 Ablauf einer Session
- **Neue Taste vorstellen:** Position und Finger zeigen, Taste 5× hintereinander richtig tippen
- **Übung:** eine Zeile (~50 Zeichen), Fehler müssen korrigiert werden, danach Mini-Auswertung (Tempo, Fehler)
- **Ereignisse:** „Taste freigeschaltet“, „Neuer Rang“, Zeit-Hinweise bei 50 / 70 / 90 % des Tagesziels
- **Pausen:** Hinweis auf eine kurze Lockerungspause nach jeweils ~5 Minuten
- **Session-Ende** beim Erreichen des Tagesziels: Zusammenfassung (Zeit, Tempo, Genauigkeit, neue Tasten, Ränge)
  – weiterüben bleibt möglich

### 5.4 Tagesziel – Konzept
| Punkt | Vorschlag |
|---|---|
| Auswahl | 5 · 10 · 15 · 20 · 30 Minuten reine Übungszeit |
| Standard | **10 Minuten** – kurz genug für jeden Tag; kurze tägliche Einheiten bringen beim Erlernen motorischer Abläufe mehr als seltene lange |
| Zählung | Nur aktive Tippzeit (Leerlauf > 10 s zählt nicht) |
| Wochenziel statt starrer Serie | Ziel: an **5 von 7 Tagen** das Tagesziel erreichen – ein ausgelassener Tag bricht nichts ab |
| Serie | Zusätzlich „Tage in Folge“, mit einem automatischen Aussetzer pro Woche |
| Anpassung | Nach 7 Tagen Vorschlag: Ziel erhöhen, wenn es jeden Tag deutlich überschritten wurde, senken, wenn es oft verfehlt wurde |
| Anzeige | Fortschrittsbalken in der Kopfzeile während des Trainings, Wochenansicht im Fortschritt |

### 5.5 Einstufungstest
- 2 Minuten Text mit allen Buchstaben; Auswertung je Taste
- Tasten mit gutem Ergebnis werden freigeschaltet und mit passendem Startrang versehen

---

## 6 · Hände, Finger, Shift
- Eigene SVG-Grafik beider Hände unter der Tastatur; aktiver Finger in Fingerfarbe hervorgehoben
- Umschalttaste: mit dem kleinen Finger der **Gegenhand**, Hinweis bevor ein Großbuchstabe kommt
- Einstellungen: Hände ein/aus, Fingerfarben ein/aus, Tastatur ein/aus (für Fortgeschrittene)

---

## 7 · Fortschritt
- Übersicht: Tastatur mit Rang je Taste, Gesamtfortschritt im Kurs, aktuelles Tempo und Genauigkeit
- Verlauf: Tempo/Genauigkeit über Sessions, Tagesziel-Woche, Serie
- Schwächste Tasten mit Direktübung
- Eigene Tipp-Test-Historie (beste und letzte Ergebnisse)

---

## 8 · Wettbewerb
- **Spitznamen:** Gäste und Konten können einen Spitznamen für die Bestenliste setzen
  (Längen-/Zeichenprüfung, Wortfilter). Schalter: Spitznamen an/aus, Gäste in der Bestenliste an/aus.
  Admin kann Spitznamen zurücksetzen.
- **Bestenliste:** Top / Neueste, Zeitraum heute / Woche / gesamt, eigener Rang, eigene Ergebnisse markiert
- **Challenges:** gegen einen gespeicherten Lauf antreten (zufällig oder aus der Bestenliste);
  der Gegner läuft als „Geist“ im Text mit, am Ende Vergleich
- **Plausibilität:** Mindestgenauigkeit für die Bestenliste, Prüfung des Anschlagrhythmus, Rate-Limits

---

## 9 · Admin
- Zugang nur mit Rolle `admin`
- **Schalter:** Registrierung, Gastprofile, Spitznamen, Gäste in Bestenliste, Challenges, E-Mail-Versand,
  Wartungsmodus (mit Hinweistext)
- **Einstellungen:** Löschfrist für Gäste, Mindestgenauigkeit Bestenliste
- **Nutzer:** suchen, Rolle setzen, sperren, löschen, Spitznamen zurücksetzen
- **Mail-Test:** SMTP-Verbindung testen, Vorschau der Vorlagen
- Konfiguration in D1, Clients bekommen den öffentlichen Teil über `/api/config`

---

## 10 · Seiten
| Route | Inhalt |
|---|---|
| `/` | Start |
| `/tipp-test`, `/ergebnis/:id`, `/challenge/:id` | Tipp-Test, Ergebnis, Challenge |
| `/bestenliste` | Bestenliste |
| `/training`, `/training/start`, `/training/einstufung` | Übersicht, Session, Einstufungstest |
| `/fortschritt` | Fortschritt |
| `/anmelden`, `/registrieren`, `/passwort-vergessen`, `/bestaetigen/:token`, `/zuruecksetzen/:token` | Konto |
| `/einstellungen` | Profil, Passwort, Training, Anzeige, Gerät übertragen, Konto löschen |
| `/admin` | Admin |
| `/impressum`, `/datenschutz`, `/kontakt`, `/neu` | Rechtliches, Feedback (in D1), Changelog |

---

## 11 · Technik

### 11.1 Datenmodell (D1)
| Tabelle | Inhalt |
|---|---|
| `tests`, `performances` | Tipp-Tests und Ergebnisse (+ Profil, Challenge-Bezug) |
| `profiles` | Gast/Konto: Rolle, Spitzname, Benutzername, E-Mail, Passwort-Hash, Status, Zeitstempel |
| `device_keys` | Gerätschlüssel-Hashes je Profil |
| `auth_sessions` | Login-Sitzungen (Token-Hash, Ablauf) |
| `transfer_codes` | Übertragungscodes (Hash, Ablauf) |
| `email_tokens` | Bestätigungs-/Reset-Tokens (Hash, Ablauf, Zweck) |
| `learners` | Kurs, Tagesziel, Anzeige-Einstellungen |
| `unit_stats` | Lernstand je Profil und Taste |
| `training_sessions`, `exercises` | Sessions, Übungen inkl. Tastenprotokoll |
| `daily_activity` | aktive Übungszeit je Tag (Tagesziel, Serie) |
| `config` | Admin-Schalter und Einstellungen |
| `feedback` | Kontakt/Feedback |
| `rate_limits` | Zähler für Bremsen |

### 11.2 Code-Struktur
- `src/lib` – gemeinsame Logik (Engine, Lernmodell, Kurs, Textgenerator) für Browser und Worker
- `worker/` – API nach Bereichen (`auth`, `profile`, `training`, `tests`, `admin`, `mail`), Middleware für Sitzung, Rollen, Limits
- `src/pages`, `src/components` – Oberfläche
- Migrationen in `migrations/`, nummeriert

### 11.3 Qualität
- Vitest für Engine, Lernmodell, Textgenerator, Auswertung und API (mit lokaler D1)
- Browser-Durchlauf (Playwright) für Tipp-Test, Training, Registrierung
- `oxlint` und `tsc` im Build

### 11.4 Deployment
- GitHub Actions: bei Push auf `main` → Tests → Migrationen → Deployment
  (Repo-Secret `CLOUDFLARE_API_TOKEN` nötig; bis dahin Deployment aus der Arbeitsumgebung)
- Migrationen immer rückwärtskompatibel, damit laufende Versionen nicht brechen

---

## 12 · Reihenfolge

| # | Paket | Ergebnis |
|---|---|---|
| 1 | Fundament | Datenmodell, Gastprofile, Sitzungen, Config/Schalter, Mobil-Hinweis, Tests, Rate-Limits |
| 2 | Lernmodell & Kurs | Kursdefinition, Lernstand, XP/Ränge, Freischaltung, Textgenerator mit Wortliste |
| 3 | Training | Einstieg, Einführung, neue Taste, Übungen, Ereignisse, Tagesziel, Session-Ende |
| 4 | Hände & Shift | Hand-Grafik, Shift-Logik, Anzeige-Optionen |
| 5 | Fortschritt | Übersicht, Verlauf, Woche/Serie, schwächste Tasten |
| 6 | Konten | Registrierung, Login, Gast-Übernahme, Einstellungen, Übertragungscode, Konto löschen |
| 7 | Mail vorbereitet | SMTP-Modul, Vorlagen, Bestätigen/Zurücksetzen hinter Schalter |
| 8 | Wettbewerb | Spitznamen, erweiterte Bestenliste, Challenges, Plausibilität |
| 9 | Einstufungstest | Test und automatische Freischaltung |
| 10 | Admin | Schalter, Nutzerverwaltung, Mail-Test |
| 11 | Seiten & Betrieb | Impressum, Datenschutz, Kontakt, Changelog, Aufräum-Job für Gäste |

Nach jedem Paket: Tests, Browser-Durchlauf, Commit, Deployment, kurzer Statusbericht.

## 13 · Was ich von dir brauche (nicht blockierend)
- Inhalt für Impressum/Datenschutz (Name, Anschrift, Kontakt) – bis dahin Platzhalter
- SMTP-Zugangsdaten, sobald der Versand an soll
- Optional: `CLOUDFLARE_API_TOKEN` als GitHub-Secret für automatisches Deployment
