import { describe, it, expect, afterEach, afterAll, vi } from 'vitest'
import { nextTick } from 'vue'
import { Modal } from '@/utils/modal-manager'
import YlModalHost from '@/components/Modal/YlModalHost.vue'
import AboutContent from '@/components/AboutContent.vue'
import { mountWithApp, cleanupBody } from './helpers'

describe('YlModalHost 集成', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  afterEach(() => {
    Modal.closeAll()
    cleanupBody()
  })

  afterAll(() => warnSpy.mockRestore())

  // 1. 打开（集成：mount Host 后 open() 渲染到 DOM）
  it('open() 后 DOM 出现 modal-wrapper', async () => {
    mountWithApp(YlModalHost)
    Modal.open({ key: 'k1', title: '测试标题' })
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.modal-wrapper')).toBeTruthy()
    expect(document.body.textContent).toContain('测试标题')
  })

  // 5. 遮罩关闭
  it('clickMaskClose=true 点击遮罩触发 close', async () => {
    mountWithApp(YlModalHost)
    Modal.open({ key: 'k1', clickMaskClose: true })
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.modal-mask') as HTMLElement
    expect(mask).toBeTruthy()
    mask.click()
    await nextTick()
    expect(Modal.getModal('k1')).toBeUndefined()
  })

  it('clickMaskClose=false 点击遮罩不关闭', async () => {
    mountWithApp(YlModalHost)
    Modal.open({ key: 'k1', clickMaskClose: false })
    await nextTick()
    await nextTick()
    const mask = document.body.querySelector('.modal-mask') as HTMLElement
    mask.click()
    await nextTick()
    expect(Modal.getModal('k1')).toBeDefined()
  })

  // 6. 自定义事件（集成：footer 按钮点击）
  it('footer 按钮 click 触发 on 回调', async () => {
    const cb = vi.fn()
    mountWithApp(YlModalHost)
    Modal.open({
      key: 'k1',
      footer: [{ name: '发送', eventName: 'send', icon: '', type: 'primary' }],
      on: { send: cb }
    })
    await nextTick()
    await nextTick()
    const btn = document.body.querySelector('.ant-btn-primary') as HTMLButtonElement
    expect(btn).toBeTruthy()
    btn.click()
    expect(cb).toHaveBeenCalled()
  })

  // 7. 内容组件 expose 调用
  it('contentComponent 暴露 increment/getCount', async () => {
    mountWithApp(YlModalHost)
    const inst = Modal.open({
      key: 'k1',
      component: AboutContent,
      componentProps: { userName: 'tester' }
    })
    await nextTick()
    await nextTick()
    expect(inst.contentComponent).toBeTruthy()
    expect(inst.contentComponent?.getCount()).toBe(1)
    inst.contentComponent?.increment()
    expect(inst.contentComponent?.getCount()).toBe(2)
    expect(inst.contentComponent?.count).toBe(2)
  })
})
