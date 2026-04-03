// wasm/main.go — syscall/js bridge
// Build: GOOS=js GOARCH=wasm go build -o ../public/engine.wasm main.go
package main

import (
	"encoding/json"
	"syscall/js"

	"algorithm-workbench/algorithms"
)

func main() {
	done := make(chan struct{})

	js.Global().Set("goBubbleSort", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.BubbleSort(jsInts(args[0])))
	}))
	js.Global().Set("goSelectionSort", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.SelectionSort(jsInts(args[0])))
	}))
	js.Global().Set("goInsertionSort", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.InsertionSort(jsInts(args[0])))
	}))
	js.Global().Set("goQuickSort", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.QuickSort(jsInts(args[0])))
	}))
	js.Global().Set("goMergeSort", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.MergeSort(jsInts(args[0])))
	}))
	js.Global().Set("goLCS", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.LCS(args[0].String(), args[1].String()))
	}))
	js.Global().Set("goKnapsack", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.Knapsack(jsInts(args[0]), jsInts(args[1]), args[2].Int()))
	}))
	js.Global().Set("goBFS", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.BFS(jsAdj(args[0]), args[1].Int()))
	}))
	js.Global().Set("goDFS", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.DFS(jsAdj(args[0]), args[1].Int()))
	}))
	js.Global().Set("goDijkstra", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.Dijkstra(jsWAdj(args[0]), args[1].Int(), args[2].Int()))
	}))
	js.Global().Set("goBenchmark", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return toJS(algorithms.Benchmark(args[0].String(), jsInts(args[1])))
	}))

	js.Global().Set("goWasmReady", js.ValueOf(true))
	<-done
}

func toJS(v interface{}) js.Value {
	b, _ := json.Marshal(v)
	return js.ValueOf(string(b))
}

func jsInts(v js.Value) []int {
	n := v.Length()
	a := make([]int, n)
	for i := 0; i < n; i++ {
		a[i] = v.Index(i).Int()
	}
	return a
}

func jsAdj(v js.Value) map[int][]int {
	adj := make(map[int][]int)
	keys := js.Global().Get("Object").Call("keys", v)
	for i := 0; i < keys.Length(); i++ {
		k := keys.Index(i).String()
		nb := v.Get(k)
		var nbs []int
		for j := 0; j < nb.Length(); j++ {
			nbs = append(nbs, nb.Index(j).Int())
		}
		nodeID := 0
		for _, c := range k {
			nodeID = nodeID*10 + int(c-'0')
		}
		adj[nodeID] = nbs
	}
	return adj
}

func jsWAdj(v js.Value) map[int][]algorithms.WeightedEdge {
	adj := make(map[int][]algorithms.WeightedEdge)
	keys := js.Global().Get("Object").Call("keys", v)
	for i := 0; i < keys.Length(); i++ {
		k := keys.Index(i).String()
		edges := v.Get(k)
		var we []algorithms.WeightedEdge
		for j := 0; j < edges.Length(); j++ {
			e := edges.Index(j)
			we = append(we, algorithms.WeightedEdge{To: e.Get("to").Int(), Weight: e.Get("weight").Int()})
		}
		nodeID := 0
		for _, c := range k {
			nodeID = nodeID*10 + int(c-'0')
		}
		adj[nodeID] = we
	}
	return adj
}
