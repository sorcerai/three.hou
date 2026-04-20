import { Composition } from 'remotion';
import { z } from 'zod';
import { MusicVideo } from './compositions/MusicVideo';
import { AudioVisualizer } from './compositions/AudioVisualizer';

const musicVideoSchema = z.object({ audioSrc: z.string() });

const FPS = 30;
const DURATION_SEC = 180;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MusicVideo"
        component={MusicVideo}
        durationInFrames={DURATION_SEC * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        schema={musicVideoSchema}
        defaultProps={{ audioSrc: 'music.mp3' }}
      />
      <Composition
        id="MusicVideoShorts"
        component={MusicVideo}
        durationInFrames={DURATION_SEC * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        schema={musicVideoSchema}
        defaultProps={{ audioSrc: 'music.mp3' }}
      />
      <Composition
        id="AudioVisualizer"
        component={AudioVisualizer}
        durationInFrames={DURATION_SEC * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
