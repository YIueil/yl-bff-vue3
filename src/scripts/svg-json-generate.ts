import {
  cleanupSVG,
  importDirectorySync,
  isEmptyColor,
  parseColors,
  runSVGO,
  type IconSet
} from '@iconify/tools'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const config = {
  // 单色图标
  singleSvgDirPath: resolve(scriptDirectory, '../assets/images/svg/single'),
  // 多彩图标
  multiSvgDirPath: resolve(scriptDirectory, '../assets/images/svg/multi'),
  // 单色生成路径
  outputSingleJsonFile: resolve(scriptDirectory, '../assets/json/singleJsonFile.json'),
  // 多彩生成路径
  outputMultiJsonFile: resolve(scriptDirectory, '../assets/json/multiJsonFile.json')
}

function processIconSet(iconSet: IconSet, monochrome: boolean) {
  const invalidIcons: string[] = []

  iconSet.forEachSync((name, type) => {
    if (type !== 'icon') {
      return
    }

    const svg = iconSet.toSVG(name)
    if (!svg) {
      invalidIcons.push(name)
      iconSet.remove(name)
      return
    }

    try {
      cleanupSVG(svg)

      if (monochrome) {
        parseColors(svg, {
          defaultColor: 'currentColor',
          callback: (_attr, colorString, color) => {
            return !color || isEmptyColor(color) ? colorString : 'currentColor'
          }
        })
      }

      runSVGO(svg)
      iconSet.fromSVG(name, svg)
    } catch (error) {
      console.error(`Error parsing ${name}:`, error)
      invalidIcons.push(name)
      iconSet.remove(name)
    }
  })

  if (invalidIcons.length > 0) {
    throw new Error(`Failed to generate icons: ${invalidIcons.join(', ')}`)
  }
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJsonValue((value as Record<string, unknown>)[key])])
    )
  }

  return value
}

function serializeIconSet(iconSet: IconSet) {
  const data = iconSet.export()
  delete data.lastModified

  return `${JSON.stringify(sortJsonValue(data))}\n`
}

const singleIconSet = importDirectorySync(config.singleSvgDirPath, {
  prefix: 'custom'
})
const multiIconSet = importDirectorySync(config.multiSvgDirPath, {
  prefix: 'custom'
})

processIconSet(singleIconSet, true)
processIconSet(multiIconSet, false)

writeFileSync(config.outputSingleJsonFile, serializeIconSet(singleIconSet), 'utf8')
writeFileSync(config.outputMultiJsonFile, serializeIconSet(multiIconSet), 'utf8')

console.log(
  `Generated ${singleIconSet.count()} monochrome icons and ${multiIconSet.count()} multicolor icons.`
)
