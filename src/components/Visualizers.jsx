// All visualizer components
import React, { useMemo } from 'react'
import s from './Visualizers.module.css'

const NODE_R = 20

// ── Sorting bar chart ─────────────────────────────────────────────────────────
export function SortingVis({ snap }) {
  if (!snap) return <Empty text="Configure input and press Play" />
  const { arr, hl = [], sorted = [], pivot = -1, sw = 0, cm = 0 } = snap
  const max = Math.max(...arr, 1)

  return (
    <div className={s.sortWrap}>
      <div className={s.statsRow}>
        <Stat label="Comparisons" value={cm} color="var(--amber)" />
        <Stat label="Swaps/Inserts" value={sw} color="var(--rose)" />
        <Stat label="Elements" value={arr.length} color="var(--violet)" />
      </div>
      <div className={s.chart}>
        {arr.map((v, i) => {
          const h = Math.max(6, Math.round((v / max) * 200))
          let cls = s.barDefault
          if (pivot === i) cls = s.barPivot
          else if (sorted[i]) cls = s.barSorted
          else if (hl.includes(i)) cls = s.barCompare
          return (
            <div key={i} className={s.barWrap}>
              <div className={`${s.bar} ${cls}`} style={{ height: h }} />
              {arr.length <= 16 && <div className={s.barLbl}>{v}</div>}
            </div>
          )
        })}
      </div>
      <div className={s.legend}>
        {[['var(--amber)','Comparing'],['var(--rose)','Pivot'],['var(--emerald)','Sorted'],['var(--violet)','Unsorted']].map(([c,l])=>(
          <div key={l} className={s.legendItem}><span className={s.ldot} style={{background:c}}/>{l}</div>
        ))}
      </div>
    </div>
  )
}

// ── Merge sort ────────────────────────────────────────────────────────────────
export function MergeVis({ snap }) {
  if (!snap) return <Empty text="Configure input and press Play" />
  const { arr = [], lo = 0, hi = 0, mid = -1, phase = 'init', placed = -1, depth = 0 } = snap
  const PHASE_COLOR = { init:'var(--text-2)', split:'var(--amber)', merging:'var(--violet)', placing:'var(--sky)', merged:'var(--emerald)', done:'var(--emerald)' }

  return (
    <div className={s.mergeWrap}>
      <div className={s.phaseBadge} style={{ color: PHASE_COLOR[phase], borderColor: PHASE_COLOR[phase]+'40' }}>
        {phase.toUpperCase()}
        <span className={s.depthTag}>depth {depth}</span>
      </div>

      <div className={s.arrayRow}>
        {arr.map((v, i) => {
          let cs = s.mcDefault
          if (phase === 'done') cs = s.mcDone
          else if (phase === 'merged' && i >= lo && i <= hi) cs = s.mcMerged
          else if (phase === 'placing' && i === placed) cs = s.mcPlacing
          else if (phase === 'placing' && i >= lo && i < placed) cs = s.mcPlaced
          else if ((phase === 'merging' || phase === 'placing') && i >= lo && i <= hi) cs = s.mcActive
          else if (phase === 'split' && i >= lo && i <= hi) cs = s.mcSplit
          return <div key={i} className={`${s.mc} ${cs}`}>{v}</div>
        })}
      </div>

      {phase !== 'init' && phase !== 'done' && (
        <div className={s.segmentRow}>
          <div className={s.segment}>
            <div className={s.segLabel}>Left [{lo}..{mid}]</div>
            <div className={s.segCells}>{arr.slice(lo, mid+1).map((v,i)=><span key={i} className={s.segCell}>{v}</span>)}</div>
          </div>
          <div className={s.segOp}>{phase==='split'?'÷':'⊕'}</div>
          <div className={s.segment}>
            <div className={s.segLabel}>Right [{mid+1}..{hi}]</div>
            <div className={s.segCells}>{arr.slice(mid+1, hi+1).map((v,i)=><span key={i} className={s.segCell}>{v}</span>)}</div>
          </div>
        </div>
      )}

      <div className={s.depthRow}>
        {Array.from({length: Math.ceil(Math.log2(arr.length+1))+1}).map((_,i)=>(
          <div key={i} className={`${s.depthDot} ${i===depth?s.depthActive:i<depth?s.depthPast:''}`}/>
        ))}
      </div>
    </div>
  )
}

