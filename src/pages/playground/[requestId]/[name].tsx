import React from 'react'
import Head from 'next/head'
import { NextPageContext } from 'next'
import { getPlaygroundFileKey, getPlaygroundZipKey } from '@/lib/storage'
import { bucketName, getStringFromS3 } from '@/lib/s3Client'
import { serverUrl } from '@/lib/config'

interface PlaygroundProps {
  requestId: string
  name: string
  app: string
  zipUrl: string
  manifest: string
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
      <pre className="text-sm">{children}</pre>
    </div>
  )
}

export default function Playground({
  name,
  app,
  manifest,
  zipUrl,
}: PlaygroundProps) {
  return (
    <div>
      <Head>
        <meta
          property="og:image"
          content={`${serverUrl}/api/og?title=${name}`}
        />
      </Head>
      <h1 className="bg-red text-4xl font-bold">{name}</h1>
      <section className="flex flex-col items-center">
        <p className="text-sm text-gray-500">
          Download the playground as a zip file:
        </p>
        <button
          className="rounded bg-slate-800 px-4 py-2 text-center text-3xl font-bold text-white hover:bg-slate-500"
          onClick={() => window.open(zipUrl)}
        >
          Download Playground
        </button>
      </section>

      <h3>App Code</h3>
      <CodeBlock>{app}</CodeBlock>
      <h3>Manifest Code</h3>
      <CodeBlock>{manifest}</CodeBlock>
    </div>
  )
}

export async function getServerSideProps(
  context: NextPageContext
): Promise<{ props: PlaygroundProps }> {
  const { requestId, name } = context.query
  if (typeof requestId !== 'string') {
    throw new Error('requestId is not a string')
  }
  if (typeof name !== 'string') {
    throw new Error('name is not a string')
  }

  const _fi = async (k: string) =>
    await getStringFromS3(getPlaygroundFileKey(name, requestId, k))

  const [app, manifest] = await Promise.all([
    _fi('App.swift'),
    _fi('Package.swift'),
  ])

  // s3 url
  const zipUrl = `https://${bucketName}.s3.amazonaws.com/${getPlaygroundZipKey(
    name,
    requestId
  )}`

  return {
    props: {
      requestId,
      name,
      app,
      manifest,
      zipUrl,
    },
  }
}
