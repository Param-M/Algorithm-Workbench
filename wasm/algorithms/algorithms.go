package algorithms

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)

// ── Merge Sort ────────────────────────────────────────────────────────────────
type MergeSnap struct {
	Arr    []int  `json:"arr"`
	Lo     int    `json:"lo"`
	Hi     int    `json:"hi"`
	Mid    int    `json:"mid"`
	Phase  string `json:"phase"`
	Placed int    `json:"placed"`
	Depth  int    `json:"depth"`
	Msg    string `json:"msg"`
}

func MergeSort(input []int) []MergeSnap {
	a := cp(input); n := len(a)
	var snaps []MergeSnap
	snaps = append(snaps, MergeSnap{cp(a), 0, n-1, -1, "init", -1, 0, fmt.Sprintf("Merge Sort — n=%d. O(n log n) time, O(n) space.", n)})
	var ms func(lo, hi, depth int)
	ms = func(lo, hi, depth int) {
		if lo >= hi { return }
		mid := (lo + hi) / 2
		snaps = append(snaps, MergeSnap{cp(a), lo, hi, mid, "split", -1, depth, fmt.Sprintf("Depth %d: Split [%d..%d] → [%d..%d] | [%d..%d]", depth, lo, hi, lo, mid, mid+1, hi)})
		ms(lo, mid, depth+1); ms(mid+1, hi, depth+1)
		L, R := cp(a[lo:mid+1]), cp(a[mid+1:hi+1])
		snaps = append(snaps, MergeSnap{cp(a), lo, hi, mid, "merging", -1, depth, fmt.Sprintf("Depth %d: Merge — Left=%v Right=%v", depth, L, R)})
		i, j, k := 0, 0, lo
		for i < len(L) && j < len(R) {
			if L[i] <= R[j] { a[k] = L[i]; i++ } else { a[k] = R[j]; j++ }
			snaps = append(snaps, MergeSnap{cp(a), lo, hi, mid, "placing", k, depth, fmt.Sprintf("Place %d at [%d]", a[k], k)}); k++
		}
		for i < len(L) { a[k] = L[i]; snaps = append(snaps, MergeSnap{cp(a), lo, hi, mid, "placing", k, depth, fmt.Sprintf("Drain left → [%d]=%d", k, a[k])}); i++; k++ }
		for j < len(R) { a[k] = R[j]; snaps = append(snaps, MergeSnap{cp(a), lo, hi, mid, "placing", k, depth, fmt.Sprintf("Drain right → [%d]=%d", k, a[k])}); j++; k++ }
		snaps = append(snaps, MergeSnap{cp(a), lo, hi, mid, "merged", -1, depth, fmt.Sprintf("Depth %d: [%d..%d] merged → %v", depth, lo, hi, a[lo:hi+1])})
	}
	ms(0, n-1, 0)
	snaps = append(snaps, MergeSnap{cp(a), 0, n-1, -1, "done", -1, 0, fmt.Sprintf("Complete! %v", a)})
	return snaps
}

// ── LCS ────────────────────────────────────────────────────────────────────────
type LCSSnap struct {
	DP     [][]int  `json:"dp"`
	Active [2]int   `json:"active"`
	Path   [][2]int `json:"path"`
	S1     string   `json:"s1"`
	S2     string   `json:"s2"`
	Msg    string   `json:"msg"`
}

