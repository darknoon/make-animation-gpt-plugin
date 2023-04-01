import { ChatCompletionRequestMessage } from 'openai'

export function buildPrompt(videoDescription: string) {
  const sep = '```'
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: 'system',
      content: `You are a helpful video generation assistant. You use Remotion (a react-based video creation framework to create customized videos for users.
- It's important to just return the code without any commentary.
- do not use any libraries other than react and remotion.
- use style dictionaries to style components.
- always use the component name "MyComposition" for the main component. This is important for the video generation to work.
`,
    },
    {
      role: 'system',
      name: 'example-good',
      content: `${sep}
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
};${sep}
`,
    },
    {
      role: 'system',
      name: 'example-good',
      content: `${sep}
import { noise3D } from "@remotion/noise";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
 
const OVERSCAN_MARGIN = 100;
const ROWS = 10;
const COLS = 15;
 
const NoiseComp: React.FC<{
  speed: number;
  circleRadius: number;
  maxOffset: number;
}> = ({ speed, circleRadius, maxOffset }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
 
  return (
    <svg width={width} height={height}>
      {new Array(COLS).fill(0).map((_, i) =>
        new Array(ROWS).fill(0).map((__, j) => {
          const x = i * ((width + OVERSCAN_MARGIN) / COLS);
          const y = j * ((height + OVERSCAN_MARGIN) / ROWS);
          const px = i / COLS;
          const py = j / ROWS;
          const dx = noise3D("x", px, py, frame * speed) * maxOffset;
          const dy = noise3D("y", px, py, frame * speed) * maxOffset;
          const opacity = interpolate(
            noise3D("opacity", i, j, frame * speed),
            [-1, 1],
            [0, 1]
          );
 
          const key = \`\${i}-\${j}\`;
 
          return (
            <circle
              key={key}
              cx={x + dx}
              cy={y + dy}
              r={circleRadius}
              fill="gray"
              opacity={opacity}
            />
          );
        })
      )}
    </svg>
  );
};${sep}`,
    },
    {
      role: 'system',
      content: `Example: interpolate rgb or rgba colors
In this example, we are interpolating colors from red to yellow. At frame 0 (the start of the video), we want the color to be red (rgb(255, 0, 0)). At frame 20, we want the color to be yellow (rgba(255, 255, 0)).

Using the following snippet, we can calculate the current color for any frame:
${sep}
import { interpolateColors, useCurrentFrame } from "remotion";
…
const frame = useCurrentFrame(); // 10
// RGB colors
const color = interpolateColors(
  frame,
  [0, 20],
  ["rgb(255, 0, 0)", "rgb(255, 255, 0)"]
); // rgba(255, 128, 0, 1)
…
${sep}
`,
    },
    {
      role: 'user',
      content: `I want to create a video matching the following description:\n\n${videoDescription}`,
    },
  ]
  return messages
}
