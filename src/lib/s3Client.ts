import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

const region = 'us-east-1'
export const bucketName = process.env.S3_BUCKET_NAME

export const s3Client = new S3Client({
  region,
})

export async function writeBufferToS3(
  buffer: Buffer,
  key: string,
): Promise<{ url: string }> {
  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    // Make public
    ACL: 'public-read',
  })

  await s3Client.send(uploadCommand)
  return { url: `https://${bucketName}.s3.amazonaws.com/${key}` }
}

export async function getStringFromS3(key: string): Promise<string> {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  const { Body } = await s3Client.send(getObjectCommand)
  if (!Body || !(Body instanceof Readable)) {
    throw new Error('No body or body is not a readable stream')
  }
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    Body.on('data', (chunk) => chunks.push(chunk))
    Body.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    Body.on('error', reject)
  })
}
