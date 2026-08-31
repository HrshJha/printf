# SubSense Dashboard Guide

This document explains the full SubSense operator dashboard: what each feature does, what each graph or visual indicator means, and how an operator should check the system during a monitoring session.

## 1. Dashboard Purpose

SubSense is a ground stability intelligence dashboard for monitoring mine subsidence risk. It shows simulated data from sensor nodes placed across mine zones. The dashboard helps an operator:

- Check mine-wide risk.
- Locate risky sensor nodes on the live mine map.
- Read node-level measurements such as tilt, displacement, crack width, vibration, temperature, signal quality, battery, and risk score.
- Understand risk movement through the deformation trend graph.
- Review alerts and acknowledge them.
- Monitor mesh network health.
- Test edge gateway behavior when cloud connectivity is lost.
- Run a controlled deformation simulation to show how risk escalates.

Important: this project is a prototype using controlled lab/demo data. It is not a real field failure prediction system.

## 2. Main Layout

The dashboard is divided into these major areas:

| Area | Purpose |
| --- | --- |
| Top bar | Shows product identity, system status, mine selector, alert shortcut, and operator profile button. |
| Left rail | Shows mine-wide risk summary and network summary. |
| Center column | Shows live mine map, selected node details, risk trajectory graph, node health table, edge gateway card, and activity log. |
| Right rail | Shows active alert queue and alert actions. |
| Footer | Shows prototype boundary and latest sync/edge state. |
| Overlays | Alert review drawer and network operations drawer. |

## 3. Top Bar

### Product Identity

The top-left area displays `SUBSENSE` and the subtitle `GROUND STABILITY INTELLIGENCE`. This identifies the dashboard as a mine ground-stability monitoring console.

### System Status

The status text changes based on cloud connectivity:

| Status | Meaning |
| --- | --- |
| `SYSTEM OPERATIONAL` | Cloud sync is active and telemetry is considered synced. |
| `EDGE MODE ACTIVE` | Internet/cloud connectivity is simulated as unavailable, but local monitoring continues through edge buffering. |

### Mine Selector

The mine selector switches the dashboard dataset. Current mine options are:

| Mine | Sector | Default Risk |
| --- | --- | --- |
| `ABC-1` | North Sector | High |
| `JHARIA-4` | East Sector | Low |
| `RANIGANJ-2` | South Sector | Watch |

When the mine is changed, the dashboard reloads:

- Sensor nodes.
- Selected default node.
- Activity log.
- Alerts.
- Map zones.
- Simulation state.

### Alert Button

The bell icon opens the alert review drawer. Use it when you want the full alert list, filters, focus actions, and acknowledged alert history.

### Operator Profile

The `OP` button shows a demo operator-profile toast. It does not open a real account page in this prototype.

## 4. Risk Overview Panel

The `Mine-wide risk` panel summarizes overall risk by node status.

### Current Assessment Badge

This badge shows the selected mine's overall assessment:

| Badge | Meaning |
| --- | --- |
| `LOW` | Normal/stable condition. |
| `WATCH` | Some signs need monitoring. |
| `HIGH` | Mine has elevated risk and needs attention. |

### Active Nodes

The large number shows nodes that are currently online. Offline nodes are excluded from this count.

Example: if a mine has 9 total nodes and 1 is offline, the active node count is `08`.

### Risk Rows

The risk rows count how many active nodes are in each condition:

| Row | Color | Meaning |
| --- | --- | --- |
| `LOW` | Green | Healthy nodes. |
| `WATCH` | Amber | Nodes with early warning signals. |
| `HIGH` | Orange | Nodes with elevated deformation risk. |
| `CRITICAL` | Red | Nodes with severe risk signals. |

Each mini bar shows that category's share of all active nodes. A longer bar means more nodes are in that status.

### Simulate Deformation

The `SIMULATE DEFORMATION` button starts a controlled scenario. It changes selected demo nodes through these phases:

1. Normal baseline.
2. Anomaly detected.
3. Spatial corroboration.
4. Adaptive sampling.
5. Progression analysis.
6. Critical warning.

During simulation:

- The primary node is selected automatically.
- Risk scores increase over time.
- The trend graph rises.
- Alerts are replaced with simulation-specific alerts.
- Activity log entries are added.
- The simulation progress percentage updates.

### Pause and Reset

When the simulation is running:

- `PAUSE` freezes the current simulation phase.
- `RESUME` continues from the paused phase.
- `RESET` restores the selected mine to its original baseline data.

### Sense to Warn Flow

The line `SENSE -> ANALYSE -> ADAPT -> WARN` explains the intended operational loop:

