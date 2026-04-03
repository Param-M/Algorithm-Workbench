// Pure-JS engine — mirrors Go Wasm API exactly.
// All algorithms accept user-provided data.

const copy = a => [...a]

// ── Sorting ──────────────────────────────────────────────────────────────────
export function bubbleSort(input) {
  const a = copy(input), n = a.length
  const sorted = new Array(n).fill(false)
  const snaps = []; let sw = 0, cm = 0
  snaps.push({ arr: copy(a), hl: [], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Bubble Sort — n=${n}` })
  for (let i = 0; i < n - 1; i++) {
    let swappedPass = false
    for (let j = 0; j < n - i - 1; j++) {
      cm++
      snaps.push({ arr: copy(a), hl: [j, j+1], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Pass ${i+1}: Compare a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}` })
      if (a[j] > a[j+1]) {
        ;[a[j], a[j+1]] = [a[j+1], a[j]]; sw++; swappedPass = true
        snaps.push({ arr: copy(a), hl: [j, j+1], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Swap a[${j}]↔a[${j+1}] → [${a[j]}, ${a[j+1]}]` })
      }
    }
    sorted[n-i-1] = true
    snaps.push({ arr: copy(a), hl: [], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Pass ${i+1} done. a[${n-i-1}]=${a[n-i-1]} in final position.` })
    if (!swappedPass) {
      for (let k = 0; k < n-i-1; k++) sorted[k] = true
      snaps.push({ arr: copy(a), hl: [], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Early exit: no swaps. Array sorted!` })
      return snaps
    }
  }
  sorted[0] = true
  snaps.push({ arr: copy(a), hl: [], sorted: new Array(n).fill(true), pivot: -1, sw, cm, msg: `Complete! Swaps: ${sw}, Comparisons: ${cm}` })
  return snaps
}

export function selectionSort(input) {
  const a = copy(input), n = a.length
  const sorted = new Array(n).fill(false)
  const snaps = []; let sw = 0, cm = 0
  snaps.push({ arr: copy(a), hl: [], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Selection Sort — n=${n}` })
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    snaps.push({ arr: copy(a), hl: [i], sorted: copy(sorted), pivot: i, sw, cm, msg: `Round ${i+1}: Assume min=a[${i}]=${a[i]}` })
    for (let j = i+1; j < n; j++) {
      cm++
      snaps.push({ arr: copy(a), hl: [minIdx, j], sorted: copy(sorted), pivot: minIdx, sw, cm, msg: `Compare a[${j}]=${a[j]} vs min a[${minIdx}]=${a[minIdx]}` })
      if (a[j] < a[minIdx]) { minIdx = j; snaps.push({ arr: copy(a), hl: [minIdx], sorted: copy(sorted), pivot: minIdx, sw, cm, msg: `New min: a[${minIdx}]=${a[minIdx]}` }) }
    }
    if (minIdx !== i) { ;[a[i], a[minIdx]] = [a[minIdx], a[i]]; sw++; snaps.push({ arr: copy(a), hl: [i, minIdx], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Swap min a[${minIdx}] → position ${i}` }) }
    else snaps.push({ arr: copy(a), hl: [i], sorted: copy(sorted), pivot: -1, sw, cm, msg: `a[${i}]=${a[i]} already minimum — no swap` })
    sorted[i] = true
    snaps.push({ arr: copy(a), hl: [], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Position ${i} final: a[${i}]=${a[i]}` })
  }
  sorted[n-1] = true
  snaps.push({ arr: copy(a), hl: [], sorted: new Array(n).fill(true), pivot: -1, sw, cm, msg: `Complete! Swaps: ${sw} (always O(n)), Comparisons: ${cm}` })
  return snaps
}

export function insertionSort(input) {
  const a = copy(input), n = a.length
  const sorted = new Array(n).fill(false); sorted[0] = true
  const snaps = []; let ins = 0, cm = 0
  snaps.push({ arr: copy(a), hl: [0], sorted: copy(sorted), pivot: -1, sw: ins, cm, msg: `Insertion Sort — n=${n}. a[0]=${a[0]} trivially sorted.` })
  for (let i = 1; i < n; i++) {
    const key = a[i]
    snaps.push({ arr: copy(a), hl: [i], sorted: copy(sorted), pivot: i, sw: ins, cm, msg: `Key=a[${i}]=${key}. Insert into sorted [0..${i-1}].` })
    let j = i - 1
    while (j >= 0 && a[j] > key) {
      cm++; a[j+1] = a[j]
      snaps.push({ arr: copy(a), hl: [j, j+1], sorted: copy(sorted), pivot: i, sw: ins, cm, msg: `a[${j}]=${a[j]} > key=${key} → shift right` })
      j--
    }
    if (j >= 0) cm++
    a[j+1] = key; ins++; sorted[i] = true
    snaps.push({ arr: copy(a), hl: [j+1], sorted: copy(sorted), pivot: -1, sw: ins, cm, msg: `Place key=${key} at [${j+1}]. Sorted: [0..${i}]` })
  }
  snaps.push({ arr: copy(a), hl: [], sorted: new Array(n).fill(true), pivot: -1, sw: ins, cm, msg: `Complete! Comparisons: ${cm}, Insertions: ${ins}` })
  return snaps
}

export function quickSort(input) {
  const a = copy(input), n = a.length
  const sorted = new Array(n).fill(false)
  const snaps = []; let sw = 0, cm = 0
  snaps.push({ arr: copy(a), hl: [], sorted: copy(sorted), pivot: -1, sw, cm, msg: `Quick Sort (Lomuto) — n=${n}` })
  function qs(lo, hi) {
    if (lo >= hi) { if (lo === hi && lo >= 0 && lo < n) sorted[lo] = true; return }
    const pv = a[hi]
    snaps.push({ arr: copy(a), hl: [lo, hi], sorted: copy(sorted), pivot: hi, sw, cm, msg: `Partition [${lo}..${hi}]. Pivot=a[${hi}]=${pv}` })
    let i = lo - 1
    for (let j = lo; j < hi; j++) {
      cm++
      snaps.push({ arr: copy(a), hl: [j, hi], sorted: copy(sorted), pivot: hi, sw, cm, msg: `a[${j}]=${a[j]} ≤ pivot=${pv}?` })
      if (a[j] <= pv) {
        i++
        if (i !== j) { ;[a[i], a[j]] = [a[j], a[i]]; sw++; snaps.push({ arr: copy(a), hl: [i, j], sorted: copy(sorted), pivot: hi, sw, cm, msg: `Yes → Swap a[${i}]↔a[${j}]` }) }
        else snaps.push({ arr: copy(a), hl: [i], sorted: copy(sorted), pivot: hi, sw, cm, msg: `Yes → a[${i}] in place` })
      }
    }
    ;[a[i+1], a[hi]] = [a[hi], a[i+1]]; sw++; sorted[i+1] = true
    snaps.push({ arr: copy(a), hl: [i+1], sorted: copy(sorted), pivot: i+1, sw, cm, msg: `Pivot at final index ${i+1} → a[${i+1}]=${a[i+1]} sorted!` })
    qs(lo, i); qs(i+2, hi)
  }
  qs(0, n-1)
  snaps.push({ arr: copy(a), hl: [], sorted: new Array(n).fill(true), pivot: -1, sw, cm, msg: `Complete! Swaps: ${sw}, Comparisons: ${cm}` })
  return snaps
}

export function mergeSort(input) {
  const a = copy(input), n = a.length, snaps = []
  snaps.push({ arr: copy(a), lo: 0, hi: n-1, mid: -1, phase: 'init', placed: -1, depth: 0, msg: `Merge Sort — n=${n}. O(n log n) time, O(n) space.` })
  function ms(lo, hi, depth) {
    if (lo >= hi) return
    const mid = Math.floor((lo+hi)/2)
    snaps.push({ arr: copy(a), lo, hi, mid, phase: 'split', placed: -1, depth, msg: `Depth ${depth}: Split [${lo}..${hi}] → [${lo}..${mid}] | [${mid+1}..${hi}]` })
    ms(lo, mid, depth+1); ms(mid+1, hi, depth+1)
    const L = a.slice(lo, mid+1), R = a.slice(mid+1, hi+1)
    snaps.push({ arr: copy(a), lo, hi, mid, phase: 'merging', placed: -1, depth, msg: `Depth ${depth}: Merge — Left=[${L}] Right=[${R}]` })
    let i=0,j=0,k=lo
    while (i<L.length&&j<R.length) {
      a[k++]=L[i]<=R[j]?L[i++]:R[j++]
      snaps.push({ arr: copy(a), lo, hi, mid, phase: 'placing', placed: k-1, depth, msg: `Place ${a[k-1]} at [${k-1}]` })
    }
    while(i<L.length){a[k++]=L[i++];snaps.push({arr:copy(a),lo,hi,mid,phase:'placing',placed:k-1,depth,msg:`Drain left → [${k-1}]=${a[k-1]}`})}
    while(j<R.length){a[k++]=R[j++];snaps.push({arr:copy(a),lo,hi,mid,phase:'placing',placed:k-1,depth,msg:`Drain right → [${k-1}]=${a[k-1]}`})}
    snaps.push({ arr: copy(a), lo, hi, mid, phase: 'merged', placed: -1, depth, msg: `Depth ${depth}: [${lo}..${hi}] merged → [${a.slice(lo,hi+1)}]` })
  }
  ms(0, n-1, 0)
  snaps.push({ arr: copy(a), lo: 0, hi: n-1, mid: -1, phase: 'done', placed: -1, depth: 0, msg: `Complete! [${a}]` })
  return snaps
}

// ── Dynamic Programming ───────────────────────────────────────────────────────
export function lcs(s1, s2) {
  const m=s1.length, n=s2.length
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0))
  const snaps=[], cpDP=()=>dp.map(r=>[...r])
  snaps.push({ dp: cpDP(), active:[-1,-1], path:[], s1, s2, msg:`LCS("${s1}", "${s2}") — table (${m}+1)×(${n}+1)` })
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) {
    if(s1[i-1]===s2[j-1]){dp[i][j]=dp[i-1][j-1]+1;snaps.push({dp:cpDP(),active:[i,j],path:[],s1,s2,msg:`'${s1[i-1]}'=='${s2[j-1]}' → dp[${i}][${j}]=dp[${i-1}][${j-1}]+1=${dp[i][j]}`})}
    else{dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);snaps.push({dp:cpDP(),active:[i,j],path:[],s1,s2,msg:`'${s1[i-1]}'≠'${s2[j-1]}' → dp[${i}][${j}]=max(${dp[i-1][j]},${dp[i][j-1]})=${dp[i][j]}`})}
  }
  let pi=m,pj=n; const path=[]; let lcsStr=''
  while(pi>0&&pj>0){if(s1[pi-1]===s2[pj-1]){path.unshift([pi,pj]);lcsStr=s1[pi-1]+lcsStr;pi--;pj--}else if(dp[pi-1][pj]>dp[pi][pj-1])pi--;else pj--}
  snaps.push({ dp: cpDP(), active:[-1,-1], path, s1, s2, msg:`LCS="${lcsStr}" (length ${dp[m][n]})` })
  return snaps
}

