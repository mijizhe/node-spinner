/**
 * 开发编译
 */

import { default as rollupPluginAlias } from "@rollup/plugin-alias"
import { default as rollupPluginRun } from "@rollup/plugin-run"
import { default as rollupPluginTypescript } from "@rollup/plugin-typescript"
import { mkdir, stat, writeFile } from "fs/promises"
import { builtinModules } from "module"
import { EOL } from "os"
import { resolve as resolvePath } from "path"
import { watch } from "rollup"

/**
 * 缓存目录
 */
const cachePath = "node_modules/.cache"

/**
 * 缓存包定义文件目录
 */
const cachePkgFilePath = resolvePath(cachePath, "package.json")

// 创建输出目录
try {
  await stat(cachePkgFilePath)
} catch {
  await mkdir(cachePath, { recursive: true })
  await writeFile(cachePkgFilePath, JSON.stringify({ type: "module" }))
}

/**
 * 打包监视器
 */
const watcher = watch(
  {
    input: {
      app: "src/main.ts",
    },
    output: {
      dir: resolvePath(cachePath, ".dev"),
    },
    plugins: [
      rollupPluginAlias({
        entries: {
          "@": resolvePath("src"),
        },
      }),
      rollupPluginTypescript(),
      rollupPluginRun(),
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
  },
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
      break
    }
  }
})
