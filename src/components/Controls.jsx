// PlaybackBar
import React from 'react'
import s from './Controls.module.css'

export function PlaybackBar({ pb, total }) {
  const { step, playing, speed, atStart, atEnd, togglePlay, stepFwd, stepBck, reset, jumpTo, changeSpeed } = pb
  const pct = total > 1 ? Math.round((step / (total-1)) * 100) : 0
  const spd = Math.round((850 - speed) / 80)

  return (
    <div className={s.bar}>
      <div className={s.scrubWrap}>
        <input type="range" className={s.scrubber} min={0} max={Math.max(total-1,0)} value={step}
          onChange={e => jumpTo(parseInt(e.target.value))} style={{'--p':`${pct}%`}} />
      </div>
      <div className={s.controls}>
        <div className={s.transport}>
          <button className={s.tbtn} onClick={reset} disabled={atStart} title="Reset to start">
            <svg width="13" height="13" viewBox="0 0 14 14"><rect x="2" y="2" width="2" height="10" rx="1" fill="currentColor"/><path d="M5 7L12 2v10z" fill="currentColor"/></svg>
          </button>
          <button className={s.tbtn} onClick={stepBck} disabled={atStart} title="Step back">
            <svg width="13" height="13" viewBox="0 0 14 14"><path d="M9 3L3 7l6 4z" fill="currentColor"/></svg>
          </button>
          <button className={`${s.tbtn} ${s.playBtn}`} onClick={togglePlay}>
            {playing
              ? <svg width="13" height="13" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor"/><rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor"/></svg>
              : <svg width="13" height="13" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5z" fill="currentColor"/></svg>
            }
          </button>
          <button className={s.tbtn} onClick={stepFwd} disabled={atEnd} title="Step forward">
            <svg width="13" height="13" viewBox="0 0 14 14"><path d="M5 3l6 4-6 4z" fill="currentColor"/></svg>
          </button>
          <button className={s.tbtn} onClick={() => jumpTo(total-1)} disabled={atEnd} title="Jump to end">
            <svg width="13" height="13" viewBox="0 0 14 14"><rect x="10" y="2" width="2" height="10" rx="1" fill="currentColor"/><path d="M9 7L2 2v10z" fill="currentColor"/></svg>
          </button>
        </div>
        <div className={s.counter}>
          <span className={s.stepNum}>{step+1}</span>
          <span className={s.stepSep}>/</span>
          <span className={s.stepTot}>{total}</span>
        </div>
        <div className={s.speedWrap}>
          <span className={s.speedLbl}>Speed</span>
          <input type="range" className={s.speedSlider} min={1} max={10} value={spd}
            onChange={e => changeSpeed(Math.round(850 - parseInt(e.target.value)*80))} />
          <span className={s.speedVal}>{spd}×</span>
        </div>
      </div>
    </div>
  )
}

export function InfoBar({ algoMeta, msg }) {
  if (!algoMeta) return null
  return (
    <div className={s.infoBar}>
      <div className={s.chips}>
        <Chip label="Time"   val={algoMeta.cplx}  color="var(--amber)" />
        <Chip label="Space"  val={algoMeta.space}  color="var(--sky)" />
        {algoMeta.stable !== null && (
          <Chip label="Stable" val={algoMeta.stable ? 'Yes' : 'No'} color={algoMeta.stable ? 'var(--emerald)' : 'var(--rose)'} />
        )}
      </div>
      {msg && (
        <div className={s.msgBox}>
          <span className={s.msgArrow}>›</span>
          <span className={s.msgText}>{msg}</span>
        </div>
      )}
    </div>
  )
}

function Chip({ label, val, color }) {
  return (
    <div className={s.chip}>
      <span className={s.chipLbl}>{label}</span>
      <span className={s.chipVal} style={{ color }}>{val}</span>
    </div>
  )
}

export function Sidebar({ units, activeAlgo, onSelect }) {
  return (
    <aside className={s.sidebar}>
      {units.map(unit => (
        <div key={unit.id} className={s.unitGroup}>
          <div className={s.unitLbl}>{unit.short}</div>
          {unit.algos.map(a => (
            <button
              key={a.id}
              className={`${s.algoBtn} ${activeAlgo === a.id ? s.algoActive : ''}`}
              onClick={() => onSelect(a.id, unit.id)}
            >
              <span className={s.algoDot} />
              <span className={s.algoName}>{a.label}</span>
              <span className={s.algoCplx}>{a.cplx.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}

export function Header({ wasmStatus, view, onViewChange }) {
  const st = {
    loading:  { text: 'Loading…',    color: 'var(--amber)' },
    ready:    { text: 'Go Wasm ✓',   color: 'var(--emerald)' },
    fallback: { text: 'JS Engine',   color: 'var(--sky)' },
    error:    { text: 'Error',       color: 'var(--rose)' },
  }[wasmStatus] || { text: '…', color: 'var(--text-2)' }

  return (
    <header className={s.header}>
      <div className={s.headerLeft}>
        <span className={s.logoMark}>AW</span>
        <span className={s.logoText}>Algorithm <em>Workbench</em></span>
        <div className={s.engineTag} style={{ color: st.color }}>
          <span className={s.engineDot} style={{ background: st.color }} />
          {st.text}
        </div>
      </div>
      <nav className={s.nav}>
        <button className={`${s.navBtn} ${view==='visualizer'?s.navActive:''}`} onClick={()=>onViewChange('visualizer')}>Visualizer</button>
        <button className={`${s.navBtn} ${view==='benchmark'?s.navActive:''}`} onClick={()=>onViewChange('benchmark')}>Benchmark</button>
      </nav>
      <div className={s.headerRight}>
        <span className={s.v2tag}>v2.0 — user-defined data</span>
      </div>
    </header>
  )
}
