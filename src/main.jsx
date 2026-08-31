import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, AlertTriangle, BatteryCharging, Bell, Check, ChevronDown, CircleHelp,
  Cloud, CloudOff, Crosshair, Gauge, Info, Layers, MapPin, Pause, Play, Radio,
  RefreshCw, RotateCcw, Server, ShieldCheck, Signal, X, Zap,
} from 'lucide-react'
import './styles.css'

const statusMeta = {
  healthy: { label: 'Healthy', color: 'green' },
  watch: { label: 'Watch', color: 'amber' },
  elevated: { label: 'High', color: 'orange' },
  critical: { label: 'Critical', color: 'red' },
  offline: { label: 'Offline', color: 'muted' },
}

const simulationLabels = ['Normal baseline', 'Anomaly detected', 'Spatial corroboration', 'Adaptive sampling', 'Progression analysis', 'Critical warning']
const simulationActivity = ['Normal baseline loaded — controlled model', 'Anomaly detected', 'Spatial corroboration detected', 'Sampling rate 5min → 30s', 'Risk score increased — progression confirmed', 'Critical alert issued']
const simulationProgress = [8, 26, 46, 64, 82, 100]

function makeNode(config) {
  return { status: 'healthy', temperatureC: 28.6, samplingRate: '5 min', baselineRisk: 18, confidence: 94, vibration: 'normal', rssiDbm: -70, snrDb: 10.4, batteryPct: 88, lastSeenSec: 4, trend: [16, 17, 17, 18, 18, 19, 20, 21], ...config }
}

const abcNodes = [
  makeNode({ id: 'N-014', zone: 'A-08', x: 14, y: 26, riskScore: 18, tiltDeg: 0.021, displacementMm: 1.1, crackMm: 0.4, temperatureC: 28.4, baselineRisk: 14, confidence: 96, rssiDbm: -68, snrDb: 11.8, batteryPct: 94, lastSeenSec: 3, trend: [12, 13, 13, 14, 14, 16, 17, 18] }),
  makeNode({ id: 'N-015', zone: 'A-11', x: 31, y: 18, riskScore: 24, tiltDeg: 0.028, displacementMm: 1.4, crackMm: 0.6, temperatureC: 29.1, baselineRisk: 18, confidence: 94, rssiDbm: -71, snrDb: 10.2, batteryPct: 87, lastSeenSec: 4, trend: [18, 18, 19, 20, 20, 22, 23, 24] }),
  makeNode({ id: 'N-016', zone: 'B-02', x: 48, y: 26, status: 'watch', riskScore: 47, tiltDeg: 0.051, displacementMm: 2.8, crackMm: 1.3, temperatureC: 29.7, samplingRate: '90 sec', baselineRisk: 27, confidence: 91, rssiDbm: -79, snrDb: 9.4, batteryPct: 82, lastSeenSec: 5, trend: [30, 33, 32, 36, 38, 39, 43, 47] }),
  makeNode({ id: 'N-019', zone: 'B-04', x: 72, y: 24, riskScore: 29, tiltDeg: 0.032, displacementMm: 1.7, crackMm: 0.8, temperatureC: 28.9, baselineRisk: 21, confidence: 95, rssiDbm: -74, snrDb: 10.8, batteryPct: 90, lastSeenSec: 4, trend: [20, 21, 21, 23, 24, 26, 28, 29] }),
  makeNode({ id: 'N-020', zone: 'B-09', x: 88, y: 33, riskScore: 16, tiltDeg: 0.019, displacementMm: 0.8, crackMm: 0.3, temperatureC: 27.8, baselineRisk: 12, confidence: 97, rssiDbm: -64, snrDb: 12.6, batteryPct: 97, lastSeenSec: 2, trend: [12, 12, 13, 13, 14, 14, 15, 16] }),
  makeNode({ id: 'N-017', zone: 'C-12', x: 57, y: 49, status: 'elevated', riskScore: 82, tiltDeg: 0.084, displacementMm: 4.2, crackMm: 2.8, temperatureC: 31.8, samplingRate: '30 sec', baselineRisk: 24, confidence: 88, rssiDbm: -87, snrDb: 8.4, batteryPct: 78, lastSeenSec: 6, trend: [12, 18, 25, 31, 44, 55, 67, 82] }),
  makeNode({ id: 'N-018', zone: 'C-14', x: 69, y: 63, status: 'critical', riskScore: 92, tiltDeg: 0.112, displacementMm: 5.7, crackMm: 3.6, vibration: 'elevated', temperatureC: 32.1, samplingRate: '30 sec', baselineRisk: 31, confidence: 84, rssiDbm: -91, snrDb: 7.1, batteryPct: 64, lastSeenSec: 8, trend: [24, 29, 34, 42, 51, 63, 78, 92] }),
  makeNode({ id: 'N-021', zone: 'C-18', x: 83, y: 71, riskScore: 21, tiltDeg: 0.025, displacementMm: 1.3, crackMm: 0.5, temperatureC: 29.4, baselineRisk: 17, confidence: 93, rssiDbm: -76, snrDb: 9.7, batteryPct: 85, lastSeenSec: 5, trend: [15, 16, 16, 17, 18, 18, 20, 21] }),
  makeNode({ id: 'N-022', zone: 'D-03', x: 28, y: 78, status: 'offline', riskScore: 0, tiltDeg: 0, displacementMm: 0, crackMm: 0, vibration: 'no signal', temperatureC: 0, samplingRate: 'buffered', baselineRisk: 20, confidence: 0, rssiDbm: 0, snrDb: 0, batteryPct: 22, lastSeenSec: 486, trend: [20, 20, 20, 20, 20, 20, 20, 20] }),
]

const jhariaNodes = Array.from({ length: 12 }, (_, index) => makeNode({
  id: `J-${String(201 + index).padStart(3, '0')}`, zone: `E-${String(4 + index).padStart(2, '0')}`, x: 10 + (index % 4) * 25, y: 18 + Math.floor(index / 4) * 27,
  riskScore: 10 + (index % 5) * 3, tiltDeg: 0.014 + (index % 4) * 0.003, displacementMm: 0.6 + (index % 4) * 0.2, crackMm: 0.2 + (index % 3) * 0.1,
  temperatureC: 27.2 + (index % 5) * 0.5, baselineRisk: 9 + (index % 4) * 2, confidence: 96 - (index % 3), rssiDbm: -61 - (index % 5) * 3,
  snrDb: 12.8 - (index % 4) * 0.6, batteryPct: 91 - (index % 4) * 4, trend: [10, 10, 11, 11, 12, 12, 13, 13 + (index % 3)],
}))

