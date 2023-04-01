import { NextApiRequest, NextApiResponse } from 'next'
import { serverUrl } from '../../../lib/config'
// Why does this work elsewhere but not here?
// import { serverUrl } from '@/lib/config'

const local = !process.env.PROD_URL

const schema = {
  schema_version: 'v1',
  name_for_human: 'Generate Animation',
  name_for_model: 'gen_animated_video',
  description_for_human: 'Generate an animated video from a description',
  description_for_model: `Generate an animated video from a description. Make sure to list multiple scenes of content, the generated video will be 15 seconds long.`,
  auth: {
    type: 'none',
  },
  api: {
    type: 'openapi',
    url: `${serverUrl}/api/schema.openapi.json`,
    is_user_authenticated: false,
  },
  logo_url: local ? `${serverUrl}/bear-localhost.svg` : `${serverUrl}/bear.svg`,
  contact_email: 'andrew@darknoon.com',
  legal_info_url: 'https://darknoon.com/',
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(schema)
}