| Step | Meaning |
| --- | --- |
| Sense | Sensor nodes collect readings. |
| Analyse | The dashboard compares readings against baselines. |
| Adapt | Sampling rate changes when risk rises. |
| Warn | Alert is created for operator review. |

## 5. Network Summary Panel

The `Mesh connectivity` panel summarizes the LoRa mesh network.

### Network State Badge

| Badge | Meaning |
| --- | --- |
| `STABLE` | Cloud connectivity is active. |
| `EDGE BUFFER` | Dashboard is simulating cloud disconnection, and packets are locally buffered. |

### Nodes Online

The first number shows online nodes out of total nodes. Offline nodes are counted in the denominator but excluded from the numerator.

### Packet Delivery

Packet delivery is a prototype indicator:

- `94%` when cloud sync is active.
- `91%` when edge mode is active.

It indicates communication reliability, not ground movement.

### Network Bars Graph

The small vertical bar graph visualizes recent mesh signal/packet quality. Taller bars indicate stronger recent communication quality. Mixed colors show variation across the network:

- Green bars: normal link quality.
- Amber/brown bars: weaker link quality or routes that need attention.

This graph is for network health only. It does not represent subsidence risk.

## 6. Live Mine Map

The map is the main spatial view of the sensor grid.

### Map Header

The map title shows the selected mine and sector, for example:

`ABC-1 / North Sector`

The `LIVE` badge indicates the dashboard is showing live-style simulated telemetry.

### Risk Zone Layer Button

The layer button toggles dashed risk-zone boxes on and off. Zones are labels such as `A-08`, `B-04`, or `C-12`.

Use this when checking whether a risky node is isolated or inside a broader zone of concern.

### Center on Highest Risk Button

The crosshair button selects the highest-risk online node. Use it when the dashboard has many nodes and you want to immediately focus on the most important signal.

### Node Markers

Each node marker is placed at a fixed map position. Its color shows status:

| Color | Status | Meaning |
| --- | --- | --- |
| Green | Healthy | Normal readings. |
| Amber | Watch | Early warning signal. |
| Orange | High | Elevated risk. |
| Red | Critical | Severe risk. |
| Gray | Offline | Node is not currently reporting. |

Clicking a node updates:

- Selected node panel.
- Risk trajectory graph.
- Node health table selection.
- Map callout.

### Node Alert Mark

The triangle alert mark appears on the mine's primary demo node. It helps show which node is affected during the simulated deformation workflow.

### Selected Node Callout

The callout shows:

- Selected node ID.
- Zone.
- Current risk score.

Use it to confirm that the map, details panel, and trend graph are all focused on the same node.

### Tunnel Lines, Compass, and Scale

The tunnel lines are visual context for the underground layout. The compass and scale provide orientation. They are interface context, not measured telemetry.

## 7. Selected Node Panel

The selected node panel gives detailed measurements for the node currently selected on the map or table.

### Node Status Badge

| Badge | Meaning |
| --- | --- |
| `HEALTHY` | Readings are normal. |
| `WATCH` | Some readings are rising and should be monitored. |
| `HIGH` | Elevated risk; review trend and neighboring nodes. |
| `CRITICAL` | Severe risk; review alert and escalation path. |
| `OFFLINE` | No current telemetry. |

### Last Seen

`LAST SEEN` shows the latest heartbeat timing.

- Online nodes show a live-style value that updates every few seconds.
- Offline nodes show the node's stored last-seen age.

### Node Metrics

| Metric | What It Means | How To Check |
| --- | --- | --- |
| Tilt | Angular movement of the node. | Rising tilt can indicate ground movement. Compare it with risk score and trend. |
| Displacement | Linear movement in millimeters. | Higher displacement means physical movement is increasing. |
| Crack Width | Crack opening size in millimeters. | Values above `2.0 mm` are visually highlighted because they are more serious in this prototype. |
| Vibration | Current vibration condition. | `normal` is stable; `elevated` supports concern when risk is also rising. |
| Temperature | Node temperature in Celsius. | Useful for sensor context; not the primary subsidence signal here. |
| RSSI / SNR | Radio signal strength and signal-to-noise ratio. | Bad signal can explain communication issues, but does not prove ground risk. |
| Battery | Remaining battery percentage. | Low battery can affect node reliability. |
| Risk Score | Aggregated risk value from `0/100` to `100/100`. | Main number to review with trend, alert status, and neighboring nodes. |

### Adaptive Sampling

Shows how often the node is collecting data:

