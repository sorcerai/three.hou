import { Config } from '@remotion/cli/config';

// Three.js requires ANGLE in headless Chrome — default OpenGL crashes the WebGL context.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(1);
