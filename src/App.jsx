import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { jsEngine } from './utils/jsEngine.js'
import { UNITS, randArray, DEFAULT_ARRAY, DEFAULT_GRAPH, DEFAULT_WGRAPH, DEFAULT_LCS, DEFAULT_KNAPSACK } from './utils/algorithms.js'
import { usePlayback } from './hooks/usePlayback.js'
import { Header, Sidebar, PlaybackBar, InfoBar } from './components/Controls.jsx'
import { ArrayInput, StringsInput, KnapsackInput, GraphInput } from './components/InputPanel.jsx'
import { SortingVis, MergeVis, DPVis, GraphVis } from './components/Visualizers.jsx'
import BenchmarkPanel from './components/BenchmarkPanel.jsx'
import styles from './styles/App.module.css'

// Wasm loader — falls back to JS engine silently
function useEngine() {
  const [engine, setEngine] = useState(jsEngine)
  const [status, setStatus] = useState('fallback')
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/engine.wasm', { method: 'HEAD' })
        if (!res.ok) throw new Error('no wasm')
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = '/wasm_exec.js'
          s.onload = resolve; s.onerror = reject
          document.head.appendChild(s)
        })
        const go = new window.Go()
        const result = await WebAssembly.instantiateStreaming(fetch('/engine.wasm'), go.importObject)
        go.run(result.instance)
        await new Promise((res, rej) => {
          const t = setInterval(() => { if (window.goWasmReady) { clearInterval(t); res() } }, 50)
          setTimeout(() => { clearInterval(t); rej() }, 4000)
        })
        const parse = j => JSON.parse(j)
        setEngine({
          bubbleSort: arr => parse(window.goBubbleSort(arr)),
          selectionSort: arr => parse(window.goSelectionSort(arr)),
          insertionSort: arr => parse(window.goInsertionSort(arr)),
          quickSort: arr => parse(window.goQuickSort(arr)),
          mergeSort: arr => parse(window.goMergeSort(arr)),
          lcs: (s1,s2) => parse(window.goLCS(s1,s2)),
          knapsack: (w,v,c) => parse(window.goKnapsack(w,v,c)),
          bfs: (adj,st) => parse(window.goBFS(adj,st)),
          dfs: (adj,st) => parse(window.goDFS(adj,st)),
          dijkstra: (adj,n,st) => parse(window.goDijkstra(adj,n,st)),
          benchmark: (a,s) => parse(window.goBenchmark(a,s)),
        })
        setStatus('ready')
      } catch { setStatus('fallback') }
    }
    load()
  }, [])
  return { engine, status }
}

