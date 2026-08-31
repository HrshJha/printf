import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Bell,
  ChevronDown,
  CircleHelp,
  Cloud,
  CloudOff,
  Crosshair,
  Gauge,
  Info,
  LayoutGrid,
  Layers,
  MapPin,
  Radio,
  RefreshCw,
  ShieldCheck,
  Signal,
  SlidersHorizontal,
  TerminalSquare,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import './styles.css'

const initialNodes = [
  { id: 'N-014', zone: 'A-08', x: 14, y: 26, status: 'healthy', riskScore: 18, tiltDeg: 0.021, displacementMm: 1.1, crackMm: 0.4, vibration: 'normal', rssiDbm: -68, snrDb: 11.8, batteryPct: 94, lastSeenSec: 3, trend: [12, 13, 13, 14, 14, 16, 17, 18] },
  { id: 'N-015', zone: 'A-11', x: 31, y: 18, status: 'healthy', riskScore: 24, tiltDeg: 0.028, displacementMm: 1.4, crackMm: 0.6, vibration: 'normal', rssiDbm: -71, snrDb: 10.2, batteryPct: 87, lastSeenSec: 4, trend: [18, 18, 19, 20, 20, 22, 23, 24] },
  { id: 'N-016', zone: 'B-02', x: 48, y: 26, status: 'watch', riskScore: 47, tiltDeg: 0.051, displacementMm: 2.8, crackMm: 1.3, vibration: 'normal', rssiDbm: -79, snrDb: 9.4, batteryPct: 82, lastSeenSec: 5, trend: [30, 33, 32, 36, 38, 39, 43, 47] },
  { id: 'N-019', zone: 'B-04', x: 72, y: 24, status: 'healthy', riskScore: 29, tiltDeg: 0.032, displacementMm: 1.7, crackMm: 0.8, vibration: 'normal', rssiDbm: -74, snrDb: 10.8, batteryPct: 90, lastSeenSec: 4, trend: [20, 21, 21, 23, 24, 26, 28, 29] },
  { id: 'N-020', zone: 'B-09', x: 88, y: 33, status: 'healthy', riskScore: 16, tiltDeg: 0.019, displacementMm: 0.8, crackMm: 0.3, vibration: 'normal', rssiDbm: -64, snrDb: 12.6, batteryPct: 97, lastSeenSec: 2, trend: [12, 12, 13, 13, 14, 14, 15, 16] },
  { id: 'N-017', zone: 'C-12', x: 57, y: 49, status: 'elevated', riskScore: 82, tiltDeg: 0.084, displacementMm: 4.2, crackMm: 2.8, vibration: 'normal', rssiDbm: -87, snrDb: 8.4, batteryPct: 78, lastSeenSec: 6, trend: [12, 18, 25, 31, 44, 55, 67, 82] },
  { id: 'N-018', zone: 'C-14', x: 69, y: 63, status: 'critical', riskScore: 92, tiltDeg: 0.112, displacementMm: 5.7, crackMm: 3.6, vibration: 'elevated', rssiDbm: -91, snrDb: 7.1, batteryPct: 64, lastSeenSec: 8, trend: [24, 29, 34, 42, 51, 63, 78, 92] },
  { id: 'N-021', zone: 'C-18', x: 83, y: 71, status: 'healthy', riskScore: 21, tiltDeg: 0.025, displacementMm: 1.3, crackMm: 0.5, vibration: 'normal', rssiDbm: -76, snrDb: 9.7, batteryPct: 85, lastSeenSec: 5, trend: [15, 16, 16, 17, 18, 18, 20, 21] },
  { id: 'N-022', zone: 'D-03', x: 28, y: 78, status: 'offline', riskScore: 0, tiltDeg: 0, displacementMm: 0, crackMm: 0, vibration: 'no signal', rssiDbm: 0, snrDb: 0, batteryPct: 22, lastSeenSec: 486, trend: [20, 20, 20, 20, 20, 20, 20, 20] },
]

const baseActivity = [
  { time: '19:45:12', text: 'Risk score updated — N-017 → 82', tone: 'danger' },
  { time: '19:43:08', text: 'Sampling rate increased — 5m → 30s', tone: 'amber' },
  { time: '19:42:51', text: 'Anomaly detected — N-017', tone: 'amber' },
  { time: '19:40:26', text: 'Heartbeat received — N-014', tone: 'green' },
  { time: '19:38:04', text: 'OTA update applied — gateway', tone: 'green' },
]