export function knapsack(weights, values, capacity) {
  const n=weights.length
  const dp=Array.from({length:n+1},()=>new Array(capacity+1).fill(0))
  const snaps=[], cpDP=()=>dp.map(r=>[...r])
  snaps.push({ dp:cpDP(), active:[-1,-1], item:-1, capacity, weights, values, msg:`0/1 Knapsack: ${n} items, capacity=${capacity}` })
  for(let i=1;i<=n;i++) for(let w=0;w<=capacity;w++){
    if(weights[i-1]>w){dp[i][w]=dp[i-1][w];snaps.push({dp:cpDP(),active:[i,w],item:i-1,capacity,weights,values,msg:`Item ${i}(w=${weights[i-1]},v=${values[i-1]}): weight>cap → skip. dp[${i}][${w}]=${dp[i][w]}`})}
    else{const take=dp[i-1][w-weights[i-1]]+values[i-1],skip=dp[i-1][w];dp[i][w]=Math.max(take,skip);snaps.push({dp:cpDP(),active:[i,w],item:i-1,capacity,weights,values,msg:`Item ${i}: take=${take}, skip=${skip} → dp[${i}][${w}]=${dp[i][w]} (${take>=skip?'TAKE':'SKIP'})`})}
  }
  snaps.push({ dp:cpDP(), active:[-1,-1], item:-1, capacity, weights, values, msg:`Complete! Max value = dp[${n}][${capacity}] = ${dp[n][capacity]}` })
  return snaps
}

