import React, { useState, useCallback } from 'react'
import s from './InputPanel.module.css'

// ── Array input (sorting / merge sort) ──────────────────────────────────────
export function ArrayInput({ value, onChange }) {
  const [raw, setRaw] = useState(value.join(', '))
  const [error, setError] = useState('')

  function handleChange(e) {
    const txt = e.target.value
    setRaw(txt)
    const nums = txt.split(/[\s,]+/).filter(Boolean).map(Number)
    if (nums.some(isNaN) || nums.length === 0) { setError('Enter numbers separated by commas'); return }
    if (nums.length > 20) { setError('Max 20 elements'); return }
    if (nums.length < 2) { setError('Min 2 elements'); return }
    setError('')
    onChange(nums)
  }

  function shuffle() {
    const n = value.length
    const a = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 5)
    setRaw(a.join(', ')); setError(''); onChange(a)
  }

  function addPreset(preset) {
    setRaw(preset.join(', ')); setError(''); onChange(preset)
  }

  const PRESETS = {
    'Random 8':  Array.from({length:8},()=>Math.floor(Math.random()*90)+5),
    'Random 12': Array.from({length:12},()=>Math.floor(Math.random()*90)+5),
    'Nearly sorted': [1,2,4,3,5,7,6,8,9,10],
    'Reverse': [10,9,8,7,6,5,4,3,2,1],
    'All equal': [5,5,5,5,5,5,5,5],
    'Two values': [1,2,2,1,2,1,1,2,2,1],
  }

  return (
    <div className={s.section}>
      <div className={s.sectionHead}>
        <span className={s.sectionTitle}>Array</span>
        <span className={s.hint}>Numbers separated by commas · 2–20 elements</span>
      </div>

      <div className={s.arrayInput}>
        <input
          className={`${s.textInput} ${error ? s.inputError : ''}`}
          value={raw}
          onChange={handleChange}
          placeholder="e.g. 38, 27, 43, 3, 9, 82, 10"
          spellCheck={false}
        />
        <button className={s.iconBtn} onClick={shuffle} title="Randomize">
          <ShuffleIcon />
        </button>
      </div>

      {error && <div className={s.error}>{error}</div>}

      {/* Visual preview */}
      {!error && value.length > 0 && (
        <div className={s.barPreview}>
          {value.map((v, i) => (
            <div key={i} className={s.barPreviewItem}>
              <div
                className={s.barPreviewBar}
                style={{ height: `${Math.max(8, (v / Math.max(...value)) * 44)}px` }}
              />
              <div className={s.barPreviewVal}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Presets */}
      <div className={s.presets}>
        <span className={s.presetsLabel}>Presets</span>
        {Object.entries(PRESETS).map(([label, arr]) => (
          <button key={label} className={s.presetBtn} onClick={() => addPreset(arr)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── LCS string input ──────────────────────────────────────────────────────────
export function StringsInput({ value, onChange }) {
  const [s1, setS1] = useState(value.s1)
  const [s2, setS2] = useState(value.s2)
  const [err1, setErr1] = useState('')
  const [err2, setErr2] = useState('')

  function validateAndEmit(newS1, newS2) {
    const v1 = /^[A-Z]{1,12}$/i.test(newS1) || newS1 === ''
    const v2 = /^[A-Z]{1,12}$/i.test(newS2) || newS2 === ''
    setErr1(!v1 ? 'Letters only, max 12 chars' : '')
    setErr2(!v2 ? 'Letters only, max 12 chars' : '')
    if (v1 && v2 && newS1 && newS2) onChange({ s1: newS1.toUpperCase(), s2: newS2.toUpperCase() })
  }

  const PRESETS = [
    { s1: 'ABCBDAB', s2: 'BDCAB' },
    { s1: 'AGGTAB', s2: 'GXTXAYB' },
    { s1: 'ABCDE', s2: 'ACE' },
    { s1: 'HELLO', s2: 'HALLO' },
    { s1: 'DYNAMIC', s2: 'DYNAMITE' },
  ]

  return (
    <div className={s.section}>
      <div className={s.sectionHead}>
        <span className={s.sectionTitle}>Strings for LCS</span>
        <span className={s.hint}>Letters only · max 12 characters each</span>
      </div>

      <div className={s.twoInputs}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>String S1</label>
          <input
            className={`${s.textInput} ${s.monoInput} ${err1 ? s.inputError : ''}`}
            value={s1}
            maxLength={12}
            onChange={e => { const v = e.target.value.toUpperCase(); setS1(v); validateAndEmit(v, s2) }}
            placeholder="ABCBDAB"
            spellCheck={false}
          />
          {err1 && <div className={s.error}>{err1}</div>}
        </div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>String S2</label>
          <input
            className={`${s.textInput} ${s.monoInput} ${err2 ? s.inputError : ''}`}
            value={s2}
            maxLength={12}
            onChange={e => { const v = e.target.value.toUpperCase(); setS2(v); validateAndEmit(s1, v) }}
            placeholder="BDCAB"
            spellCheck={false}
          />
          {err2 && <div className={s.error}>{err2}</div>}
        </div>
      </div>

      {/* Character alignment preview */}
      {s1 && s2 && !err1 && !err2 && (
        <div className={s.charPreview}>
          <div className={s.charRow}>
            <span className={s.charLabel}>S1</span>
            {s1.split('').map((c, i) => <span key={i} className={s.charCell}>{c}</span>)}
          </div>
          <div className={s.charRow}>
            <span className={s.charLabel}>S2</span>
            {s2.split('').map((c, i) => <span key={i} className={`${s.charCell} ${s1.includes(c) ? s.charMatch : ''}`}>{c}</span>)}
          </div>
        </div>
      )}

      <div className={s.presets}>
        <span className={s.presetsLabel}>Presets</span>
        {PRESETS.map((p, i) => (
          <button key={i} className={s.presetBtn} onClick={() => { setS1(p.s1); setS2(p.s2); validateAndEmit(p.s1, p.s2) }}>
            {p.s1}/{p.s2}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Knapsack input ────────────────────────────────────────────────────────────
export function KnapsackInput({ value, onChange }) {
  const [items, setItems] = useState(value.items)
  const [capacity, setCapacity] = useState(value.capacity)
  const [capErr, setCapErr] = useState('')

  function emitChange(newItems, newCap) {
    onChange({
      items: newItems,
      capacity: newCap,
      weights: newItems.map(it => it.weight),
      values: newItems.map(it => it.value),
    })
  }

  function updateItem(idx, field, val) {
    const n = parseInt(val)
    if (isNaN(n) || n < 1 || n > 99) return
    const newItems = items.map((it, i) => i === idx ? { ...it, [field]: n } : it)
    setItems(newItems); emitChange(newItems, capacity)
  }

  function addItem() {
    if (items.length >= 8) return
    const newItems = [...items, { weight: 1, value: 1 }]
    setItems(newItems); emitChange(newItems, capacity)
  }

  function removeItem(idx) {
    if (items.length <= 1) return
    const newItems = items.filter((_, i) => i !== idx)
    setItems(newItems); emitChange(newItems, capacity)
  }

  function updateCap(v) {
    const n = parseInt(v)
    if (isNaN(n) || n < 1) { setCapErr('Min 1'); return }
    if (n > 30) { setCapErr('Max 30'); return }
    setCapErr(''); setCapacity(n); emitChange(items, n)
  }

  const PRESETS = [
    { label: 'Classic 4', items: [{weight:2,value:3},{weight:3,value:4},{weight:4,value:5},{weight:5,value:6}], capacity: 8 },
    { label: 'Tight fit', items: [{weight:1,value:2},{weight:2,value:5},{weight:3,value:7},{weight:5,value:10}], capacity: 6 },
    { label: '6 items', items: [{weight:1,value:1},{weight:2,value:6},{weight:3,value:10},{weight:4,value:16},{weight:5,value:17},{weight:6,value:13}], capacity: 10 },
  ]

  return (
    <div className={s.section}>
      <div className={s.sectionHead}>
        <span className={s.sectionTitle}>Knapsack</span>
        <span className={s.hint}>Up to 8 items · weight &amp; value 1–99</span>
      </div>

      <div className={s.capacityRow}>
        <label className={s.inputLabel}>Capacity (W)</label>
        <input
          type="number" min={1} max={30}
          className={`${s.numInput} ${capErr ? s.inputError : ''}`}
          value={capacity}
          onChange={e => updateCap(e.target.value)}
        />
        {capErr && <span className={s.error}>{capErr}</span>}
      </div>

      <div className={s.itemsTable}>
        <div className={s.itemsHeader}>
          <span>#</span><span>Weight</span><span>Value</span><span>W/V ratio</span><span></span>
        </div>
        {items.map((item, i) => (
          <div key={i} className={s.itemRow}>
            <span className={s.itemIdx}>{i + 1}</span>
            <input
              type="number" min={1} max={99}
              className={s.numInput}
              value={item.weight}
              onChange={e => updateItem(i, 'weight', e.target.value)}
            />
            <input
              type="number" min={1} max={99}
              className={s.numInput}
              value={item.value}
              onChange={e => updateItem(i, 'value', e.target.value)}
            />
            <span className={s.ratio}>{(item.value / item.weight).toFixed(2)}</span>
            <button className={s.removeBtn} onClick={() => removeItem(i)} disabled={items.length <= 1}>×</button>
          </div>
        ))}
      </div>

      <div className={s.itemActions}>
        <button className={s.addBtn} onClick={addItem} disabled={items.length >= 8}>
          + Add item
        </button>
        <span className={s.hint}>{items.length}/8 items</span>
      </div>

      <div className={s.presets}>
        <span className={s.presetsLabel}>Presets</span>
        {PRESETS.map((p, i) => (
          <button key={i} className={s.presetBtn} onClick={() => {
            setItems(p.items); setCapacity(p.capacity); setCapErr('')
            onChange({ items: p.items, capacity: p.capacity, weights: p.items.map(it=>it.weight), values: p.items.map(it=>it.value) })
          }}>{p.label}</button>
        ))}
      </div>
    </div>
  )
}

// ── Graph input (BFS / DFS) ───────────────────────────────────────────────────
export function GraphInput({ value, onChange, weighted = false }) {
  const [nodeCount, setNodeCount] = useState(value.nodes.length)
  const [edges, setEdges] = useState(value.edges)
  const [start, setStart] = useState(value.start)
  const [edgeFrom, setEdgeFrom] = useState('')
  const [edgeTo, setEdgeTo] = useState('')
  const [edgeW, setEdgeW] = useState('1')
  const [edgeErr, setEdgeErr] = useState('')

  function buildAdj(nodeN, edgeList) {
    const adj = {}
    for (let i = 0; i < nodeN; i++) adj[i] = weighted ? [] : []
    for (const e of edgeList) {
      if (weighted) {
        adj[e.from] = [...(adj[e.from]||[]), { to: e.to, weight: e.weight }]
        adj[e.to] = [...(adj[e.to]||[]), { to: e.from, weight: e.weight }]
      } else {
        adj[e.from] = [...(adj[e.from]||[]), e.to]
        adj[e.to] = [...(adj[e.to]||[]), e.from]
      }
    }
    return adj
  }

  function layoutNodes(n) {
    if (n <= 1) return [{ id: 0, x: 250, y: 100 }]
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2
      return { id: i, x: Math.round(250 + 160 * Math.cos(angle)), y: Math.round(105 + 80 * Math.sin(angle)) }
    })
  }

  function changeNodeCount(n) {
    const count = Math.min(10, Math.max(2, parseInt(n) || 2))
    setNodeCount(count)
    const filteredEdges = edges.filter(e => e.from < count && e.to < count)
    setEdges(filteredEdges)
    const newStart = Math.min(start, count - 1)
    setStart(newStart)
    const nodes = layoutNodes(count)
    onChange({ nodes, edges: filteredEdges, adj: buildAdj(count, filteredEdges), start: newStart })
  }

  function addEdge() {
    const f = parseInt(edgeFrom), t = parseInt(edgeTo), w = parseInt(edgeW) || 1
    if (isNaN(f)||isNaN(t)) { setEdgeErr('Enter valid node IDs'); return }
    if (f<0||f>=nodeCount||t<0||t>=nodeCount) { setEdgeErr(`Node IDs must be 0–${nodeCount-1}`); return }
    if (f===t) { setEdgeErr('No self-loops'); return }
    const exists = edges.some(e => (e.from===f&&e.to===t)||(e.from===t&&e.to===f))
    if (exists) { setEdgeErr('Edge already exists'); return }
    if (edges.length >= 20) { setEdgeErr('Max 20 edges'); return }
    setEdgeErr('')
    const newEdges = [...edges, weighted ? { from:f, to:t, weight:w } : { from:f, to:t }]
    setEdges(newEdges)
    const nodes = layoutNodes(nodeCount)
    onChange({ nodes, edges: newEdges, adj: buildAdj(nodeCount, newEdges), start })
    setEdgeFrom(''); setEdgeTo(''); setEdgeW('1')
  }

  function removeEdge(i) {
    const newEdges = edges.filter((_, idx) => idx !== i)
    setEdges(newEdges)
    const nodes = layoutNodes(nodeCount)
    onChange({ nodes, edges: newEdges, adj: buildAdj(nodeCount, newEdges), start })
  }

  function changeStart(n) {
    setStart(n)
    const nodes = layoutNodes(nodeCount)
    onChange({ nodes, edges, adj: buildAdj(nodeCount, edges), start: n })
  }

  const PRESETS = weighted ? [
    { label: '6-node weighted', nodes: [{id:0,x:60,y:100},{id:1,x:200,y:30},{id:2,x:200,y:170},{id:3,x:350,y:30},{id:4,x:350,y:170},{id:5,x:480,y:100}], edges: [{from:0,to:1,weight:4},{from:0,to:2,weight:2},{from:1,to:2,weight:5},{from:1,to:3,weight:10},{from:1,to:4,weight:3},{from:2,to:4,weight:6},{from:3,to:5,weight:2},{from:4,to:3,weight:1},{from:4,to:5,weight:7}], start: 0 },
    { label: 'Simple 4', nodes: [{id:0,x:100,y:100},{id:1,x:250,y:30},{id:2,x:250,y:170},{id:3,x:400,y:100}], edges: [{from:0,to:1,weight:1},{from:0,to:2,weight:4},{from:1,to:3,weight:2},{from:2,to:3,weight:3}], start: 0 },
  ] : [
    { label: '8-node tree', nodes:[{id:0,x:70,y:80},{id:1,x:200,y:25},{id:2,x:200,y:135},{id:3,x:330,y:15},{id:4,x:330,y:85},{id:5,x:330,y:155},{id:6,x:460,y:55},{id:7,x:460,y:145}], edges:[{from:0,to:1},{from:0,to:2},{from:1,to:3},{from:1,to:4},{from:2,to:4},{from:2,to:5},{from:3,to:6},{from:4,to:6},{from:4,to:7},{from:5,to:7}], start:0 },
    { label: 'Cycle 5', nodes: Array.from({length:5},(_,i)=>({id:i,x:Math.round(250+140*Math.cos(i*2*Math.PI/5-Math.PI/2)),y:Math.round(100+80*Math.sin(i*2*Math.PI/5-Math.PI/2))})), edges:[{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:0},{from:0,to:2}], start:0 },
    { label: 'Star 6', nodes:[{id:0,x:250,y:100},...Array.from({length:5},(_,i)=>({id:i+1,x:Math.round(250+160*Math.cos(i*2*Math.PI/5)),y:Math.round(100+80*Math.sin(i*2*Math.PI/5))}))], edges:Array.from({length:5},(_,i)=>({from:0,to:i+1})), start:0 },
  ]

  return (
    <div className={s.section}>
      <div className={s.sectionHead}>
        <span className={s.sectionTitle}>{weighted ? 'Weighted Graph' : 'Graph'}</span>
        <span className={s.hint}>2–10 nodes · up to 20 edges</span>
      </div>

      <div className={s.graphControls}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Nodes</label>
          <input type="number" min={2} max={10} className={s.numInput} value={nodeCount}
            onChange={e => changeNodeCount(e.target.value)} />
        </div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Start node</label>
          <select className={s.selectInput} value={start} onChange={e => changeStart(parseInt(e.target.value))}>
            {Array.from({length:nodeCount},(_,i)=><option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      {/* Add edge form */}
      <div className={s.edgeForm}>
        <span className={s.inputLabel}>Add edge</span>
        <div className={s.edgeFormRow}>
          <input type="number" min={0} max={nodeCount-1} className={s.numInput} value={edgeFrom}
            onChange={e => setEdgeFrom(e.target.value)} placeholder="From" />
          <span className={s.edgeArrow}>{weighted ? '↔' : '—'}</span>
          <input type="number" min={0} max={nodeCount-1} className={s.numInput} value={edgeTo}
            onChange={e => setEdgeTo(e.target.value)} placeholder="To" />
          {weighted && (
            <>
              <span className={s.inputLabel}>w=</span>
              <input type="number" min={1} max={99} className={s.numInput} value={edgeW}
                onChange={e => setEdgeW(e.target.value)} style={{width:48}} />
            </>
          )}
          <button className={s.addBtn} onClick={addEdge}>Add</button>
        </div>
        {edgeErr && <div className={s.error}>{edgeErr}</div>}
      </div>

      {/* Edge list */}
      {edges.length > 0 && (
        <div className={s.edgeList}>
          {edges.map((e, i) => (
            <div key={i} className={s.edgeTag}>
              <span>{e.from}—{e.to}{weighted ? ` (w=${e.weight})` : ''}</span>
              <button className={s.removeEdgeBtn} onClick={() => removeEdge(i)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className={s.presets}>
        <span className={s.presetsLabel}>Presets</span>
        {PRESETS.map((p, i) => (
          <button key={i} className={s.presetBtn} onClick={() => {
            const nc = p.nodes.length
            setNodeCount(nc); setEdges(p.edges); setStart(p.start); setEdgeErr('')
            onChange({ nodes: p.nodes, edges: p.edges, adj: buildAdj(nc, p.edges), start: p.start })
          }}>{p.label}</button>
        ))}
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function ShuffleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  )
}