const statusMeta = {
  healthy: { label: 'Healthy', color: 'green' },
  watch: { label: 'Watch', color: 'amber' },
  elevated: { label: 'Elevated risk', color: 'orange' },
  critical: { label: 'Critical', color: 'red' },
  offline: { label: 'Offline', color: 'muted' },
}

function Icon({ name, size = 16, strokeWidth = 1.8 }) {
  const icons = { Activity, AlertTriangle, BatteryCharging, Bell, ChevronDown, CircleHelp, Cloud, CloudOff, Crosshair, Gauge, Info, LayoutGrid, Layers, MapPin, Radio, RefreshCw, ShieldCheck, Signal, SlidersHorizontal, TerminalSquare, Wifi, X, Zap }
  const Component = icons[name] || CircleHelp
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" />
}

function Badge({ tone = 'green', children, pulse = false }) {
  return <span className={`badge badge-${tone}`}>{pulse && <span className="badge-pulse" />}{children}</span>
}

function Panel({ className = '', children }) {
  return <section className={`panel ${className}`}>{children}</section>
}

function App() {
  const [nodes, setNodes] = useState(initialNodes)
  const [selectedId, setSelectedId] = useState('N-017')
  const [isOffline, setIsOffline] = useState(false)
  const [pendingSync, setPendingSync] = useState(27)
  const [activity, setActivity] = useState(baseActivity)
  const [simulation, setSimulation] = useState({ active: false, stage: 'idle', progress: 100 })
  const [lastUpdated, setLastUpdated] = useState(6)

  const selectedNode = nodes.find((node) => node.id === selectedId) || nodes[5]
  const counts = useMemo(() => nodes.reduce((acc, node) => {
    if (node.status === 'healthy') acc.low += 1
    if (node.status === 'watch') acc.watch += 1
    if (node.status === 'elevated') acc.high += 1
    if (node.status === 'critical') acc.critical += 1
    return acc
  }, { low: 0, watch: 0, high: 0, critical: 0 }), [nodes])

  useEffect(() => {
    const heartbeat = window.setInterval(() => setLastUpdated((value) => value >= 12 ? 3 : value + 1), 2500)
    return () => window.clearInterval(heartbeat)
  }, [])

  useEffect(() => {
    if (!isOffline) return undefined
    const buffer = window.setInterval(() => setPendingSync((value) => value + 1), 3000)
    return () => window.clearInterval(buffer)
  }, [isOffline])

  useEffect(() => {
    if (!simulation.active) return undefined
    const stages = [
      { after: 200, stage: 'detecting', label: 'Anomaly detected — N-017', tone: 'amber', score: 42, status: 'elevated', progress: 25 },
      { after: 1300, stage: 'adapting', label: 'Sampling rate 5min → 30s', tone: 'amber', score: 67, status: 'elevated', progress: 52 },
      { after: 2500, stage: 'analysing', label: 'Risk score N-017 → 84', tone: 'orange', score: 84, status: 'critical', progress: 78 },
      { after: 3700, stage: 'warning', label: 'Critical alert issued — Zone C-12', tone: 'danger', score: 92, status: 'critical', progress: 100 },
    ]
    const timers = stages.map((item) => window.setTimeout(() => {
      setNodes((current) => current.map((node) => node.id === 'N-017' ? { ...node, status: item.status, riskScore: item.score, trend: [...node.trend.slice(0, -1), item.score] } : node))
      setActivity((current) => [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), text: item.label, tone: item.tone }, ...current].slice(0, 5))
      setSimulation({ active: item.stage !== 'warning', stage: item.stage, progress: item.progress })
      if (item.stage === 'warning') window.setTimeout(() => setSimulation({ active: false, stage: 'complete', progress: 100 }), 1500)
    }, item.after))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [simulation.active])

  const simulateDeformation = () => {
    if (simulation.active) return
    setSelectedId('N-017')
    setSimulation({ active: true, stage: 'detecting', progress: 8 })
    setActivity((current) => [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), text: 'Simulation started — monitoring Zone C-12', tone: 'amber' }, ...current].slice(0, 5))
  }

  const selectNode = (node) => {
    if (node.status !== 'offline') setSelectedId(node.id)
  }

  return (
    <main className="app-shell">
      <TopBar isOffline={isOffline} onToggle={() => setIsOffline((value) => !value)} />
      <div className="dashboard-grid">
        <aside className="left-rail">
          <RiskOverview counts={counts} simulation={simulation} onSimulate={simulateDeformation} />
          <NetworkSummary nodes={nodes} />
        </aside>
        <div className="main-column">
          <MapPanel nodes={nodes} selectedId={selectedId} simulation={simulation} onSelect={selectNode} />
          <div className="detail-grid">
            <SelectedNode node={selectedNode} lastUpdated={lastUpdated} />
            <TrendChart node={selectedNode} simulation={simulation} />
          </div>
          <div className="bottom-grid">
            <NodeHealth nodes={nodes} selectedId={selectedId} onSelect={selectNode} />
            <div className="right-bottom-stack">
              <EdgeCard isOffline={isOffline} pendingSync={pendingSync} onToggle={() => setIsOffline((value) => !value)} />
              <ActivityLog entries={activity} />
            </div>
          </div>
        </div>
        <AlertCenter simulation={simulation} />
      </div>
      <footer className="footer-bar"><span><Icon name="ShieldCheck" size={14} /> Demo environment · simulated telemetry</span><span>Last system sync 19:45:12 IST <span className="footer-dot" /></span></footer>
    </main>
  )
}

