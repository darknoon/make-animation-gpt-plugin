import { buildPrompt, generateVideoCode } from '@/lib/genCode'
import { generateVideo } from '@/lib/genVideo'
import { writeBufferToS3 } from '@/lib/s3Client'
import { readFile } from 'fs/promises'
import { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage } from 'openai'

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
        durationInFrames={15 * 30}
        component={MyComposition}
    />
    </>
);
};
registerRoot(RemotionRoot);
`

function formatError(e: Error) {
  // Don't let error be too long
  if (e.message.length > 100) {
    return e.message.substring(0, 100) + '...'
  } else {
    return e.message
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body
  if (!prompt) {
    res.status(400).json({ error: 'No prompt provided' })
    return
  }

  const messages: Array<ChatCompletionRequestMessage> = buildPrompt(prompt)

  // retry up to 3 times, passing the error into the next attempt at generating the code
  let errors: Error[] = []
  for (let i = 0; i < 3; i++) {
    try {
      const { code } = await generateVideoCode(messages)

      const full = code + wrapper

      const { outputLocation } = await generateVideo(full)
      // load the video from the output location and upload it to S3
      const buf = await readFile(outputLocation)
      const { url } = await writeBufferToS3(buf, 'my-video.mp4')

      res.status(200).json({ url })
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }
      errors.push(e)

      console.error('GENERATION ERROR: ', e)
      // Add error to the messages
      console.error('error type', e.constructor.name)
      errors.push(e)
      messages.push({
        role: 'assistant',
        content: `GENERATION ERROR ${formatError(e)}`,
      })
    }
  }
  res.status(500).json({ error: 'Exceeded 3 tries!' })
}

//   res.status(200).json({ code })
//   return

//   const source = `
//   import React from "react";
//   import { useCurrentFrame, AbsoluteFill } from "remotion";

//   export const MyComposition = () => {
//     const frame = useCurrentFrame();

//     return (
//       <AbsoluteFill
//         style={{
//           justifyContent: "center",
//           alignItems: "center",
//           fontSize: 100,
//           backgroundColor: "white"
//         }}
//       >
//         The current frame is {frame}.
//       </AbsoluteFill>
//     );
//   };
//   `

//   const source = `import React from "react";
//   import { useCurrentFrame, spring, AbsoluteFill } from "remotion";

//   const styleDictionary = {
//         ball: {
//           backgroundColor: "red",
//       borderRadius: "50%",
//       width: 100,
//       height: 100,
//       position: "absolute"
//     }
//   };

//   export const MyComposition = () => {
//         const frame = useCurrentFrame();
//         const translateY = spring({
//           frame: frame % 150,
//           // ANDREW EDIT
//           fps: 30,
//           // END EDIT
//           config: {
//             stiffness: 200,
//             damping: 20,
//             mass: 1
//       }
//     });

//     return (
//           <AbsoluteFill
//             style={{
//               justifyContent: "center",
//           alignItems: "center",
//           backgroundColor: "white"
//         }}
//       >
//         <div
//           style={{
//                 ...styleDictionary.ball,
//                 transform: \`translateY(\${translateY * 100}px)\`
//           }}
//         />
//         <p>{translateY}</p>
//       </AbsoluteFill>
//     );
//   };`

const source =
  '\nimport React from "react";\nimport { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";\n\nconst BouncingBall: React.FC = () => {\n  const frame = useCurrentFrame();\n  const { height } = useVideoConfig();\n  const translateY = spring({ frame, from: height, to: 0, durationInFrames: 30 });\n  \n  return (\n    <div style={{ position: "absolute", transform: `translateY(${translateY}px)` }}>\n      <div style={{ position: "absolute", width: 100, height: 100, backgroundColor: "blue", borderRadius: "50%" }} />\n      <div style={{ fontSize: 48, marginTop: 120, textAlign: "center" }}>Bounce Bounce</div>\n    </div>\n  );\n};\n\nconst List: React.FC<{ items: string[]; startFrame: number }> = ({ items, startFrame }) => {\n  const frame = useCurrentFrame();\n\n  return (\n    <ul>\n      {items.map((item, index) => {\n        const revealFrame = startFrame + index * 10;\n\n        const show = frame - revealFrame;\n        const y = index * 40 + 30;\n\n        const animatedY = spring({ frame: show, from: y + 50, to: y, damping: 200 });\n\n        return (\n          <li\n            key={index}\n            style={{\n              position: "absolute",\n              fontSize: 24,\n              fontWeight: "bold",\n              left: 30,\n              top: animatedY,\n              opacity: Math.min(1, (frame - revealFrame) / 10),\n            }}\n          >\n            {item}\n          </li>\n        );\n      })}\n    </ul>\n  );\n};\n\nconst content1 = ["Find a dog trainer", "Repetition is key", "Reward-based training"];\nconst content2 = ["Feed a high-quality diet", "Nutrients over ingredients", "Adjust for age and activity"];\n\nexport const MyComposition: React.FC = () => {\n  const frame = useCurrentFrame();\n\n  return (\n    <AbsoluteFill\n      style={{\n        justifyContent: "center",\n        alignItems: "center",\n        fontSize: 100,\n        backgroundColor: "white",\n      }}\n    >\n      {frame < 90 && <BouncingBall />}\n      {(frame >= 90 || frame < 270) && (\n        <div style={{ textAlign: "center", fontSize: 36, fontWeight: "bold" }}>How to train a dog</div>\n      )}\n      {frame >= 90 && <List items={content1} startFrame={100} />}\n      {frame >= 270 && (\n        <div style={{ textAlign: "center", fontSize: 36, fontWeight: "bold" }}>Top tips for dog nutrition</div>\n      )}\n      {frame >= 270 && <List items={content2} startFrame={280} />}\n    </AbsoluteFill>\n  );\n};\n'
