import { generateVideo } from '@/lib/genVideo'
import { writeBufferToS3 } from '@/lib/s3Client'
import { readFile } from 'fs/promises'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //   const { source } = req.body
  const wrapper = `
import { registerRoot, Composition } from "remotion"
export const RemotionRoot = () => {
return (
    <>
    <Composition
        id="my-comp"
        fps={30}
        height={1080}
        width={1920}
        durationInFrames={90}
        component={MyComposition}
    />
    </>
);
};
registerRoot(RemotionRoot);
`
  const source =
    `
import React from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
 
export const MyComposition = () => {
  const frame = useCurrentFrame();
 
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 100,
        backgroundColor: "white"
      }}
    >
      The current frame is {frame}.
    </AbsoluteFill>
  );
};
` + wrapper

  const { outputLocation } = await generateVideo(source)

  // load the video from the output location and upload it to S3
  const buf = await readFile(outputLocation)
  writeBufferToS3(buf, 'my-video.mp4')

  res.status(200).json({ name: 'John Doe' })
}