func LCS(s1, s2 string) []LCSSnap {
	m, n := len(s1), len(s2)
	dp := make([][]int, m+1)
	for i := range dp { dp[i] = make([]int, n+1) }
	cpDP := func() [][]int { c := make([][]int, len(dp)); for i := range dp { c[i] = make([]int, len(dp[i])); copy(c[i], dp[i]) }; return c }
	var snaps []LCSSnap
	snaps = append(snaps, LCSSnap{cpDP(), [2]int{-1,-1}, nil, s1, s2, fmt.Sprintf(`LCS("%s", "%s") — table (%d+1)×(%d+1)`, s1, s2, m, n)})
	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if s1[i-1] == s2[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
				snaps = append(snaps, LCSSnap{cpDP(), [2]int{i,j}, nil, s1, s2, fmt.Sprintf("'%c'=='%c' → dp[%d][%d]=%d+1=%d", s1[i-1], s2[j-1], i, j, dp[i-1][j-1], dp[i][j])})
			} else {
				if dp[i-1][j] > dp[i][j-1] { dp[i][j] = dp[i-1][j] } else { dp[i][j] = dp[i][j-1] }
				snaps = append(snaps, LCSSnap{cpDP(), [2]int{i,j}, nil, s1, s2, fmt.Sprintf("'%c'≠'%c' → dp[%d][%d]=max(%d,%d)=%d", s1[i-1], s2[j-1], i, j, dp[i-1][j], dp[i][j-1], dp[i][j])})
			}
		}
	}
	pi, pj := m, n
	var path [][2]int; var lcsStr []byte
	for pi > 0 && pj > 0 {
		if s1[pi-1] == s2[pj-1] { path = append([][2]int{{pi,pj}}, path...); lcsStr = append([]byte{s1[pi-1]}, lcsStr...); pi--; pj-- } else if dp[pi-1][pj] > dp[pi][pj-1] { pi-- } else { pj-- }
	}
	snaps = append(snaps, LCSSnap{cpDP(), [2]int{-1,-1}, path, s1, s2, fmt.Sprintf(`LCS="%s" (length %d)`, string(lcsStr), dp[m][n])})
	return snaps
}

// ── Knapsack ──────────────────────────────────────────────────────────────────
type KnapsackSnap struct {
	DP       [][]int `json:"dp"`
	Active   [2]int  `json:"active"`
	Item     int     `json:"item"`
	Capacity int     `json:"capacity"`
	Weights  []int   `json:"weights"`
	Values   []int   `json:"values"`
	Msg      string  `json:"msg"`
}

func Knapsack(weights, values []int, capacity int) []KnapsackSnap {
	n := len(weights)
	dp := make([][]int, n+1)
	for i := range dp { dp[i] = make([]int, capacity+1) }
	cpDP := func() [][]int { c := make([][]int, len(dp)); for i := range dp { c[i] = make([]int, len(dp[i])); copy(c[i], dp[i]) }; return c }
	var snaps []KnapsackSnap
	snaps = append(snaps, KnapsackSnap{cpDP(), [2]int{-1,-1}, -1, capacity, weights, values, fmt.Sprintf("0/1 Knapsack: %d items, capacity=%d", n, capacity)})
	for i := 1; i <= n; i++ {
		for w := 0; w <= capacity; w++ {
			if weights[i-1] > w {
				dp[i][w] = dp[i-1][w]
				snaps = append(snaps, KnapsackSnap{cpDP(), [2]int{i,w}, i-1, capacity, weights, values, fmt.Sprintf("Item %d(w=%d,v=%d): weight>cap → skip. dp[%d][%d]=%d", i, weights[i-1], values[i-1], i, w, dp[i][w])})
			} else {
				take := dp[i-1][w-weights[i-1]] + values[i-1]
				skip := dp[i-1][w]
				if take > skip { dp[i][w] = take } else { dp[i][w] = skip }
				action := "SKIP"; if take >= skip { action = "TAKE" }
				snaps = append(snaps, KnapsackSnap{cpDP(), [2]int{i,w}, i-1, capacity, weights, values, fmt.Sprintf("Item %d: take=%d, skip=%d → dp[%d][%d]=%d (%s)", i, take, skip, i, w, dp[i][w], action)})
			}
		}
	}
	snaps = append(snaps, KnapsackSnap{cpDP(), [2]int{-1,-1}, -1, capacity, weights, values, fmt.Sprintf("Complete! Max value = dp[%d][%d] = %d", n, capacity, dp[n][capacity])})
	return snaps
}

// ── Graphs ────────────────────────────────────────────────────────────────────
type GraphSnap struct {
	Visited  []int `json:"visited"`
	Current  int   `json:"current"`
	Queue    []int `json:"queue"`
	Stack    []int `json:"stack"`
	Dist     []int `json:"dist"`
	EdgeFrom int   `json:"edgeFrom"`
	EdgeTo   int   `json:"edgeTo"`
	Msg      string `json:"msg"`
}

type WeightedEdge struct {
	To     int `json:"to"`
	Weight int `json:"weight"`
}

func cis(a []int) []int { if a==nil{return []int{}}; b:=make([]int,len(a));copy(b,a);return b }