const raniganjNodes = Array.from({ length: 12 }, (_, index) => makeNode({
  id: `R-${String(301 + index).padStart(3, '0')}`, zone: `S-${String(2 + index).padStart(2, '0')}`, x: 12 + (index % 4) * 24, y: 20 + Math.floor(index / 4) * 26,
  status: index === 2 ? 'watch' : index === 6 ? 'elevated' : index > 9 ? 'offline' : 'healthy', riskScore: index === 2 ? 51 : index === 6 ? 62 : 18 + (index % 5) * 3,
  tiltDeg: index === 2 ? 0.058 : index === 6 ? 0.067 : 0.018 + (index % 4) * 0.004, displacementMm: index === 2 ? 2.9 : index === 6 ? 3.4 : 0.8 + (index % 4) * 0.2,
  crackMm: index === 2 ? 1.4 : index === 6 ? 1.9 : 0.3 + (index % 3) * 0.2, temperatureC: index === 6 ? 30.6 : 28.1 + (index % 5) * 0.6,
  samplingRate: index === 2 || index === 6 ? '90 sec' : '5 min', baselineRisk: index === 2 ? 28 : index === 6 ? 33 : 15 + (index % 4) * 2, confidence: index > 9 ? 0 : 90 + (index % 6),
  rssiDbm: index === 6 ? -84 : index > 9 ? 0 : -67 - (index % 5) * 4, snrDb: index === 6 ? 8.7 : index > 9 ? 0 : 11.7 - (index % 4) * 0.7,
  batteryPct: index > 9 ? 18 + index : 84 - (index % 5) * 5, lastSeenSec: index > 9 ? 340 + index * 23 : 3 + (index % 5), vibration: index === 6 ? 'elevated' : index > 9 ? 'no signal' : 'normal',
  trend: index === 6 ? [28, 31, 34, 37, 42, 47, 55, 62] : index === 2 ? [24, 28, 31, 34, 38, 42, 47, 51] : [16, 17, 17, 18, 19, 19, 20, 21],
}))

const mineCatalog = [
  {
    id: 'ABC-1', sector: 'North Sector', risk: 'HIGH', nodes: abcNodes, defaultNode: 'N-017', demo: { primary: 'N-017', neighbor: 'N-018', zone: 'C-12' },
    mapZones: [{ label: 'A-08', className: 'zone-a' }, { label: 'B-04', className: 'zone-b' }, { label: 'C-12', className: 'zone-c' }],
    activity: [
      { time: '19:45:12', text: 'Risk score updated — N-017 → 82', tone: 'danger' }, { time: '19:43:08', text: 'Sampling rate increased — 5m → 30s', tone: 'amber' },
      { time: '19:42:51', text: 'Anomaly detected — N-017', tone: 'amber' }, { time: '19:40:26', text: 'Heartbeat received — N-014', tone: 'green' }, { time: '19:38:04', text: 'OTA update applied — gateway', tone: 'green' },
    ],
    alerts: [
      { id: 'abc-crack-progression', tone: 'critical', label: 'CRITICAL', time: '2 MIN AGO', title: 'Crack progression detected', location: 'Zone C-12', risk: 92, nodeIds: ['N-017', 'N-018'], detail: 'Corroborated by N-017 and N-018. Adaptive sampling is active.' },
      { id: 'abc-elevated-tilt', tone: 'watch', label: 'WATCH', time: '11 MIN AGO', title: 'Elevated tilt, monitoring', location: 'Zone B-04', risk: 47, nodeIds: ['N-016'], detail: 'Single-node signal. Continue monitoring before escalation.' },
      { id: 'abc-node-offline', tone: 'info', label: 'INFO', time: '18 MIN AGO', title: 'Node N-022 stopped reporting', location: 'Local buffer engaged', nodeIds: ['N-022'], detail: 'Gateway is holding packets for sync when connectivity returns.' },
    ],
  },
  {
    id: 'JHARIA-4', sector: 'East Sector', risk: 'LOW', nodes: jhariaNodes, defaultNode: 'J-204', demo: { primary: 'J-204', neighbor: 'J-205', zone: 'E-07' },
    mapZones: [{ label: 'E-04', className: 'zone-a' }, { label: 'E-08', className: 'zone-b' }, { label: 'E-12', className: 'zone-c' }],
    activity: [
      { time: '19:45:09', text: 'Baseline refreshed — J-204', tone: 'green' }, { time: '19:42:18', text: 'Heartbeat received — J-207', tone: 'green' },
      { time: '19:39:44', text: 'Calibration check passed — east grid', tone: 'green' }, { time: '19:37:21', text: 'Cloud sync completed — 12 nodes', tone: 'green' }, { time: '19:34:05', text: 'Sampling interval stable — 5m', tone: 'blue' },
    ],
    alerts: [
      { id: 'jharia-baseline', tone: 'info', label: 'INFO', time: '4 MIN AGO', title: 'Location baseline refreshed', location: 'East grid · J-204', risk: 13, nodeIds: ['J-204'], detail: 'Per-node baseline remains stable after the latest calibration pass.' },
      { id: 'jharia-link-check', tone: 'info', label: 'INFO', time: '16 MIN AGO', title: 'Mesh link quality check passed', location: '12 nodes online', nodeIds: [], detail: 'All gateways and surface links are reporting within baseline.' },
    ],
  },
  {
    id: 'RANIGANJ-2', sector: 'South Sector', risk: 'WATCH', nodes: raniganjNodes, defaultNode: 'R-303', demo: { primary: 'R-303', neighbor: 'R-307', zone: 'S-04' },
    mapZones: [{ label: 'S-02', className: 'zone-a' }, { label: 'S-07', className: 'zone-b' }, { label: 'S-10', className: 'zone-c' }],
    activity: [
      { time: '19:44:32', text: 'Deformation trend rising — R-307', tone: 'amber' }, { time: '19:42:14', text: 'Link quality degraded — R-307', tone: 'amber' },
      { time: '19:39:58', text: 'Sampling rate increased — S-04', tone: 'amber' }, { time: '19:37:41', text: 'Heartbeat received — R-301', tone: 'green' }, { time: '19:34:26', text: 'Local buffer engaged — R-311', tone: 'blue' },
    ],
    alerts: [
      { id: 'raniganj-tilt-watch', tone: 'watch', label: 'WATCH', time: '6 MIN AGO', title: 'Tilt trend increasing', location: 'Zone S-04', risk: 51, nodeIds: ['R-303'], detail: 'Mildly increasing deformation trend; adaptive monitoring is active.' },
      { id: 'raniganj-link-degraded', tone: 'info', label: 'INFO', time: '14 MIN AGO', title: 'Degraded communication link', location: 'Node R-307 · RSSI -84 dBm', risk: 62, nodeIds: ['R-307'], detail: 'Communication quality is degraded; this signal is not treated as subsidence evidence.' },
      { id: 'raniganj-buffer', tone: 'info', label: 'INFO', time: '21 MIN AGO', title: 'Two nodes using local buffer', location: 'South grid', nodeIds: ['R-311'], detail: 'Buffered packets will sync when the gateway connection is restored.' },
    ],
  },
]

