import { cleanupSVG, importDirectorySync, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import * as fs from 'node:fs'

const config = {
  // 单色图标
  singleSvgDirPath: '../assets/images/svg/single',
  // 多彩图标
  multiSvgDirPath: '../assets/images/svg/multi',
  // 单色生成路径
  outputSingleJsonFile: '../assets/json/singleJsonFile.json',
  // 多彩生成路径
  outputMultiJsonFile: '../assets/json/multiJsonFile.json'
}
// Import icons
const singleIconSet = importDirectorySync(config.singleSvgDirPath, {
  prefix: 'custom'
})

const multiIconSet = importDirectorySync(config.multiSvgDirPath, {
  prefix: 'custom'
})

// 单色图标处理
singleIconSet.forEachSync((name, type) => {
  if (type !== 'icon') {
    return
  }

  const svg = singleIconSet.toSVG(name)
  if (!svg) {
    // Invalid icon
    singleIconSet.remove(name)
    return
  }

  // Clean up and optimise icons
  try {
    // Clean up icon code
    cleanupSVG(svg)

    // 如果要生成单色svg图标则执行该代码
    parseColors(svg, {
      defaultColor: 'currentColor',
      callback: (attr, colorStr, color) => {
        return !color || isEmptyColor(color) ? colorStr : 'currentColor'
      }
    })

    // Optimise
    runSVGO(svg)
  } catch (err) {
    // Invalid icon
    console.error(`Error parsing ${name}:`, err)
    singleIconSet.remove(name)
    return
  }

  // Update icon
  singleIconSet.fromSVG(name, svg)
})

// 多色图标处理
multiIconSet.forEachSync((name, type) => {
  if (type !== 'icon') {
    return
  }

  const svg = multiIconSet.toSVG(name)
  if (!svg) {
    // Invalid icon
    multiIconSet.remove(name)
    return
  }

  // Clean up and optimise icons
  try {
    // Clean up icon code
    cleanupSVG(svg)

    // Optimise
    runSVGO(svg)
  } catch (err) {
    // Invalid icon
    console.error(`Error parsing ${name}:`, err)
    multiIconSet.remove(name)
    return
  }

  // Update icon
  multiIconSet.fromSVG(name, svg)
})

// Export
console.log(multiIconSet.export())

fs.writeFileSync(config.outputSingleJsonFile, JSON.stringify(singleIconSet.export()))
fs.writeFileSync(config.outputMultiJsonFile, JSON.stringify(multiIconSet.export()))
