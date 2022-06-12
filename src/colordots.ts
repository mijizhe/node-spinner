/**
 * colordots
 */
import type { BarGenerator } from "@/bar"
import { blue, cyan, green, magenta, red, yellow } from "@mijizhe/ansi-escape-sequences/colors"

/**
 * new a colordots bar generator
 */
export const newColordotsBarGenerator = (): BarGenerator => {
  const frames = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"]
  const colors = [red, green, yellow, blue, magenta, cyan]
  let frameIndex = 0
  let colorIndex = 0
  return () => {
    const frame = frames.at(frameIndex)
    const color = colors.at(colorIndex)
    frameIndex = (frameIndex + 1) % frames.length
    colorIndex = (colorIndex + 1) % colors.length
    return color(frame)
  }
}
