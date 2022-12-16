# Fastify deep merge and extend schema plugin

This module add two useful methods to fastify instance: mergeSchema, extendSchema.

- mergeSchema. merge two schemas and create new schema
- extendSchema. extend two schemas and create new schema
## Install

```shell
npm i fastify-merge-extend-schema
```

## usage

```typescript
import fastify from 'fastify';

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
```
where, **source** - original schema. **with** - additional schema for merging.

As a result, we get new schema with new generated id. If you want have your own id, add $id key to **with** object.

Also, you can merge schema by reference. Example:

```typescript
import fastify from 'fastify';

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
```

**mergeExtend** works as the same way, but make deep extend operation. Under the hood, plugin use [deepmerge-json](https://www.npmjs.com/package/deepmerge-json) and [deep-extend](https://www.npmjs.com/package/deep-extend) packages.

## License

MIT © [Nikolay Lapshin](https://nlapshin.com)
