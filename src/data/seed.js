/**
 * Seed data — matches data.json structure from the existing project.
 * Edit this file to update default values.
 */

export const DEFAULT_SETTINGS = {
  currentPrice:    71000,
  usdthb:          33.0,
  goalBtc:         1.0,
  currentAge:      29,
  targetAge:       40,
  monthlyDcaUsd:   300,
  annualGrowthRate: 10,
}

export const DCA_ENTRIES = [
  { date:'2026-04-07', type:'BUY',      source:'Bitkub', btcQty:0.00052688, usdtAmount:36.52,  price:69300,   note:'Auto DCA',                   location:'Bitkub', strategy:'DCA' },
  { date:'2026-04-06', type:'BUY',      source:'Bitkub', btcQty:0.00035328, usdtAmount:24.56,  price:69542,   note:'Auto DCA',                   location:'Bitkub', strategy:'DCA' },
  { date:'2026-03-31', type:'SPOT_BUY', source:'Spot',   btcQty:0.00054986, usdtAmount:36.96,  price:67200,   note:'Auto DCA (THB→USDT)',         location:'Bitkub', strategy:'DCA' },
  { date:'2026-03-30', type:'SPOT_BUY', source:'Spot',   btcQty:0.00021340, usdtAmount:14.28,  price:66890,   note:'Auto DCA (THB→USDT, 1m)',    location:'Bitkub', strategy:'DCA' },
  { date:'2026-03-24', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00052195, usdtAmount:35.67,  price:68350,   note:'Auto DCA (THB converted)',    location:'Trezor', strategy:'DCA' },
  { date:'2026-03-23', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00034827, usdtAmount:23.82,  price:68400,   note:'Auto DCA (THB converted)',    location:'Trezor', strategy:'DCA' },
  { date:'2026-03-17', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00049962, usdtAmount:36.50,  price:73100,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
  { date:'2026-03-16', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00033380, usdtAmount:23.90,  price:71600,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
  { date:'2026-03-10', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00054162, usdtAmount:36.00,  price:66400,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
  { date:'2026-03-09', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00036229, usdtAmount:23.80,  price:65700,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
  { date:'2026-03-03', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00055599, usdtAmount:35.20,  price:63300,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
  { date:'2026-03-02', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00038559, usdtAmount:23.50,  price:60900,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
  { date:'2026-02-23', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00048868, usdtAmount:29.30,  price:60050,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
  { date:'2026-02-23', type:'SPOT_BUY', source:'Bitkub', btcQty:0.00048329, usdtAmount:29.30,  price:60600,   note:'Auto DCA (THB→USDT)',         location:'Trezor', strategy:'DCA' },
]

export const DIP_ENTRIES = [
  { date:'2026-02-06', type:'SPOT_BUY',    source:'Spot',         btcQty: 0.00478521, usdtAmount:-313.745,  price:65500,   note:'Spot #3',                    location:'Trezor', strategy:'Dip Reserve' },
  { date:'2026-02-05', type:'GRID_SUMMARY',source:'Spot Grid',    btcQty: 0.00416826, usdtAmount:-290.18,   price:69621,   note:'Spot Grid #2 closed',        location:'Trezor', strategy:'Dip Reserve' },
  { date:'2026-02-03', type:'SPOT_BUY',    source:'Spot',         btcQty: 0.00438561, usdtAmount:-316.168,  price:72020,   note:'Spot #2',                    location:'Trezor', strategy:'Dip Reserve' },
  { date:'2026-02-02', type:'SPOT_BUY',    source:'Dual Investment', btcQty:0.00384723,usdtAmount:-321.40,  price:76655,   note:'Dual #2 Target < 84,000',    location:'Trezor', strategy:'Dip Reserve' },
  { date:'2026-01-31', type:'SPOT_BUY',    source:'Spot',         btcQty: 0.00394605, usdtAmount:-317.88,   price:80475,   note:'Spot #1',                    location:'Trezor', strategy:'Dip Reserve' },
  { date:'2026-01-30', type:'GRID_SUMMARY',source:'Spot Grid',    btcQty: 0.00345134, usdtAmount:-299.00,   price:86600,   note:'Spot Grid #1 closed',        location:'Trezor', strategy:'Dip Reserve' },
  { date:'2026-01-26', type:'SPOT_BUY',    source:'Dual Investment', btcQty:0.00360528,usdtAmount:-316.90,  price:87910,   note:'Dual #1 Target < 89,500',    location:'Trezor', strategy:'Dip Reserve' },
]

export const FUTURES_ENTRIES = [
  { dateOpen:'2026-03-27', dateClose:'2026-03-27', symbol:'BTCUSDT', side:'Short', leverage:'3x', mode:'Cross',    entryPrice:67722,  exitPrice:66978,    sizeBtc:0.008,  pnlUsdt:5.95,   roi: 0.74,  mistakeTag:'Good Trap / Proper Exit',        notes:'Sweep → TP' },
  { dateOpen:'2026-03-18', dateClose:'2026-03-18', symbol:'BTCUSDT', side:'Long',  leverage:'3x', mode:'Cross',    entryPrice:72600,  exitPrice:71293.4,  sizeBtc:0.029,  pnlUsdt:-37.89, roi:-1.80,  mistakeTag:'Against Structure + Wrong Level', notes:'Liquidity trap / Fake bounce' },
  { dateOpen:'2026-03-16', dateClose:'2026-03-16', symbol:'BTCUSDT', side:'Short', leverage:'3x', mode:'Isolated', entryPrice:73350,  exitPrice:74284.3,  sizeBtc:0.029,  pnlUsdt:-27.09, roi:-1.27,  mistakeTag:'Stop Hunt / Late Entry',         notes:'SL / liquidity sweep fail' },
  { dateOpen:'2026-03-08', dateClose:'2026-03-09', symbol:'BTCUSDT', side:'Long',  leverage:'3x', mode:'Isolated', entryPrice:66875,  exitPrice:65898.83, sizeBtc:0.036,  pnlUsdt:-36.73, roi:-1.53,  mistakeTag:null,                             notes:null },
  { dateOpen:'2026-03-06', dateClose:'2026-03-06', symbol:'BTCUSDT', side:'Long',  leverage:'3x', mode:'Isolated', entryPrice:69800,  exitPrice:68770.1,  sizeBtc:0.036,  pnlUsdt:-38.82, roi:-1.54,  mistakeTag:null,                             notes:null },
  { dateOpen:'2026-03-05', dateClose:'2026-03-05', symbol:'BTCUSDT', side:'Long',  leverage:'3x', mode:'Isolated', entryPrice:72000,  exitPrice:72396.3,  sizeBtc:0.020,  pnlUsdt:6.84,   roi: 0.48,  mistakeTag:null,                             notes:null },
  { dateOpen:'2026-02-28', dateClose:'2026-03-01', symbol:'BTCUSDT', side:'Short', leverage:'4x', mode:'Cross',    entryPrice:64500,  exitPrice:65415.7,  sizeBtc:0.043,  pnlUsdt:-41.46, roi:-1.49,  mistakeTag:null,                             notes:null },
  { dateOpen:'2026-02-27', dateClose:'2026-02-28', symbol:'BTCUSDT', side:'Short', leverage:'3x', mode:'Cross',    entryPrice:65938.9,exitPrice:63010,    sizeBtc:0.035,  pnlUsdt:100.33, roi: 4.35,  mistakeTag:null,                             notes:null },
]

export const GRID_ENTRIES = [
  { dateStart:'2026-02-13', dateEnd:'2026-03-04', gridType:'Spot', mode:'Arithmetic Grid', capitalUsdt:321.77, leverage:null, rangeLow:60200, rangeHigh:68500, grids:19, netProfitUsdt:11.49, roi:3.57, durationDays:19, strategy:'Grid Bot' },
]

export const TRIGGERS = [
  { level:'L1', drop:-0.10, fundSource:'Dip',   thbBudget:7437.5,  notes:'Small entry on -10%'     },
  { level:'L2', drop:-0.20, fundSource:'Dip',   thbBudget:14875,   notes:'Add more on -20%'        },
  { level:'L3', drop:-0.40, fundSource:'Panic', thbBudget:14875,   notes:'Panic buy — highest %'   },
  { level:'L4', drop:-0.30, fundSource:'Panic', thbBudget:29750,   notes:'Extreme panic — reserve' },
]
