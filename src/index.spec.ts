import { expect } from 'chai'

import fastify from 'fastify'
import schemaPlugin from './'

describe('mergeSchema', () => {
  it('should exist mergeSchema function', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    await app.ready()

    expect(app.mergeSchema).is.exist
  })

  it('should merge two schema', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    await app.ready()

    const newSchema = app.mergeSchema({
      source: {
        $id: 'response.error',
        type: 'object',
        required: ['success', 'statusCode', 'errors'],
        properties: {
          success: { type: 'boolean' },
          statusCode: { type: 'integer' },
          errors: {
            type: 'array',
            items: { type: 'string', enum: ['Internal server error'] }
          }
        },
        example: {
          success: false,
          statusCode: 500,
          errors: ['Internal server error']
        },
        additionalProperties: false
      },
      with: {
        properties: {
          errors: {
            items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] }
          }
        },
        example: {
          success: false,
          statusCode: 400,
          errors: ['Wrong username or password']
        }
      }
    })

    const expected = {
      $id: 'response.error.extended-schema-1',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: { type: 'array', items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] } }
      },
      example: {
        success: false,
        statusCode: 400,
        errors: ['Wrong username or password']
      },
      additionalProperties: false
    }

    expect(newSchema).deep.equal(expected)
  })

  it('should merge two schema by ref', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    app.addSchema({
      $id: 'response.error',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: {
          type: 'array',
          items: { type: 'string', enum: ['Internal server error'] }
        }
      },
      example: {
        success: false,
        statusCode: 500,
        errors: ['Internal server error']
      },
      additionalProperties: false
    })

    await app.ready()

    const newSchema = app.mergeSchema({
      source: { $ref: 'response.error' },
      with: {
        properties: {
          errors: {
            items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] }
          }
        },
        example: {
          success: false,
          statusCode: 400,
          errors: ['Wrong username or password']
        }
      }
    })

    const expected = {
      $id: 'response.error.extended-schema-1',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: { type: 'array', items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] } }
      },
      example: {
        success: false,
        statusCode: 400,
        errors: ['Wrong username or password']
      },
      additionalProperties: false
    }

    expect(newSchema).deep.equal(expected)
  })

  it('should increment id in the final schema if id is not set in target schema', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    app.addSchema({
      $id: 'response.error',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: {
          type: 'array',
          items: { type: 'string', enum: ['Internal server error'] }
        }
      },
      example: {
        success: false,
        statusCode: 500,
        errors: ['Internal server error']
      },
      additionalProperties: false
    })

    await app.ready()

    const newSchema1 = app.mergeSchema({
      source: { $ref: 'response.error' },
      with: {
        properties: {
          errors: {
            items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] }
          }
        }
      }
    })

    const newSchema2 = app.mergeSchema({
      source: { $ref: 'response.error' },
      with: {
        example: {
          success: false,
          statusCode: 400,
          errors: ['Wrong username or password']
        }
      }
    })

    const newSchema3 = app.mergeSchema({
      source: { $ref: 'response.error' },
      with: {
        $id: 'extended-id'
      }
    })

    expect(newSchema1.$id).equal('response.error.extended-schema-1')
    expect(newSchema2.$id).equal('response.error.extended-schema-2')
    expect(newSchema3.$id).equal('extended-id')
  })
})

describe('extendSchema', () => {
  it('should exist extendSchema function', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    await app.ready()

    expect(app.extendSchema).is.exist
  })

  it('should extend two schema', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    await app.ready()

    const newSchema = app.extendSchema({
      source: {
        $id: 'response.error',
        type: 'object',
        required: ['success', 'statusCode', 'errors'],
        properties: {
          success: { type: 'boolean' },
          statusCode: { type: 'integer' },
          errors: {
            type: 'array',
            items: { type: 'string', enum: ['Internal server error'] }
          }
        },
        example: {
          success: false,
          statusCode: 500,
          errors: ['Internal server error']
        },
        additionalProperties: false
      },
      with: {
        properties: {
          errors: {
            items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] }
          }
        },
        example: {
          success: false,
          statusCode: 400,
          errors: ['Wrong username or password']
        }
      }
    })

    const expected = {
      $id: 'response.error.extended-schema-1',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: { type: 'array', items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] } }
      },
      example: {
        success: false,
        statusCode: 400,
        errors: ['Wrong username or password']
      },
      additionalProperties: false
    }

    expect(newSchema).deep.equal(expected)
  })

  it('should extend two schema by ref', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    app.addSchema({
      $id: 'response.error',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: {
          type: 'array',
          items: { type: 'string', enum: ['Internal server error'] }
        }
      },
      example: {
        success: false,
        statusCode: 500,
        errors: ['Internal server error']
      },
      additionalProperties: false
    })

    await app.ready()

    const newSchema = app.extendSchema({
      source: { $ref: 'response.error' },
      with: {
        properties: {
          errors: {
            items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] }
          }
        },
        example: {
          success: false,
          statusCode: 400,
          errors: ['Wrong username or password']
        }
      }
    })

    const expected = {
      $id: 'response.error.extended-schema-1',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: { type: 'array', items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] } }
      },
      example: {
        success: false,
        statusCode: 400,
        errors: ['Wrong username or password']
      },
      additionalProperties: false
    }

    expect(newSchema).deep.equal(expected)
  })

  it('should increment id in the final schema if id is not set in target schema', async() => {
    const app = fastify()
    app.register(schemaPlugin)

    app.addSchema({
      $id: 'response.error',
      type: 'object',
      required: ['success', 'statusCode', 'errors'],
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'integer' },
        errors: {
          type: 'array',
          items: { type: 'string', enum: ['Internal server error'] }
        }
      },
      example: {
        success: false,
        statusCode: 500,
        errors: ['Internal server error']
      },
      additionalProperties: false
    })

    await app.ready()

    const newSchema1 = app.extendSchema({
      source: { $ref: 'response.error' },
      with: {
        properties: {
          errors: {
            items: { type: 'string', enum: ['Wrong username or password', 'An error occurred while performing the operation'] }
          }
        }
      }
    })

    const newSchema2 = app.extendSchema({
      source: { $ref: 'response.error' },
      with: {
        example: {
          success: false,
          statusCode: 400,
          errors: ['Wrong username or password']
        }
      }
    })

    const newSchema3 = app.extendSchema({
      source: { $ref: 'response.error' },
      with: {
        $id: 'extended-id'
      }
    })

    expect(newSchema1.$id).equal('response.error.extended-schema-1')
    expect(newSchema2.$id).equal('response.error.extended-schema-2')
    expect(newSchema3.$id).equal('extended-id')
  })
})
