import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MissionControl — the hero as a live engineering simulation.
 *
 * Not a checklist of technologies: a system that *does* things. A scripted-but-
 * randomised event engine plays scenarios (request flows, cache hit/miss,
 * traffic spikes, deploys, retries, dead-letter) across the architecture of
 * Aniket's REAL projects (BVISIONR, Radique, Aura, StopSearch). Packets travel,
 * nodes light up, a log streams, metrics react. The sequence never repeats and
 * rotates between projects, so every visit feels different.
 *
 * Interaction:
 *   • Switch project  → the whole panel morphs to that product's architecture.
 *   • Hover a node    → the panel morphs into that service's inspector.
 *   • Easter egg      → type "hire" (or the Konami code) to run hire-aniket.
 *
 * The telemetry is an illustrative architecture simulation (aria-hidden, tagged
 * "sim") — it demonstrates how each system is wired, not live business metrics.
 * All motion respects `reduced`.
 */

/* ── Media query hook (SSR safe) ──────────────────────────────────────────── */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/* ── Canonical topology geometry (relabelled per project) ─────────────────── */
const NODE_POS = {
  ingress: [50, 30],
  edge: [170, 30],
  core: [300, 30],
  queue: [430, 30],
  egress: [550, 30],
  cache: [170, 120],
  db: [350, 120],
  cloud: [550, 120],
};
const PIPE_EDGES = [
  ['ingress', 'edge'],
  ['edge', 'core'],
  ['core', 'queue'],
  ['queue', 'egress'],
];
const STORE_EDGES = [
  ['edge', 'cache'],
  ['core', 'db'],
  ['queue', 'cloud'],
];

/* ── Real projects → architecture labels + stack ──────────────────────────── */
const PROJECTS = [
  {
    id: 'bvisionr',
    name: 'BVISIONR',
    kind: 'Multi-tenant messaging SaaS',
    labels: {
      ingress: 'Client', edge: 'API', core: 'Automation', queue: 'BullMQ',
      egress: 'WhatsApp', cache: 'Redis', db: 'MongoDB', cloud: 'OCI',
    },
  },
  {
    id: 'radique',
    name: 'Radique',
    kind: 'Radiology workflow platform',
    labels: {
      ingress: 'Hospital', edge: 'API', core: 'Orthanc', queue: 'Workflow',
      egress: 'Report', cache: 'Audit', db: 'MongoDB', cloud: 'Docker',
    },
  },
  {
    id: 'aura',
    name: 'Aura',
    kind: 'Laptop rental & commerce platform',
    labels: {
      ingress: 'Customer', edge: 'Catalog', core: 'Razorpay', queue: 'Automation',
      egress: 'Invoice', cache: 'Inventory', db: 'MongoDB', cloud: 'Docker / K8s',
    },
  },
  {
    id: 'stopsearch',
    name: 'StopSearch',
    kind: 'Live hiring & candidate search',
    labels: {
      ingress: 'Candidate', edge: 'OTP Auth', core: 'Gemini Rank', queue: 'Socket.IO',
      egress: 'Dashboard', cache: 'Redis', db: 'MongoDB', cloud: 'Cloud',
    },
  },
];

/* ── Compact "System Card" snapshot per project (mobile collapsed view) ───── */
const SNAPSHOTS = {
  bvisionr: { service: 'Automation', status: 'Healthy', latency: '41ms', queue: '0', cache: '98%' },
  radique: { service: 'Workflow', status: 'Healthy', latency: '210ms', queue: '127', cache: '91%' },
  aura: { service: 'Payments', status: 'Healthy', latency: '88ms', queue: '12', cache: '96%' },
  stopsearch: { service: 'Realtime', status: 'Healthy', latency: '63ms', queue: '34', cache: '94%' },
};

/* Two-letter pills for the mobile card's project switcher. */
const ABBR = { bvisionr: 'BV', radique: 'RA', aura: 'AU', stopsearch: 'SS' };

/* Slow count-down played on the card's Queue metric so it feels alive. */
const QUEUE_SEQ = [127, 92, 48, 12, 0];

