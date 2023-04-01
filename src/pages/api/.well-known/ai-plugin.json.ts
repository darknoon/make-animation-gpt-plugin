import { NextApiRequest, NextApiResponse } from 'next'
import { serverUrl } from '../../../lib/config'
// Why does this work elsewhere but not here?
// import { serverUrl } from '@/lib/config'

const local = !process.env.PROD_URL

const schema = {
  schema_version: 'v1',
  name_for_human: 'Generate Animation',
  name_for_model: 'gen_animated_video',
  description_for_human: '',
  description_for_model: ``,
  auth: {
    type: 'none',
  },
  api: {
    type: 'openapi',
    url: `${serverUrl}/api/schema.openapi.json`,
    is_user_authenticated: false,
  },
  // logo_url: ,
  contact_email: 'andrew@darknoon.com',
  legal_info_url: 'https://darknoon.com/',
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(schema)
}