// ── Graphs ────────────────────────────────────────────────────────────────────
export function bfs(adj, start) {
  const snaps=[], visited=new Set(), vo=[], queue=[start]
  visited.add(start); vo.push(start)
  snaps.push({ visited:[...vo], current:-1, queue:[...queue], stack:[], dist:[], edgeFrom:-1, edgeTo:-1, msg:`BFS from ${start}. Queue: [${queue}]` })
  while(queue.length>0){
    const cur=queue.shift()
    snaps.push({ visited:[...vo], current:cur, queue:[...queue], stack:[], dist:[], edgeFrom:-1, edgeTo:-1, msg:`Dequeue ${cur}. Neighbors: [${(adj[cur]||[]).join(',')}]` })
    for(const nb of (adj[cur]||[])){
      snaps.push({ visited:[...vo], current:cur, queue:[...queue], stack:[], dist:[], edgeFrom:cur, edgeTo:nb, msg:`Edge ${cur}→${nb}: ${visited.has(nb)?'visited, skip':'unvisited → enqueue'}` })
      if(!visited.has(nb)){visited.add(nb);vo.push(nb);queue.push(nb);snaps.push({ visited:[...vo], current:cur, queue:[...queue], stack:[], dist:[], edgeFrom:cur, edgeTo:nb, msg:`Enqueue ${nb}. Queue: [${queue}]` })}
    }
    snaps.push({ visited:[...vo], current:-1, queue:[...queue], stack:[], dist:[], edgeFrom:-1, edgeTo:-1, msg:`Node ${cur} processed.` })
  }
  snaps.push({ visited:[...vo], current:-1, queue:[], stack:[], dist:[], edgeFrom:-1, edgeTo:-1, msg:`BFS complete! Order: [${vo}]` })
  return snaps
}

