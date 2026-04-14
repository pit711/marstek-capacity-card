/**
 * Marstek Capacity Card
 * HACS Lovelace Custom Card for Marstek Venus E capacity testing
 * https://github.com/pit711/marstek-capacity-card
 */

const CARD_VERSION = '1.0.0';
const NENN = 5120;
const ZELL_NAMEN = Array.from({length:16},(_,i)=>`batteriepack_1_zelle_${i+1}_spannung`);
const ZELL_LABELS = Array.from({length:16},(_,i)=>`Z${String(i+1).padStart(2,'0')}`);
const ZELL_FARBEN = ['#003F91','#1d4ed8','#0891b2','#0e7490','#047857','#16a34a','#65a30d','#ca8a04','#d97706','#dc2626','#9333ea','#7c3aed','#db2777','#be185d','#475569','#0f766e'];

// ── i18n ───────────────────────────────────────────────────────────────────
const T = {
  de: {
    title:'Marstek Venus E — Kapazitätsprüfung',
    sub:'Mehrzyklen · Zellspannungsaufzeichnung · Modbus TCP',
    params:'Prüfparameter', numCycles:'Anzahl Prüfzyklen', cyclesUnit:'Zyklen',
    cyclesHint:'Jeder Zyklus: Entladen → Laden → Messentladen',
    pwr1lbl:'Schritt 1 – Entladeleistung', pwr2lbl:'Schritt 2 – Ladeleistung', pwr3lbl:'Schritt 3 – Messentladeleistung',
    warn800:'Leistung über 800 W — muss von einem <strong>zugelassenen Elektrofachmann genehmigt</strong> worden sein.',
    socLow:'SoC-Untergrenze (%)', socHigh:'SoC-Obergrenze (%)',
    socHint:'Tiefentladeschutz fest auf 12 % programmiert. Nennkapazität: 5.120 Wh. Maximal messbar: ~4.506 Wh.',
    warningBox:'<strong>Hinweis:</strong> Während der Prüfung steht der Speicher <strong>nicht für Eigenverbrauch oder Netzregelung</strong> zur Verfügung.',
    infoBox:'Empfohlene Messstromstärke: C/5-Rate (~1.024 W). Niedrigere Werte erhöhen die Messgenauigkeit.',
    btnStart:'Prüfung starten', btnAbort:'Prüfung abbrechen', btnExport:'Gesamtprotokoll', btnCancel:'Abbrechen',
    procedure:'Prüfablauf',
    step1title:'Schritt 1 – Vollständiges Entladen', step1sub:'Auf SoC-Untergrenze entladen',
    step2title:'Schritt 2 – Vollständiges Laden', step2sub:'Auf SoC-Obergrenze laden',
    step3title:'Schritt 3 – Messentladung', step3sub:'Kapazitätsmessung per Energieintegration',
    step4title:'Schritt 4 – Auswertung', step4sub:'Kapazitätsberechnung und Protokollerstellung',
    cycleLbl:'Zyklus', stepTime:'Schrittzeit', totalTime:'Gesamtdauer', remaining:'Verbleibend',
    cardSoc:'Ladezustand (SoC)', cardPwr:'AC-Leistung', cardCell:'Zellspannung Ø', cardCap:'Kapazität (akt. Zyklus)', cardCapSub:'Schritt 3 Energieintegral',
    socChart:'SoC-Verlauf · Aktueller Zyklus',
    cellMonitor:'Zellspannungsüberwachung · 16 Zellen',
    legendOk:'OK (<5 mV)', legendWarn:'Warn (5–15 mV)', legendErr:'Drift (>15 mV)', driftCells:'Driftzellen',
    cycleResults:'Prüfzyklen — Ergebnisse',
    modalTitle:'⚠ Prüfung jetzt starten?',
    modalBody:(nz,u,o)=>`Der Speicher wird auf <strong>Manuell-Betrieb</strong> umgeschaltet und steht <strong>nicht für Eigenverbrauch oder Netzstabilisierung</strong> zur Verfügung.<br><br>Geplante Zyklen: <strong>${nz}</strong><br>Ablauf: Entladen auf <strong>${u}%</strong> → Laden auf <strong>${o}%</strong> → Messentladung auf <strong>${u}%</strong><br><br>Empfehlung: <strong>Außerhalb von Nutzungszeiten</strong> starten.`,
    statusHalt:'GESPERRT', statusRun:'LÄUFT', statusOk:'ABGESCHLOSSEN', statusAbort:'ABGEBROCHEN',
    charging:'Laden', discharging:'Entladen', standby:'Standby',
    zykStart:(n,t)=>`Zyklus ${n} — ${t}`,
    zykDurDelta:(d,delta)=>`Dauer: ${d} · Delta: ${delta} mV`,
    resCap:'Kapazität', resHealth:'Kapazitätserhalt', resDrift:'Max. Zelldrift', resDur:'Dauer',
    btnPrint:'Drucken', btnProto:'Protokoll (.txt)', btnCsv:'Messdaten (.csv)',
    logReady:'Marstek Kapazitätsprüfung v'+CARD_VERSION+' bereit.',
    logConnTest:'Verbindung wird getestet …',
    logConnOk:(s)=>`Verbunden – SoC: ${s} %`,
    logConnFail:(e)=>`Verbindungsfehler: ${e}`,
    logStarted:(n)=>`Prüfung gestartet – ${n} Zyklus/Zyklen`,
    logZykStart:(n)=>`Zyklus ${n} startet …`,
    logStep1:(w,u)=>`Schritt 1 – Entladen @ ${w} W bis SoC ${u} %`,
    logStep1done:(s)=>`Schritt 1 abgeschlossen – SoC ${s} %`,
    logStep2:(w)=>`Schritt 2 – Laden @ ${w} W`,
    logStep2done:(s)=>`Schritt 2 abgeschlossen – SoC ${s} %`,
    logStep3:(w)=>`Schritt 3 – Messentladung @ ${w} W`,
    logStep3done:'Schritt 3 abgeschlossen',
    logZykDone:(n,k)=>`Zyklus ${n} abgeschlossen – ${k} Wh`,
    logAllDone:(n)=>`Prüfung abgeschlossen – ${n} Zyklen`,
    logAbort:'Prüfung abgebrochen',
    logMode:(m)=>`Betriebsmodus → ${m}`,
    logDischarge:(w)=>`Erzwungenes Entladen @ ${w} W`,
    logCharge:(w)=>`Erzwungenes Laden @ ${w} W`,
    bannerCfg:[
      {cls:'',pikt:'⚙',bez:'Bereit',titel:'Prüfung konfigurieren und starten',sub:'Parameter einstellen, dann Prüfung starten'},
      {cls:'s1',pikt:'▼',bez:'Schritt 1',titel:'Vollständiges Entladen',sub:'Speicher wird auf SoC-Untergrenze entladen'},
      {cls:'s2',pikt:'▲',bez:'Schritt 2',titel:'Vollständiges Laden',sub:'Speicher wird auf SoC-Obergrenze geladen'},
      {cls:'s3',pikt:'≋',bez:'Schritt 3',titel:'Messentladung – Kapazitätsbestimmung',sub:'Energieintegration aktiv · Wh werden akkumuliert'},
      {cls:'s4',pikt:'✓',bez:'Schritt 4',titel:'Prüfung abgeschlossen',sub:'Ergebnisse in den Zyklus-Karten verfügbar'}
    ],
  },
  en: {
    title:'Marstek Venus E — Capacity Test',
    sub:'Multi-Cycle · Cell Voltage Recording · Modbus TCP',
    params:'Test Parameters', numCycles:'Number of Cycles', cyclesUnit:'Cycles',
    cyclesHint:'Each cycle: Discharge → Charge → Measurement discharge',
    pwr1lbl:'Step 1 – Discharge Power', pwr2lbl:'Step 2 – Charge Power', pwr3lbl:'Step 3 – Measurement Discharge Power',
    warn800:'Power above 800 W — must be <strong>approved by a licensed electrician</strong> before use.',
    socLow:'SoC Lower Limit (%)', socHigh:'SoC Upper Limit (%)',
    socHint:'Deep discharge protection fixed at 12 % SoC. Rated capacity: 5,120 Wh. Max measurable: ~4,506 Wh.',
    warningBox:'<strong>Note:</strong> During the test the storage is <strong>not available for self-consumption or grid regulation</strong>.',
    infoBox:'Recommended rate: C/5 (~1,024 W for 5.12 kWh). Lower values improve accuracy.',
    btnStart:'Start Test', btnAbort:'Abort Test', btnExport:'Full Report', btnCancel:'Cancel',
    procedure:'Test Procedure',
    step1title:'Step 1 – Full Discharge', step1sub:'Discharge to SoC lower limit',
    step2title:'Step 2 – Full Charge', step2sub:'Charge to SoC upper limit',
    step3title:'Step 3 – Measurement Discharge', step3sub:'Capacity measurement by energy integration',
    step4title:'Step 4 – Evaluation', step4sub:'Capacity calculation and report',
    cycleLbl:'Cycle', stepTime:'Step Time', totalTime:'Total Duration', remaining:'Remaining',
    cardSoc:'State of Charge (SoC)', cardPwr:'AC Power', cardCell:'Cell Voltage Avg', cardCap:'Capacity (cur. Cycle)', cardCapSub:'Step 3 Energy Integral',
    socChart:'SoC Trace · Current Cycle',
    cellMonitor:'Cell Voltage Monitor · 16 Cells',
    legendOk:'OK (<5 mV)', legendWarn:'Warn (5–15 mV)', legendErr:'Drift (>15 mV)', driftCells:'Drift Cells',
    cycleResults:'Test Cycles — Results',
    modalTitle:'⚠ Start Test Now?',
    modalBody:(nz,u,o)=>`Storage will switch to <strong>Manual Mode</strong> and will <strong>not be available for self-consumption or grid stabilisation</strong>.<br><br>Planned cycles: <strong>${nz}</strong><br>Per cycle: Discharge to <strong>${u}%</strong> → Charge to <strong>${o}%</strong> → Measurement discharge to <strong>${u}%</strong><br><br>Recommendation: Start <strong>outside peak usage hours</strong>.`,
    statusHalt:'LOCKED', statusRun:'RUNNING', statusOk:'COMPLETED', statusAbort:'ABORTED',
    charging:'Charging', discharging:'Discharging', standby:'Standby',
    zykStart:(n,t)=>`Cycle ${n} — ${t}`,
    zykDurDelta:(d,delta)=>`Duration: ${d} · Delta: ${delta} mV`,
    resCap:'Capacity', resHealth:'Retention', resDrift:'Max Drift', resDur:'Duration',
    btnPrint:'Print', btnProto:'Report (.txt)', btnCsv:'Data (.csv)',
    logReady:'Marstek Capacity Test v'+CARD_VERSION+' ready.',
    logConnTest:'Testing connection …',
    logConnOk:(s)=>`Connected – SoC: ${s} %`,
    logConnFail:(e)=>`Connection error: ${e}`,
    logStarted:(n)=>`Test started – ${n} cycle(s)`,
    logZykStart:(n)=>`Cycle ${n} starting …`,
    logStep1:(w,u)=>`Step 1 – Discharging @ ${w} W to SoC ${u} %`,
    logStep1done:(s)=>`Step 1 complete – SoC ${s} %`,
    logStep2:(w)=>`Step 2 – Charging @ ${w} W`,
    logStep2done:(s)=>`Step 2 complete – SoC ${s} %`,
    logStep3:(w)=>`Step 3 – Measurement discharge @ ${w} W`,
    logStep3done:'Step 3 complete',
    logZykDone:(n,k)=>`Cycle ${n} complete – ${k} Wh`,
    logAllDone:(n)=>`Test complete – ${n} cycle(s)`,
    logAbort:'Test aborted',
    logMode:(m)=>`Operating mode → ${m}`,
    logDischarge:(w)=>`Force discharge @ ${w} W`,
    logCharge:(w)=>`Force charge @ ${w} W`,
    bannerCfg:[
      {cls:'',pikt:'⚙',bez:'Ready',titel:'Configure and start test',sub:'Set parameters, then start test'},
      {cls:'s1',pikt:'▼',bez:'Step 1',titel:'Full Discharge',sub:'Discharging to SoC lower limit'},
      {cls:'s2',pikt:'▲',bez:'Step 2',titel:'Full Charge',sub:'Charging to SoC upper limit'},
      {cls:'s3',pikt:'≋',bez:'Step 3',titel:'Measurement Discharge',sub:'Energy integration active'},
      {cls:'s4',pikt:'✓',bez:'Step 4',titel:'Test Complete',sub:'Results in cycle cards below'}
    ],
  }
};

