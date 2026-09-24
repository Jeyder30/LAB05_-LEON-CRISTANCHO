import { beforeEach, describe, it, expect, vi } from 'vitest'
import api from '../src/services/apiClient.js'
import apiclient from '../src/services/apiclientService.js'

vi.mock('../src/services/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('apiclient service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('unwraps the LAB03 response envelope for getAll', async () => {
    const blueprints = [{ author: 'john', name: 'house', points: [] }]
    api.get.mockResolvedValue({ data: { code: 200, message: 'Success', data: blueprints } })

    await expect(apiclient.getAll()).resolves.toEqual(blueprints)
    expect(api.get).toHaveBeenCalledWith('/v1/blueprints')
  })

  it('encodes the author and treats a missing author as an empty list', async () => {
    const blueprints = [{ author: 'john doe', name: 'house', points: [] }]
    api.get.mockResolvedValueOnce({ data: { data: blueprints } })
    await expect(apiclient.getByAuthor('john doe')).resolves.toEqual(blueprints)
    expect(api.get).toHaveBeenLastCalledWith('/v1/blueprints/john%20doe')

    api.get.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(apiclient.getByAuthor('unknown')).resolves.toEqual([])
  })

  it('gets one blueprint and creates a blueprint through Axios', async () => {
    const blueprint = { author: 'john', name: 'house', points: [{ x: 1, y: 2 }] }
    api.get.mockResolvedValueOnce({ data: { data: blueprint } })
    await expect(apiclient.getByAuthorAndName('john', 'house')).resolves.toEqual(blueprint)

    api.post.mockResolvedValueOnce({ data: { data: blueprint } })
    await expect(apiclient.create(blueprint)).resolves.toEqual(blueprint)
    expect(api.post).toHaveBeenCalledWith('/v1/blueprints', blueprint)
  })
})
