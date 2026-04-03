package algorithms

import "fmt"

type SortSnap struct {
	Arr  []int  `json:"arr"`
	Hl   []int  `json:"hl"`
	Sorted []bool `json:"sorted"`
	Pivot int    `json:"pivot"`
	Sw   int    `json:"sw"`
	Cm   int    `json:"cm"`
	Msg  string `json:"msg"`
}

func cp(a []int) []int  { b := make([]int, len(a)); copy(b, a); return b }
func cb(a []bool) []bool { b := make([]bool, len(a)); copy(b, a); return b }

func BubbleSort(input []int) []SortSnap {
	a := cp(input); n := len(a)
	sorted := make([]bool, n)
	var snaps []SortSnap; sw, cm := 0, 0
	snaps = append(snaps, SortSnap{cp(a), nil, cb(sorted), -1, sw, cm, fmt.Sprintf("Bubble Sort — n=%d", n)})
	for i := 0; i < n-1; i++ {
		swp := false
		for j := 0; j < n-i-1; j++ {
			cm++
			snaps = append(snaps, SortSnap{cp(a), []int{j, j+1}, cb(sorted), -1, sw, cm, fmt.Sprintf("Pass %d: Compare a[%d]=%d and a[%d]=%d", i+1, j, a[j], j+1, a[j+1])})
			if a[j] > a[j+1] {
				a[j], a[j+1] = a[j+1], a[j]; sw++; swp = true
				snaps = append(snaps, SortSnap{cp(a), []int{j, j+1}, cb(sorted), -1, sw, cm, fmt.Sprintf("Swap a[%d]↔a[%d] → [%d, %d]", j, j+1, a[j], a[j+1])})
			}
		}
		sorted[n-i-1] = true
		snaps = append(snaps, SortSnap{cp(a), nil, cb(sorted), -1, sw, cm, fmt.Sprintf("Pass %d done. a[%d]=%d in final position.", i+1, n-i-1, a[n-i-1])})
		if !swp {
			for k := 0; k < n-i-1; k++ { sorted[k] = true }
			snaps = append(snaps, SortSnap{cp(a), nil, cb(sorted), -1, sw, cm, "Early exit: no swaps. Array sorted!"})
			return snaps
		}
	}
	sorted[0] = true
	snaps = append(snaps, SortSnap{cp(a), nil, allTrue(n), -1, sw, cm, fmt.Sprintf("Complete! Swaps: %d, Comparisons: %d", sw, cm)})
	return snaps
}

func SelectionSort(input []int) []SortSnap {
	a := cp(input); n := len(a)
	sorted := make([]bool, n)
	var snaps []SortSnap; sw, cm := 0, 0
	snaps = append(snaps, SortSnap{cp(a), nil, cb(sorted), -1, sw, cm, fmt.Sprintf("Selection Sort — n=%d", n)})
	for i := 0; i < n-1; i++ {
		minIdx := i
		snaps = append(snaps, SortSnap{cp(a), []int{i}, cb(sorted), i, sw, cm, fmt.Sprintf("Round %d: Assume min=a[%d]=%d", i+1, i, a[i])})
		for j := i + 1; j < n; j++ {
			cm++
			snaps = append(snaps, SortSnap{cp(a), []int{minIdx, j}, cb(sorted), minIdx, sw, cm, fmt.Sprintf("Compare a[%d]=%d vs min a[%d]=%d", j, a[j], minIdx, a[minIdx])})
			if a[j] < a[minIdx] {
				minIdx = j
				snaps = append(snaps, SortSnap{cp(a), []int{minIdx}, cb(sorted), minIdx, sw, cm, fmt.Sprintf("New min: a[%d]=%d", minIdx, a[minIdx])})
			}
		}
		if minIdx != i {
			a[i], a[minIdx] = a[minIdx], a[i]; sw++
			snaps = append(snaps, SortSnap{cp(a), []int{i, minIdx}, cb(sorted), -1, sw, cm, fmt.Sprintf("Swap min a[%d] → position %d", minIdx, i)})
		} else {
			snaps = append(snaps, SortSnap{cp(a), []int{i}, cb(sorted), -1, sw, cm, fmt.Sprintf("a[%d]=%d already minimum — no swap", i, a[i])})
		}
		sorted[i] = true
		snaps = append(snaps, SortSnap{cp(a), nil, cb(sorted), -1, sw, cm, fmt.Sprintf("Position %d final: a[%d]=%d", i, i, a[i])})
	}
	sorted[n-1] = true
	snaps = append(snaps, SortSnap{cp(a), nil, allTrue(n), -1, sw, cm, fmt.Sprintf("Complete! Swaps: %d, Comparisons: %d", sw, cm)})
	return snaps
}

