// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { serverUrl } from '@/lib/config'

console.log('serverUrl', serverUrl)

const codeDesc = `The description of the video`

const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Create Animation Video',
    version: '1.0.0',
  },
  servers: [
    {
      url: serverUrl,
    },
  ],
  paths: {
    '/api/video/create': {
      post: {
        summary: 'Create generated video',
        operationId: 'generateVideo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  prompt: {
                    type: 'string',
                    description: codeDesc,
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
                      description: 'The URL of generated video',
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
