import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import merge from 'deepmerge-json'
import extend from 'deep-extend'

declare module 'fastify' {
  interface FastifyInstance {
    mergeSchema<
      S extends { [key: string]: any, $ref?: string } = any, 
      T extends { [key: string]: any, $id?: string } = any,
      U = any
    >(jsonSchema: { source: S, with: T }): U

    extendSchema<
      S extends { [key: string]: any, $ref?: string } = any, 
      T extends { [key: string]: any, $id?: string } = any,
      U = any
    >(jsonSchema: { source: S, with: T }): U
  }
}

async function schemaPlugin(fastify: FastifyInstance) {
  const counter = id()

  fastify.decorate('mergeSchema', function(this: FastifyInstance, jsonSchema: any) {
    const { source, with: target } = jsonSchema
    const mergeSource = source.$ref ? this.getSchema(source.$ref.replace('#', '')) : source

    if (!target.$id) {
      target.$id = generateId(mergeSource, counter)
    }

    return merge(mergeSource, target)
  })

  fastify.decorate('extendSchema', function(this: FastifyInstance, jsonSchema: any) {
    const { source, with: target } = jsonSchema
    const extendSource = source.$ref ? this.getSchema(source.$ref.replace('#', '')) : source

    if (!target.$id) {
      target.$id = generateId(extendSource, counter)
    }

    return extend({}, extendSource, target)
  })
}

function id() {
  let count = 0

  return {
    incr() {
      count = count + 1

      return count
    }
  }
}

function generateId(source: any, counter: { incr: () => number }) {
  return `${source.$id}.extended-schema-${counter.incr()}`
}

export default fp(schemaPlugin)