/* ── Event scripts — generic, project-flavoured at runtime ────────────────── */
// tokens {edge} {core} etc. resolved from the active project's labels.
const EVENTS = [
  {
    id: 'req-hit',
    label: 'request · cache hit',
    steps: [
      { node: 'ingress', text: '→ inbound request', t: 'info' },
      { node: 'edge', text: '{edge} · auth ok', t: 'ok' },
      { node: 'cache', text: '{cache} GET → HIT', t: 'ok', m: { cache: '98%' } },
      { node: 'egress', text: '200 · {egress}', t: 'ok', m: { latency: '41ms' } },
    ],
  },
  {
    id: 'req-miss',
    label: 'request · db read',
    steps: [
      { node: 'ingress', text: '→ inbound request', t: 'info' },
      { node: 'cache', text: '{cache} GET → MISS', t: 'warn', m: { cache: '91%' } },
      { node: 'core', text: '{core} · resolve', t: 'info' },
      { node: 'db', text: '{db} query 1 row', t: 'ok' },
      { node: 'egress', text: '200 · {egress}', t: 'ok', m: { latency: '88ms' } },
    ],
  },
  {
    id: 'spike',
    label: 'traffic spike → autoscale',
    steps: [
      { node: 'edge', text: '⚠ traffic spike +340%', t: 'warn', m: { latency: '210ms' } },
      { node: 'queue', text: '{queue} depth ↑ 127', t: 'warn', m: { queue: '127' } },
      { node: 'cloud', text: '{cloud} scale 2 → 5', t: 'info' },
      { node: 'queue', text: '{queue} draining', t: 'live', m: { queue: '34' } },
      { node: 'egress', text: 'recovered · healthy', t: 'ok', m: { latency: '63ms', queue: '0' } },
    ],
  },
  {
    id: 'deploy',
    label: 'deploy · production',
    steps: [
      { node: 'cloud', text: '$ deploy --prod', t: 'info' },
      { node: 'cloud', text: '✓ build · tests pass', t: 'ok' },
      { node: 'edge', text: 'rollout 3 / 3 healthy', t: 'ok' },
      { node: 'egress', text: '● live · 100% traffic', t: 'live' },
    ],
  },
  {
    id: 'retry',
    label: 'job retry',
    steps: [
      { node: 'queue', text: '{queue} job picked', t: 'info' },
      { node: 'core', text: 'task failed · timeout', t: 'warn' },
      { node: 'queue', text: 'retry 2/3 · backoff', t: 'info' },
      { node: 'egress', text: 'completed · {egress}', t: 'ok' },
    ],
  },
  {
    id: 'dlq',
    label: 'dead-letter recovery',
    steps: [
      { node: 'queue', text: 'max retries reached', t: 'warn' },
      { node: 'cloud', text: '→ dead-letter queue', t: 'warn' },
      { node: 'queue', text: 'replayed from DLQ', t: 'info' },
      { node: 'egress', text: 'drained · 0 stuck', t: 'ok', m: { queue: '0' } },
    ],
  },
  {
    id: 'cache-inv',
    label: 'cache invalidation',
    steps: [
      { node: 'core', text: 'mutation · feed:*', t: 'info' },
      { node: 'cache', text: '{cache} invalidate', t: 'warn' },
      { node: 'cache', text: 'warm · prefetch', t: 'ok', m: { cache: '96%' } },
    ],
  },
  {
    id: 'replica',
    label: 'db replication',
    steps: [
      { node: 'db', text: '{db} write · primary', t: 'info' },
      { node: 'db', text: 'replica sync · 4ms lag', t: 'ok' },
      { node: 'edge', text: 'read-replica routed', t: 'ok' },
    ],
  },
  {
    id: 'ai',
    label: 'AI routing',
    steps: [
      { node: 'ingress', text: '→ message received', t: 'info' },
      { node: 'core', text: '{core} · intent=billing', t: 'live' },
      { node: 'core', text: 'tool_call · resolve()', t: 'live' },
      { node: 'egress', text: 'sent · {egress}', t: 'ok', m: { latency: '120ms' } },
    ],
  },
  {
    id: 'stream',
    label: 'realtime stream',
    steps: [
      { node: 'edge', text: 'ws connect · 1.2k', t: 'live' },
      { node: 'core', text: 'fan-out · {core}', t: 'info' },
      { node: 'egress', text: 'pushed · {egress}', t: 'live' },
    ],
  },
];

/* ── Per-node inspector content ───────────────────────────────────────────── */
function inspectorFor(nodeId, labels) {
  const map = {
    edge: { title: `${labels.edge} · gateway`, rows: [['routes', '42'], ['p95', '38ms'], ['auth', 'JWT · RBAC']] },
    core: { title: `${labels.core} · service`, rows: [['concurrency', '12'], ['errors', '0 / 5m'], ['queue', 'BullMQ']] },
    queue: { title: `${labels.queue} · jobs`, rows: [['waiting', '0'], ['active', '3'], ['workers', '3']] },
    egress: { title: `${labels.egress} · delivery`, rows: [['status', 'connected'], ['success', '98.6%'], ['retries', 'auto']] },
    cache: { title: `${labels.cache} · cache`, rows: [['hit ratio', '98%'], ['memory', '2.4 GB'], ['latency', '1.8ms']] },
    db: { title: `${labels.db} · store`, rows: [['role', 'primary'], ['repl lag', '4ms'], ['conns', '24 / 100']] },
    cloud: { title: `${labels.cloud} · infra`, rows: [['regions', '3'], ['containers', '5 running'], ['rollout', '100%']] },
    ingress: { title: `${labels.ingress} · entry`, rows: [['protocol', 'HTTPS / WS'], ['rate limit', 'on'], ['edge', 'global']] },
  };
  return map[nodeId];
}

