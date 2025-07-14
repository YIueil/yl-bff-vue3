import { addCollection, listIcons } from '@iconify/vue';
// 单色图标集
import singleJsonFile from '@/assets/json/singleJsonFile.json'
// 多彩图标集合
import monotoneJsonFile from '@/assets/json/multiJsonFile.json'

addCollection(singleJsonFile)
addCollection(monotoneJsonFile)

console.log('可用自定义图标:', listIcons())