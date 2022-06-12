/**
 * 打包编译
 */

import { default as rollupPluginAlias } from "@rollup/plugin-alias"
import { default as rollupPluginTypescript } from "@rollup/plugin-typescript"
import { readdir, rm } from "fs/promises"
import { builtinModules } from "module"
import { EOL } from "os"
import { resolve as resolvePath } from "path"
import { watch } from "rollup"
import { default as rollupPluginDts } from "rollup-plugin-dts"

/**
 * 分发目录
 */
const distPath = "dist"

// 清空分发目录
try {
  for (const i of await readdir(distPath)) {
    await rm(resolvePath(distPath, i), { force: true, recursive: true })
  }
} catch {
  //
}

/**
 * 创建选项
 */
const createOptions = (plugins) => ({
  input: {
    spinner: "src/spinner.ts",
    colordots: "src/colordots.ts",
  },
  output: {
    dir: "dist",
  },
  plugins: [
    rollupPluginAlias({
      entries: {
        "@": resolvePath("src"),
      },
    }),
    ...plugins,
  ],
  external(id) {
    if (builtinModules.includes(id)) {
      return true
    }
    if (id.startsWith("node:")) {
      return true
    }
    if (id.startsWith(resolvePath("node_modules"))) {
      return true
    }
  },
  onwarn() {},
})

/**
 * 打包监视器
 */
const watcher = watch(
  [
    createOptions([rollupPluginDts()]),
    createOptions([rollupPluginTypescript()]),
  ],
)

/**
 * 打包事件
 */
watcher.on("event", ({ code, error }) => {
  switch (code) {
    case "BUNDLE_START": {
      console.clear()
      console.log("🚀", "\x1b[36m" + "编译中…" + "\x1b[39m")
      break
    }
    case "ERROR": {
      console.clear()
      console.error("🚨", "\x1b[31m" + "编译失败！" + "\x1b[39m" + EOL)
      console.error(error)
      break
    }
    case "BUNDLE_END": {
      console.clear()
      console.log("🎉", "\x1b[32m" + "编译完成！" + "\x1b[39m")
      break
    }
    case "END": {
      process.exit()
    }
  }
})
