import { Composition } from "remotion";
import { PRPromo } from "./PRPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PRPromo"
        component={PRPromo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
