import { generateVideo } from '@/lib/genVideo'
import { writeBufferToS3 } from '@/lib/s3Client'
import { readFile } from 'fs/promises'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { source } = req.body

  const { outputLocation } = await generateVideo(source)

  // load the video from the output location and upload it to S3
  const buf = await readFile(outputLocation)
  writeBufferToS3(buf, 'my-video.mp4')

  res.status(200).json({ name: 'John Doe' })
}
