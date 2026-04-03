import { useState, useRef, useCallback, useEffect } from 'react'

export function usePlayback(snapshots) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(380)
  const timer = useRef(null)

  useEffect(() => () => clearInterval(timer.current), [])

  useEffect(() => {
    clearInterval(timer.current)
    setPlaying(false)
    setStep(0)
  }, [snapshots])

  const stop = useCallback(() => { clearInterval(timer.current); timer.current = null }, [])

  const startTimer = useCallback((spd, snaps) => {
    stop()
    timer.current = setInterval(() => {
      setStep(prev => {
        if (prev >= snaps.length - 1) { clearInterval(timer.current); setPlaying(false); return prev }
        return prev + 1
      })
    }, spd)
  }, [stop])

  const play = useCallback(() => {
    if (!snapshots?.length) return
    const s = step >= snapshots.length - 1 ? 0 : step
    setStep(s); setPlaying(true); startTimer(speed, snapshots)
  }, [snapshots, step, speed, startTimer])

  const pause = useCallback(() => { stop(); setPlaying(false) }, [stop])
  const togglePlay = useCallback(() => playing ? pause() : play(), [playing, play, pause])
  const stepFwd = useCallback(() => snapshots && setStep(s => Math.min(s+1, snapshots.length-1)), [snapshots])
  const stepBck = useCallback(() => setStep(s => Math.max(s-1, 0)), [])
  const reset = useCallback(() => { stop(); setPlaying(false); setStep(0) }, [stop])
  const jumpTo = useCallback((i) => { stop(); setPlaying(false); setStep(i) }, [stop])

  const changeSpeed = useCallback((spd) => {
    setSpeed(spd)
    if (playing && snapshots) startTimer(spd, snapshots)
  }, [playing, snapshots, startTimer])

  const total = snapshots?.length || 0
  const snap = snapshots?.[step] || null
  const atStart = step === 0
  const atEnd = step >= total - 1

  return { step, playing, speed, snap, total, atStart, atEnd,
    play, pause, togglePlay, stepFwd, stepBck, reset, jumpTo, changeSpeed }
}
