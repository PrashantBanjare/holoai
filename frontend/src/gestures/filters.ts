/** Exponential moving average: smooths jittery values. Lower alpha = smoother but slower. */
export class Ema {
  private value: number | null = null
  private alpha: number

  constructor(alpha: number) {
    this.alpha = alpha
  }

  next(x: number) {
    this.value = this.value === null ? x : this.value + this.alpha * (x - this.value)
    return this.value
  }

  reset() {
    this.value = null
  }
}

/**
 * Debounce for discrete states: a new state must be seen for N consecutive
 * frames before it replaces the current one. Single noisy frames are ignored.
 */
export class Debouncer<T> {
  current: T
  private candidate: T
  private count = 0
  private framesToSwitch: number

  constructor(current: T, framesToSwitch: number) {
    this.current = current
    this.candidate = current
    this.framesToSwitch = framesToSwitch
  }

  update(raw: T): T {
    if (raw === this.current) {
      this.candidate = raw
      this.count = 0
      return this.current
    }
    if (raw === this.candidate) {
      this.count++
    } else {
      this.candidate = raw
      this.count = 1
    }
    if (this.count >= this.framesToSwitch) {
      this.current = this.candidate
      this.count = 0
    }
    return this.current
  }
}
