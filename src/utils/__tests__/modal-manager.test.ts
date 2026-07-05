import { describe, it, expect, afterEach, afterAll, vi } from 'vitest'
import { Modal, isModalTrustedHtml } from '@/utils/modal-manager'

describe('ModalManager', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  afterEach(() => Modal.closeAll())

  afterAll(() => warnSpy.mockRestore())

  // 1. 打开
  it('open() 创建条目并返回 ModalInstance', () => {
    const inst = Modal.open({ key: 'k1', title: 't' })
    expect(inst).toBeDefined()
    expect(inst.getKey()).toBe('k1')
    expect(Modal.getModal('k1')).toBeDefined()
  })

  // 2. 重复 key
  it('同 key 第二次 open() 不重建，仅 show，返回同一 instance', () => {
    const inst1 = Modal.open({ key: 'k1', title: 't' })
    const inst2 = Modal.open({ key: 'k1', title: 't' })
    expect(inst1).toBe(inst2)
    expect([...Modal.listModal()].length).toBe(1)
  })

  // 3. 隐藏恢复
  it('hide() 后 showModal=false，show() 后 showModal=true', () => {
    const inst = Modal.open({ key: 'k1' })
    expect(inst.showModal).toBe(true)
    inst.hide()
    expect(Modal.getModal('k1')?.showModal).toBe(false)
    Modal.show('k1')
    expect(Modal.getModal('k1')?.showModal).toBe(true)
  })

  // 4. 关闭全部
  it('closeAll() 清空所有条目', () => {
    Modal.open({ key: 'k1' })
    Modal.open({ key: 'k2' })
    Modal.closeAll()
    expect([...Modal.listModal()].length).toBe(0)
  })

  // 6. 自定义事件
  it('onEvent 派发对应 on 回调', () => {
    const cb = vi.fn()
    const on = { send: cb }
    Modal.open({ key: 'k1', on })
    Modal.onEvent('k1', 'send', on)
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ getKey: expect.any(Function) })
    )
  })

  it('onEvent 未实现的 eventName 走 console.error', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    Modal.open({ key: 'k1' })
    Modal.onEvent('k1', 'unknownEvent')
    expect(err).toHaveBeenCalled()
    err.mockRestore()
  })

  it('onEvent eventName=close 触发 close', () => {
    Modal.open({ key: 'k1' })
    Modal.onEvent('k1', 'close')
    expect(Modal.getModal('k1')).toBeUndefined()
  })

  // trustedHtml
  it('trustedHtml() 返回带品牌的对象，isModalTrustedHtml 识别', () => {
    const html = Modal.trustedHtml('<b>x</b>')
    expect(html.html).toBe('<b>x</b>')
    expect(isModalTrustedHtml(html)).toBe(true)
    expect(isModalTrustedHtml('<b>x</b>')).toBe(false)
  })
})