function cloneNodes(nodes) { return nodes.map((node) => ({ ...node, trend: [...node.trend] })) }
function findMine(id) { return mineCatalog.find((mine) => mine.id === id) || mineCatalog[0] }
function formatTime() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
function addActivity(setActivity, text, tone = 'amber') { setActivity((current) => [{ time: formatTime(), text, tone }, ...current].slice(0, 5)) }

function Icon({ name, size = 16, strokeWidth = 1.8 }) {
  const icons = { Activity, AlertTriangle, BatteryCharging, Bell, Check, ChevronDown, CircleHelp, Cloud, CloudOff, Crosshair, Gauge, Info, Layers, MapPin, Pause, Play, Radio, RefreshCw, RotateCcw, Server, ShieldCheck, Signal, X, Zap }
  const Component = icons[name] || CircleHelp
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" />
}
function Badge({ tone = 'green', children, pulse = false }) { return <span className={`badge badge-${tone}`}>{pulse && <span className="badge-pulse" />}{children}</span> }
function Panel({ className = '', children }) { return <section className={`panel ${className}`}>{children}</section> }
function badgeTone(alertTone) { return alertTone === 'critical' ? 'red' : alertTone === 'watch' ? 'amber' : alertTone === 'elevated' ? 'orange' : 'blue' }

