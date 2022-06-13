/**
 * spinner
 */
import type { BarGenerator } from "@/bar"
import { dim, green, red } from "@mijizhe/ansi-escape-sequences/colors"
import { newTerminal } from "@mijizhe/ansi-escape-sequences/terminal"
import { EventEmitter } from "events"
import { setTimeout as sleep } from "timers/promises"
import { format } from "util"

/**
 * spinner state enum
 */
export enum SpinnerState {
  Pending = 0,
  Started = 1,
  Stopped = 2,
}

/**
 * spinner class
 */
export class Spinner {
  /**
   * event emitter
   */
  #eventEmitter = new EventEmitter()

  /**
   * terminal
   */
  #terminal = newTerminal()

  /**
   * state
   */
  #state = SpinnerState.Pending

  /**
   * sigint signal handler
   */
  #sigintHandler?: () => void

  /**
   * bar generator
   */
  #barGenerator: BarGenerator

  /**
   * frame duration
   */
  #frameDuration: number

  /**
   * text
   */
  #text = ""

  /**
   * constructor
   */
  constructor(
    barGenerator: BarGenerator,
    frameDuration = 80,
  ) {
    this.#barGenerator = barGenerator
    this.#frameDuration = frameDuration
  }

  /**
   * set text
   */
  #setText(texts: string[]) {
    this.#text = dim(
      texts
        .join(" ")
        .replaceAll("\r\n", "\n")
        .replaceAll("\r", "\n"),
    )
  }

  /**
   * state getter
   */
  get state() {
    return this.#state
  }

  /**
   * start the spinner
   */
  async start(...texts: string[]) {
    if (this.#state === SpinnerState.Started) {
      return
    }
    this.#state = SpinnerState.Started
    this.#setText(texts)
    await this
      .#terminal
      .cursorHide()
      .cursorLeft()
      .cursorSavePosition()
      .write()
    this.#sigintHandler = () => {
      this
        .#terminal
        .cursorRestorePosition()
        .eraseDown()
        .cursorShow()
        .write()
        .then(() => process.exit())
        .catch(undefined)
    }
    process.on("SIGINT", this.#sigintHandler)
    ;(async () => {
      while (this.#state === SpinnerState.Started) {
        await this
          .#terminal
          .cursorRestorePosition()
          .eraseLine()
          .text(this.#barGenerator(), this.#text)
          .eraseDown()
          .write()
        this.#eventEmitter.emit("DISPLAYED")
        await sleep(this.#frameDuration)
      }
      await this
        .#terminal
        .cursorRestorePosition()
        .eraseDown()
        .cursorShow()
        .write()
      process.off("SIGINT", this.#sigintHandler)
      this.#eventEmitter.emit("STOPPED")
    })()
      .catch((err) => {
        throw err
      })
  }

  /**
   * stop the spinner
   */
  async stop() {
    if (this.#state === SpinnerState.Started) {
      process.removeListener("SIGINT", this.#sigintHandler)
      this.#state = SpinnerState.Stopped
      await new Promise((resolve) => this.#eventEmitter.once("STOPPED", resolve))
    }
  }

  /**
   * display text to spinner
   */
  async display(...texts: string[]) {
    if (this.#state === SpinnerState.Started) {
      this.#setText(texts)
      await new Promise((resolve) => this.#eventEmitter.once("DISPLAYED", resolve))
    }
  }

  /**
   * stop the spinnner and output success
   */
  async succeed(...texts: string[]) {
    await this.stop()
    process.stdout.write(format("%s %s\n", green("✔"), texts.join(" ")))
  }

  /**
   * stop the spinner and output failure
   */
  async fail(...texts: string[]) {
    await this.stop()
    process.stdout.write(format("%s %s\n", red("✖"), texts.join(" ")))
  }
}

/**
 * new a spinner
 */
export const newSpinner = (barGenerator: BarGenerator, frameDuration = 80) => new Spinner(barGenerator, frameDuration)