export default function App() {
  const { engine, status } = useEngine()

  // ── Active algo ─────────────────────────────────────────────────────────────
  const [unitId, setUnitId] = useState(0)
  const [algoId, setAlgoId] = useState('bubble')
  const [view, setView]     = useState('visualizer')
  const [inputOpen, setInputOpen] = useState(true)

  // ── User-defined inputs (one per type) ──────────────────────────────────────
  const [userArray,    setUserArray]    = useState(DEFAULT_ARRAY)
  const [userStrings,  setUserStrings]  = useState(DEFAULT_LCS)
  const [userKnapsack, setUserKnapsack] = useState({
    ...DEFAULT_KNAPSACK,
    weights: DEFAULT_KNAPSACK.items.map(i=>i.weight),
    values:  DEFAULT_KNAPSACK.items.map(i=>i.value),
  })
  const [userGraph,    setUserGraph]    = useState(DEFAULT_GRAPH)
  const [userWGraph,   setUserWGraph]   = useState(DEFAULT_WGRAPH)

  // ── Derive algo meta ────────────────────────────────────────────────────────
  const unit = UNITS.find(u => u.id === unitId)
  const algoMeta = unit?.algos.find(a => a.id === algoId)

  // ── Generate snapshots from user data ───────────────────────────────────────
  const snapshots = useMemo(() => {
    try {
      switch (algoId) {
        case 'bubble':    return engine.bubbleSort(userArray)
        case 'selection': return engine.selectionSort(userArray)
        case 'insertion': return engine.insertionSort(userArray)
        case 'quick':     return engine.quickSort(userArray)
        case 'merge':     return engine.mergeSort(userArray)
        case 'lcs':       return engine.lcs(userStrings.s1, userStrings.s2)
        case 'knapsack':  return engine.knapsack(userKnapsack.weights, userKnapsack.values, userKnapsack.capacity)
        case 'bfs':       return engine.bfs(userGraph.adj, userGraph.start)
        case 'dfs':       return engine.dfs(userGraph.adj, userGraph.start)
        case 'dijkstra':  return engine.dijkstra(userWGraph.adj, userWGraph.nodes.length, userWGraph.start)
        default: return []
      }
    } catch (e) { console.error(e); return [] }
  }, [engine, algoId, userArray, userStrings, userKnapsack, userGraph, userWGraph])

  const pb = usePlayback(snapshots)

  const handleAlgoSelect = useCallback((newAlgo, newUnit) => {
    setAlgoId(newAlgo); setUnitId(newUnit); setView('visualizer')
  }, [])

  // Input type for active algo
  const inputType = algoMeta?.inputType || 'array'
  const isArray   = ['array'].includes(inputType)
  const isStrings = inputType === 'strings'
  const isKnap    = inputType === 'knapsack'
  const isGraph   = inputType === 'graph'
  const isWGraph  = inputType === 'wgraph'
  const isSorting = ['bubble','selection','insertion','quick'].includes(algoId)

  // Current graph data for visualizer
  const graphData = isWGraph ? userWGraph : userGraph

  return (
    <div className={styles.app}>
      <Header wasmStatus={status} view={view} onViewChange={setView} />
      <div className={styles.body}>
        <Sidebar units={UNITS} activeAlgo={algoId} onSelect={handleAlgoSelect} />

        <main className={styles.main}>
          {view === 'benchmark' ? (
            <BenchmarkPanel engine={engine} />
          ) : (
            <>
              {/* Two-column: left=input panel, right=visualizer */}
              <div className={styles.workspace}>

                {/* ── INPUT PANEL ───────────────────────────────── */}
                <div className={`${styles.inputCol} ${!inputOpen ? styles.inputCollapsed : ''}`}>
                  <div className={styles.inputColHeader}>
                    <span className={styles.inputColTitle}>
                      {isArray  && 'Array Input'}
                      {isStrings && 'String Input'}
                      {isKnap   && 'Knapsack Input'}
                      {(isGraph||isWGraph) && 'Graph Input'}
                    </span>
                    <button className={styles.collapseBtn} onClick={() => setInputOpen(o => !o)}>
                      {inputOpen ? '←' : '→'}
                    </button>
                  </div>

                  {inputOpen && (
                    <div className={styles.inputBody}>
                      {isArray && (
                        <ArrayInput
                          value={userArray}
                          onChange={arr => { setUserArray(arr) }}
                        />
                      )}
                      {isStrings && (
                        <StringsInput
                          value={userStrings}
                          onChange={setUserStrings}
                        />
                      )}
                      {isKnap && (
                        <KnapsackInput
                          value={userKnapsack}
                          onChange={setUserKnapsack}
                        />
                      )}
                      {isGraph && (
                        <GraphInput
                          key="unweighted"
                          value={userGraph}
                          onChange={g => setUserGraph(g)}
                          weighted={false}
                        />
                      )}
                      {isWGraph && (
                        <GraphInput
                          key="weighted"
                          value={userWGraph}
                          onChange={g => setUserWGraph(g)}
                          weighted={true}
                        />
                      )}

                      {/* Snapshot count summary */}
                      <div className={styles.snapSummary}>
                        <span className={styles.snapDot}/>
                        <span>{snapshots.length} snapshots generated</span>
                        <span className={styles.snapHint}>— changes apply on next Play</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── VISUALIZER ────────────────────────────────── */}
                <div className={styles.visCol}>
                  <div className={styles.visBody}>
                    {isSorting && <SortingVis snap={pb.snap} />}
                    {algoId === 'merge' && <MergeVis snap={pb.snap} />}
                    {(algoId === 'lcs' || algoId === 'knapsack') && <DPVis snap={pb.snap} algoId={algoId} />}
                    {(algoId === 'bfs' || algoId === 'dfs' || algoId === 'dijkstra') && (
                      <GraphVis snap={pb.snap} algoId={algoId} graphData={graphData} />
                    )}
                  </div>
                </div>
              </div>

              <InfoBar algoMeta={algoMeta} msg={pb.snap?.msg} />
              <PlaybackBar pb={pb} total={snapshots.length} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