func BFS(adj map[int][]int, start int) []GraphSnap {
	var snaps []GraphSnap
	vis := make(map[int]bool); vo := []int{}
	queue := []int{start}; vis[start]=true; vo=append(vo,start)
	snaps = append(snaps, GraphSnap{cis(vo),-1,cis(queue),nil,nil,-1,-1, fmt.Sprintf("BFS from %d. Queue: [%d]", start, start)})
	for len(queue)>0 {
		cur:=queue[0]; queue=queue[1:]
		snaps = append(snaps, GraphSnap{cis(vo),cur,cis(queue),nil,nil,-1,-1, fmt.Sprintf("Dequeue %d. Neighbors: %v", cur, adj[cur])})
		for _,nb:=range adj[cur] {
			action:="visited, skip"; if !vis[nb] { action="unvisited → enqueue" }
			snaps = append(snaps, GraphSnap{cis(vo),cur,cis(queue),nil,nil,cur,nb, fmt.Sprintf("Edge %d→%d: %s", cur, nb, action)})
			if !vis[nb] { vis[nb]=true; vo=append(vo,nb); queue=append(queue,nb); snaps=append(snaps,GraphSnap{cis(vo),cur,cis(queue),nil,nil,cur,nb,fmt.Sprintf("Enqueue %d. Queue: %v", nb, queue)}) }
		}
		snaps = append(snaps, GraphSnap{cis(vo),-1,cis(queue),nil,nil,-1,-1,fmt.Sprintf("Node %d processed.", cur)})
	}
	snaps = append(snaps, GraphSnap{cis(vo),-1,nil,nil,nil,-1,-1,fmt.Sprintf("BFS complete! Order: %v", vo)})
	return snaps
}

func DFS(adj map[int][]int, start int) []GraphSnap {
	var snaps []GraphSnap
	vis:=make(map[int]bool); vo:=[]int{}; stack:=[]int{start}
	snaps = append(snaps, GraphSnap{cis(vo),-1,nil,cis(stack),nil,-1,-1,fmt.Sprintf("DFS from %d. Stack: [%d]", start, start)})
	for len(stack)>0 {
		cur:=stack[len(stack)-1]; stack=stack[:len(stack)-1]
		if vis[cur] { snaps=append(snaps,GraphSnap{cis(vo),cur,nil,cis(stack),nil,-1,-1,fmt.Sprintf("Pop %d — already visited, skip.", cur)}); continue }
		vis[cur]=true; vo=append(vo,cur)
		snaps = append(snaps, GraphSnap{cis(vo),cur,nil,cis(stack),nil,-1,-1,fmt.Sprintf("Visit %d. Neighbors: %v", cur, adj[cur])})
		nb:=adj[cur]
		for i:=len(nb)-1;i>=0;i-- {
			if !vis[nb[i]] { stack=append(stack,nb[i]); snaps=append(snaps,GraphSnap{cis(vo),cur,nil,cis(stack),nil,cur,nb[i],fmt.Sprintf("Push neighbor %d. Stack: %v", nb[i], stack)}) }
		}
	}
	snaps = append(snaps, GraphSnap{cis(vo),-1,nil,nil,nil,-1,-1,fmt.Sprintf("DFS complete! Order: %v", vo)})
	return snaps
}

func Dijkstra(adj map[int][]WeightedEdge, n, start int) []GraphSnap {
	INF := math.MaxInt32/2
	dist:=make([]int,n); for i:=range dist{dist[i]=INF}; dist[start]=0
	vis:=make([]bool,n); vo:=[]int{}
	var snaps []GraphSnap
	cd:=func()[]int{c:=make([]int,len(dist));for i,d:=range dist{if d>=INF{c[i]=-1}else{c[i]=d}};return c}
	snaps = append(snaps, GraphSnap{cis(vo),-1,nil,nil,cd(),-1,-1,fmt.Sprintf("Dijkstra from %d. dist[%d]=0, others=∞", start, start)})
	for iter:=0;iter<n;iter++ {
		u:=-1
		for v:=0;v<n;v++{if !vis[v]&&(u==-1||dist[v]<dist[u]){u=v}}
		if u==-1||dist[u]>=INF{break}
		vis[u]=true; vo=append(vo,u)
		snaps = append(snaps, GraphSnap{cis(vo),u,nil,nil,cd(),-1,-1,fmt.Sprintf("Extract min: node %d (dist=%d). Relax edges.", u, dist[u])})
		for _,e:=range adj[u] {
			if vis[e.To]{continue}
			nd:=dist[u]+e.Weight; imp:=nd<dist[e.To]
			oldStr:="∞"; if dist[e.To]<INF{oldStr=fmt.Sprintf("%d",dist[e.To])}
			action:="no change"; if imp{action="UPDATE!"}
			snaps = append(snaps, GraphSnap{cis(vo),u,nil,nil,cd(),u,e.To,fmt.Sprintf("Relax %d→%d(w=%d): %s vs %d → %s", u, e.To, e.Weight, oldStr, nd, action)})
			if imp { dist[e.To]=nd; snaps=append(snaps,GraphSnap{cis(vo),u,nil,nil,cd(),u,e.To,fmt.Sprintf("dist[%d] = %d (via %d)", e.To, dist[e.To], u)}) }
		}
	}
	snaps = append(snaps, GraphSnap{cis(vo),-1,nil,nil,cd(),-1,-1,fmt.Sprintf("Dijkstra complete from node %d.", start)})
	return snaps
}

