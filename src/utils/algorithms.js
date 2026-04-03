export const UNITS = [
  {
    id: 0, key: 'sorting', label: 'Unit 1 — Sorting', short: 'Sorting',
    algos: [
      { id: 'bubble',    label: 'Bubble Sort',    cplx: 'O(n²)',        space: 'O(1)',      stable: true,  fn: 'bubbleSort',    inputType: 'array' },
      { id: 'selection', label: 'Selection Sort', cplx: 'O(n²)',        space: 'O(1)',      stable: false, fn: 'selectionSort', inputType: 'array' },
      { id: 'insertion', label: 'Insertion Sort', cplx: 'O(n²)',        space: 'O(1)',      stable: true,  fn: 'insertionSort', inputType: 'array' },
      { id: 'quick',     label: 'Quick Sort',     cplx: 'O(n log n)',   space: 'O(log n)', stable: false, fn: 'quickSort',     inputType: 'array' },
    ]
  },
  {
    id: 1, key: 'dc', label: 'Unit 2 — Divide & Conquer', short: 'D&C',
    algos: [
      { id: 'merge', label: 'Merge Sort', cplx: 'O(n log n)', space: 'O(n)', stable: true, fn: 'mergeSort', inputType: 'array' },
    ]
  },
  {
    id: 2, key: 'dp', label: 'Unit 3 — Dynamic Prog.', short: 'DP',
    algos: [
      { id: 'lcs',      label: 'LCS',      cplx: 'O(m×n)',  space: 'O(m×n)', stable: null, fn: 'lcs',      inputType: 'strings' },
      { id: 'knapsack', label: 'Knapsack', cplx: 'O(n×W)',  space: 'O(n×W)', stable: null, fn: 'knapsack', inputType: 'knapsack' },
    ]
  },
  {
    id: 3, key: 'graphs', label: 'Unit 4 — Graphs', short: 'Graphs',
    algos: [
      { id: 'bfs',      label: 'BFS',      cplx: 'O(V+E)', space: 'O(V)', stable: null, fn: 'bfs',      inputType: 'graph' },
      { id: 'dfs',      label: 'DFS',      cplx: 'O(V+E)', space: 'O(V)', stable: null, fn: 'dfs',      inputType: 'graph' },
      { id: 'dijkstra', label: 'Dijkstra', cplx: 'O(V²)',  space: 'O(V)', stable: null, fn: 'dijkstra', inputType: 'wgraph' },
    ]
  },
]

export function randArray(n = 12) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 5)
}

export const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10, 56, 24, 61]

export const DEFAULT_GRAPH = {
  nodes: [
    { id: 0, x: 70,  y: 80  },
    { id: 1, x: 200, y: 25  },
    { id: 2, x: 200, y: 135 },
    { id: 3, x: 330, y: 15  },
    { id: 4, x: 330, y: 85  },
    { id: 5, x: 330, y: 155 },
    { id: 6, x: 460, y: 55  },
    { id: 7, x: 460, y: 145 },
  ],
  edges: [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 4 }, { from: 2, to: 5 },
    { from: 3, to: 6 }, { from: 4, to: 6 },
    { from: 4, to: 7 }, { from: 5, to: 7 },
  ],
  adj: { 0:[1,2], 1:[0,3,4], 2:[0,4,5], 3:[1,6], 4:[1,2,6,7], 5:[2,7], 6:[3,4], 7:[4,5] },
  start: 0,
}

export const DEFAULT_WGRAPH = {
  nodes: [
    { id: 0, x: 60,  y: 100, label: 'A' },
    { id: 1, x: 200, y: 30,  label: 'B' },
    { id: 2, x: 200, y: 170, label: 'C' },
    { id: 3, x: 350, y: 30,  label: 'D' },
    { id: 4, x: 350, y: 170, label: 'E' },
    { id: 5, x: 480, y: 100, label: 'F' },
  ],
  edges: [
    { from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 2 },
    { from: 1, to: 2, weight: 5 }, { from: 1, to: 3, weight: 10 }, { from: 1, to: 4, weight: 3 },
    { from: 2, to: 4, weight: 6 },
    { from: 3, to: 5, weight: 2 }, { from: 4, to: 3, weight: 1 }, { from: 4, to: 5, weight: 7 },
  ],
  adj: {
    0:[{to:1,weight:4},{to:2,weight:2}],
    1:[{to:0,weight:4},{to:2,weight:5},{to:3,weight:10},{to:4,weight:3}],
    2:[{to:0,weight:2},{to:1,weight:5},{to:4,weight:6}],
    3:[{to:1,weight:10},{to:4,weight:1},{to:5,weight:2}],
    4:[{to:1,weight:3},{to:2,weight:6},{to:3,weight:1},{to:5,weight:7}],
    5:[{to:3,weight:2},{to:4,weight:7}],
  },
  start: 0,
}

export const DEFAULT_LCS = { s1: 'ABCBDAB', s2: 'BDCAB' }
export const DEFAULT_KNAPSACK = {
  items: [
    { weight: 2, value: 3 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 6 },
  ],
  capacity: 8,
}