function TopBar({ isOffline, onToggle }) {
  return <header className="topbar">
    <div className="brand-lockup"><div className="brand-mark"><Icon name="Crosshair" size={19} strokeWidth={2.2} /></div><div><div className="brand-name">SUBSENSE</div><div className="brand-subtitle">GROUND STABILITY INTELLIGENCE</div></div></div>
    <div className="topbar-meta"><div className={`system-status ${isOffline ? 'is-offline' : ''}`}><span className="status-dot" />{isOffline ? 'EDGE MODE ACTIVE' : 'SYSTEM OPERATIONAL'}</div><div className="mine-selector"><span className="eyebrow">MINE</span><strong>ABC-1</strong><Icon name="ChevronDown" size={14} /></div><button className="top-icon-button" aria-label="Open alerts"><Icon name="Bell" size={17} /><span className="notification-dot" /></button><button className="avatar" aria-label="Operator profile">OP</button></div>
  </header>
}

function SectionHeading({ eyebrow, title, icon, action }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action || (icon && <Icon name={icon} size={16} />)}</div>
}

function RiskOverview({ counts, simulation, onSimulate }) {
  const items = [{ key: 'low', label: 'LOW', tone: 'green', value: counts.low + 3 }, { key: 'watch', label: 'WATCH', tone: 'amber', value: counts.watch + 22 }, { key: 'high', label: 'HIGH', tone: 'orange', value: counts.high + 2 }, { key: 'critical', label: 'CRITICAL', tone: 'red', value: counts.critical }]
  return <Panel className="risk-panel"><SectionHeading eyebrow="RISK OVERVIEW" title="Mine-wide risk" icon="Gauge" /><div className="risk-total"><span className="risk-total-number">{String(items.reduce((sum, item) => sum + item.value, 0)).padStart(2, '0')}</span><span className="risk-total-label">active<br />nodes</span></div><div className="risk-list">{items.map((item) => <div className="risk-row" key={item.key}><span className={`risk-number ${item.tone}`}>{String(item.value).padStart(2, '0')}</span><span className="risk-label">{item.label}</span><span className={`risk-mini-bar ${item.tone}`}><i style={{ width: `${Math.min(100, item.value / 0.32)}%` }} /></span></div>)}</div><button className={`simulate-button ${simulation.active ? 'is-running' : ''}`} onClick={onSimulate} disabled={simulation.active}><Icon name={simulation.active ? 'RefreshCw' : 'Zap'} size={16} />{simulation.active ? 'SIMULATION RUNNING' : 'SIMULATE DEFORMATION'}<span className="button-arrow">↗</span></button><div className={`simulation-status ${simulation.stage !== 'idle' ? 'visible' : ''}`}><span className="stage-ring" /><span>{simulation.stage === 'complete' ? 'Scenario complete' : simulation.stage === 'idle' ? 'Ready for live scenario' : simulation.stage}</span><span>{simulation.progress}%</span></div></Panel>
}