function App() {
  const [mineId, setMineId] = useState('ABC-1')
  const [nodes, setNodes] = useState(() => cloneNodes(mineCatalog[0].nodes))
  const [selectedId, setSelectedId] = useState('N-017')
  const [isOffline, setIsOffline] = useState(false)
  const [pendingSync, setPendingSync] = useState(27)
  const [activity, setActivity] = useState(mineCatalog[0].activity)
  const [simulation, setSimulation] = useState({ mineId: null, running: false, paused: false, phase: -1, progress: 0 })
  const [lastUpdated, setLastUpdated] = useState(6)
  const [showZones, setShowZones] = useState(true)
  const [overlay, setOverlay] = useState(null)
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([])
  const [otaStatus, setOtaStatus] = useState('ready')
  const [toast, setToast] = useState('')

  const selectedMine = findMine(mineId)
  const selectedNode = nodes.find((node) => node.id === selectedId) || nodes[0]
  const counts = useMemo(() => nodes.reduce((acc, node) => {
    if (node.status === 'healthy') acc.low += 1
    if (node.status === 'watch') acc.watch += 1
    if (node.status === 'elevated') acc.high += 1
    if (node.status === 'critical') acc.critical += 1
    return acc
  }, { low: 0, watch: 0, high: 0, critical: 0 }), [nodes])

  const simulatedAlerts = useMemo(() => {
    if (simulation.mineId !== mineId || simulation.phase < 0) return []
    const { primary, neighbor, zone } = selectedMine.demo
    const base = { location: `Zone ${zone}`, nodeIds: [primary], detail: 'Frontend-only controlled deformation scenario.' }
    if (simulation.phase === 0) return []
    if (simulation.phase === 1) return [{ ...base, id: 'simulation-anomaly', tone: 'watch', label: 'WATCH', time: 'NOW', title: `Anomaly detected — ${primary}`, risk: 42, detail: 'Single-node deviation detected against the local baseline.' }]
    if (simulation.phase === 2) return [{ ...base, id: 'simulation-corroboration', tone: 'watch', label: 'WATCH', time: 'NOW', title: 'Spatial corroboration detected', risk: 67, nodeIds: [primary, neighbor], detail: `Correlated movement now appears across ${primary} and ${neighbor}.` }]
    if (simulation.phase === 3) return [{ ...base, id: 'simulation-adaptive', tone: 'elevated', label: 'HIGH', time: 'NOW', title: 'Adaptive sampling active', risk: 72, nodeIds: [primary, neighbor], detail: 'Affected nodes are sampling every 30 seconds for reassessment.' }]
    if (simulation.phase === 4) return [{ ...base, id: 'simulation-progression', tone: 'elevated', label: 'HIGH', time: 'NOW', title: 'Deformation progression confirmed', risk: 84, nodeIds: [primary, neighbor], detail: 'Tilt, displacement, and crack signals are accelerating together.' }]
    return [{ ...base, id: 'simulation-critical', tone: 'critical', label: 'CRITICAL', time: 'NOW', title: 'Critical alert issued', risk: 92, nodeIds: [primary, neighbor], detail: 'Human-authorized warning recommended for the affected zone.' }]
  }, [mineId, selectedMine, simulation])

  const sourceAlerts = simulation.mineId === mineId && simulation.phase >= 0 ? simulatedAlerts : selectedMine.alerts
  const activeAlerts = sourceAlerts.filter((alert) => !dismissedAlerts.includes(alert.id))

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
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    if (!simulation.running || simulation.paused) return undefined
    const timer = window.setTimeout(() => setSimulation((current) => {
      if (!current.running || current.paused) return current
      const nextPhase = Math.min(5, current.phase + 1)
      return { ...current, phase: nextPhase, progress: simulationProgress[nextPhase], running: nextPhase < 5 }
    }), 1800)
    return () => window.clearTimeout(timer)
  }, [simulation.running, simulation.paused, simulation.phase])
  useEffect(() => {
    if (simulation.mineId !== mineId || simulation.phase < 0) return
    setNodes((current) => applySimulationStage(current, selectedMine, simulation.phase))
    addActivity(setActivity, `${simulationActivity[simulation.phase]} — ${selectedMine.demo.primary}`, simulation.phase >= 5 ? 'danger' : simulation.phase >= 3 ? 'amber' : 'green')
  }, [mineId, selectedMine, simulation.mineId, simulation.phase])
  useEffect(() => {
    if (otaStatus !== 'queued') return undefined
    const timer = window.setTimeout(() => {
      setOtaStatus('verified')
      addActivity(setActivity, 'OTA package verified — sensor fleet', 'green')
      setToast('OTA package verified for the sensor fleet')
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [otaStatus])

  const changeMine = (nextMineId) => {
    const nextMine = findMine(nextMineId)
    setMineId(nextMineId); setNodes(cloneNodes(nextMine.nodes)); setSelectedId(nextMine.defaultNode); setActivity(nextMine.activity)
    setDismissedAlerts([]); setAcknowledgedAlerts([]); setSimulation({ mineId: null, running: false, paused: false, phase: -1, progress: 0 })
    setShowZones(true); setOtaStatus('ready'); setLastUpdated(3); setToast(`${nextMine.id} · ${nextMine.sector} loaded`)
  }
  const startSimulation = () => {
    if (simulation.running) return
    setDismissedAlerts([]); setAcknowledgedAlerts([]); setSelectedId(selectedMine.demo.primary)
    setSimulation({ mineId, running: true, paused: false, phase: 0, progress: simulationProgress[0] })
    setActivity((current) => [{ time: formatTime(), text: `Simulation started — monitoring Zone ${selectedMine.demo.zone}`, tone: 'amber' }, ...current].slice(0, 5))
    setToast('Controlled deformation simulation started')
  }
  const resetSimulation = () => {
    setNodes(cloneNodes(selectedMine.nodes)); setSelectedId(selectedMine.defaultNode); setActivity(selectedMine.activity); setDismissedAlerts([]); setAcknowledgedAlerts([])
    setSimulation({ mineId: null, running: false, paused: false, phase: -1, progress: 0 }); setToast('Simulation reset to mine baseline')
  }
  const toggleSimulationPause = () => { setSimulation((current) => ({ ...current, paused: !current.paused })); setToast(simulation.paused ? 'Simulation resumed' : 'Simulation paused') }
  const toggleConnectivity = () => {
    setIsOffline((value) => {
      const nextValue = !value
      if (value && !nextValue) { setPendingSync(0); addActivity(setActivity, 'Cloud sync restored — buffered packets forwarded', 'green'); setToast('Cloud sync restored; buffered packets forwarded') }
      else if (!value && nextValue) { addActivity(setActivity, 'Internet unavailable — edge buffer engaged', 'amber'); setToast('Edge mode active; local monitoring continues') }
      return nextValue
    })
  }
  const dismissAlert = (id) => {
    const alert = [...activeAlerts, ...selectedMine.alerts].find((item) => item.id === id)
    if (!alert) return
    setDismissedAlerts((current) => current.includes(id) ? current : [...current, id])
    setAcknowledgedAlerts((current) => current.some((item) => item.id === id) ? current : [{ ...alert, acknowledgedAt: formatTime() }, ...current])
    addActivity(setActivity, `Alert acknowledged — ${alert.title}`, 'green'); setToast(`${alert.label} alert acknowledged`)
  }
  const focusAlert = (alert) => {
    const target = nodes.find((node) => alert.nodeIds?.includes(node.id))
    if (target) setSelectedId(target.id)
    setOverlay(null); setToast(target ? `Focused ${target.id} · ${target.zone}` : 'Alert has no individual node target')
  }
  const centerOnRisk = () => {
    const highestRiskNode = [...nodes].filter((node) => node.status !== 'offline').sort((a, b) => b.riskScore - a.riskScore)[0]
    if (highestRiskNode) { setSelectedId(highestRiskNode.id); setToast(`Map centered on ${highestRiskNode.id} · ${highestRiskNode.zone}`) }
  }
  const queueOta = () => {
    if (otaStatus === 'queued') return
    setOtaStatus('queued'); addActivity(setActivity, 'OTA package queued — verify and rollback enabled', 'amber'); setToast('OTA update queued for verification')
  }

  return <main className="app-shell">
    <TopBar mine={selectedMine} mines={mineCatalog} isOffline={isOffline} onMineChange={changeMine} onOpenAlerts={() => setOverlay('alerts')} onProfile={() => setToast('Operator profile · demo access')} />
    <div className="dashboard-grid">
      <aside className="left-rail"><RiskOverview mine={selectedMine} activeCount={nodes.filter((node) => node.status !== 'offline').length} counts={counts} simulation={simulation} onSimulate={startSimulation} onPause={toggleSimulationPause} onReset={resetSimulation} /><NetworkSummary nodes={nodes} isOffline={isOffline} /></aside>
      <div className="main-column"><MapPanel mine={selectedMine} nodes={nodes} selectedId={selectedId} simulation={simulation} showZones={showZones} onToggleLayers={() => setShowZones((value) => !value)} onCenter={centerOnRisk} onSelect={(node) => setSelectedId(node.id)} /><div className="detail-grid"><SelectedNode node={selectedNode} lastUpdated={lastUpdated} /><TrendChart node={selectedNode} simulation={simulation} /></div><div className="bottom-grid"><NodeHealth nodes={nodes} selectedId={selectedId} onSelect={(node) => setSelectedId(node.id)} onOpenNetwork={() => setOverlay('network')} /><div className="right-bottom-stack"><EdgeCard isOffline={isOffline} pendingSync={pendingSync} onToggle={toggleConnectivity} /><ActivityLog entries={activity} /></div></div></div>
      <AlertCenter alerts={activeAlerts} onDismiss={dismissAlert} onFocus={focusAlert} onOpenAll={() => setOverlay('alerts')} />
    </div>
    <footer className="footer-bar"><span><Icon name="ShieldCheck" size={14} /> Prototype boundary · controlled lab model, not a field failure prediction</span><span>{isOffline ? 'Edge buffer active' : 'Last system sync 19:45:12 IST'} <span className="footer-dot" /></span></footer>
    {overlay === 'alerts' && <AlertDrawer alerts={activeAlerts} acknowledged={acknowledgedAlerts} onDismiss={dismissAlert} onFocus={focusAlert} onClose={() => setOverlay(null)} />}
    {overlay === 'network' && <NetworkDrawer nodes={nodes} otaStatus={otaStatus} onQueueOta={queueOta} onClose={() => setOverlay(null)} />}
    {toast && <div className="toast" role="status"><Icon name="Check" size={14} />{toast}</div>}
  </main>
}

function applySimulationStage(currentNodes, mine, phase) {
  const primaryStages = [
    { status: 'healthy', riskScore: 24, tiltDeg: 0.028, displacementMm: 1.4, crackMm: 0.6, samplingRate: '5 min', baselineRisk: 20, confidence: 96, trend: [18, 19, 20, 20, 21, 22, 23, 24] },
    { status: 'watch', riskScore: 42, tiltDeg: 0.043, displacementMm: 2.1, crackMm: 0.9, samplingRate: '5 min', baselineRisk: 20, confidence: 92, trend: [18, 20, 21, 24, 27, 31, 36, 42] },
    { status: 'elevated', riskScore: 67, tiltDeg: 0.064, displacementMm: 3.2, crackMm: 1.7, samplingRate: '90 sec', baselineRisk: 20, confidence: 90, trend: [18, 20, 22, 28, 35, 44, 56, 67] },
    { status: 'elevated', riskScore: 72, tiltDeg: 0.073, displacementMm: 3.8, crackMm: 2.2, samplingRate: '30 sec', baselineRisk: 20, confidence: 89, trend: [18, 22, 27, 34, 43, 54, 65, 72] },
    { status: 'elevated', riskScore: 84, tiltDeg: 0.091, displacementMm: 4.7, crackMm: 2.9, samplingRate: '30 sec', baselineRisk: 20, confidence: 87, trend: [18, 23, 30, 39, 50, 63, 75, 84] },
    { status: 'critical', riskScore: 92, tiltDeg: 0.112, displacementMm: 5.7, crackMm: 3.6, samplingRate: '30 sec', baselineRisk: 20, confidence: 88, trend: [18, 25, 34, 45, 58, 70, 83, 92] },
  ]
  const neighborStages = [
    { status: 'healthy', riskScore: 22, trend: [18, 18, 19, 19, 20, 20, 21, 22] }, { status: 'healthy', riskScore: 24, trend: [18, 19, 20, 20, 21, 21, 23, 24] },
    { status: 'watch', riskScore: 56, samplingRate: '90 sec', trend: [18, 20, 23, 27, 32, 39, 47, 56] }, { status: 'elevated', riskScore: 68, samplingRate: '30 sec', trend: [18, 21, 25, 31, 38, 47, 58, 68] },
    { status: 'elevated', riskScore: 76, samplingRate: '30 sec', trend: [18, 22, 27, 34, 42, 52, 65, 76] }, { status: 'critical', riskScore: 83, samplingRate: '30 sec', trend: [18, 23, 29, 37, 46, 58, 71, 83] },
  ]
  const primaryStage = primaryStages[phase]; const neighborStage = neighborStages[phase]
  return currentNodes.map((node) => {
    if (node.id === mine.demo.primary) return { ...node, ...primaryStage, temperatureC: node.temperatureC + phase * 0.4 }
    if (node.id === mine.demo.neighbor) return { ...node, ...neighborStage, tiltDeg: node.tiltDeg + phase * 0.006, displacementMm: node.displacementMm + phase * 0.2, crackMm: node.crackMm + phase * 0.1 }
    return node
  })
}

function TopBar({ mine, mines, isOffline, onMineChange, onOpenAlerts, onProfile }) {
  return <header className="topbar"><div className="brand-lockup"><div className="brand-mark"><Icon name="Crosshair" size={19} strokeWidth={2.2} /></div><div><div className="brand-name">SUBSENSE</div><div className="brand-subtitle">GROUND STABILITY INTELLIGENCE</div></div></div><div className="topbar-meta"><div className={`system-status ${isOffline ? 'is-offline' : ''}`}><span className="status-dot" />{isOffline ? 'EDGE MODE ACTIVE' : 'SYSTEM OPERATIONAL'}</div><label className="mine-selector"><span className="eyebrow">MINE</span><select value={mine.id} onChange={(event) => onMineChange(event.target.value)} aria-label="Select mine">{mines.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}</select><Icon name="ChevronDown" size={14} /></label><button className="top-icon-button" aria-label="Open alerts" onClick={onOpenAlerts}><Icon name="Bell" size={17} /><span className="notification-dot" /></button><button className="avatar" aria-label="Operator profile" onClick={onProfile}>OP</button></div></header>
}

function SectionHeading({ eyebrow, title, icon, action }) { return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action || (icon && <Icon name={icon} size={16} />)}</div> }
function RiskOverview({ mine, activeCount, counts, simulation, onSimulate, onPause, onReset }) {
  const items = [{ key: 'low', label: 'LOW', tone: 'green', value: counts.low }, { key: 'watch', label: 'WATCH', tone: 'amber', value: counts.watch }, { key: 'high', label: 'HIGH', tone: 'orange', value: counts.high }, { key: 'critical', label: 'CRITICAL', tone: 'red', value: counts.critical }]
  const hasScenario = simulation.mineId === mine.id && simulation.phase >= 0
  return <Panel className="risk-panel"><SectionHeading eyebrow="RISK OVERVIEW" title="Mine-wide risk" icon="Gauge" /><div className="mine-risk-line"><span>Current assessment</span><Badge tone={mine.risk === 'LOW' ? 'green' : mine.risk === 'WATCH' ? 'amber' : 'orange'}>{mine.risk}</Badge></div><div className="risk-total"><span className="risk-total-number">{String(activeCount).padStart(2, '0')}</span><span className="risk-total-label">active<br />nodes</span></div><div className="risk-list">{items.map((item) => <div className="risk-row" key={item.key}><span className={`risk-number ${item.tone}`}>{String(item.value).padStart(2, '0')}</span><span className="risk-label">{item.label}</span><span className={`risk-mini-bar ${item.tone}`}><i style={{ width: `${activeCount ? (item.value / activeCount) * 100 : 0}%` }} /></span></div>)}</div><button className={`simulate-button ${simulation.running ? 'is-running' : ''}`} onClick={onSimulate} disabled={simulation.running}><Icon name={simulation.running ? 'RefreshCw' : 'Zap'} size={16} />{simulation.running ? 'SIMULATION RUNNING' : 'SIMULATE DEFORMATION'}<span className="button-arrow">↗</span></button><div className={`simulation-status ${hasScenario ? 'visible' : ''}`}><span className="stage-ring" /><span>{hasScenario ? simulationLabels[simulation.phase] : 'Ready for live scenario'}</span><span>{hasScenario ? simulation.progress : 0}%</span></div><div className="simulation-controls">{simulation.running && <button className="simulation-control" onClick={onPause}><Icon name={simulation.paused ? 'Play' : 'Pause'} size={12} />{simulation.paused ? 'RESUME' : 'PAUSE'}</button>}{hasScenario && <button className="simulation-control reset" onClick={onReset}><Icon name="RotateCcw" size={12} />RESET</button>}</div><div className="signal-loop"><span>SENSE</span><i>→</i><span>ANALYSE</span><i>→</i><span>ADAPT</span><i>→</i><span>WARN</span></div></Panel>
}

function NetworkSummary({ nodes, isOffline }) { const online = nodes.filter((node) => node.status !== 'offline').length; return <Panel className="network-summary"><div className="network-summary-top"><div><div className="eyebrow">NETWORK</div><h3>Mesh connectivity</h3></div><Badge tone={isOffline ? 'amber' : 'green'} pulse>{isOffline ? 'EDGE BUFFER' : 'STABLE'}</Badge></div><div className="network-stats"><div><strong>{online}<small>/{nodes.length}</small></strong><span>nodes online</span></div><div><strong>{isOffline ? '91' : '94'}<span className="unit">%</span></strong><span>packet delivery</span></div></div><div className="network-bars">{[42, 67, 53, 75, 62, 88, 68, 79, 56, 91, 74, 86, 63, 77, 94, 82, 72, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="network-foot"><span><span className="tiny-signal" /> LoRa mesh</span><span>12.6 km coverage</span></div></Panel> }

function MapPanel({ mine, nodes, selectedId, simulation, showZones, onToggleLayers, onCenter, onSelect }) {
  return <Panel className="map-panel"><div className="map-heading"><SectionHeading eyebrow="LIVE MINE MAP" title={`${mine.id} / ${mine.sector}`} /><div className="map-actions"><Badge tone="green" pulse>LIVE</Badge><button className={`map-action ${showZones ? 'is-active' : ''}`} aria-label={`${showZones ? 'Hide' : 'Show'} risk zones`} aria-pressed={showZones} onClick={onToggleLayers}><Icon name="Layers" size={15} /></button><button className="map-action" aria-label="Center map on highest risk node" onClick={onCenter}><Icon name="Crosshair" size={15} /></button></div></div><div className={`map-canvas ${showZones ? '' : 'zones-hidden'}`}><div className="map-grid-lines" /><div className="map-watermark">{mine.id}<span>{mine.sector.toUpperCase()} · SURFACE MONITORING GRID</span></div><div className="map-compass"><span>N</span><i /><span>S</span></div><div className="map-scale"><span>0</span><i /><span>250 m</span></div>{mine.mapZones.map((zone) => <div className={`map-zones ${zone.className}`} key={zone.label}><span>{zone.label}</span></div>)}<svg className="tunnel-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M5 43 C20 25 24 40 37 31 S57 38 66 25 S80 18 98 34" /><path d="M8 70 C20 61 31 73 43 58 S65 70 78 54 S91 65 99 58" /><path d="M16 12 C22 26 25 39 38 47 S55 57 60 86" /><path d="M45 11 C44 26 55 31 55 45 S72 62 85 88" /></svg>{nodes.map((node) => <button key={node.id} className={`map-node node-${node.status} ${selectedId === node.id ? 'is-selected' : ''} ${node.status === 'offline' ? 'is-disabled' : ''} ${simulation.running && node.id === mine.demo.primary ? 'is-simulating' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onSelect(node)} aria-label={`${node.id}, ${statusMeta[node.status].label}, risk score ${node.riskScore}`}><span className="node-halo" /><span className="node-core" /><span className="node-label">{node.id}</span>{node.id === mine.demo.primary && <span className="node-alert-mark"><Icon name="AlertTriangle" size={10} /></span>}</button>)}<div className="map-legend"><span><i className="legend-dot green" />Healthy</span><span><i className="legend-dot amber" />Watch</span><span><i className="legend-dot red" />Critical</span><span><i className="legend-dot muted" />Offline</span></div><div className="map-callout"><div className="callout-line" /><div className="callout-card"><span className="eyebrow">SELECTED NODE</span><strong>{selectedId}</strong><span>{nodes.find((node) => node.id === selectedId)?.zone || mine.demo.zone} · {nodes.find((node) => node.id === selectedId)?.riskScore || 0} risk score</span></div></div></div></Panel>
}

function AlertCenter({ alerts, onDismiss, onFocus, onOpenAll }) { return <aside className="alert-column"><Panel className="alerts-panel"><div className="alerts-header"><SectionHeading eyebrow="ALERT CENTER" title="Operator queue" /><span className="alert-count">{String(alerts.length).padStart(2, '0')}</span></div>{alerts.slice(0, 3).map((alert) => <AlertCard key={alert.id} alert={alert} onDismiss={onDismiss} onFocus={onFocus} />)}{alerts.length === 0 && <div className="empty-alerts"><Icon name="Check" size={20} /><strong>Queue acknowledged</strong><span>No active alerts in the operator queue.</span></div>}<button className="view-all-button" onClick={onOpenAll}>VIEW ALL ALERTS <span>↗</span></button></Panel><div className="alert-note"><Icon name="ShieldCheck" size={15} /><span><strong>AI-assisted triage</strong> ranks alerts by severity, corroboration, and rate of change.</span></div></aside> }
function AlertCard({ alert, onDismiss, onFocus }) { const handleKeyDown = (event) => { if (event.key === 'Enter' || event.key === ' ') onFocus(alert) }; return <div className={`alert-card ${alert.tone}`} role="button" tabIndex="0" onClick={() => onFocus(alert)} onKeyDown={handleKeyDown}><div className="alert-card-top"><Badge tone={badgeTone(alert.tone)} pulse={alert.tone === 'critical'}>{alert.label}</Badge><span>{alert.time}</span></div><h3>{alert.title}</h3><div className="alert-location"><Icon name={alert.tone === 'info' ? 'Radio' : 'MapPin'} size={14} />{alert.location}{alert.risk && <><span>·</span> risk <b>{alert.risk}</b></>}</div><div className="alert-divider" /><div className="corroboration">{alert.tone === 'critical' ? <><span className="avatar-stack"><i>{alert.nodeIds?.[0]?.replace('-', '')}</i><i>{alert.nodeIds?.[1]?.replace('-', '')}</i></span><span>Corroborated by {alert.nodeIds?.length || 1} nodes</span></> : <span>{alert.detail}</span>}<button onClick={(event) => { event.stopPropagation(); onDismiss(alert.id) }} aria-label={`Acknowledge ${alert.title}`}><Icon name={alert.tone === 'info' ? 'Check' : 'X'} size={14} /></button></div></div> }

function SelectedNode({ node, lastUpdated }) { const meta = statusMeta[node.status]; const offline = node.status === 'offline'; return <Panel className="selected-node-panel"><div className="selected-node-head"><div><div className="eyebrow">SELECTED NODE</div><div className="node-title-row"><h2>{node.id}</h2><Badge tone={meta.color} pulse={node.status === 'elevated' || node.status === 'critical'}>{meta.label.toUpperCase()}</Badge></div><span className="node-zone">{node.zone} · south ventilation drift</span></div><div className="last-seen"><span className="live-pip" />LAST SEEN <strong>{offline ? `${node.lastSeenSec}s ago` : `${lastUpdated}s ago`}</strong></div></div><div className="node-metrics"><Metric label="TILT" value={offline ? '—' : `${node.tiltDeg.toFixed(3)}°`} /><Metric label="DISPLACEMENT" value={offline ? '—' : `${node.displacementMm.toFixed(1)} mm`} /><Metric label="CRACK WIDTH" value={offline ? '—' : `${node.crackMm.toFixed(1)} mm`} accent={node.crackMm > 2} /><Metric label="VIBRATION" value={node.vibration} /><Metric label="TEMPERATURE" value={offline ? '—' : `${node.temperatureC.toFixed(1)}°C`} /><Metric label="RSSI / SNR" value={offline ? '—' : `${node.rssiDbm} / ${node.snrDb.toFixed(1)}`} /><Metric label="BATTERY" value={`${node.batteryPct}%`} /><Metric label="RISK SCORE" value={offline ? 'N/A' : `${node.riskScore}/100`} accent={node.riskScore > 60} /></div><div className="node-insight-strip"><span><b>ADAPTIVE SAMPLING</b>{node.samplingRate}</span><span><b>LOCAL BASELINE</b>{node.baselineRisk}/100</span><span title="Confidence in current anomaly/risk assessment"><b>FUSION CONFIDENCE</b>{node.confidence ? `${node.confidence}%` : 'N/A'}</span></div></Panel> }
function Metric({ label, value, accent }) { return <div className="metric"><span>{label}</span><strong className={accent ? 'accent-value' : ''}>{value}</strong></div> }

function TrendChart({ node, simulation }) { const width = 560, height = 116, padX = 12, padY = 12; const values = node.trend; const points = values.map((value, index) => `${padX + index * ((width - padX * 2) / (values.length - 1))},${height - padY - (value / 100) * (height - padY * 2)}`).join(' '); const last = values[values.length - 1]; const color = last > 70 ? '#ff5c5c' : last > 40 ? '#ffb547' : '#36d399'; const accelerating = last - values[0] > 20; return <Panel className="trend-panel"><div className="trend-header"><div><div className="eyebrow">DEFORMATION TREND <span className="trend-period">· LAST 8 READINGS</span></div><h2>Risk trajectory</h2></div><div className="trend-score" style={{ color }}><strong>{last}</strong><span>/ 100</span><small>{simulation.running ? 'SIMULATING' : 'CURRENT RISK'}</small></div></div><div className="chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Risk score trend for ${node.id}, currently ${last} out of 100`} preserveAspectRatio="none"><defs><linearGradient id={`riskFill-${node.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".24" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>{[25, 50, 75].map((value) => <g key={value}><line x1="0" x2={width} y1={height - padY - (value / 100) * (height - padY * 2)} y2={height - padY - (value / 100) * (height - padY * 2)} stroke="rgba(161,177,191,.13)" strokeDasharray="3 5" /><text x={width - 2} y={height - padY - (value / 100) * (height - padY * 2) - 4} textAnchor="end" fill="#71808d" fontSize="8">{value}</text></g>)}<polygon points={`${padX},${height - padY} ${points} ${width - padX},${height - padY}`} fill={`url(#riskFill-${node.id})`} /><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{values.map((value, index) => <circle key={`${value}-${index}`} cx={padX + index * ((width - padX * 2) / (values.length - 1))} cy={height - padY - (value / 100) * (height - padY * 2)} r={index === values.length - 1 ? 4 : 2} fill="#10161b" stroke={color} strokeWidth={index === values.length - 1 ? 2 : 1.2} />)}</svg><div className="chart-axis"><span>−35 min</span><span>NOW</span></div></div><div className="trend-footer"><span><i className="trend-arrow">↗</i> {accelerating ? 'Rapid acceleration' : last > 35 ? 'Mild increase' : 'Stable trajectory'}</span><span title="Confidence in current anomaly/risk assessment">Model confidence <strong>{node.confidence || 'N/A'}%</strong></span></div></Panel> }

function NodeHealth({ nodes, selectedId, onSelect, onOpenNetwork }) { return <Panel className="health-panel"><SectionHeading eyebrow="NODE HEALTH" title="Mesh node status" action={<button className="panel-action" onClick={onOpenNetwork}>VIEW NETWORK <span>↗</span></button>} /><div className="health-table"><div className="health-table-head"><span>NODE / ZONE</span><span>STATUS</span><span>RSSI / SNR</span><span>BATTERY</span><span>LAST SEEN</span></div>{nodes.map((node) => <button className={`health-row ${selectedId === node.id ? 'selected' : ''}`} key={node.id} onClick={() => onSelect(node)}><span className="health-node-id"><i className={`status-bullet ${statusMeta[node.status].color}`} /> <strong>{node.id}</strong><small>{node.zone}</small></span><span><Badge tone={statusMeta[node.status].color}>{statusMeta[node.status].label}</Badge></span><span className="signal-cell">{node.status === 'offline' ? '—' : <><b>{node.rssiDbm}</b><small>{node.snrDb.toFixed(1)} dB</small></>}</span><span className="battery-cell"><span className="battery-track"><i style={{ width: `${node.batteryPct}%` }} /></span><b>{node.batteryPct}%</b></span><span className="last-seen-cell">{node.lastSeenSec > 90 ? `${node.lastSeenSec}s` : `${node.lastSeenSec}s ago`}</span></button>)}</div></Panel> }
function EdgeCard({ isOffline, pendingSync, onToggle }) { return <Panel className={`edge-panel ${isOffline ? 'offline' : ''}`}><div className="edge-head"><div><div className="eyebrow">EDGE GATEWAY</div><h2>{isOffline ? 'Cloud disconnected' : 'Cloud connected'}</h2></div><button className={`toggle ${isOffline ? 'on' : ''}`} onClick={onToggle} aria-pressed={isOffline} aria-label="Toggle cloud connectivity"><span /></button></div><div className="edge-state"><div className="edge-icon"><Icon name={isOffline ? 'CloudOff' : 'Cloud'} size={18} /></div><div><strong>{isOffline ? 'Edge monitoring active' : 'Cloud sync operational'}</strong><span>{isOffline ? 'Internet unavailable · local buffering enabled' : 'All telemetry synced to cloud'}</span></div></div><div className="sync-line"><span>Pending sync</span><strong className={isOffline ? 'accent-value' : ''}>{isOffline ? pendingSync : 0} <small>packets</small></strong></div><div className="edge-progress"><i style={{ width: isOffline ? '36%' : '100%' }} /></div></Panel> }
function ActivityLog({ entries }) { return <Panel className="activity-panel"><div className="activity-head"><SectionHeading eyebrow="SYSTEM ACTIVITY" title="Event stream" /><span className="activity-live"><i />LIVE</span></div><div className="activity-list">{entries.map((entry, index) => <div className="activity-row" key={`${entry.time}-${index}`}><span className={`activity-marker ${entry.tone}`}><i /></span><span className="activity-time">{entry.time}</span><span className="activity-text">{entry.text}</span></div>)}</div></Panel> }

function AlertDrawer({ alerts, acknowledged, onDismiss, onFocus, onClose }) { const [filter, setFilter] = useState('ALL'); const allItems = [...alerts.map((alert) => ({ ...alert, state: 'ACTIVE' })), ...acknowledged.map((alert) => ({ ...alert, state: 'ACKNOWLEDGED' }))]; const visibleItems = allItems.filter((alert) => filter === 'ALL' || alert.label === filter); return <Overlay title="Alert review" eyebrow="OPERATOR QUEUE" onClose={onClose}><div className="overlay-summary"><span><strong>{alerts.length}</strong> active alerts</span><span>Ranked by severity + corroboration + rate of change</span></div><div className="alert-filters" role="group" aria-label="Filter alerts">{['ALL', 'CRITICAL', 'HIGH', 'WATCH', 'INFO'].map((item) => <button className={filter === item ? 'is-selected' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="drawer-list">{visibleItems.map((alert) => alert.state === 'ACKNOWLEDGED' ? <div className="acknowledged-row" key={`${alert.id}-ack`}><span><Badge tone="green">ACKNOWLEDGED</Badge><strong>{alert.title}</strong></span><small>{alert.acknowledgedAt}</small></div> : <div className="drawer-alert" key={alert.id} onClick={() => onFocus(alert)}><div><Badge tone={badgeTone(alert.tone)}>{alert.label}</Badge><h3>{alert.title}</h3><p>{alert.detail}</p></div><div className="drawer-actions"><button className="drawer-action secondary" onClick={(event) => { event.stopPropagation(); onFocus(alert) }}>FOCUS</button><button className="drawer-action" onClick={(event) => { event.stopPropagation(); onDismiss(alert.id) }}><Icon name="Check" size={14} /> ACKNOWLEDGE</button></div></div>)}{visibleItems.length === 0 && <div className="empty-alerts large"><Icon name="Check" size={22} /><strong>No alerts in this filter</strong><span>Try another severity or acknowledge the remaining queue.</span></div>}</div></Overlay> }
function NetworkDrawer({ nodes, otaStatus, onQueueOta, onClose }) { const onlineNodes = nodes.filter((node) => node.status !== 'offline'); return <Overlay title="Network operations" eyebrow="MESH + OTA CONTROL" onClose={onClose}><div className="network-drawer-grid"><div className="drawer-stat"><span>NODE FLEET</span><strong>{onlineNodes.length}/{nodes.length}</strong><small>online</small></div><div className="drawer-stat"><span>GATEWAY</span><strong className="green">READY</strong><small>Raspberry Pi edge</small></div><div className="drawer-stat"><span>ROUTING</span><strong className="green">SELF-HEALING</strong><small>multi-hop active</small></div></div><div className="ota-control"><div><div className="eyebrow">REMOTE FIRMWARE</div><h3>OTA update manager</h3><p>Stage a signed package for the ESP32 fleet. Verification and rollback are part of the prototype flow.</p></div><button className="drawer-action" disabled={otaStatus === 'queued'} onClick={onQueueOta}>{otaStatus === 'ready' ? <><Icon name="RefreshCw" size={14} /> STAGE UPDATE</> : otaStatus === 'queued' ? <><Icon name="RefreshCw" size={14} /> VERIFYING...</> : <><Icon name="Check" size={14} /> VERIFIED</>}</button></div><div className="link-list"><div className="link-list-head"><span>LINK</span><span>RSSI / SNR</span><span>ROUTE</span></div>{onlineNodes.slice(0, 5).map((node, index) => <div className="link-row" key={node.id}><span><i className="link-dot" />{node.id} → {index === 0 ? 'GATEWAY' : onlineNodes[index - 1].id}</span><span>{node.rssiDbm} / {node.snrDb.toFixed(1)} dB</span><span className="green">{node.status === 'critical' ? 'REROUTED' : 'HEALTHY'}</span></div>)}</div><div className="honesty-note"><Icon name="Info" size={15} /><span>OTA and mesh controls are simulated in this dashboard. The hardware path remains Raspberry Pi → LoRa → ESP32 nodes.</span></div></Overlay> }
function Overlay({ eyebrow, title, onClose, children }) { return <div className="overlay-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="overlay-title"><div className="overlay-header"><div><div className="eyebrow">{eyebrow}</div><h2 id="overlay-title">{title}</h2></div><button className="overlay-close" aria-label="Close dialog" onClick={onClose}><Icon name="X" size={16} /></button></div>{children}</section></div> }

function AppRoot() { return <StrictMode><App /></StrictMode> }
createRoot(document.getElementById('root')).render(<AppRoot />)
