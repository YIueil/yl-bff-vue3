export * from './components/modal'

// 用于联合类型, 联合后允许访问不存在于其他联合类型的属性
export interface ComponentWithUnknownProps {
  [key: string]: any
}