import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

const canvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
}

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => canvasContext)

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  vi.clearAllMocks()
})