// ── DP Table ──────────────────────────────────────────────────────────────────
export function DPVis({ snap, algoId }) {
  if (!snap) return <Empty text="Configure input and press Play" />
  if (algoId === 'lcs') return <LCSTable snap={snap} />
  if (algoId === 'knapsack') return <KnapsackTable snap={snap} />
  return null
}

function LCSTable({ snap }) {
  const { dp, active, path = [], s1 = '', s2 = '' } = snap
  const pathSet = new Set((path||[]).map(([r,c])=>`${r},${c}`))
  return (
    <div className={s.dpWrap}>
      <div className={s.dpStrings}>
        <span className={s.dpTag} style={{background:'rgba(251,113,133,0.12)',color:'var(--rose)'}}>S1</span>
        <span className={s.dpStrVal}>"{s1}"</span>
        <span className={s.dpVs}>vs</span>
        <span className={s.dpTag} style={{background:'var(--sky-dim)',color:'var(--sky)'}}>S2</span>
        <span className={s.dpStrVal}>"{s2}"</span>
      </div>
      <div className={s.tableScroll}>
        <table className={s.dpTable}>
          <thead>
            <tr>
              <th className={s.dph}></th>
              <th className={s.dph}>ε</th>
              {s2.split('').map((c,j)=><th key={j} className={s.dph} style={{color:'var(--sky)'}}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {dp&&dp.map((row,i)=>(
              <tr key={i}>
                <td className={s.dpRowH} style={{color:i===0?'var(--text-2)':'var(--rose)'}}>{i===0?'ε':s1[i-1]}</td>
                {row.map((v,j)=>{
                  const isActive=active&&active[0]===i&&active[1]===j
                  const isPath=pathSet.has(`${i},${j}`)
                  return <td key={j} className={`${s.dptd} ${isActive?s.tdActive:isPath?s.tdPath:v>0?s.tdFilled:''}`}>{v>0?v:''}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KnapsackTable({ snap }) {
  const { dp, active, weights=[], values=[], capacity=8, item=-1 } = snap
  return (
    <div className={s.dpWrap}>
      <div className={s.kpItems}>
        {weights.map((w,i)=>(
          <div key={i} className={`${s.kpItem} ${item===i?s.kpItemActive:''}`}>
            <span className={s.kpItemLabel}>Item {i+1}</span>
            <span className={s.kpItemDetail}>w={w} v={values[i]}</span>
          </div>
        ))}
        <div className={s.kpCap}>W={capacity}</div>
      </div>
      <div className={s.tableScroll}>
        <table className={s.dpTable}>
          <thead>
            <tr>
              <th className={s.dph}>Item</th>
              {dp&&dp[0]&&dp[0].map((_,w)=><th key={w} className={s.dph} style={{fontSize:10}}>w={w}</th>)}
            </tr>
          </thead>
          <tbody>
            {dp&&dp.map((row,i)=>(
              <tr key={i}>
                <td className={s.dpRowH}>{i===0?'∅':`I${i}`}</td>
                {row.map((v,w)=>{
                  const isActive=active&&active[0]===i&&active[1]===w
                  return <td key={w} className={`${s.dptd} ${isActive?s.tdActive:v>0?s.tdFilled:''}`}>{v>0?v:''}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Graph ─────────────────────────────────────────────────────────────────────
export function GraphVis({ snap, algoId, graphData }) {
  if (!snap) return <Empty text="Configure graph and press Play" />
  const { nodes, edges } = graphData
  const isDijkstra = algoId === 'dijkstra'
  const visitedSet = new Set(snap.visited||[])
  const queuedSet = new Set([...(snap.queue||[]), ...(snap.stack||[])])
  const cur = snap.current ?? -1
  const efrom = snap.edgeFrom ?? -1
  const eto = snap.edgeTo ?? -1
  const dist = snap.dist || []

  const VW = 560, VH = 210
  const scaledNodes = useMemo(() => {
    if (!nodes.length) return []
    const xs = nodes.map(n=>n.x), ys = nodes.map(n=>n.y)
    const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys)
    const pad = 44, rangeX = maxX-minX||1, rangeY = maxY-minY||1
    return nodes.map(n => ({
      ...n,
      sx: pad + ((n.x-minX)/rangeX)*(VW-pad*2),
      sy: pad + ((n.y-minY)/rangeY)*(VH-pad*2),
    }))
  }, [nodes])

  const nodeMap = useMemo(()=>{const m={};scaledNodes.forEach(n=>{m[n.id]=n});return m},[scaledNodes])

  function nodeState(id) {
    if (id===cur) return 'current'
    if (visitedSet.has(id)) return 'visited'
    if (queuedSet.has(id)) return 'queued'
    return 'default'
  }

  return (
    <div className={s.graphWrap}>
      <svg viewBox={`0 0 ${VW} ${VH}`} className={s.graphSvg}>
        <defs>
          <marker id="aw-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>
        {edges.map((e, i) => {
          const fn=nodeMap[e.from], tn=nodeMap[e.to]; if(!fn||!tn) return null
          const isActive=(e.from===efrom&&e.to===eto)||(e.from===eto&&e.to===efrom)
          const isTraveled=visitedSet.has(e.from)&&visitedSet.has(e.to)
          const color=isActive?'var(--amber)':isTraveled?'rgba(139,124,248,0.45)':'rgba(255,255,255,0.07)'
          const dx=tn.sx-fn.sx, dy=tn.sy-fn.sy, len=Math.sqrt(dx*dx+dy*dy)
          const nx=dx/len, ny=dy/len
          const x1=fn.sx+nx*NODE_R, y1=fn.sy+ny*NODE_R
          const x2=tn.sx-nx*(NODE_R+4), y2=tn.sy-ny*(NODE_R+4)
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={isActive?2.5:1.5} markerEnd={isDijkstra?'url(#aw-arr)':undefined}/>
              {isDijkstra&&e.weight!=null&&<text x={(fn.sx+tn.sx)/2+5} y={(fn.sy+tn.sy)/2-5} fill="var(--text-2)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">{e.weight}</text>}
            </g>
          )
        })}
        {scaledNodes.map(n => {
          const st = nodeState(n.id)
          const fill={current:'rgba(251,191,36,0.2)',visited:'rgba(139,124,248,0.2)',queued:'rgba(56,189,248,0.15)',default:'rgba(255,255,255,0.03)'}[st]
          const stroke={current:'var(--amber)',visited:'var(--violet)',queued:'var(--sky)',default:'rgba(255,255,255,0.10)'}[st]
          const sw={current:2.5,visited:2,queued:2,default:1}[st]
          const textColor={current:'var(--amber)',visited:'var(--text-0)',queued:'var(--sky)',default:'var(--text-1)'}[st]
          return (
            <g key={n.id}>
              <circle cx={n.sx} cy={n.sy} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={sw}/>
              <text x={n.sx} y={n.sy} textAnchor="middle" dominantBaseline="central" fill={textColor} fontSize="13" fontFamily="var(--font-mono)" fontWeight={st==='current'?'600':'400'}>{n.label||n.id}</text>
              {isDijkstra&&dist[n.id]!==undefined&&<text x={n.sx} y={n.sy+NODE_R+13} textAnchor="middle" fill={dist[n.id]===-1?'var(--text-3)':'var(--emerald)'} fontSize="11" fontFamily="var(--font-mono)">{dist[n.id]===-1?'∞':dist[n.id]}</text>}
            </g>
          )
        })}
      </svg>

      <div className={s.graphInfo}>
        <div className={s.gInfoBlock}>
          <span className={s.gInfoLabel}>Visited</span>
          <div className={s.gInfoTags}>
            {(snap.visited||[]).map((id,i)=><span key={i} className={s.visitedTag}>{nodes[id]?.label||id}</span>)}
            {!(snap.visited||[]).length && <span className={s.gInfoEmpty}>—</span>}
          </div>
        </div>
        {(snap.queue||snap.stack||[]).length>0&&(
          <div className={s.gInfoBlock}>
            <span className={s.gInfoLabel}>{algoId==='bfs'?'Queue':'Stack'}</span>
            <div className={s.gInfoTags}>
              {(algoId==='bfs'?snap.queue:snap.stack||[]).map((id,i)=><span key={i} className={s.queueTag}>{nodes[id]?.label||id}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Empty({ text }) {
  return <div className={s.empty}>{text}</div>
}

function Stat({ label, value, color }) {
  return (
    <div className={s.stat}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statVal} style={{ color }}>{value}</div>
    </div>
  )
}