| Value | Meaning |
| --- | --- |
| `5 min` | Normal baseline sampling. |
| `90 sec` | Increased monitoring after early signs. |
| `30 sec` | High-frequency monitoring during elevated or critical risk. |
| `buffered` | Offline/local buffering condition. |

### Local Baseline

The baseline risk is the node's normal reference level. Compare current risk score against baseline:

- Small difference: likely stable.
- Large difference: possible anomaly.
- Large and fast-rising difference: stronger warning signal.

### Fusion Confidence

Fusion confidence shows confidence in the current anomaly/risk assessment. Higher confidence means the system has stronger support from available signals.

For offline nodes, confidence is `N/A`.

## 8. Deformation Trend Graph

The `Risk trajectory` graph shows the selected node's risk score over the last 8 readings.

### What the Graph Shows

- X-axis: time, from about `-35 min` to `NOW`.
- Y-axis: risk score from `0` to `100`.
- Line: selected node's risk movement.
- Dots: individual readings.
- Final larger dot: latest reading.
- Shaded area: intensity under the risk curve.

### Graph Colors

| Color | Risk Range | Meaning |
| --- | --- | --- |
| Green | Latest score `<= 40` | Stable or low risk. |
| Amber | Latest score `41-70` | Watch or elevated movement. |
| Red | Latest score `> 70` | High/critical movement. |

### Trend Footer

The footer classifies the trend:

| Label | Meaning |
| --- | --- |
| Stable trajectory | Risk is low and not rising sharply. |
| Mild increase | Risk is above normal but not sharply accelerating. |
| Rapid acceleration | Latest risk is more than 20 points higher than the first reading. |

### How To Use The Trend Graph

When checking risk, do not look only at the latest number. Check:

1. Whether the line is rising or flat.
2. Whether the final dot is in green, amber, or red range.
3. Whether the increase is sudden.
4. Whether the alert center says the movement is corroborated by neighboring nodes.
5. Whether adaptive sampling changed from `5 min` to `90 sec` or `30 sec`.

## 9. Node Health Table

The node health table lists every sensor node for the selected mine.

### Columns

| Column | Meaning |
| --- | --- |
| Node / Zone | Sensor ID and mine zone. |
| Status | Current health/risk state. |
| RSSI / SNR | Radio signal strength and noise quality. |
| Battery | Battery level with a progress bar. |
| Last Seen | Last heartbeat age. |

### How To Check Nodes

Use the table to scan operational health:

1. Check for red or orange status first.
2. Check offline nodes because they can hide missing telemetry.
3. Check weak RSSI/SNR before assuming missing data is ground risk.
4. Check low battery because it can cause unreliable reporting.
5. Click a row to inspect that node in the map, selected-node panel, and trend graph.

## 10. Edge Gateway Panel

The edge gateway panel shows cloud sync and local buffering behavior.

### Cloud Connected

When connected:

- Header says `Cloud connected`.
- State says `Cloud sync operational`.
- Pending sync is `0 packets`.
- Progress bar is full green.

### Cloud Disconnected / Edge Mode

When the toggle is switched on:

- Header says `Cloud disconnected`.
- State says `Edge monitoring active`.
- Pending sync count increases over time.
- Progress bar becomes amber.
- Activity log records that edge buffering started.

When switched back:

- Pending sync resets to `0`.
- Activity log records that buffered packets were forwarded.

### What Edge Mode Indicates

Edge mode indicates communication/cloud availability. It does not directly indicate mine deformation. The correct interpretation is:

- Ground monitoring continues locally.
- Cloud dashboards may be delayed.
- Buffered packets need to sync later.

## 11. System Activity Log

The event stream records recent dashboard events.

Examples:

- Risk score updates.
- Sampling rate changes.
- Anomaly detection.
- Heartbeats.
- OTA updates.
- Cloud sync changes.
- Alert acknowledgements.

Use this panel to understand what changed recently and in what order.

## 12. Alert Center

The alert center is the operator queue.

### Alert Count

The number in the alert header shows active, unacknowledged alerts.

### Alert Severity

| Severity | Color | Meaning |
| --- | --- | --- |
| `CRITICAL` | Red | Highest priority. Needs immediate review. |
| `HIGH` | Orange | Elevated risk. Review trend and affected nodes. |
| `WATCH` | Amber | Early warning. Continue monitoring. |
| `INFO` | Blue | Operational or contextual message. |

### Alert Card Content

Each alert can show:

- Severity badge.
- Time.
- Title.
- Location.
- Risk score.
- Affected node IDs.
- Corroboration details.
- Acknowledge button.

### Corroboration