function NetworkSummary({ nodes }) {
  const online = nodes.filter((node) => node.status !== 'offline').length
  return <Panel className="network-summary"><div className="network-summary-top"><div><div className="eyebrow">NETWORK</div><h3>Mesh connectivity</h3></div><Badge tone="green" pulse>STABLE</Badge></div><div className="network-stats"><div><strong>{online}<small>/{nodes.length}</small></strong><span>nodes online</span></div><div><strong>94<span className="unit">%</span></strong><span>packet delivery</span></div></div><div className="network-bars">{[42, 67, 53, 75, 62, 88, 68, 79, 56, 91, 74, 86, 63, 77, 94, 82, 72, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="network-foot"><span><span className="tiny-signal" /> LoRa mesh</span><span>12.6 km coverage</span></div></Panel>
}

function MapPanel({ nodes, selectedId, simulation, onSelect }) {
  return <Panel className="map-panel"><div className="map-heading"><SectionHeading eyebrow="LIVE MINE MAP" title="ABC-1 / North sector" /><div className="map-actions"><Badge tone="green" pulse>LIVE</Badge><button className="map-action" aria-label="Map layers"><Icon name="Layers" size={15} /></button><button className="map-action" aria-label="Center map"><Icon name="Crosshair" size={15} /></button></div></div><div className="map-canvas"><div className="map-grid-lines" /><div className="map-watermark">ABC-1<span>NORTH SECTOR · SURFACE MONITORING GRID</span></div><div className="map-compass"><span>N</span><i /><span>S</span></div><div className="map-scale"><span>0</span><i /><span>250 m</span></div><div className="map-zones zone-a"><span>A-08</span></div><div className="map-zones zone-b"><span>B-04</span></div><div className="map-zones zone-c"><span>C-12</span></div><svg className="tunnel-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M5 43 C20 25 24 40 37 31 S57 38 66 25 S80 18 98 34" /><path d="M8 70 C20 61 31 73 43 58 S65 70 78 54 S91 65 99 58" /><path d="M16 12 C22 26 25 39 38 47 S55 57 60 86" /><path d="M45 11 C44 26 55 31 55 45 S72 62 85 88" /></svg>{nodes.map((node) => <button key={node.id} className={`map-node node-${node.status} ${selectedId === node.id ? 'is-selected' : ''} ${node.status === 'offline' ? 'is-disabled' : ''} ${simulation.active && node.id === 'N-017' ? 'is-simulating' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onSelect(node)} aria-label={`${node.id}, ${statusMeta[node.status].label}, risk score ${node.riskScore}`}><span className="node-halo" /><span className="node-core" /><span className="node-label">{node.id}</span>{node.id === 'N-017' && <span className="node-alert-mark"><Icon name="AlertTriangle" size={10} /></span>}</button>)}<div className="map-legend"><span><i className="legend-dot green" />Healthy</span><span><i className="legend-dot amber" />Watch</span><span><i className="legend-dot red" />Critical</span><span><i className="legend-dot muted" />Offline</span></div><div className="map-callout"><div className="callout-line" /><div className="callout-card"><span className="eyebrow">SELECTED NODE</span><strong>{selectedId}</strong><span>{nodes.find((n) => n.id === selectedId)?.zone || 'C-12'} · {nodes.find((n) => n.id === selectedId)?.riskScore || 0} risk score</span></div></div></div></Panel>
}

function AlertCenter({ simulation }) {
  const critical = simulation.stage === 'warning' || simulation.stage === 'complete'
  return <aside className="alert-column"><Panel className="alerts-panel"><div className="alerts-header"><SectionHeading eyebrow="ALERT CENTER" title="Operator queue" /><span className="alert-count">{critical ? '03' : '02'}</span></div><div className={`alert-card critical ${critical ? 'is-new' : ''}`}><div className="alert-card-top"><Badge tone="red" pulse>CRITICAL</Badge><span>{critical ? 'NOW' : '2 MIN AGO'}</span></div><h3>Crack progression detected</h3><div className="alert-location"><Icon name="MapPin" size={14} />Zone C-12 <span>·</span> risk <b>{critical ? '92' : '92'}</b></div><div className="alert-divider" /><div className="corroboration"><span className="avatar-stack"><i>N17</i><i>N18</i></span><span>Corroborated by 2 nodes</span><button aria-label="Dismiss critical alert"><Icon name="X" size={14} /></button></div></div><div className="alert-card watch"><div className="alert-card-top"><Badge tone="amber">WATCH</Badge><span>11 MIN AGO</span></div><h3>Elevated tilt, monitoring</h3><div className="alert-location"><Icon name="MapPin" size={14} />Zone B-04 <span>·</span> risk <b>47</b></div><div className="alert-divider" /><div className="corroboration"><span>Single node signal</span><button aria-label="Open watch alert"><Icon name="ChevronDown" size={14} /></button></div></div><div className="alert-card info"><div className="alert-card-top"><Badge tone="blue">INFO</Badge><span>18 MIN AGO</span></div><h3>Node N-022 stopped reporting</h3><div className="alert-location"><Icon name="Radio" size={14} />Local buffer engaged</div></div><button className="view-all-button">VIEW ALL ALERTS <span>↗</span></button></Panel><div className="alert-note"><Icon name="ShieldCheck" size={15} /><span><strong>AI-assisted triage</strong> ranks alerts by severity, corroboration, and rate of change.</span></div></aside>
}

function SelectedNode({ node, lastUpdated }) {
  const meta = statusMeta[node.status]
  return <Panel className="selected-node-panel"><div className="selected-node-head"><div><div className="eyebrow">SELECTED NODE</div><div className="node-title-row"><h2>{node.id}</h2><Badge tone={meta.color} pulse={node.status === 'elevated' || node.status === 'critical'}>{meta.label.toUpperCase()}</Badge></div><span className="node-zone">{node.zone} · south ventilation drift</span></div><div className="last-seen"><span className="live-pip" />LAST SEEN <strong>{lastUpdated}s ago</strong></div></div><div className="node-metrics"><Metric label="TILT" value={node.status === 'offline' ? '—' : `${node.tiltDeg.toFixed(3)}°`} /><Metric label="DISPLACEMENT" value={node.status === 'offline' ? '—' : `${node.displacementMm.toFixed(1)} mm`} /><Metric label="CRACK WIDTH" value={node.status === 'offline' ? '—' : `${node.crackMm.toFixed(1)} mm`} accent={node.crackMm > 2} /><Metric label="VIBRATION" value={node.vibration} /><Metric label="RSSI" value={node.status === 'offline' ? '—' : `${node.rssiDbm} dBm`} /><Metric label="SNR" value={node.status === 'offline' ? '—' : `${node.snrDb.toFixed(1)} dB`} /><Metric label="BATTERY" value={`${node.batteryPct}%`} /><Metric label="RISK SCORE" value={node.status === 'offline' ? 'N/A' : `${node.riskScore}/100`} accent={node.riskScore > 60} /></div></Panel>
}

function Metric({ label, value, accent }) { return <div className="metric"><span>{label}</span><strong className={accent ? 'accent-value' : ''}>{value}</strong></div> }

function TrendChart({ node, simulation }) {
  const width = 560, height = 116, padX = 12, padY = 12
  const values = node.trend
  const max = 100, min = 0
  const points = values.map((value, index) => `${padX + index * ((width - padX * 2) / (values.length - 1))},${height - padY - ((value - min) / (max - min)) * (height - padY * 2)}`).join(' ')
  const last = values[values.length - 1]
  const color = last > 70 ? '#ff5c5c' : last > 40 ? '#ffb547' : '#36d399'
  return <Panel className="trend-panel"><div className="trend-header"><div><div className="eyebrow">DEFORMATION TREND <span className="trend-period">· LAST 8 READINGS</span></div><h2>Risk trajectory</h2></div><div className="trend-score" style={{ color }}><strong>{last}</strong><span>/ 100</span><small>{simulation.active ? 'SIMULATING' : 'CURRENT RISK'}</small></div></div><div className="chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Risk score trend for ${node.id}, currently ${last} out of 100`} preserveAspectRatio="none"><defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".24" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>{[25, 50, 75].map((value) => <g key={value}><line x1="0" x2={width} y1={height - padY - (value / 100) * (height - padY * 2)} y2={height - padY - (value / 100) * (height - padY * 2)} stroke="rgba(161,177,191,.13)" strokeDasharray="3 5" /><text x={width - 2} y={height - padY - (value / 100) * (height - padY * 2) - 4} textAnchor="end" fill="#71808d" fontSize="8">{value}</text></g>)}<polygon points={`${padX},${height - padY} ${points} ${width - padX},${height - padY}`} fill="url(#riskFill)" /><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={simulation.active ? 'chart-drawing' : ''} />{values.map((value, index) => <circle key={`${value}-${index}`} cx={padX + index * ((width - padX * 2) / (values.length - 1))} cy={height - padY - ((value - min) / (max - min)) * (height - padY * 2)} r={index === values.length - 1 ? 4 : 2} fill="#10161b" stroke={color} strokeWidth={index === values.length - 1 ? 2 : 1.2} />)}</svg><div className="chart-axis"><span>−35 min</span><span>NOW</span></div></div><div className="trend-footer"><span><i className="trend-arrow">↗</i> {last > 70 ? 'Rapid acceleration' : 'Stable trajectory'}</span><span>Model confidence <strong>94%</strong></span></div></Panel>
}

function NodeHealth({ nodes, selectedId, onSelect }) {
  return <Panel className="health-panel"><SectionHeading eyebrow="NODE HEALTH" title="Mesh node status" action={<button className="panel-action">VIEW NETWORK <span>↗</span></button>} /><div className="health-table"><div className="health-table-head"><span>NODE / ZONE</span><span>STATUS</span><span>RSSI / SNR</span><span>BATTERY</span></div>{nodes.map((node) => <button className={`health-row ${selectedId === node.id ? 'selected' : ''}`} key={node.id} onClick={() => onSelect(node)}><span className="health-node-id"><i className={`status-bullet ${statusMeta[node.status].color}`} /> <strong>{node.id}</strong><small>{node.zone}</small></span><span><Badge tone={statusMeta[node.status].color}>{statusMeta[node.status].label}</Badge></span><span className="signal-cell">{node.status === 'offline' ? '—' : <><b>{node.rssiDbm}</b><small>{node.snrDb.toFixed(1)} dB</small></>}</span><span className="battery-cell"><span className="battery-track"><i style={{ width: `${node.batteryPct}%` }} /></span><b>{node.batteryPct}%</b></span></button>)}</div></Panel>
}

function EdgeCard({ isOffline, pendingSync, onToggle }) {
  return <Panel className={`edge-panel ${isOffline ? 'offline' : ''}`}><div className="edge-head"><div><div className="eyebrow">EDGE GATEWAY</div><h2>{isOffline ? 'Cloud disconnected' : 'Cloud connected'}</h2></div><button className={`toggle ${isOffline ? 'on' : ''}`} onClick={onToggle} aria-pressed={isOffline} aria-label="Toggle cloud connectivity"><span /></button></div><div className="edge-state"><div className="edge-icon"><Icon name={isOffline ? 'CloudOff' : 'Cloud'} size={18} /></div><div><strong>{isOffline ? 'Edge monitoring active' : 'Cloud sync operational'}</strong><span>{isOffline ? 'Local buffering enabled' : 'All telemetry synced to cloud'}</span></div></div><div className="sync-line"><span>Pending sync</span><strong className={isOffline ? 'accent-value' : ''}>{isOffline ? pendingSync : 0} <small>packets</small></strong></div><div className="edge-progress"><i style={{ width: isOffline ? '36%' : '100%' }} /></div></Panel>
}

function ActivityLog({ entries }) {
  return <Panel className="activity-panel"><div className="activity-head"><SectionHeading eyebrow="SYSTEM ACTIVITY" title="Event stream" /><span className="activity-live"><i />LIVE</span></div><div className="activity-list">{entries.map((entry, index) => <div className="activity-row" key={`${entry.time}-${index}`}><span className={`activity-marker ${entry.tone}`}><i /></span><span className="activity-time">{entry.time}</span><span className="activity-text">{entry.text}</span></div>)}</div></Panel>
}

function AppRoot() { return <StrictMode><App /></StrictMode> }

createRoot(document.getElementById('root')).render(<AppRoot />)