// ── Styles ─────────────────────────────────────────────────────────────────
const STYLES = `
  :host { display: block; font-family: 'PT Sans', var(--primary-font-family, sans-serif); font-size: 13px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .card-root { background: var(--card-background-color, #fff); border-radius: var(--ha-card-border-radius, 12px); overflow: hidden; }
  .hdr { background: #003F91; color: #fff; border-bottom: 3px solid #FFC300; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
  .hdr-title { flex: 1; }
  .hdr-title h2 { font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }
  .hdr-title p { font-size: 11px; opacity: 0.75; margin-top: 1px; }
  .langswitch { display: flex; border: 1px solid rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden; }
  .langbtn { padding: 3px 9px; font-size: 11px; font-weight: 700; background: transparent; border: none; color: rgba(255,255,255,0.55); cursor: pointer; }
  .langbtn.on { background: rgba(255,255,255,0.2); color: #fff; }
  .statusbar { background: #002D6B; padding: 4px 16px; display: flex; align-items: center; gap: 14px; font-size: 11px; color: rgba(255,255,255,0.7); flex-wrap: wrap; }
  .si { display: flex; align-items: center; gap: 5px; }
  .sdot { width: 7px; height: 7px; border-radius: 50%; background: #6B7280; flex-shrink: 0; }
  .sdot.on { background: #22C55E; } .sdot.err { background: #EF4444; } .sdot.run { background: #F59E0B; animation: bl 1.2s infinite; }
  @keyframes bl { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .sbadge { margin-left: auto; padding: 2px 9px; border-radius: 1px; font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
  .bhalt { background: #EF4444; color: #fff; } .blauf { background: #F59E0B; color: #000; } .bok { background: #22C55E; color: #fff; }
  .body { display: grid; grid-template-columns: 280px 1fr; min-height: 500px; }
  .sidebar { border-right: 1px solid var(--divider-color, #e0e0e0); overflow-y: auto; max-height: 80vh; }
  .sbs { border-bottom: 1px solid var(--divider-color, #e0e0e0); padding: 12px 14px; }
  .sbh { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #003F91; border-bottom: 2px solid #003F91; display: inline-block; margin-bottom: 9px; padding-bottom: 3px; }
  .fl { display: flex; flex-direction: column; gap: 2px; margin-bottom: 7px; }
  .fl label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--secondary-text-color, #666); }
  input[type=number] { background: var(--input-fill-color, #f5f5f5); border: 1px solid var(--input-idle-line-color, #ccc); border-radius: 4px; color: var(--primary-text-color, #333); font-family: 'Source Code Pro', monospace; font-size: 12px; padding: 5px 8px; width: 100%; outline: none; }
  input[type=number]:focus { border-color: #003F91; }
  .pwrrow { margin-bottom: 9px; }
  .pwrlabel { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--secondary-text-color, #666); margin-bottom: 3px; }
  .pwrwrap { display: flex; }
  .pwrwrap input { flex: 1; border-right: none; border-radius: 4px 0 0 4px; }
  .pwrunit { background: var(--input-fill-color, #f0f0f0); border: 1px solid var(--input-idle-line-color, #ccc); padding: 5px 9px; font-size: 11px; color: var(--secondary-text-color, #666); font-family: monospace; display: flex; align-items: center; border-radius: 0 4px 4px 0; }
  .w800 { display: none; background: #FDECEA; border: 1px solid #E8A49C; border-left: 3px solid #C0392B; padding: 6px 8px; font-size: 11px; color: #C0392B; line-height: 1.5; margin-top: 3px; border-radius: 2px; }
  .w800.show { display: block; }
  .socrow { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 7px; }
  .socfield label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--secondary-text-color, #666); display: block; margin-bottom: 2px; }
  .sochint { grid-column: 1/-1; font-size: 10px; color: var(--secondary-text-color, #888); background: var(--input-fill-color, #f5f5f5); border: 1px solid var(--divider-color, #ddd); border-left: 2px solid #9A9A90; padding: 5px 7px; margin-top: 2px; border-radius: 2px; }
  .btn { display: block; width: 100%; padding: 8px; border: none; font-family: inherit; font-size: 12px; font-weight: 700; letter-spacing: 0.03em; cursor: pointer; text-transform: uppercase; border-radius: 4px; transition: filter 0.1s; }
  .btn:hover { filter: brightness(0.9); } .btn:disabled { opacity: 0.4; cursor: not-allowed; filter: none; } .btn+.btn { margin-top: 5px; }
  .btnblau { background: #003F91; color: #fff; } .btnrot { background: #C0392B; color: #fff; } .btngrau { background: var(--input-fill-color, #eee); color: var(--primary-text-color, #333); border: 1px solid var(--divider-color, #ccc); }
  .hinweis { background: #FEF3C7; border: 1px solid #F5CFA0; border-left: 3px solid #D97706; padding: 8px 9px; font-size: 11px; color: #92400E; line-height: 1.5; margin-bottom: 7px; border-radius: 2px; }
  .info { background: #E8EEF7; border: 1px solid #B3C6E0; border-left: 3px solid #003F91; padding: 8px 9px; font-size: 11px; color: #1E3A5F; line-height: 1.5; margin-bottom: 7px; border-radius: 2px; }
  .ablauf { display: flex; flex-direction: column; }
  .abi { display: flex; align-items: flex-start; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--divider-color, #eee); }
  .abi:last-child { border: none; }
  .abnr { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #D0D0C8; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #9A9A90; margin-top: 1px; }
  .abnr.aktiv { border-color: #003F91; color: #003F91; background: #E8EEF7; }
  .abnr.fertig { border-color: #166534; color: #fff; background: #166534; }
  .abtxt { font-size: 11px; color: var(--secondary-text-color, #666); }
  .abtxt strong { display: block; color: var(--primary-text-color, #333); font-size: 12px; }
  .strip { display: flex; gap: 3px; margin-top: 8px; }
  .ss { flex: 1; height: 4px; background: var(--divider-color, #eee); border-radius: 2px; }
  .ss.fertig { background: #16A34A; } .ss.aktiv { background: #003F91; }
  .content { padding: 14px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 80vh; }
  .schbanner { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #ddd); border-left: 4px solid #9A9A90; padding: 12px 14px; display: flex; align-items: center; gap: 12px; border-radius: 4px; }
  .schbanner.s1 { border-left-color: #C0392B; } .schbanner.s2 { border-left-color: #16A34A; } .schbanner.s3 { border-left-color: #7C3AED; } .schbanner.s4 { border-left-color: #003F91; }
  .schpikt { width: 32px; height: 32px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; background: var(--input-fill-color, #f0f0f0); }
  .schbanner.s1 .schpikt { background: #FDECEA; } .schbanner.s2 .schpikt { background: #DCFCE7; } .schbanner.s3 .schpikt { background: #EDE9FE; } .schbanner.s4 .schpikt { background: #E8EEF7; }
  .schbez { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: var(--secondary-text-color, #888); }
  .schtitel { font-size: 13px; font-weight: 700; color: var(--primary-text-color, #333); margin-top: 1px; }
  .schsub { font-size: 11px; color: var(--secondary-text-color, #888); margin-top: 2px; }
  .zykbadge { margin-left: auto; background: #E8EEF7; border: 1px solid #B3C6E0; padding: 3px 10px; text-align: center; border-radius: 3px; }
  .zykbadge-lbl { font-size: 9px; color: var(--secondary-text-color, #888); text-transform: uppercase; letter-spacing: 0.08em; }
  .zykbadge-val { font-size: 15px; font-weight: 700; font-family: monospace; color: #003F91; }
  .timerblock { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #ddd); display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: center; padding: 12px 14px; border-radius: 4px; }
  .timerdig { font-family: 'Source Code Pro', monospace; font-size: 26px; font-weight: 600; letter-spacing: 0.05em; color: #003F91; line-height: 1; }
  .timerlbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.09em; color: var(--secondary-text-color, #888); margin-bottom: 3px; }
  .fortbar { height: 7px; background: var(--input-fill-color, #eee); border-radius: 3px; margin-top: 5px; overflow: hidden; }
  .fortfill { height: 100%; background: #003F91; transition: width 1s linear; border-radius: 3px; }
  .fortfill.rot { background: #C0392B; } .fortfill.gruen { background: #16A34A; } .fortfill.lila { background: #7C3AED; }
  .etatxt { font-size: 11px; color: var(--secondary-text-color, #888); margin-top: 2px; }
  .kgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
  .karte { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #ddd); padding: 10px 12px; border-radius: 4px; }
  .karte.betont { border-color: #003F91; border-top: 3px solid #003F91; }
  .kartlbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 700; color: var(--secondary-text-color, #888); margin-bottom: 3px; }
  .kartwert { font-size: 20px; font-weight: 700; font-family: monospace; line-height: 1; }
  .kartein { font-size: 11px; font-weight: 400; color: var(--secondary-text-color, #888); }
  .kartsub { font-size: 10px; color: var(--secondary-text-color, #888); margin-top: 3px; }
  .diagblock { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #ddd); padding: 12px; border-radius: 4px; }
  .bh { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #003F91; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid var(--divider-color, #eee); }
  .chartcont { position: relative; width: 100%; }
  canvas { display: block; }
  .zellenblock { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #ddd); padding: 12px; border-radius: 4px; }
  .zellhdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid var(--divider-color, #eee); flex-wrap: wrap; gap: 6px; }
  .legende { display: flex; gap: 11px; font-size: 10px; color: var(--secondary-text-color, #888); }
  .litem { display: flex; align-items: center; gap: 3px; }
  .ldot { width: 10px; height: 10px; border-radius: 1px; flex-shrink: 0; }
  .zraster { display: grid; grid-template-columns: repeat(8,1fr); gap: 4px; }
  .zelle { border: 1px solid var(--divider-color, #ddd); background: var(--input-fill-color, #f5f5f5); padding: 5px 3px; text-align: center; border-radius: 3px; }
  .znr { font-size: 9px; color: var(--secondary-text-color, #999); }
  .zmv { font-size: 11px; font-weight: 700; font-family: monospace; margin-top: 2px; color: var(--secondary-text-color, #999); }
  .zbar { height: 3px; background: var(--divider-color, #ddd); margin-top: 3px; border-radius: 1px; }
  .zbarfill { height: 100%; transition: width 0.5s; border-radius: 1px; }
  .zelle.ok { background: #F0FDF4; border-color: #BBF7D0; } .zelle.ok .zmv { color: #166534; } .zelle.ok .zbarfill { background: #16A34A; }
  .zelle.warn { background: #FFFBEB; border-color: #FDE68A; } .zelle.warn .zmv { color: #92400E; } .zelle.warn .zbarfill { background: #D97706; }
  .zelle.err { background: #FEF2F2; border-color: #FECACA; } .zelle.err .zmv { color: #991B1B; } .zelle.err .zbarfill { background: #DC2626; }
  .zstats { display: grid; grid-template-columns: repeat(4,1fr); gap: 7px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--divider-color, #eee); }
  .zst { text-align: center; } .zsw { font-size: 14px; font-weight: 700; font-family: monospace; } .zsl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--secondary-text-color, #888); margin-top: 2px; }
  .zyklen-block { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #ddd); padding: 12px; border-radius: 4px; }
  .zyklen-liste { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .zyk-card { border: 1px solid var(--divider-color, #ddd); border-radius: 4px; overflow: hidden; }
  .zyk-card-header { display: flex; align-items: center; gap: 9px; padding: 9px 12px; background: var(--card-background-color, #fff); cursor: pointer; }
  .zyk-card-header:hover { background: var(--input-fill-color, #f5f5f5); }
  .zyk-nr { width: 26px; height: 26px; background: #003F91; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 3px; }
  .zyk-title { font-weight: 700; font-size: 12px; flex: 1; }
  .zyk-kap { font-family: monospace; font-size: 13px; font-weight: 700; color: #003F91; }
  .zyk-health { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 3px; margin-left: 8px; }
  .h-gut { background: #DCFCE7; color: #166534; } .h-mitte { background: #FEF3C7; color: #92400E; } .h-schlecht { background: #FDECEA; color: #C0392B; }
  .zyk-body { display: none; padding: 10px; border-top: 1px solid var(--divider-color, #eee); background: var(--input-fill-color, #fafafa); }
  .zyk-body.open { display: block; }
  .zyk-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .zyk-btn-row { display: flex; gap: 6px; justify-content: flex-end; margin-top: 7px; flex-wrap: wrap; }
  .zyk-btn { padding: 5px 12px; border: 1px solid var(--divider-color, #ddd); background: var(--card-background-color, #fff); font-family: inherit; font-size: 11px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.04em; border-radius: 4px; }
  .zyk-btn:hover { background: var(--input-fill-color, #f0f0f0); } .zyk-btn.blau { background: #003F91; color: #fff; border-color: #003F91; }
  .logblock { background: #1C1C1A; border: 1px solid #333; padding: 8px 10px; max-height: 120px; overflow-y: auto; font-family: 'Source Code Pro', monospace; font-size: 11px; line-height: 1.7; border-radius: 4px; }
  .lz { display: flex; gap: 8px; } .lt { color: #6B7280; min-width: 64px; } .lm { color: #D1D5DB; }
  .lz.info .lm { color: #93C5FD; } .lz.ok .lm { color: #86EFAC; } .lz.warn .lm { color: #FCD34D; } .lz.err .lm { color: #FCA5A5; } .lz.cmd .lm { color: #C4B5FD; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 9999; display: none; align-items: center; justify-content: center; }
  .modal-overlay.show { display: flex; }
  .modal-box { background: var(--card-background-color, #fff); border: 2px solid #003F91; border-top: 6px solid #003F91; padding: 20px; max-width: 400px; width: 92%; border-radius: 4px; }
  .modal-kopf { font-size: 13px; font-weight: 700; color: #003F91; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
  .modal-txt { font-size: 12px; line-height: 1.8; color: var(--secondary-text-color, #666); margin-bottom: 14px; }
  .modal-txt strong { color: var(--primary-text-color, #333); }
  .modal-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  @media(max-width:700px) { .body { grid-template-columns: 1fr; } .kgrid { grid-template-columns: repeat(2,1fr); } .zraster { grid-template-columns: repeat(4,1fr); } .zyk-charts { grid-template-columns: 1fr; } }
`;

