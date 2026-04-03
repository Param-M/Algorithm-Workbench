import React, { useState, useEffect, useRef, useCallback } from 'react'
import s from './Benchmark.module.css'

const SIZES = [50, 100, 200, 400, 800, 1500, 2500]
const ALGOS = [
  { id:'bubble',    label:'Bubble Sort',    color:'#f87171', theory:'O(n²)' },
  { id:'selection', label:'Selection Sort', color:'#fb923c', theory:'O(n²)' },
  { id:'insertion', label:'Insertion Sort', color:'#fbbf24', theory:'O(n²)' },
  { id:'quick',     label:'Quick Sort',     color:'#34d399', theory:'O(n log n)' },
  { id:'merge',     label:'Merge Sort',     color:'#8b7cf8', theory:'O(n log n)' },
]

export default function BenchmarkPanel({ engine }) {
  const [selected, setSelected] = useState(['bubble','quick','merge'])
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const canvasRef = useRef(null)

  const run = useCallback(async () => {
    setRunning(true); setResults([])
    const out = []
    for (const id of selected) {
      await new Promise(r => setTimeout(r, 8))
      out.push(engine.benchmark(id, SIZES))
      setResults([...out])
    }
    setRunning(false)
  }, [engine, selected])

  useEffect(() => {
    if (results.length) drawChart(canvasRef.current, results)
  }, [results])

  const toggle = id => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])

  return (
    <div className={s.panel}>
      <div className={s.top}>
        <div>
          <h2 className={s.title}>Performance Benchmark</h2>
          <p className={s.sub}>Measures actual JS execution time at n = {SIZES.join(', ')} and overlays the theoretical curve.</p>
        </div>
        <button className={s.runBtn} onClick={run} disabled={running||!selected.length}>
          {running ? '⟳ Running…' : '▶ Run'}
        </button>
      </div>

      <div className={s.chips}>
        {ALGOS.map(a => (
          <button key={a.id}
            className={`${s.chip} ${selected.includes(a.id)?s.chipOn:''}`}
            style={selected.includes(a.id)?{borderColor:a.color,color:a.color,background:a.color+'18'}:{}}
            onClick={()=>toggle(a.id)}>
            <span className={s.cdot} style={{background:selected.includes(a.id)?a.color:'var(--border-2)'}}/>
            {a.label}
            <span className={s.ctheory}>{a.theory}</span>
          </button>
        ))}
      </div>

      <div className={s.chartBox}>
        {!results.length && !running
          ? <div className={s.chartEmpty}>Select algorithms and press <strong>Run</strong> to benchmark</div>
          : running && !results.length
            ? <div className={s.chartEmpty}>Running…</div>
            : <canvas ref={canvasRef} className={s.canvas} width={820} height={360}/>
        }
      </div>

      {results.length > 0 && (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr>
              <th>Algorithm</th>
              {SIZES.map(sz=><th key={sz}>n={sz}</th>)}
              <th>Complexity</th>
            </tr></thead>
            <tbody>{results.map(r => {
              const meta = ALGOS.find(a=>a.id===r.algo)
              return <tr key={r.algo}>
                <td style={{color:meta?.color}}>{meta?.label}</td>
                {r.times.map((t,i)=><td key={i}>{t<1?'<1ms':`${t.toFixed(1)}ms`}</td>)}
                <td style={{color:meta?.color}}>{meta?.theory}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function drawChart(canvas, results) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W=canvas.width, H=canvas.height
  const pad={top:32,right:120,bottom:54,left:64}
  const cW=W-pad.left-pad.right, cH=H-pad.top-pad.bottom
  ctx.clearRect(0,0,W,H)
  ctx.fillStyle='#111318'; ctx.fillRect(0,0,W,H)
  const allTimes=results.flatMap(r=>r.times), maxT=Math.max(...allTimes,0.01)
  const xs=SIZES.map((_,i)=>pad.left+(i/(SIZES.length-1))*cW)
  const ys=v=>pad.top+cH-(v/maxT)*cH
  const COLORS={bubble:'#f87171',selection:'#fb923c',insertion:'#fbbf24',quick:'#34d399',merge:'#8b7cf8'}

  // Grid
  ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1
  for(let i=0;i<=5;i++){const y=pad.top+(i/5)*cH;ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+cW,y);ctx.stroke()}
  // Y labels
  ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.font='11px "IBM Plex Mono"'; ctx.textAlign='right'
  for(let i=0;i<=5;i++){const y=pad.top+(i/5)*cH; const v=maxT*(1-i/5); ctx.fillText(v<1?v.toFixed(2):v.toFixed(0),pad.left-8,y+4)}
  // X labels
  ctx.textAlign='center'; SIZES.forEach((sz,i)=>ctx.fillText(sz,xs[i],H-12))
  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=1
  ctx.beginPath();ctx.moveTo(pad.left,pad.top);ctx.lineTo(pad.left,pad.top+cH);ctx.stroke()
  ctx.beginPath();ctx.moveTo(pad.left,pad.top+cH);ctx.lineTo(pad.left+cW,pad.top+cH);ctx.stroke()
  // Axis titles
  ctx.save();ctx.translate(14,pad.top+cH/2);ctx.rotate(-Math.PI/2);ctx.fillStyle='rgba(255,255,255,0.28)';ctx.textAlign='center';ctx.fillText('Time (ms)',0,0);ctx.restore()
  ctx.fillStyle='rgba(255,255,255,0.28)';ctx.textAlign='center';ctx.fillText('n (array size)',pad.left+cW/2,H-30)

  results.forEach(r => {
    const color = COLORS[r.algo]||'#aaa'
    // Theory dashed
    ctx.strokeStyle=color+'44'; ctx.lineWidth=1.5; ctx.setLineDash([4,4])
    ctx.beginPath(); r.theory.forEach((t,i)=>{const x=xs[i],y=ys(t);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}); ctx.stroke()
    ctx.setLineDash([])
    // Measured solid
    ctx.strokeStyle=color; ctx.lineWidth=2
    ctx.beginPath(); r.times.forEach((t,i)=>{const x=xs[i],y=ys(t);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}); ctx.stroke()
    // Dots
    r.times.forEach((t,i)=>{ctx.beginPath();ctx.arc(xs[i],ys(t),3.5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()})
    // End label
    const lx=xs[SIZES.length-1]+8, ly=ys(r.times[r.times.length-1])
    ctx.fillStyle=color; ctx.font='11px "IBM Plex Mono"'; ctx.textAlign='left'; ctx.fillText(r.algo,lx,ly+4)
  })

  // Legend
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='11px "IBM Plex Mono"'; ctx.textAlign='left'
  ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=2; ctx.setLineDash([])
  ctx.beginPath();ctx.moveTo(pad.left+8,pad.top+12);ctx.lineTo(pad.left+28,pad.top+12);ctx.stroke()
  ctx.fillText('measured',pad.left+32,pad.top+16)
  ctx.setLineDash([4,4])
  ctx.beginPath();ctx.moveTo(pad.left+110,pad.top+12);ctx.lineTo(pad.left+130,pad.top+12);ctx.stroke()
  ctx.setLineDash([])
  ctx.fillText('theoretical',pad.left+134,pad.top+16)
}
