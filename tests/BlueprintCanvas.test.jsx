import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas.jsx'

describe('BlueprintCanvas', () => {
  it('renders an identified 520 by 360 canvas and gets its 2D context', () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    const { container } = render(<BlueprintCanvas />)
    const canvas = container.querySelector('#blueprint-canvas')

    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('width', '520')
    expect(canvas).toHaveAttribute('height', '360')
    expect(canvas).toHaveAttribute('aria-label', 'Lienzo del blueprint actual')
    expect(getContext).toHaveBeenCalledWith('2d')
    expect(screen.getByRole('img', { name: /lienzo del blueprint actual/i })).toBe(canvas)
  })

  it('draws ordered segments and marks every valid point', () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    render(
      <BlueprintCanvas
        points={[
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ]}
      />,
    )
    const context = getContext.mock.results.at(-1).value

    expect(context.arc).toHaveBeenCalledTimes(3)
    expect(context.moveTo).toHaveBeenLastCalledWith(104, 24)
    expect(context.lineTo.mock.calls.slice(-2)).toEqual([
      [416, 24],
      [416, 336],
    ])
  })
})