// ── Card Class ─────────────────────────────────────────────────────────────
class MarstekCapacityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this._hass = null;
    this._config = {};
    this._lang = 'de';
    this._Z = {verbunden:false,laufend:false,schritt:0,schrStart:null,gesStart:null,schrInt:null,gesInt:null,pollInt:null,zykAnz:1,zykAkt:0,zyklen:[],aktZyk:null,kapWh:0,lPwrTs:null,socVerlauf:[],zellenDaten:Array(16).fill(null)};
    this._chart = null;
    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
  }

  setConfig(config) {
    this._config = config;
    this._prefix = config.entity_prefix || 'marstek_venus_modbus';
  }

  static getConfigElement() {
    return document.createElement('marstek-capacity-card-editor');
  }

  static getStubConfig() {
    return { entity_prefix: 'marstek_venus_modbus' };
  }

  t(k, ...a) {
    const fn = T[this._lang][k];
    return typeof fn === 'function' ? fn(...a) : (fn || k);
  }

  _render() {
    const shadow = this.shadowRoot;
    shadow.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = STYLES;
    shadow.appendChild(style);

    const root = document.createElement('ha-card');
    root.className = 'card-root';
    root.innerHTML = this._html();
    shadow.appendChild(root);

    this._bindEvents();
    this._initChart();
    this._renderCells(Array(16).fill(null));
    this._updateUI();
    this._log(this.t('logReady'), 'info');

    // Auto-connect using hass token
    if (this._hass) {
      this._autoConnect();
    }
  }

  _html() {
    return `
    <div class="hdr">
      <div class="hdr-title">
        <h2 id="hdrTitle">${this.t('title')}</h2>
        <p id="hdrSub">${this.t('sub')}</p>
      </div>
      <div class="langswitch">
        <button class="langbtn on" id="btnDe">DE</button>
        <button class="langbtn" id="btnEn">EN</button>
      </div>
    </div>
    <div class="statusbar">
      <div class="si"><div class="sdot" id="connDot"></div><span id="connText">${this.t('statusHalt')}</span></div>
      <div class="si"><span id="datumSpan"></span></div>
      <div class="sbadge bhalt" id="statusBadge">${this.t('statusHalt')}</div>
    </div>

    <div class="body">
      <div class="sidebar">
        <div class="sbs">
          <div class="sbh" id="lParams">${this.t('params')}</div>
          <div class="fl">
            <label id="lNumCycles">${this.t('numCycles')}</label>
            <div class="pwrwrap"><input type="number" id="anzZyk" value="1" min="1" max="10" style="border-right:none;border-radius:4px 0 0 4px"><div class="pwrunit" id="lCycUnit">${this.t('cyclesUnit')}</div></div>
            <div style="font-size:10px;color:var(--secondary-text-color,#888);margin-top:3px" id="lCycHint">${this.t('cyclesHint')}</div>
          </div>
          <div class="pwrrow">
            <div class="pwrlabel" id="lPwr1">${this.t('pwr1lbl')}</div>
            <div class="pwrwrap"><input type="number" id="pwr1" value="200" min="1"><div class="pwrunit">W</div></div>
            <div class="w800" id="w1">⚡ <span id="lWarn1">${this.t('warn800')}</span></div>
          </div>
          <div class="pwrrow">
            <div class="pwrlabel" id="lPwr2">${this.t('pwr2lbl')}</div>
            <div class="pwrwrap"><input type="number" id="pwr2" value="300" min="1"><div class="pwrunit">W</div></div>
            <div class="w800" id="w2">⚡ <span id="lWarn2">${this.t('warn800')}</span></div>
          </div>
          <div class="pwrrow">
            <div class="pwrlabel" id="lPwr3">${this.t('pwr3lbl')}</div>
            <div class="pwrwrap"><input type="number" id="pwr3" value="150" min="1"><div class="pwrunit">W</div></div>
            <div class="w800" id="w3">⚡ <span id="lWarn3">${this.t('warn800')}</span></div>
          </div>
          <div class="socrow">
            <div class="socfield"><label id="lSocLow">${this.t('socLow')}</label><input type="number" id="socU" value="12" min="12" max="20"></div>
            <div class="socfield"><label id="lSocHigh">${this.t('socHigh')}</label><input type="number" id="socO" value="98" min="90" max="100"></div>
            <div class="sochint" id="lSocHint">${this.t('socHint')}</div>
          </div>
        </div>
        <div class="sbs">
          <div class="hinweis" id="lWarning">${this.t('warningBox')}</div>
          <div class="info" id="lInfo">${this.t('infoBox')}</div>
          <button class="btn btnblau" id="startBtn" disabled>${this.t('btnStart')}</button>
          <button class="btn btnrot" id="abortBtn" disabled>${this.t('btnAbort')}</button>
          <button class="btn btngrau" id="exportBtn">${this.t('btnExport')}</button>
        </div>
        <div class="sbs">
          <div class="sbh" id="lProcedure">${this.t('procedure')}</div>
          <div class="ablauf">
            <div class="abi"><div class="abnr" id="an0">1</div><div class="abtxt"><strong id="ls1t">${this.t('step1title')}</strong><span id="ls1s">${this.t('step1sub')}</span></div></div>
            <div class="abi"><div class="abnr" id="an1">2</div><div class="abtxt"><strong id="ls2t">${this.t('step2title')}</strong><span id="ls2s">${this.t('step2sub')}</span></div></div>
            <div class="abi"><div class="abnr" id="an2">3</div><div class="abtxt"><strong id="ls3t">${this.t('step3title')}</strong><span id="ls3s">${this.t('step3sub')}</span></div></div>
            <div class="abi"><div class="abnr" id="an3">4</div><div class="abtxt"><strong id="ls4t">${this.t('step4title')}</strong><span id="ls4s">${this.t('step4sub')}</span></div></div>
          </div>
          <div class="strip"><div class="ss" id="ss0"></div><div class="ss" id="ss1"></div><div class="ss" id="ss2"></div><div class="ss" id="ss3"></div></div>
        </div>
      </div>

      <div class="content">
        <div class="schbanner" id="schBanner">
          <div class="schpikt" id="schPikt">⚙</div>
          <div style="flex:1">
            <div class="schbez" id="schBez"></div>
            <div class="schtitel" id="schTitel"></div>
            <div class="schsub" id="schSub"></div>
          </div>
          <div class="zykbadge">
            <div class="zykbadge-lbl" id="lCycleLbl">${this.t('cycleLbl')}</div>
            <div class="zykbadge-val"><span id="zykAkt">—</span> / <span id="zykGes">—</span></div>
          </div>
        </div>

        <div class="timerblock">
          <div><div class="timerlbl" id="lStepTime">${this.t('stepTime')}</div><div class="timerdig" id="timerAnz">00:00:00</div></div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:3px">
              <div><div class="timerlbl" id="timerSchrLbl">—</div><div class="etatxt"><span id="lRemaining">${this.t('remaining')}</span>: <span id="etaAnz">—</span></div></div>
              <div style="text-align:right;font-size:13px;font-weight:700;font-family:monospace" id="pctAnz">—</div>
            </div>
            <div class="fortbar"><div class="fortfill" id="fortFill" style="width:0%"></div></div>
          </div>
          <div style="text-align:right"><div class="timerlbl" id="lTotalTime">${this.t('totalTime')}</div><div style="font-size:17px;font-weight:700;font-family:monospace" id="gesTimer">00:00:00</div></div>
        </div>

        <div class="kgrid">
          <div class="karte"><div class="kartlbl" id="lCardSoc">${this.t('cardSoc')}</div><div class="kartwert" id="kSoc">—<span class="kartein"> %</span></div><div class="kartsub" id="kSocS">${this.t('standby')}</div></div>
          <div class="karte"><div class="kartlbl" id="lCardPwr">${this.t('cardPwr')}</div><div class="kartwert" id="kPwr">—<span class="kartein"> W</span></div><div class="kartsub" id="kPwrS">—</div></div>
          <div class="karte"><div class="kartlbl" id="lCardCell">${this.t('cardCell')}</div><div class="kartwert" id="kZell">—<span class="kartein"> mV</span></div><div class="kartsub" id="kZellS">Δ —</div></div>
          <div class="karte betont"><div class="kartlbl" id="lCardCap">${this.t('cardCap')}</div><div class="kartwert" id="kKap">—<span class="kartein"> Wh</span></div><div class="kartsub" id="lCardCapSub">${this.t('cardCapSub')}</div></div>
        </div>

        <div class="diagblock">
          <div class="bh" id="lSocChart">${this.t('socChart')}</div>
          <div class="chartcont" style="height:90px"><canvas id="socCanvas"></canvas></div>
        </div>

        <div class="zellenblock">
          <div class="zellhdr">
            <div class="bh" style="margin:0;border:none;padding:0" id="lCellMonitor">${this.t('cellMonitor')}</div>
            <div class="legende">
              <div class="litem"><div class="ldot" style="background:#16A34A"></div><span id="lLegOk">${this.t('legendOk')}</span></div>
              <div class="litem"><div class="ldot" style="background:#D97706"></div><span id="lLegWarn">${this.t('legendWarn')}</span></div>
              <div class="litem"><div class="ldot" style="background:#DC2626"></div><span id="lLegErr">${this.t('legendErr')}</span></div>
            </div>
          </div>
          <div class="zraster" id="zRaster"></div>
          <div class="zstats">
            <div class="zst"><div class="zsw" id="zsMin">—</div><div class="zsl">Min mV</div></div>
            <div class="zst"><div class="zsw" id="zsMax">—</div><div class="zsl">Max mV</div></div>
            <div class="zst"><div class="zsw" id="zsDelta">—</div><div class="zsl">Delta mV</div></div>
            <div class="zst"><div class="zsw" id="zsDrift">—</div><div class="zsl" id="lDriftCells">${this.t('driftCells')}</div></div>
          </div>
        </div>

        <div class="zyklen-block" id="zyklenBlock" style="display:none">
          <div class="bh" id="lCycleResults">${this.t('cycleResults')}</div>
          <div class="zyklen-liste" id="zyklenListe"></div>
        </div>

        <div class="logblock" id="logBlock"></div>
      </div>
    </div>

    <div class="modal-overlay" id="modalBg">
      <div class="modal-box">
        <div class="modal-kopf" id="lModalTitle">${this.t('modalTitle')}</div>
        <div class="modal-txt" id="modalTxt"></div>
        <div class="modal-btns">
          <button class="btn btngrau" id="btnCancel">${this.t('btnCancel')}</button>
          <button class="btn btnblau" id="btnConfirm">${this.t('btnStart')}</button>
        </div>
      </div>
    </div>
    `;
  }

  _$ (id) { return this.shadowRoot.getElementById(id); }

  _bindEvents() {
    this._$('btnDe').addEventListener('click', () => this._setLang('de'));
    this._$('btnEn').addEventListener('click', () => this._setLang('en'));
    this._$('startBtn').addEventListener('click', () => this._anfragen());
    this._$('abortBtn').addEventListener('click', () => this._abbrechen());
    this._$('exportBtn').addEventListener('click', () => this._allesExportieren());
    this._$('btnCancel').addEventListener('click', () => this._modalZu());
    this._$('btnConfirm').addEventListener('click', () => this._starten());
    ['pwr1','pwr2','pwr3'].forEach((id,i) => {
      this._$(id).addEventListener('input', (e) => {
        this._$('w'+(i+1)).className = 'w800' + (parseFloat(e.target.value) > 800 ? ' show' : '');
      });
    });
    this._$('datumSpan').textContent = new Date().toLocaleDateString(this._lang === 'de' ? 'de-DE' : 'en-GB');
  }

  _setLang(l) {
    this._lang = l;
    this._$('btnDe').className = 'langbtn' + (l === 'de' ? ' on' : '');
    this._$('btnEn').className = 'langbtn' + (l === 'en' ? ' on' : '');
    this._applyI18n();
    this._updateUI();
  }

  _applyI18n() {
    const s = (id, k) => { const el = this._$(id); if(el) el.innerHTML = this.t(k); };
    s('hdrTitle','title'); s('hdrSub','sub'); s('lParams','params');
    s('lNumCycles','numCycles'); s('lCycUnit','cyclesUnit'); s('lCycHint','cyclesHint');
    s('lPwr1','pwr1lbl'); s('lPwr2','pwr2lbl'); s('lPwr3','pwr3lbl');
    s('lWarn1','warn800'); s('lWarn2','warn800'); s('lWarn3','warn800');
    s('lSocLow','socLow'); s('lSocHigh','socHigh'); s('lSocHint','socHint');
    s('lWarning','warningBox'); s('lInfo','infoBox');
    s('lProcedure','procedure');
    s('ls1t','step1title'); s('ls1s','step1sub'); s('ls2t','step2title'); s('ls2s','step2sub');
    s('ls3t','step3title'); s('ls3s','step3sub'); s('ls4t','step4title'); s('ls4s','step4sub');
    s('lCycleLbl','cycleLbl'); s('lStepTime','stepTime'); s('lTotalTime','totalTime'); s('lRemaining','remaining');
    s('lCardSoc','cardSoc'); s('lCardPwr','cardPwr'); s('lCardCell','cardCell'); s('lCardCap','cardCap'); s('lCardCapSub','cardCapSub');
    s('lSocChart','socChart'); s('lCellMonitor','cellMonitor');
    s('lLegOk','legendOk'); s('lLegWarn','legendWarn'); s('lLegErr','legendErr'); s('lDriftCells','driftCells');
    s('lCycleResults','cycleResults'); s('lModalTitle','modalTitle');
    const sb = this._$('startBtn'); if(sb) sb.textContent = this.t('btnStart');
    const ab = this._$('abortBtn'); if(ab) ab.textContent = this.t('btnAbort');
    const eb = this._$('exportBtn'); if(eb) eb.textContent = this.t('btnExport');
    const bc = this._$('btnCancel'); if(bc) bc.textContent = this.t('btnCancel');
    const bco = this._$('btnConfirm'); if(bco) bco.textContent = this.t('btnStart');
  }

  // ── HA API via hass object (no CORS!) ──────────────────────────────────
  async _haGet(entity) {
    if (!this._hass) throw new Error('no hass');
    return this._hass.callApi('GET', `states/sensor.${entity}`);
  }

  async _haSvc(domain, service, data) {
    if (!this._hass) throw new Error('no hass');
    return this._hass.callService(domain, service, data);
  }

  async _setModus(m) {
    const p = this._prefix;
    try { await this._haSvc('select','select_option',{entity_id:`select.${p}_betriebsmodus`,option:m==='manuell'?'Manuell':'Auto'}); }
    catch { await this._haSvc('number','set_value',{entity_id:`number.${p}_betriebsmodus`,value:m==='manuell'?1:0}); }
    this._log(this.t('logMode', m.toUpperCase()), 'cmd');
  }

  async _entladeForce(w) {
    const p = this._prefix;
    await this._haSvc('number','set_value',{entity_id:`number.${p}_entladeleistung`,value:w});
    try { await this._haSvc('select','select_option',{entity_id:`select.${p}_lademodus`,option:'Erzwungene Entladung'}); } catch {}
    this._log(this.t('logDischarge', w), 'cmd');
  }

  async _ladeForce(w) {
    const p = this._prefix;
    await this._haSvc('number','set_value',{entity_id:`number.${p}_ladeleistung`,value:w});
    try { await this._haSvc('select','select_option',{entity_id:`select.${p}_lademodus`,option:'Erzwungenes Laden'}); } catch {}
    this._log(this.t('logCharge', w), 'cmd');
  }

  async _normal() {
    try { await this._haSvc('select','select_option',{entity_id:`select.${this._prefix}_lademodus`,option:'Normal'}); } catch {}
  }

  // ── Auto-connect ────────────────────────────────────────────────────────
  async _autoConnect() {
    try {
      const p = this._prefix;
      const s = await this._haGet(`${p}_soc_batterie`);
      this._Z.verbunden = true;
      this._$('connDot').className = 'sdot on';
      this._$('connText').textContent = this.t('logConnOk', Math.round(parseFloat(s.state)));
      this._$('startBtn').disabled = false;
      this._log(this.t('logConnOk', s.state), 'ok');
      this._pollStart();
    } catch(e) {
      this._$('connDot').className = 'sdot err';
      this._log(this.t('logConnFail', e.message), 'err');
    }
  }

  // ── Polling ────────────────────────────────────────────────────────────
  _pollStart() {
    if (this._Z.pollInt) clearInterval(this._Z.pollInt);
    this._Z.pollInt = setInterval(() => this._poll(), 5000);
    this._poll();
  }

  async _poll() {
    if (!this._Z.verbunden || !this._hass) return;
    const p = this._prefix;
    try {
      const [sR, pR] = await Promise.all([
        this._haGet(`${p}_soc_batterie`),
        this._haGet(`${p}_batterieleistung`).catch(() => this._haGet(`${p}_ac_leistung`))
      ]);
      const soc = parseFloat(sR.state), pwr = parseFloat(pR.state);
      this._$('kSoc').innerHTML = `${Math.round(soc)}<span class="kartein"> %</span>`;
      this._$('kSoc').style.color = soc < 10 ? '#991B1B' : soc > 90 ? '#166534' : '';
      this._$('kPwr').innerHTML = `${pwr>0?'+':''}${Math.round(pwr)}<span class="kartein"> W</span>`;
      this._$('kPwrS').textContent = pwr > 20 ? this.t('charging') : pwr < -20 ? this.t('discharging') : this.t('standby');
      if (this._Z.schritt === 3 && this._Z.laufend && this._Z.aktZyk) {
        const now = Date.now();
        if (this._Z.lPwrTs !== null) {
          this._Z.kapWh += Math.abs(pwr) * (now - this._Z.lPwrTs) / 3600000;
          this._Z.aktZyk.kapWh = this._Z.kapWh;
          this._$('kKap').innerHTML = `${Math.round(this._Z.kapWh)}<span class="kartein"> Wh</span>`;
        }
        this._Z.lPwrTs = now;
      }
      const ts = Date.now();
      this._Z.socVerlauf.push({x: ts, y: soc});
      if (this._Z.socVerlauf.length > 600) this._Z.socVerlauf.shift();
      if (this._Z.aktZyk) this._Z.aktZyk.socPunkte.push({ts, soc});
      this._chartUpd();
      if (this._Z.laufend) this._phasenCheck(soc);
      await this._zellenPoll(ts);
    } catch {}
  }

  async _zellenPoll(ts) {
    const p = this._prefix;
    const ps = ZELL_NAMEN.map(n => this._haGet(`${p}_${n}`).catch(() => null));
    const res = await Promise.all(ps);
    this._Z.zellenDaten = res.map(r => r && r.state !== 'unavailable' ? parseFloat(r.state) * 1000 : null);
    if (this._Z.aktZyk && this._Z.laufend && this._Z.zellenDaten.some(v => v !== null))
      this._Z.aktZyk.zellPunkte.push({ts, volt: [...this._Z.zellenDaten]});
    this._renderCells(this._Z.zellenDaten);
  }

  // ── Phase Logic ────────────────────────────────────────────────────────
  _phasenCheck(soc) {
    const u = parseFloat(this._$('socU').value), o = parseFloat(this._$('socO').value);
    if (this._Z.schritt === 1 && soc <= u) { this._log(this.t('logStep1done', soc.toFixed(1)), 'ok'); this._naechster(); }
    else if (this._Z.schritt === 2 && soc >= o) { this._log(this.t('logStep2done', soc.toFixed(1)), 'ok'); this._naechster(); }
    else if (this._Z.schritt === 3 && soc <= u) { this._log(this.t('logStep3done'), 'ok'); this._zyklusBeenden(); }
  }

  async _naechster() {
    this._Z.schritt++; this._Z.schrStart = Date.now(); this._updateUI();
    if (this._Z.schritt === 2) {
      const w = parseInt(this._$('pwr2').value);
      try { await this._ladeForce(w); } catch(e) { this._log(e.message, 'err'); }
      this._log(this.t('logStep2', w), 'info');
    } else if (this._Z.schritt === 3) {
      this._Z.kapWh = 0; this._Z.lPwrTs = null;
      const w = parseInt(this._$('pwr3').value);
      try { await this._entladeForce(w); } catch(e) { this._log(e.message, 'err'); }
      this._log(this.t('logStep3', w), 'info');
    }
  }

  async _zyklusBeenden() {
    if (this._Z.aktZyk) {
      this._Z.aktZyk.ende = Date.now();
      this._Z.aktZyk.dauer = Math.floor((this._Z.aktZyk.ende - this._Z.aktZyk.start) / 1000);
      this._Z.aktZyk.fertig = true;
      this._Z.zyklen.push(this._Z.aktZyk);
      this._renderZyklusKarte(this._Z.aktZyk);
      this._log(this.t('logZykDone', this._Z.aktZyk.nr, Math.round(this._Z.aktZyk.kapWh)), 'ok');
    }
    if (this._Z.zykAkt < this._Z.zykAnz) {
      this._Z.zykAkt++;
      this._Z.aktZyk = this._neuerZyklus(this._Z.zykAkt);
      this._Z.schritt = 1; this._Z.schrStart = Date.now();
      this._Z.kapWh = 0; this._Z.lPwrTs = null; this._Z.socVerlauf = [];
      this._$('kKap').innerHTML = '0<span class="kartein"> Wh</span>';
      this._updateUI();
      this._log(this.t('logZykStart', this._Z.zykAkt), 'info');
      const w = parseInt(this._$('pwr1').value);
      try { await this._entladeForce(w); } catch(e) { this._log(e.message, 'err'); }
      this._log(this.t('logStep1', w, this._$('socU').value), 'info');
    } else {
      this._allesFertig();
    }
  }

  async _allesFertig() {
    this._Z.laufend = false; this._Z.schritt = 4;
    clearInterval(this._Z.schrInt); this._updateUI();
    try { await this._normal(); await this._setModus('auto'); } catch {}
    this._$('statusBadge').className = 'sbadge bok';
    this._$('statusBadge').textContent = this.t('statusOk');
    this._$('abortBtn').disabled = true;
    this._$('startBtn').disabled = false;
    this._$('connDot').className = 'sdot on';
    this._log(this.t('logAllDone', this._Z.zyklen.length), 'ok');
  }

  _neuerZyklus(nr) {
    return {nr, start: Date.now(), ende: null, kapWh: 0, dauer: 0, socPunkte: [], zellPunkte: [], logZeilen: [], fertig: false};
  }

  // ── Start/Abort ────────────────────────────────────────────────────────
  _anfragen() {
    const u = this._$('socU').value, o = this._$('socO').value, nz = this._$('anzZyk').value;
    this._$('modalTxt').innerHTML = this.t('modalBody', nz, u, o);
    this._$('modalBg').className = 'modal-overlay show';
  }
  _modalZu() { this._$('modalBg').className = 'modal-overlay'; }

  async _starten() {
    this._modalZu();
    this._Z.zykAnz = parseInt(this._$('anzZyk').value) || 1;
    this._Z.zykAkt = 1; this._Z.zyklen = []; this._Z.laufend = true; this._Z.schritt = 1;
    this._Z.schrStart = Date.now(); this._Z.gesStart = Date.now();
    this._Z.kapWh = 0; this._Z.lPwrTs = null; this._Z.socVerlauf = [];
    this._Z.aktZyk = this._neuerZyklus(1);
    this._$('zyklenBlock').style.display = 'block';
    this._$('zyklenListe').innerHTML = '';
    this._$('kKap').innerHTML = '0<span class="kartein"> Wh</span>';
    this._$('startBtn').disabled = true; this._$('abortBtn').disabled = false;
    this._$('statusBadge').className = 'sbadge blauf';
    this._$('statusBadge').textContent = this.t('statusRun');
    this._$('connDot').className = 'sdot run';
    this._$('zykAkt').textContent = '1'; this._$('zykGes').textContent = this._Z.zykAnz;
    for (let i = 0; i < 4; i++) { this._$('ss'+i).className = 'ss'; const nr = this._$('an'+i); nr.className = 'abnr'; nr.textContent = i+1; }
    this._$('ss0').className = 'ss aktiv'; this._$('an0').className = 'abnr aktiv';
    this._updateUI();
    this._Z.schrInt = setInterval(() => this._timerUpd(), 1000);
    if (!this._Z.gesInt) this._Z.gesInt = setInterval(() => {
      if (this._Z.gesStart) this._$('gesTimer').textContent = this._zt(Math.floor((Date.now() - this._Z.gesStart) / 1000));
    }, 1000);
    this._log(this.t('logStarted', this._Z.zykAnz), 'info');
    try {
      await this._setModus('manuell');
      const w = parseInt(this._$('pwr1').value);
      await this._entladeForce(w);
      this._log(this.t('logStep1', w, this._$('socU').value), 'info');
    } catch(e) { this._log(e.message, 'err'); }
  }

  async _abbrechen() {
    this._Z.laufend = false; this._Z.schritt = 0;
    clearInterval(this._Z.schrInt);
    try { await this._normal(); await this._setModus('auto'); } catch {}
    this._updateUI();
    this._$('statusBadge').className = 'sbadge bhalt';
    this._$('statusBadge').textContent = this.t('statusAbort');
    this._$('abortBtn').disabled = true; this._$('startBtn').disabled = false;
    this._$('connDot').className = 'sdot on';
    for (let i = 0; i < 4; i++) { this._$('ss'+i).className = 'ss'; const nr = this._$('an'+i); nr.className = 'abnr'; nr.textContent = i+1; }
    this._log(this.t('logAbort'), 'warn');
  }

  // ── UI Update ──────────────────────────────────────────────────────────
  _updateUI() {
    const cfgs = this.t('bannerCfg');
    const c = cfgs[this._Z.schritt] || cfgs[0];
    this._$('schBanner').className = `schbanner ${c.cls}`;
    this._$('schPikt').textContent = c.pikt;
    this._$('schBez').textContent = c.bez;
    this._$('schTitel').textContent = c.titel;
    this._$('schSub').textContent = c.sub;
    this._$('timerSchrLbl').textContent = c.titel;
    if (this._Z.laufend) { this._$('zykAkt').textContent = this._Z.zykAkt; this._$('zykGes').textContent = this._Z.zykAnz; }
    const fills = ['','rot','gruen','lila',''];
    this._$('fortFill').className = `fortfill ${fills[this._Z.schritt] || ''}`;
    for (let i = 0; i < 4; i++) {
      const nr = this._$('an'+i), ss = this._$('ss'+i), step = i+1;
      if (step < this._Z.schritt) { nr.className = 'abnr fertig'; nr.textContent = '✓'; ss.className = 'ss fertig'; }
      else if (step === this._Z.schritt) { nr.className = 'abnr aktiv'; ss.className = 'ss aktiv'; }
      else { nr.className = 'abnr'; ss.className = 'ss'; }
    }
  }

  _timerUpd() {
    if (!this._Z.laufend || !this._Z.schrStart) return;
    const el = Math.floor((Date.now() - this._Z.schrStart) / 1000);
    this._$('timerAnz').textContent = this._zt(el);
    const soc = parseFloat(this._$('kSoc').textContent) || 50;
    const u = parseFloat(this._$('socU').value), o = parseFloat(this._$('socO').value);
    let pwr = 0;
    if (this._Z.schritt === 1) pwr = parseInt(this._$('pwr1').value);
    if (this._Z.schritt === 2) pwr = parseInt(this._$('pwr2').value);
    if (this._Z.schritt === 3) pwr = parseInt(this._$('pwr3').value);
    let pct = 0, eta = '—';
    if (pwr > 0) {
      let rWh = 0;
      if (this._Z.schritt === 1 || this._Z.schritt === 3) rWh = ((soc - u) / 100) * NENN;
      if (this._Z.schritt === 2) rWh = ((o - soc) / 100) * NENN;
      const rS = rWh > 0 ? (rWh / pwr) * 3600 : 0;
      pct = rS > 0 ? Math.min(100, el / (el + rS) * 100) : 0;
      eta = rS > 0 ? this._zt(Math.round(rS)) : '—';
    }
    this._$('fortFill').style.width = pct.toFixed(1) + '%';
    this._$('pctAnz').textContent = pct.toFixed(0) + '%';
    this._$('etaAnz').textContent = eta;
  }

  _zt(s) {
    const h = Math.floor(s/3600).toString().padStart(2,'0');
    const m = Math.floor((s%3600)/60).toString().padStart(2,'0');
    const ss = (s%60).toString().padStart(2,'0');
    return `${h}:${m}:${ss}`;
  }

  // ── Cells ──────────────────────────────────────────────────────────────
  _renderCells(volt) {
    const r = this._$('zRaster');
    if (!r) return;
    const valid = volt.filter(v => v !== null);
    const vmin = valid.length ? Math.min(...valid) : 0;
    const vmax = valid.length ? Math.max(...valid) : 0;
    const vavg = valid.length ? valid.reduce((a,b) => a+b, 0) / valid.length : 0;
    const delta = vmax - vmin;
    r.innerHTML = volt.map((v,i) => {
      if (v === null) return `<div class="zelle"><div class="znr">${ZELL_LABELS[i]}</div><div class="zmv">—</div><div class="zbar"><div class="zbarfill" style="width:0%"></div></div></div>`;
      const d = v - vavg, cls = Math.abs(d) > 15 ? 'err' : Math.abs(d) > 5 ? 'warn' : 'ok';
      const bp = vmax > vmin ? ((v - vmin) / (vmax - vmin) * 100).toFixed(0) : 50;
      return `<div class="zelle ${cls}" title="${ZELL_LABELS[i]}: ${v.toFixed(0)} mV"><div class="znr">${ZELL_LABELS[i]}</div><div class="zmv">${v.toFixed(0)}</div><div class="zbar"><div class="zbarfill" style="width:${bp}%"></div></div></div>`;
    }).join('');
    if (valid.length) {
      this._$('zsMin').textContent = vmin.toFixed(0); this._$('zsMax').textContent = vmax.toFixed(0);
      const dEl = this._$('zsDelta'); dEl.textContent = delta.toFixed(0);
      dEl.style.color = delta > 15 ? '#991B1B' : delta > 5 ? '#92400E' : '#166534';
      this._$('zsDrift').textContent = valid.filter(v => Math.abs(v-vavg) > 15).length;
      this._$('kZell').innerHTML = `${Math.round(vavg)}<span class="kartein"> mV</span>`;
      this._$('kZellS').textContent = `Δ ${delta.toFixed(0)} mV`;
    }
  }

  // ── Chart (simple canvas, no lib needed) ───────────────────────────────
  _initChart() {
    const canvas = this._$('socCanvas');
    if (!canvas) return;
    canvas.width = canvas.parentElement.offsetWidth || 400;
    canvas.height = 90;
    this._chart = canvas;
    this._chartUpd();
  }

  _chartUpd() {
    const canvas = this._chart;
    if (!canvas) return;
    const data = this._Z.socVerlauf;
    const W = canvas.width || 400, H = canvas.height || 90;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    // grid
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 0.5;
    [25,50,75].forEach(y => { const py = H - (y/100)*H; ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke(); });
    // labels
    ctx.fillStyle = '#9A9A90'; ctx.font = '9px monospace';
    [0,25,50,75,100].forEach(y => ctx.fillText(y+'%', 2, H-(y/100)*H - 1));
    if (data.length < 2) return;
    const tMin = data[0].x, tMax = data[data.length-1].x;
    const tRange = tMax - tMin || 1;
    // fill
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = ((pt.x - tMin) / tRange) * W;
      const y = H - (pt.y / 100) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = 'rgba(0,63,145,0.07)'; ctx.fill();
    // line
    ctx.beginPath(); ctx.strokeStyle = '#003F91'; ctx.lineWidth = 1.5;
    data.forEach((pt, i) => {
      const x = ((pt.x - tMin) / tRange) * W;
      const y = H - (pt.y / 100) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // ── Cycle Cards ────────────────────────────────────────────────────────
  _renderZyklusKarte(zyk) {
    this._$('zyklenBlock').style.display = 'block';
    const kap = Math.round(zyk.kapWh), health = ((kap / NENN) * 100).toFixed(1);
    const hcls = parseFloat(health) >= 90 ? 'h-gut' : parseFloat(health) >= 75 ? 'h-mitte' : 'h-schlecht';
    const vals = zyk.zellPunkte.length ? zyk.zellPunkte[zyk.zellPunkte.length-1].volt.filter(v=>v!==null) : [];
    const delta = vals.length ? Math.round(Math.max(...vals) - Math.min(...vals)) : 0;
    const startStr = new Date(zyk.start).toLocaleString(this._lang === 'de' ? 'de-DE' : 'en-GB');
    const div = document.createElement('div');
    div.className = 'zyk-card'; div.id = `zyk-${zyk.nr}`;
    div.innerHTML = `
    <div class="zyk-card-header" onclick="this.parentElement.querySelector('.zyk-body').classList.toggle('open')">
      <div class="zyk-nr">${zyk.nr}</div>
      <div style="flex:1"><div class="zyk-title">${this.t('zykStart', zyk.nr, startStr)}</div><div style="font-size:10px;color:var(--secondary-text-color,#888)">${this.t('zykDurDelta', this._zt(zyk.dauer), delta)}</div></div>
      <div class="zyk-kap">${kap} Wh</div>
      <div class="zyk-health ${hcls}">${health} %</div>
      <span style="margin-left:8px;color:var(--secondary-text-color,#888)">▼</span>
    </div>
    <div class="zyk-body">
      <div class="zyk-charts">
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#003F91;margin-bottom:5px">${this.t('socChart')}</div><canvas id="zyk-soc-${zyk.nr}" width="300" height="120" style="width:100%;height:120px"></canvas></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#003F91;margin-bottom:5px">${this.t('cellMonitor')}</div><canvas id="zyk-zell-${zyk.nr}" width="300" height="120" style="width:100%;height:120px"></canvas></div>
      </div>
      <div style="font-size:11px;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#ddd);padding:8px 10px;border-radius:4px">
        <div style="font-weight:700;margin-bottom:5px">${this._lang==='de'?'Ergebnis':'Result'} – ${this._lang==='de'?'Zyklus':'Cycle'} ${zyk.nr}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px">
          <div><div style="font-size:9px;color:var(--secondary-text-color,#888);text-transform:uppercase;letter-spacing:0.07em">${this.t('resCap')}</div><div style="font-size:14px;font-weight:700;font-family:monospace;color:#003F91">${kap} Wh</div></div>
          <div><div style="font-size:9px;color:var(--secondary-text-color,#888);text-transform:uppercase;letter-spacing:0.07em">${this.t('resHealth')}</div><div style="font-size:14px;font-weight:700;font-family:monospace">${health} %</div></div>
          <div><div style="font-size:9px;color:var(--secondary-text-color,#888);text-transform:uppercase;letter-spacing:0.07em">${this.t('resDrift')}</div><div style="font-size:14px;font-weight:700;font-family:monospace">${delta} mV</div></div>
          <div><div style="font-size:9px;color:var(--secondary-text-color,#888);text-transform:uppercase;letter-spacing:0.07em">${this.t('resDur')}</div><div style="font-size:14px;font-weight:700;font-family:monospace">${this._zt(zyk.dauer)}</div></div>
        </div>
      </div>
      <div class="zyk-btn-row">
        <button class="zyk-btn" onclick="this.closest('marstek-capacity-card')._printZyklus(${zyk.nr})">${this.t('btnPrint')}</button>
        <button class="zyk-btn" onclick="this.closest('marstek-capacity-card')._protokollZyklus(${zyk.nr})">${this.t('btnProto')}</button>
        <button class="zyk-btn blau" onclick="this.closest('marstek-capacity-card')._csvZyklus(${zyk.nr})">${this.t('btnCsv')}</button>
      </div>
    </div>`;
    this._$('zyklenListe').appendChild(div);
    setTimeout(() => this._zykChartsInit(zyk), 150);
  }

  _zykChartsInit(zyk) {
    this._drawSocCanvas(this.shadowRoot.getElementById(`zyk-soc-${zyk.nr}`), zyk.socPunkte);
    this._drawCellCanvas(this.shadowRoot.getElementById(`zyk-zell-${zyk.nr}`), zyk.zellPunkte);
  }

  _drawSocCanvas(canvas, pts) {
    if (!canvas || pts.length < 2) return;
    const W = canvas.offsetWidth || 300, H = 120;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const tMin = pts[0].x, tRange = (pts[pts.length-1].x - pts[0].x) || 1;
    ctx.fillStyle = 'rgba(0,63,145,0.07)';
    ctx.beginPath();
    pts.forEach((p,i) => { const x=(p.x-tMin)/tRange*W, y=H-(p.soc/100)*H; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.strokeStyle='#003F91'; ctx.lineWidth=1.5;
    pts.forEach((p,i) => { const x=(p.x-tMin)/tRange*W, y=H-(p.soc/100)*H; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke();
  }

  _drawCellCanvas(canvas, pts) {
    if (!canvas || pts.length < 2) return;
    const W = canvas.offsetWidth || 300, H = 120;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const tMin = pts[0].ts, tRange = (pts[pts.length-1].ts - pts[0].ts) || 1;
    const allV = pts.flatMap(p => p.volt.filter(v => v !== null));
    const vMin = Math.min(...allV), vMax = Math.max(...allV), vRange = (vMax - vMin) || 1;
    for (let i = 0; i < 16; i++) {
      const cellPts = pts.filter(p => p.volt[i] !== null);
      if (cellPts.length < 2) continue;
      ctx.beginPath(); ctx.strokeStyle = ZELL_FARBEN[i]; ctx.lineWidth = 1;
      cellPts.forEach((p,j) => { const x=(p.ts-tMin)/tRange*W, y=H-(p.volt[i]-vMin)/vRange*H; j===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.stroke();
    }
  }

  // ── Exports ────────────────────────────────────────────────────────────
  _protokollZyklus(nr) {
    const zyk = this._Z.zyklen.find(z => z.nr === nr); if (!zyk) return;
    const kap = Math.round(zyk.kapWh), health = ((kap/NENN)*100).toFixed(1);
    let txt = `Marstek Venus E – ${this._lang==='de'?'Prüfprotokoll':'Test Report'} ${this._lang==='de'?'Zyklus':'Cycle'} ${nr}\n`;
    txt += `${this._lang==='de'?'Datum':'Date'}: ${new Date(zyk.start).toLocaleString()}\n`;
    txt += `${this._lang==='de'?'Dauer':'Duration'}: ${this._zt(zyk.dauer)}\n`;
    txt += `${this._lang==='de'?'Kapazität':'Capacity'}: ${kap} Wh\n`;
    txt += `${this._lang==='de'?'Kapazitätserhalt':'Retention'}: ${health} %\n\n=== Log ===\n`;
    zyk.logZeilen.forEach(l => txt += `${l.t}  ${l.m}\n`);
    this._dl(txt, `marstek-report-cycle${nr}-${Date.now()}.txt`, 'text/plain');
  }

  _csvZyklus(nr) {
    const zyk = this._Z.zyklen.find(z => z.nr === nr); if (!zyk) return;
    let csv = 'Timestamp,SoC'; for (let i = 0; i < 16; i++) csv += `,${ZELL_LABELS[i]}_mV`; csv += '\n';
    const allTs = [...new Set([...zyk.socPunkte.map(p=>p.ts), ...zyk.zellPunkte.map(p=>p.ts)])].sort((a,b)=>a-b);
    allTs.forEach(ts => {
      const sp = zyk.socPunkte.find(p=>Math.abs(p.ts-ts)<5000);
      const zp = zyk.zellPunkte.find(p=>Math.abs(p.ts-ts)<5000);
      csv += `${new Date(ts).toISOString()},${sp?sp.soc.toFixed(1):''},${zp?zp.volt.map(v=>v!==null?v.toFixed(0):'').join(','):','.repeat(15)}\n`;
    });
    this._dl(csv, `marstek-data-cycle${nr}-${Date.now()}.csv`, 'text/csv');
  }

  _printZyklus(nr) {
    const zyk = this._Z.zyklen.find(z => z.nr === nr); if (!zyk) return;
    const kap = Math.round(zyk.kapWh), health = ((kap/NENN)*100).toFixed(1);
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Marstek Cycle ${nr}</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}h1{font-size:16px;color:#003F91}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ddd;padding:6px 8px;font-size:11px}</style></head><body>`);
    w.document.write(`<h1>Marstek Venus E – Cycle ${nr}</h1>`);
    w.document.write(`<p>Date: ${new Date(zyk.start).toLocaleString()} | Duration: ${this._zt(zyk.dauer)} | Capacity: ${kap} Wh | Retention: ${health} %</p>`);
    w.document.write(`<table><tr><th>Time</th><th>Message</th></tr>`);
    zyk.logZeilen.forEach(l => w.document.write(`<tr><td>${l.t}</td><td>${l.m}</td></tr>`));
    w.document.write(`</table></body></html>`); w.document.close(); w.print();
  }

  _allesExportieren() {
    let txt = `Marstek Venus E – ${this._lang==='de'?'Gesamtprüfprotokoll':'Full Test Report'}\nDate: ${new Date().toLocaleString()}\nDevice: ${this._prefix}\n\n`;
    this._Z.zyklen.forEach(zyk => {
      const kap = Math.round(zyk.kapWh), health = ((kap/NENN)*100).toFixed(1);
      txt += `=== ${this._lang==='de'?'Zyklus':'Cycle'} ${zyk.nr} ===\nStart: ${new Date(zyk.start).toLocaleString()}\nDuration: ${this._zt(zyk.dauer)}  Capacity: ${kap} Wh  Retention: ${health} %\n\n`;
      zyk.logZeilen.forEach(l => txt += `  ${l.t}  ${l.m}\n`); txt += '\n';
    });
    this._dl(txt, `marstek-full-report-${Date.now()}.txt`, 'text/plain');
  }

  _dl(content, filename, mime) {
    const b = new Blob([content], {type: mime});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = filename; a.click();
  }

  // ── Log ────────────────────────────────────────────────────────────────
  _log(msg, typ = 'info') {
    const b = this._$('logBlock'); if (!b) return;
    const d = document.createElement('div');
    d.className = `lz ${typ}`;
    const t = new Date().toLocaleTimeString(this._lang === 'de' ? 'de-DE' : 'en-GB');
    d.innerHTML = `<span class="lt">${t}</span><span class="lm">${msg}</span>`;
    b.appendChild(d); b.scrollTop = b.scrollHeight;
    if (this._Z.aktZyk) this._Z.aktZyk.logZeilen.push({t, m: msg, typ});
  }
}

// ── Simple Editor ──────────────────────────────────────────────────────────
class MarstekCapacityCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; }
  get config() { return this._config; }
  connectedCallback() {
    this.innerHTML = `
    <style>ha-textfield{display:block;margin-bottom:8px}</style>
    <ha-textfield label="Entity Prefix" .value="${this._config.entity_prefix || 'marstek_venus_modbus'}"
      @change="${e => { this._config = {...this._config, entity_prefix: e.target.value}; this.dispatchEvent(new CustomEvent('config-changed', {detail:{config:this._config},bubbles:true,composed:true})); }}">
    </ha-textfield>`;
  }
}

customElements.define('marstek-capacity-card', MarstekCapacityCard);
customElements.define('marstek-capacity-card-editor', MarstekCapacityCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'marstek-capacity-card',
  name: 'Marstek Capacity Card',
  description: 'Multi-cycle capacity test and calibration for Marstek Venus E 3.0',
  preview: false,
  documentationURL: 'https://github.com/pit711/marstek-capacity-card',
});

console.info(`%c MARSTEK-CAPACITY-CARD %c v${CARD_VERSION} `, 'color:#fff;background:#003F91;font-weight:700', 'color:#003F91;background:#FFC300;font-weight:700');
