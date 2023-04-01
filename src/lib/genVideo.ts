import { bundle } from '@remotion/bundler'
import { getCompositions, renderMedia } from '@remotion/renderer'
import { writeFileSync } from 'fs'
import { tmpdir } from 'os'

export const generateVideo = async (source: string) => {
  // You only have to do this once, you can reuse the bundle.
  const tempDir = tmpdir()
  const name = 'bundle.js'
  const entryPath = `${tempDir}/${name}`
  writeFileSync(entryPath, source)

  console.log('Creating a Webpack bundle of the video')
  const bundleLocation = await bundle(
    entryPath,
    (progress: number) => {
      console.log('Webpack progress:', progress)
    },
    {
      // If you have a Webpack override, make sure to add it here
      webpackOverride: (config) => config,
    }
  )

  // Parametrize the video by passing arbitrary props to your component.
  const inputProps = {
    foo: 'bar',
  }

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundleLocation, {
    // You can pass custom input props that you can retrieve using getInputProps()
    // in the composition list. Use this if you want to dynamically set the duration or
    // dimensions of the video.
    inputProps,
  })

  console.log('Found compositions:', comps)

  // Select the composition you want to render.
  const composition = comps[0]
  const compositionId = composition.id

  // Ensure the composition exists
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entryPath}" for the correct ID.`)
  }

  const outputLocation = `out/${compositionId}.mp4`
  console.log('Attempting to render:', outputLocation)
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    inputProps,
  })
  console.log('Render done!')
  return { outputLocation }
}