const INSPECTABLE = new Set(['edge', 'core', 'queue', 'egress', 'cache', 'db', 'cloud', 'ingress']);

const resolve = (text, labels) =>
  text.replace(/\{(\w+)\}/g, (_, k) => labels[k] || k);

const pct = (id) => ({
  left: `${(NODE_POS[id][0] / 600) * 100}%`,
  top: `${(NODE_POS[id][1] / 150) * 100}%`,
});

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

const MissionControl = ({ reduced = false, active = true }) => {
  const [projectIx, setProjectIx] = useState(0);
  const [activeNode, setActiveNode] = useState(null);
  const [eventLabel, setEventLabel] = useState('idle');
  const [log, setLog] = useState([]);
  const [metrics, setMetrics] = useState({ latency: '—', cache: '—', queue: '0' });
  const [inspect, setInspect] = useState(null);
  const [egg, setEgg] = useState(false);

  // Mobile shows a compact "System Card" by default; tap expands to the full
  // panel. The simulation only runs when the hero is on screen (`active`),
  // motion is allowed, and — on mobile — the panel is expanded.
  const isCompact = useMediaQuery('(max-width: 700px)');
  const [expanded, setExpanded] = useState(false);
  const [liveQueue, setLiveQueue] = useState(null);
  const running = active && !reduced && (!isCompact || expanded);
  const showCard = isCompact && !expanded;

  const pausedRef = useRef(false);
  // Monotonic, persists across effect re-runs (project rotation) so log line
  // keys are always unique — fixes the duplicate-key reconciliation churn.
  const lineIdRef = useRef(0);
  const project = PROJECTS[projectIx];
  const labels = project.labels;

  const select = useCallback((id) => {
    pausedRef.current = true;
    setInspect(id);
    setActiveNode(id);
  }, []);
  const clearInspect = useCallback(() => {
    pausedRef.current = false;
    setInspect(null);
  }, []);

  const switchProject = useCallback((ix) => {
    setProjectIx(ix);
    setLog([]);
    setMetrics({ latency: '—', cache: '—', queue: '0' });
    setActiveNode(null);
  }, []);

  /* ── Event engine ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced) {
      setEventLabel('request · cache hit');
      setLog([
        { id: lineIdRef.current++, text: '→ inbound request', t: 'info' },
        { id: lineIdRef.current++, text: `${labels.cache} GET → HIT`, t: 'ok' },
        { id: lineIdRef.current++, text: `200 · ${labels.egress}`, t: 'ok' },
      ]);
      setMetrics({ latency: '41ms', cache: '98%', queue: '0' });
      setActiveNode('egress');
      return undefined;
    }

    // Paused: hero off-screen / tab hidden, or mobile card not yet expanded.
    if (!running) return undefined;

    let stopped = false;
    let lastId = null;
    let count = 0;
    const timers = new Set();
    const sleep = (ms) =>
      new Promise((res) => {
        const t = setTimeout(() => {
          timers.delete(t);
          res();
        }, ms);
        timers.add(t);
      });

    const pick = () => {
      let e;
      do {
        e = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      } while (e.id === lastId && EVENTS.length > 1);
      lastId = e.id;
      return e;
    };

    const run = async () => {
      while (!stopped) {
        while (pausedRef.current && !stopped) await sleep(180);
        if (stopped) return;

        const ev = pick();
        setEventLabel(ev.label);
        for (const step of ev.steps) {
          while (pausedRef.current && !stopped) await sleep(180);
          if (stopped) return;
          setActiveNode(step.node);
          const text = resolve(step.text, labels);
          const id = lineIdRef.current++;
          setLog((prev) => [...prev.slice(-5), { id, text, t: step.t }]);
          if (step.m) setMetrics((prev) => ({ ...prev, ...step.m }));
          await sleep(720 + Math.random() * 260);
        }
        if (stopped) return;
        await sleep(1200);
        count += 1;
        if (count % 3 === 0) {
          if (stopped) return;
          setProjectIx((ix) => (ix + 1) % PROJECTS.length);
          return; // effect re-runs on project change
        }
      }
    };
    run();

    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced, projectIx, labels, running]);

  /* ── Card "live" queue count-down (collapsed mobile view) ─────────────────── */
  useEffect(() => {
    if (!showCard || reduced || !active) {
      setLiveQueue(null);
      return undefined;
    }
    let i = 0;
    setLiveQueue(QUEUE_SEQ[0]);
    const t = window.setInterval(() => {
      i = (i + 1) % QUEUE_SEQ.length;
      setLiveQueue(QUEUE_SEQ[i]);
    }, 2200);
    return () => window.clearInterval(t);
  }, [showCard, reduced, active]);

  /* ── Easter eggs ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let buf = '';
    let kIx = 0;
    const trigger = () => {
      setEgg(true);
      window.setTimeout(() => setEgg(false), 5200);
    };
    const onKey = (e) => {
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === 'hire') trigger();
      kIx = e.key === KONAMI[kIx] || e.key.toLowerCase() === KONAMI[kIx] ? kIx + 1 : 0;
      if (kIx === KONAMI.length) {
        kIx = 0;
        trigger();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const inspectData = inspect ? inspectorFor(inspect, labels) : null;
  const snap = SNAPSHOTS[project.id];

  const nextProject = useCallback(
    () => switchProject((projectIx + 1) % PROJECTS.length),
    [projectIx, switchProject],
  );
  const prevProject = useCallback(
    () => switchProject((projectIx - 1 + PROJECTS.length) % PROJECTS.length),
    [projectIx, switchProject],
  );
  const touchX = useRef(null);
  const onTouchStart = (e) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? nextProject : prevProject)();
    touchX.current = null;
  };

  return (
    <div
      className="mission-control"
      onMouseLeave={reduced ? undefined : clearInspect}
    >
      <div className="mc-glow" aria-hidden="true" />

      {showCard ? (
        /* ── Mobile System Card — compact snapshot, expandable ── */
        <div className="mc-card" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="mc-card__head">
            <span className="mc-card__sys">{project.name.toLowerCase()}.system</span>
            <span className="mc-live">
              <span className="mc-live-dot" /> live
            </span>
          </div>

          <div className="mc-card__metrics">
            <div className="mc-metric">
              <span className="mc-metric__k">Status</span>
              <span className="mc-metric__v mc-metric__v--ok">● {snap.status}</span>
            </div>
            <div className="mc-metric">
              <span className="mc-metric__k">Latency</span>
              <span className="mc-metric__v">{snap.latency}</span>
            </div>
            <div className="mc-metric">
              <span className="mc-metric__k">Queue</span>
              <span className="mc-metric__v">{liveQueue ?? snap.queue}</span>
            </div>
            <div className="mc-metric">
              <span className="mc-metric__k">Cache</span>
              <span className="mc-metric__v mc-metric__v--ok">{snap.cache}</span>
            </div>
          </div>

          <div className="mc-card__tabs" role="tablist" aria-label="Switch project">
            {PROJECTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === projectIx}
                className={`mc-pill ${i === projectIx ? 'is-active' : ''}`}
                onClick={() => switchProject(i)}
                aria-label={`${p.name} — ${p.kind}`}
              >
                {ABBR[p.id]}
              </button>
            ))}
          </div>

          <button type="button" className="mc-card__cta" onClick={() => setExpanded(true)}>
            Inspect System
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          {isCompact && expanded && (
            <button type="button" className="mc-collapse" onClick={() => setExpanded(false)}>
              ‹ System snapshot
            </button>
          )}

          {/* Chrome */}
      <div className="mc-chrome">
        <div className="mc-dots" aria-hidden="true">
          <span className="mc-cdot mc-cdot--r" />
          <span className="mc-cdot mc-cdot--y" />
          <span className="mc-cdot mc-cdot--g" />
        </div>
        <span className="mc-chrome-title" aria-hidden="true">
          {project.name.toLowerCase()}.system
        </span>
        <span className="mc-chrome-right" aria-hidden="true">
          <span className="mc-sim">sim</span>
          <span className="mc-live">
            <span className="mc-live-dot" /> live
          </span>
        </span>
      </div>

      {/* Project switcher */}
      <div className="mc-projects" role="tablist" aria-label="Project systems">
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === projectIx}
            className={`mc-proj ${i === projectIx ? 'is-active' : ''}`}
            onMouseEnter={() => switchProject(i)}
            onFocus={() => switchProject(i)}
            onClick={() => switchProject(i)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={project.id}
          className="mc-stagebody"
          initial={reduced ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={reduced ? false : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduced ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
        >
          <div className="mc-kind" aria-hidden="true">
            {project.kind}
          </div>

          {/* Topology */}
          <div className="mc-topo">
            <svg viewBox="0 0 600 150" className="mc-topo-svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <g className="mc-edges">
                {PIPE_EDGES.map(([a, b]) => (
                  <line
                    key={`${a}${b}`}
                    className="mc-edge mc-edge--pipe"
                    x1={NODE_POS[a][0]} y1={NODE_POS[a][1]}
                    x2={NODE_POS[b][0]} y2={NODE_POS[b][1]}
                  />
                ))}
                {STORE_EDGES.map(([a, b]) => (
                  <line
                    key={`${a}${b}`}
                    className="mc-edge"
                    x1={NODE_POS[a][0]} y1={NODE_POS[a][1]}
                    x2={NODE_POS[b][0]} y2={NODE_POS[b][1]}
                  />
                ))}
              </g>
              {Object.entries(NODE_POS).map(([id, [x, y]]) => (
                <g
                  key={id}
                  className={`mc-node ${activeNode === id ? 'is-hot' : ''} ${
                    INSPECTABLE.has(id) ? 'is-link' : ''
                  }`}
                >
                  {activeNode === id && <circle className="mc-node-ring" cx={x} cy={y} r="20" />}
                  <rect x={x - 34} y={y - 13} width="68" height="26" rx="7" />
                  <text x={x} y={y + 4}>{labels[id]}</text>
                </g>
              ))}
            </svg>

            {/* Hover targets (HTML, on top of the SVG for crisp pointer hit areas) */}
            <div className="mc-hit-layer">
              {Object.keys(NODE_POS).map((id) =>
                INSPECTABLE.has(id) ? (
                  <button
                    key={id}
                    type="button"
                    className="mc-hit"
                    style={pct(id)}
                    onMouseEnter={() => select(id)}
                    onFocus={() => select(id)}
                    onClick={() => select(id)}
                    aria-label={`Inspect ${labels[id]}`}
                  />
                ) : null
              )}
            </div>

            {/* Travelling packet */}
            {!reduced && activeNode && (
              <span className="mc-packet" style={pct(activeNode)} aria-hidden="true" />
            )}
          </div>

          {/* Lower zone: event log OR node inspector (morph) */}
          <div className="mc-lower">
            <AnimatePresence mode="wait" initial={false}>
              {inspectData ? (
                <motion.div
                  key={`inspect-${inspect}`}
                  className="mc-inspect"
                  initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                  animate={reduced ? false : { opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mc-inspect-title">{inspectData.title}</div>
                  <div className="mc-inspect-grid">
                    {inspectData.rows.map(([k, v]) => (
                      <div className="mc-inspect-row" key={k}>
                        <span className="mc-inspect-k">{k}</span>
                        <span className="mc-inspect-v">{v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="logview"
                  className="mc-logview"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={reduced ? false : { opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mc-log-head" aria-hidden="true">
                    <span className="mc-log-evt">{eventLabel}</span>
                  </div>
                  <div className="mc-log" aria-hidden="true">
                    {log.map((l) => (
                      <div key={l.id} className={`mc-log-line mc-log-line--${l.t}`}>
                        {l.text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Metrics + status */}
      <div className="mc-status" aria-hidden="true">
        <span className="mc-stat">
          <span className="mc-stat-k">latency</span>
          <span className="mc-stat-v">{metrics.latency}</span>
        </span>
        <span className="mc-stat">
          <span className="mc-stat-k">cache</span>
          <span className="mc-stat-v mc-stat-v--ok">{metrics.cache}</span>
        </span>
        <span className="mc-stat">
          <span className="mc-stat-k">queue</span>
          <span className="mc-stat-v">{metrics.queue}</span>
        </span>
        <span className="mc-stat mc-stat--grow mc-stat--ok">
          <span className="mc-status-dot" /> operational
        </span>
      </div>
        </>
      )}

      {/* Easter-egg overlay */}
      <AnimatePresence>
        {egg && (
          <motion.div
            className="mc-egg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mc-egg-body">
              <div className="mc-egg-line mc-egg-line--cmd">$ npm run hire-aniket</div>
              <div className="mc-egg-line mc-egg-line--ok">✓ compile · 0 errors</div>
              <div className="mc-egg-line mc-egg-line--ok">✓ deploy · production</div>
              <div className="mc-egg-line mc-egg-line--live">● let&apos;s build together</div>
              <a className="mc-egg-cta" href="#contact" data-open-contact>
                Start a conversation →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionControl;
