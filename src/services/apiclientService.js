import api from './apiClient.js'

const blueprintsPath = '/v1/blueprints'

function unwrapResponse(response) {
  return response.data?.data ?? response.data
}

function ensureList(data) {
  if (!Array.isArray(data)) {
    throw new Error('La respuesta del servidor no contiene una lista de planos.')
  }
  return data
}

const apiclient = {
  async getAll() {
    const response = await api.get(blueprintsPath)
    return ensureList(unwrapResponse(response))
  },

  async getByAuthor(author) {
    try {
      const response = await api.get(`${blueprintsPath}/${encodeURIComponent(author)}`)
      return ensureList(unwrapResponse(response))
    } catch (error) {
      if (error.response?.status === 404) return []
      throw error
    }
  },

  async getByAuthorAndName(author, name) {
    try {
      const response = await api.get(
        `${blueprintsPath}/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
      )
      return unwrapResponse(response)
    } catch (error) {
      if (error.response?.status === 404) return null
      throw error
    }
  },

  async create(blueprint) {
    const response = await api.post(blueprintsPath, blueprint)
    return unwrapResponse(response)
  },

  async update(author, name, blueprint) {
    const response = await api.put(
      `${blueprintsPath}/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
      blueprint,
    )
    return unwrapResponse(response)
  },

  async delete(author, name) {
    await api.delete(
      `${blueprintsPath}/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return { author, name }
  },
}

export default apiclient