func InsertionSort(input []int) []SortSnap {
	a := cp(input); n := len(a)
	sorted := make([]bool, n); sorted[0] = true
	var snaps []SortSnap; ins, cm := 0, 0
	snaps = append(snaps, SortSnap{cp(a), []int{0}, cb(sorted), -1, ins, cm, fmt.Sprintf("Insertion Sort — n=%d. a[0]=%d trivially sorted.", n, a[0])})
	for i := 1; i < n; i++ {
		key := a[i]
		snaps = append(snaps, SortSnap{cp(a), []int{i}, cb(sorted), i, ins, cm, fmt.Sprintf("Key=a[%d]=%d. Insert into sorted [0..%d].", i, key, i-1)})
		j := i - 1
		for j >= 0 && a[j] > key {
			cm++; a[j+1] = a[j]
			snaps = append(snaps, SortSnap{cp(a), []int{j, j+1}, cb(sorted), i, ins, cm, fmt.Sprintf("a[%d]=%d > key=%d → shift right", j, a[j], key)})
			j--
		}
		if j >= 0 { cm++ }
		a[j+1] = key; ins++; sorted[i] = true
		snaps = append(snaps, SortSnap{cp(a), []int{j+1}, cb(sorted), -1, ins, cm, fmt.Sprintf("Place key=%d at [%d]. Sorted: [0..%d]", key, j+1, i)})
	}
	snaps = append(snaps, SortSnap{cp(a), nil, allTrue(n), -1, ins, cm, fmt.Sprintf("Complete! Comparisons: %d, Insertions: %d", cm, ins)})
	return snaps
}

func QuickSort(input []int) []SortSnap {
	a := cp(input); n := len(a)
	sorted := make([]bool, n)
	var snaps []SortSnap; sw, cm := 0, 0
	snaps = append(snaps, SortSnap{cp(a), nil, cb(sorted), -1, sw, cm, fmt.Sprintf("Quick Sort (Lomuto) — n=%d", n)})
	var qs func(lo, hi int)
	qs = func(lo, hi int) {
		if lo >= hi {
			if lo == hi && lo >= 0 && lo < n { sorted[lo] = true }
			return
		}
		pv := a[hi]
		snaps = append(snaps, SortSnap{cp(a), []int{lo, hi}, cb(sorted), hi, sw, cm, fmt.Sprintf("Partition [%d..%d]. Pivot=a[%d]=%d", lo, hi, hi, pv)})
		i := lo - 1
		for j := lo; j < hi; j++ {
			cm++
			snaps = append(snaps, SortSnap{cp(a), []int{j, hi}, cb(sorted), hi, sw, cm, fmt.Sprintf("a[%d]=%d ≤ pivot=%d?", j, a[j], pv)})
			if a[j] <= pv {
				i++
				if i != j {
					a[i], a[j] = a[j], a[i]; sw++
					snaps = append(snaps, SortSnap{cp(a), []int{i, j}, cb(sorted), hi, sw, cm, fmt.Sprintf("Yes → Swap a[%d]↔a[%d]", i, j)})
				} else {
					snaps = append(snaps, SortSnap{cp(a), []int{i}, cb(sorted), hi, sw, cm, fmt.Sprintf("Yes → a[%d] in place", i)})
				}
			}
		}
		a[i+1], a[hi] = a[hi], a[i+1]; sw++; sorted[i+1] = true
		snaps = append(snaps, SortSnap{cp(a), []int{i+1}, cb(sorted), i+1, sw, cm, fmt.Sprintf("Pivot at final index %d → a[%d]=%d sorted!", i+1, i+1, a[i+1])})
		qs(lo, i); qs(i+2, hi)
	}
	qs(0, n-1)
	snaps = append(snaps, SortSnap{cp(a), nil, allTrue(n), -1, sw, cm, fmt.Sprintf("Complete! Swaps: %d, Comparisons: %d", sw, cm)})
	return snaps
}

func allTrue(n int) []bool { b := make([]bool, n); for i := range b { b[i] = true }; return b }