// ── Benchmark ─────────────────────────────────────────────────────────────────
type BenchResult struct {
	Algo   string    `json:"algo"`
	Sizes  []int     `json:"sizes"`
	Times  []float64 `json:"times"`
	Theory []float64 `json:"theory"`
}

func Benchmark(algo string, sizes []int) BenchResult {
	rand.Seed(time.Now().UnixNano())
	times := make([]float64, len(sizes))
	for i, n := range sizes {
		arr := make([]int, n)
		for j := range arr { arr[j] = rand.Intn(n * 10) }
		t0 := time.Now()
		switch algo {
		case "bubble":    timeBubble(arr)
		case "selection": timeSelection(arr)
		case "insertion": timeInsertion(arr)
		case "quick":     timeQuick(arr, 0, len(arr)-1)
		case "merge":     timeMerge(arr)
		}
		times[i] = float64(time.Since(t0).Microseconds()) / 1000.0
	}
	maxN := float64(sizes[len(sizes)-1])
	theory := make([]float64, len(sizes))
	for i, n := range sizes {
		fn := float64(n)
		if algo == "bubble" || algo == "selection" || algo == "insertion" {
			theory[i] = (fn / maxN) * (fn / maxN)
		} else {
			logN := math.Log2(fn); logMax := math.Log2(maxN)
			theory[i] = (fn / maxN) * (logN / logMax)
		}
	}
	maxT := 0.0; for _, t := range times { if t > maxT { maxT = t } }
	if maxT > 0 { for i := range theory { theory[i] *= maxT } }
	return BenchResult{algo, sizes, times, theory}
}

func timeBubble(a []int) { n:=len(a);cp:=make([]int,n);copy(cp,a);for i:=0;i<n-1;i++{for j:=0;j<n-i-1;j++{if cp[j]>cp[j+1]{cp[j],cp[j+1]=cp[j+1],cp[j]}}} }
func timeSelection(a []int) { n:=len(a);cp:=make([]int,n);copy(cp,a);for i:=0;i<n-1;i++{m:=i;for j:=i+1;j<n;j++{if cp[j]<cp[m]{m=j}};cp[i],cp[m]=cp[m],cp[i]} }
func timeInsertion(a []int) { cp:=make([]int,len(a));copy(cp,a);for i:=1;i<len(cp);i++{k:=cp[i];j:=i-1;for j>=0&&cp[j]>k{cp[j+1]=cp[j];j--};cp[j+1]=k} }
func timeQuick(a []int, lo, hi int) { if lo>=hi{return};p:=a[hi];i:=lo-1;for j:=lo;j<hi;j++{if a[j]<=p{i++;a[i],a[j]=a[j],a[i]}};a[i+1],a[hi]=a[hi],a[i+1];timeQuick(a,lo,i);timeQuick(a,i+2,hi) }
func timeMerge(a []int) []int { if len(a)<=1{return a};m:=len(a)/2;l:=timeMerge(append([]int{},a[:m]...));r:=timeMerge(append([]int{},a[m:]...));res:=make([]int,0,len(a));i,j:=0,0;for i<len(l)&&j<len(r){if l[i]<=r[j]{res=append(res,l[i]);i++}else{res=append(res,r[j]);j++}};return append(append(res,l[i:]...),r[j:]...) }
