import { B as BarGenerator } from "./bar-639b1c92.js"

/**
 * spinner
 */

/**
 * spinner state enum
 */
declare enum SpinnerState {
  Pending = 0,
  Started = 1,
  Stoped = 2,
}
/**
 * spinner class
 */
declare class Spinner {
  #private
  /**
   * constructor
   */
  constructor(barGenerator: BarGenerator, frameDuration?: number)
  /**
   * state getter
   */
  get state(): SpinnerState
  /**
   * start the spinner
   */
  start(...texts: string[]): Promise<void>
  /**
   * stop the spinner
   */
  stop(): Promise<void>
  /**
   * display text to spinner
   */
  display(...texts: string[]): Promise<void>
  /**
   * stop the spinnner and output success
   */
  succeed(...texts: string[]): Promise<void>
  /**
   * stop the spinner and output failure
   */
  fail(...texts: string[]): Promise<void>
}

export { Spinner, SpinnerState }