export function dfs(adj, start) {
  const snaps=[], visited=new Set(), vo=[], stack=[start]
  snaps.push({ visited:[...vo], current:-1, queue:[], stack:[...stack], dist:[], edgeFrom:-1, edgeTo:-1, msg:`DFS from ${start}. Stack: [${stack}]` })
  while(stack.length>0){
    const cur=stack.pop()
    if(visited.has(cur)){snaps.push({ visited:[...vo], current:cur, queue:[], stack:[...stack], dist:[], edgeFrom:-1, edgeTo:-1, msg:`Pop ${cur} — already visited, skip.` });continue}
    visited.add(cur);vo.push(cur)
    snaps.push({ visited:[...vo], current:cur, queue:[], stack:[...stack], dist:[], edgeFrom:-1, edgeTo:-1, msg:`Visit ${cur}. Neighbors: [${(adj[cur]||[]).join(',')}]` })
    for(const nb of [...(adj[cur]||[])].reverse()){
      if(!visited.has(nb)){stack.push(nb);snaps.push({ visited:[...vo], current:cur, queue:[], stack:[...stack], dist:[], edgeFrom:cur, edgeTo:nb, msg:`Push neighbor ${nb}. Stack: [${stack}]` })}
    }
  }
  snaps.push({ visited:[...vo], current:-1, queue:[], stack:[], dist:[], edgeFrom:-1, edgeTo:-1, msg:`DFS complete! Order: [${vo}]` })
  return snaps
}

