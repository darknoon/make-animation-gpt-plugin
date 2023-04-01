import { generateVideoCode } from '@/lib/genCode'
import { buildPrompt } from '@/lib/buildPrompt'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body
  if (!prompt) {
    res.status(400).json({ error: 'No prompt provided' })
    return
  }

  const messages = buildPrompt(prompt)
  const code = await generateVideoCode(messages)

  res.status(200).json({ code })
}
