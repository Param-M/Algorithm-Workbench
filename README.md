# Algorithm Workbench 

A client-side algorithm visualization tool with **user-defined input data** for every algorithm.  
Built with React + Go WebAssembly. Zero server. Fully static.


| Algorithm | What you can customize |
|-----------|----------------------|
| Bubble / Selection / Insertion / Quick Sort | Any array of numbers (2–20 elements), live bar preview, presets |
| Merge Sort | Same array input, shared across Unit 1 & 2 |
| LCS | Two custom strings (up to 12 chars each), character match preview |
| 0/1 Knapsack | Up to 8 items with custom weight & value, custom capacity |
| BFS / DFS | Custom node count (2–10), add/remove edges manually, choose start node |
| Dijkstra | Same graph builder + edge weights |

Changes to inputs regenerate snapshots instantly. The input panel can be collapsed to give more space to the visualizer.

## Quick start

```bash
# JS engine (no Go needed)
npm install && npm run dev

# Full Go Wasm
./build-wasm.sh && npm run dev
```

## Architecture

```
User input (InputPanel)
      ↓  changes
  jsEngine / Go Wasm Engine
      ↓  snapshots[]
  usePlayback (buffer)
      ↓  one snap per step
  SortingVis / MergeVis / DPVis / GraphVis
```

Go knows nothing about CSS. React knows nothing about algorithms. The language boundary enforces the separation.

## Deployment

```bash
vercel   # Vercel (recommended — vercel.json sets COOP/COEP headers)
```

Or push to `main` and GitHub Actions builds + deploys automatically.