Corroboration means more than one node supports the same risk pattern. This is stronger than a single-node warning.

Example: if `N-017` and `N-018` both show rising movement, the dashboard treats the alert as more serious than one isolated node.

### Focus Alert

Click an alert card or `FOCUS` action to select the related node. This helps the operator jump from the queue to the exact node on the map and details panel.

### Acknowledge Alert

Click the acknowledge button to remove an alert from the active queue. The dashboard also:

- Adds the alert to acknowledged history.
- Adds an activity log entry.
- Shows a confirmation toast.

Acknowledge means the operator has reviewed the alert. It does not mean the physical risk is resolved.

## 13. Alert Review Drawer

The alert drawer opens from the bell icon or `VIEW ALL ALERTS`.

### Summary

The drawer shows:

- Number of active alerts.
- Ranking logic: severity, corroboration, and rate of change.

### Filters

Available filters:

- `ALL`
- `CRITICAL`
- `HIGH`
- `WATCH`
- `INFO`

Use filters to focus on one severity level.

### Active and Acknowledged Alerts

Active alerts have actions:

- `FOCUS`
- `ACKNOWLEDGE`

Acknowledged alerts appear in a separate acknowledged row with acknowledgement time.

## 14. Network Operations Drawer

The network drawer opens from `VIEW NETWORK`.

### Network Stats

| Stat | Meaning |
| --- | --- |
| Node Fleet | Online nodes out of total nodes. |
| Gateway | Prototype gateway readiness. |
| Routing | Mesh route behavior. |

### OTA Update Manager

The OTA manager simulates remote firmware staging for the ESP32 fleet.

States:

| State | Meaning |
| --- | --- |
| `STAGE UPDATE` | OTA package is ready to stage. |
| `VERIFYING...` | Package has been queued and is being verified. |
| `VERIFIED` | Prototype verification is complete. |

This is simulated. No real hardware firmware update happens.

### Link List

The link list shows sample mesh routes:

- Node-to-gateway or node-to-node route.
- RSSI/SNR values.
- Route state such as `HEALTHY` or `REROUTED`.

Use this to distinguish communication problems from physical deformation alerts.

## 15. Toast Messages

Toast messages appear after actions such as:

- Mine loaded.
- Simulation started.
- Simulation paused/resumed/reset.
- Edge mode toggled.
- Alert acknowledged.
- OTA package verified.
- Map centered on a node.

Toasts confirm that the dashboard received the action.

## 16. Recommended Operator Check Flow

Use this sequence during a dashboard review:

1. Check top bar status: confirm `SYSTEM OPERATIONAL` or identify `EDGE MODE ACTIVE`.
2. Select the correct mine from the mine selector.
3. Review mine-wide risk and active node count.
4. Check the risk category counts: low, watch, high, critical.
5. Open the map and select the highest-risk node using the crosshair button.
6. Review the selected node metrics.
7. Check the deformation trend graph for rising or accelerating risk.
8. Compare current risk score with the local baseline.
9. Check whether adaptive sampling has increased.
10. Review alert center for severity, location, and corroboration.
11. Focus each serious alert and verify the related node.
12. Check node health table for offline nodes, weak signal, or low battery.
13. Open network operations if communication quality looks weak.
14. Acknowledge reviewed alerts only after inspection.
15. Use the activity log to confirm the order of recent events.

## 17. How To Interpret High Risk Correctly

A serious risk signal is strongest when several indicators agree:

- Risk score is high.
- Trend graph is rising quickly.
- Tilt, displacement, or crack width are increasing.
- Neighboring nodes show related movement.
- Alert center says the signal is corroborated.
- Sampling rate has changed to `30 sec`.
- Fusion confidence remains meaningful.

A single bad signal should be checked carefully:

- Weak RSSI/SNR may mean communication trouble.
- Low battery may mean unreliable telemetry.
- Offline state means missing data, not necessarily physical danger.
- Temperature alone is not treated as a subsidence warning in this prototype.

## 18. Prototype Boundaries

The dashboard currently uses hardcoded demo data in `src/main.jsx`.

The following behaviors are simulated:

- Sensor readings.
- Mine map positions.
- Alerts.
- Risk scores.
- Trend graph data.
- Edge/cloud connectivity.
- Pending sync packets.
- OTA update staging and verification.
- Mesh routes.

The intended hardware path shown in the UI is:

`Raspberry Pi -> LoRa -> ESP32 nodes`

For a real deployment, this prototype would need real telemetry ingestion, authentication, persistent alert history, validated risk models, hardware integration, and field-tested thresholds.

