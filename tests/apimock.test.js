import { describe, it, expect } from 'vitest'
import apimock from '../src/services/apimock.js'

describe('apimock service', () => {
  it('provides all blueprints and filters them by author and name', async () => {
    const all = await apimock.getAll()
    const byAuthor = await apimock.getByAuthor('john')
    const blueprint = await apimock.getByAuthorAndName('john', 'house')

    expect(all.length).toBeGreaterThanOrEqual(3)
    expect(byAuthor.map((item) => item.name)).toEqual(['house', 'garage'])
    expect(blueprint).toMatchObject({ author: 'john', name: 'house' })
    expect(await apimock.getByAuthorAndName('john', 'missing')).toBeNull()
  })

  it('creates a blueprint in memory and rejects a duplicate', async () => {
    const blueprint = {
      author: `test-${Date.now()}-${Math.random()}`,
      name: 'temporary',
      points: [{ x: 1, y: 2 }],
    }
    const created = await apimock.create(blueprint)

    expect(created).toEqual(blueprint)
    expect(await apimock.getByAuthor(blueprint.author)).toEqual([blueprint])
    await expect(apimock.create(blueprint)).rejects.toThrow(/Ya existe/)
  })
})
