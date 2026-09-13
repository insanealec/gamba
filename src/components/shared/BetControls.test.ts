import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BetControls from './BetControls.vue'

function mountWith(modelValue: number, balance: number, disabled = false) {
  return mount(BetControls, { props: { modelValue, balance, disabled } })
}

describe('BetControls', () => {
  it('Max emits the full balance when balance is a whole number', async () => {
    const wrapper = mountWith(10, 500)
    await wrapper.find('button.chip:last-child').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([500])
  })

  it(
    'regression: Max emits the exact fractional balance when balance is under 1 credit, ' +
      'instead of rounding up to a minimum bet of 1 (this soft-locked runs before it was fixed)',
    async () => {
      const wrapper = mountWith(10, 0.063)
      const maxButton = wrapper.find('button.chip:last-child')
      expect(maxButton.attributes('disabled')).toBeUndefined() // still biddable
      await maxButton.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0.063])
    },
  )

  it('Max is disabled and inert when balance is exactly 0', async () => {
    const wrapper = mountWith(10, 0)
    const maxButton = wrapper.find('button.chip:last-child')
    expect(maxButton.attributes('disabled')).toBeDefined()
  })

  it('a preset chip above the balance is disabled', () => {
    const wrapper = mountWith(10, 30)
    const chips = wrapper.findAll('button.chip')
    // presets are [10, 25, 50, 100]; only 10 and 25 fit inside a 30-credit balance
    expect(chips[0].attributes('disabled')).toBeUndefined() // 10
    expect(chips[1].attributes('disabled')).toBeUndefined() // 25
    expect(chips[2].attributes('disabled')).toBeDefined() // 50
    expect(chips[3].attributes('disabled')).toBeDefined() // 100
  })

  it('clicking an affordable preset emits that exact amount', async () => {
    const wrapper = mountWith(10, 500)
    await wrapper.findAll('button.chip')[1].trigger('click') // 25
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([25])
  })

  it('typing a value into the input clamps it to the balance', async () => {
    const wrapper = mountWith(10, 50)
    const input = wrapper.find('input[type="number"]')
    await input.setValue('9999')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([50])
  })

  it('an empty input value coerces to 0 and clamps up to the minimum bet of 1', async () => {
    const wrapper = mountWith(10, 50)
    const input = wrapper.find('input[type="number"]')
    await input.setValue('')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
  })

  it('disabled=true disables every control regardless of balance', () => {
    const wrapper = mountWith(10, 500, true)
    for (const chip of wrapper.findAll('button.chip')) {
      expect(chip.attributes('disabled')).toBeDefined()
    }
    expect(wrapper.find('input[type="number"]').attributes('disabled')).toBeDefined()
  })
})
