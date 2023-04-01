// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { serverUrl } from '@/lib/config'

console.log('serverUrl', serverUrl)

const codeDesc = `The code to be used in the playground, must be valid SwiftUI code for an App.
Swift code MUST be all in a single file using SwiftUI and App struct marked with @main.
DO NOT USE triple quotes since they do not exist in JSON.
ALWAYS carefully escape newlines and quotes in the json.`

const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Create Swift Playground API',
    version: '1.0.0',
  },
  servers: [
    {
      url: serverUrl,
    },
  ],
  paths: {
    '/api/playground/create': {
      post: {
        summary: 'Create a new Swift playground from code',
        operationId: 'createPlayground',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: codeDesc,
                  },
                  name: {
                    type: 'string',
                    description:
                      'The name of the app that will be created. This MUST match the name of the App struct in the code!',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<typeof apiSpec>
) {
  res.status(200).json(apiSpec)
}
