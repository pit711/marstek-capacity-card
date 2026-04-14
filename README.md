# Marstek Capacity Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/pit711/marstek-capacity-card/releases)

A Lovelace custom card for **multi-cycle capacity testing and calibration** of the Marstek Venus E 3.0 battery storage system.

Communicates directly via the [Marstek Venus Modbus plugin](https://github.com/ViperRNMC/marstek_venus_modbus) — **no CORS issues**, no extra server, works natively inside Home Assistant.

---

## Features

- **Multi-cycle test** — 1–10 full cycles (discharge → charge → measurement discharge)
- **Real capacity measurement** — energy integration (Wh) during measurement discharge
- **Live cell monitor** — all 16 cells with colour-coded drift detection
- **Per-cycle charts** — SoC trace and 16-cell voltage traces (native canvas, no external lib)
- **ETA estimation** — remaining time per step
- **Export** — `.txt` log report and `.csv` data per cycle, full report for all cycles
- **Print** — per-cycle print view
- **DE / EN** — full language switch
- **>800 W safety notice** — shown automatically when power exceeds 800 W

---

## Installation

### Via HACS (recommended)

1. Open **HACS → Frontend**
2. Click the three-dot menu → **Custom repositories**
3. Add `https://github.com/pit711/marstek-capacity-card` with category **Lovelace**
4. Find **Marstek Capacity Card** in the list → Install
5. Reload the browser

### Manual

1. Download `marstek-capacity-card.js` from the [latest release](https://github.com/pit711/marstek-capacity-card/releases)
2. Copy to `/config/www/marstek-capacity-card.js`
3. Add to **Settings → Dashboards → Resources**:
   ```
   URL: /local/marstek-capacity-card.js
   Type: JavaScript module
   ```
4. Reload the browser

---

## Configuration

Add a card to your dashboard manually:

```yaml
type: custom:marstek-capacity-card
entity_prefix: marstek_venus_modbus
```

### Options

| Option | Default | Description |
|---|---|---|
| `entity_prefix` | `marstek_venus_modbus` | HA entity prefix for your Marstek device |

---

## Requirements

| Requirement | Details |
|---|---|
| Home Assistant | 2024.1.0 or newer |
| Marstek Venus Modbus plugin | [ViperRNMC/marstek_venus_modbus](https://github.com/ViperRNMC/marstek_venus_modbus) via HACS |
| Modbus TCP | Ethernet cable to Marstek LAN port, firmware V144+ |
| Cell voltage sensors | Must be **enabled** in HA (disabled by default) |

### Enabling cell voltage sensors

Go to **Settings → Devices & Services → Entities**, filter for `marstek_venus_modbus_batteriepack`, select all 16, enable. Recommended polling interval: 300 s (Low Priority).

---

## Device Specifications (Marstek Venus E 3.0)

| Parameter | Value |
|---|---|
| Rated capacity | 5,120 Wh |
| Deep discharge protection | **12 % SoC** — firmware-fixed |
| Max measurable capacity | ~4,506 Wh (88 % × 5,120 Wh) |
| Cell chemistry | LiFePO₄, 16 cells |
| Cell entities | `sensor.marstek_venus_modbus_batteriepack_N_zelle_N_spannung` |

---

## Usage

1. Add the card to your dashboard
2. The card connects automatically using your existing HA session — no token needed
3. Set test parameters (cycles, power levels, SoC limits)
4. Click **Start Test** and confirm
5. The card manages the full test sequence and switches back to Auto mode when complete

> ⚠️ During the test the storage is not available for self-consumption or grid regulation. Run overnight or during low consumption periods.

---

## License

MIT
