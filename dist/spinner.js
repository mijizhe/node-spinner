import { dim, green, red } from "@mijizhe/ansi-escape-sequences/colors"
import { Terminal } from "@mijizhe/ansi-escape-sequences/terminal"
import { EventEmitter } from "events"
import { setTimeout } from "timers/promises"
import { format } from "util"

/**
 * spinner state enum
 */
var SpinnerState
;(function(SpinnerState) {
  SpinnerState[SpinnerState["Pending"] = 0] = "Pending"
  SpinnerState[SpinnerState["Started"] = 1] = "Started"
  SpinnerState[SpinnerState["Stoped"] = 2] = "Stoped"
})(SpinnerState || (SpinnerState = {}))
/**
 * spinner class
 */
class Spinner {
  /**
   * event emitter
   */
  #eventEmitter = new EventEmitter()
  /**
   * terminal
   */
  #terminal = new Terminal()
  /**
   * state
   */
  #state = SpinnerState.Pending
  /**
   * sigint signal handler
   */
  #sigintHandler
  /**
   * bar generator
   */
  #barGenerator
  /**
   * frame duration
   */
  #frameDuration
  /**
   * text
   */
  #text = ""
  /**
   * constructor
   */
  constructor(barGenerator, frameDuration = 80) {
    this.#barGenerator = barGenerator
    this.#frameDuration = frameDuration
  }
  /**
   * set text
   */
  #setText(texts) {
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
  async start(...texts) {
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
        await setTimeout(this.#frameDuration)
      }
      await this
        .#terminal
        .cursorRestorePosition()
        .eraseDown()
        .cursorShow()
        .write()
      process.off("SIGINT", this.#sigintHandler)
      this.#eventEmitter.emit("STOPED")
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
      this.#state = SpinnerState.Stoped
      await new Promise((resolve) => this.#eventEmitter.once("STOPED", resolve))
    }
  }
  /**
   * display text to spinner
   */
  async display(...texts) {
    if (this.#state === SpinnerState.Started) {
      this.#setText(texts)
      await new Promise((resolve) => this.#eventEmitter.once("DISPLAYED", resolve))
    }
  }
  /**
   * stop the spinnner and output success
   */
  async succeed(...texts) {
    await this.stop()
    process.stdout.write(format("%s %s\n", green("✔"), texts.join(" ")))
  }
  /**
   * stop the spinner and output failure
   */
  async fail(...texts) {
    await this.stop()
    process.stdout.write(format("%s %s\n", red("✖"), texts.join(" ")))
  }
}
/**
 * new a spinner
 */
const newSpinner = (barGenerator, frameDuration = 80) => new Spinner(barGenerator, frameDuration)

export { newSpinner, Spinner, SpinnerState }
