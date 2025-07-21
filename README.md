# yl-bff-vue3
YIueil's 的 vue3 前端框架。

> NodeJS: 20.14.5
> 
> PNPM: 10.13.0
> 
> Vue3: 3.4.29

## 1 启动项目
### 1.1 依赖安装
```bash
pnpm install
```

### 1.2 启动项目
默认在端口`3000`启动
```bash
pnpm run dev
```

## 2 框架功能
### 2.1 Iconify 组件集成
> [Iconify](https://icon-sets.iconify.design) 是一个集成了大量icon的开源图标项目。
>
> [官方文档](https://iconify.design/docs/icon-components/vue/) 和Vue的集成方式。
> 
> // TODO 通过 UnoCss 使用。

#### 在线使用
这种方式要引入在线图标，会通过网络方式加载图标。离线环境下无法使用。
```vue
import { Icon } from '@iconify/vue'
<Icon icon="mdi:home" width="24" height="24" />
```

#### 离线使用
该方式为按需加载，使用了自动导入避免了手动的import。
```vue
<!-- 组件的名字为 <i开头>-<图标集名>-<图标名> -->
<i-mdi-home width="32" height="32" color="red" />
```

#### 自定义SVG图标
[svg-import.ts](src/core/svg-import.ts)这个目录下的这个文件中，通过iconify中提供的方法添加了本地图标。
1. 添加svg到@/assets/images/svg/目录下。
2. 通过node执行json生成脚本[svg-json-generate.ts](src/scripts/svg-json-generate.ts)。
3. 由svg-import.ts中的代码引入。
4. 在代码中使用。
```vue
import { Icon } from '@iconify/vue'
<Icon icon="mdi:home" width="24" height="24" /> 
```

### 2.2 unplugin 相关插件
通过 unplugin 插件实现 vue 的声明自动导入。
- [x] iconify图标自动导入。
- [x] vue、vue-router相关API自动声明导入。

### 2.3 元素拖拽功能
集成 [vue-draggable-plus](https://vue-draggable-plus.pages.dev) 实现列表元素拖拽排序。

使用 [vue3-draggable-resizable](https://github.com/a7650/vue3-draggable-resizable/blob/main/docs/document_zh.md) 实现单个元素的拖拽和元素大小缩放。

### 2.4 模态框组件
定制的模态框组件[YlModal.vue](src/components/YlModal.vue)。
- [x] 拖拽
- [x] 缩放
- [x] 最大最小化
- [ ] API创建模态框
- [ ] 移动端优化
- [ ] 模态框列表

### 3 VueUse 引入使用
VueUse是基于CompositionAPI的一套实用函数集合。
