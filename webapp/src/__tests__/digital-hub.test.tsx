import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { DigitalHub } from '../main'

describe('DigitalHub', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'vi'
  })

  it('renders all service groups and switches between VI, EN and Chinese', () => {
    const { container } = render(<DigitalHub />)

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Một điểm truy cập')
    expect(container.querySelectorAll('.hub-card')).toHaveLength(5)

    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('One gateway')
    expect(document.documentElement.lang).toBe('en')

    fireEvent.click(screen.getByRole('button', { name: '中文' }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('一站访问')
    expect(document.documentElement.lang).toBe('zh-CN')
  })
})
