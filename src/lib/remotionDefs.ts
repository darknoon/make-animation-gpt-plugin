const sep = '```'

const defs = `

REMOTION APIS:

## Easing

${sep}
import { Easing, interpolate } from "remotion";
 
const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const interpolated = interpolate(frame, [0, 100], [0, 1], {
    easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        transform: \`scale(\${interpolated})\`,
        backgroundColor: "red",
      }}
    />
  );
};
${sep}
`

export default defs