export function dijkstra(adj, n, start) {
  const INF=1e9, dist=new Array(n).fill(INF); dist[start]=0
  const vis=new Array(n).fill(false), vo=[], snaps=[]
  const cd=()=>dist.map(d=>d>=INF?-1:d)
  snaps.push({ visited:[...vo], current:-1, queue:[], stack:[], dist:cd(), edgeFrom:-1, edgeTo:-1, msg:`Dijkstra from ${start}. dist[${start}]=0, others=∞` })
  for(let iter=0;iter<n;iter++){
    let u=-1
    for(let v=0;v<n;v++) if(!vis[v]&&(u===-1||dist[v]<dist[u]))u=v
    if(u===-1||dist[u]>=INF)break
    vis[u]=true;vo.push(u)
    snaps.push({ visited:[...vo], current:u, queue:[], stack:[], dist:cd(), edgeFrom:-1, edgeTo:-1, msg:`Extract min: node ${u} (dist=${dist[u]}). Relax edges.` })
    for(const e of (adj[u]||[])){
      if(vis[e.to])continue
      const nd=dist[u]+e.weight, imp=nd<dist[e.to]
      snaps.push({ visited:[...vo], current:u, queue:[], stack:[], dist:cd(), edgeFrom:u, edgeTo:e.to, msg:`Relax ${u}→${e.to}(w=${e.weight}): ${dist[e.to]>=INF?'∞':dist[e.to]} vs ${nd} → ${imp?'UPDATE!':'no change'}` })
      if(imp){dist[e.to]=nd;snaps.push({ visited:[...vo], current:u, queue:[], stack:[], dist:cd(), edgeFrom:u, edgeTo:e.to, msg:`dist[${e.to}] = ${dist[e.to]} (via ${u})` })}
    }
  }
  snaps.push({ visited:[...vo], current:-1, queue:[], stack:[], dist:cd(), edgeFrom:-1, edgeTo:-1, msg:`Complete! Distances from ${start}: ${dist.map((d,i)=>`${i}:${d>=INF?'∞':d}`).join(' ')}` })
  return snaps
}

// ── Benchmark ─────────────────────────────────────────────────────────────────
export function benchmark(algo, sizes) {
  const rand=n=>Array.from({length:n},()=>Math.floor(Math.random()*n*10))
  const times=[], theory=[]
  for(const n of sizes){
    const arr=rand(n); const t0=performance.now()
    if(algo==='bubble'){const a=[...arr];for(let i=0;i<n-1;i++)for(let j=0;j<n-i-1;j++)if(a[j]>a[j+1])[a[j],a[j+1]]=[a[j+1],a[j]]}
    else if(algo==='selection'){const a=[...arr];for(let i=0;i<n-1;i++){let m=i;for(let j=i+1;j<n;j++)if(a[j]<a[m])m=j;[a[i],a[m]]=[a[m],a[i]]}}
    else if(algo==='insertion'){const a=[...arr];for(let i=1;i<n;i++){const k=a[i];let j=i-1;while(j>=0&&a[j]>k){a[j+1]=a[j];j--}a[j+1]=k}}
    else if(algo==='quick'){const a=[...arr];function q(lo,hi){if(lo>=hi)return;const p=a[hi];let i=lo-1;for(let j=lo;j<hi;j++)if(a[j]<=p){i++;[a[i],a[j]]=[a[j],a[i]]};[a[i+1],a[hi]]=[a[hi],a[i+1]];q(lo,i);q(i+2,hi)}q(0,n-1)}
    else if(algo==='merge'){function m(a){if(a.length<=1)return a;const mid=a.length>>1,l=m(a.slice(0,mid)),r=m(a.slice(mid));let i=0,j=0,res=[];while(i<l.length&&j<r.length)res.push(l[i]<=r[j]?l[i++]:r[j++]);return res.concat(l.slice(i),r.slice(j))}m(arr)}
    times.push(performance.now()-t0)
  }
  const mx=Math.max(...sizes)
  for(const n of sizes){
    if(['bubble','selection','insertion'].includes(algo))theory.push((n/mx)**2)
    else theory.push((n/mx)*Math.max(1,Math.log2(n))/Math.max(1,Math.log2(mx)))
  }
  const maxT=Math.max(...times,0.001)
  return { algo, sizes, times, theory:theory.map(t=>t*maxT) }
}

export const jsEngine = { bubbleSort, selectionSort, insertionSort, quickSort, mergeSort, lcs, knapsack, bfs, dfs, dijkstra, benchmark }
