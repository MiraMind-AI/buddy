# Avatar Design

## Overview

The avatar is a visible 3D character that reacts to conversation and voice state. It is a quality-of-experience feature intended to make Buddy feel more like a presence than a chat window. The avatar must perform well in the browser and not interfere with conversation responsiveness.

---

## Rendering Stack

- **React Three Fiber** for the Three.js scene inside the React component tree
- **@react-three/drei** for helpers (camera, lighting, environment)
- **@react-spring/three** or Framer Motion 3D for state transition animations
- Canvas rendered in a contained area of the UI, not full-screen by default

The avatar canvas runs independently of the chat and voice state components. It subscribes to avatar state from the Zustand store but does not block or delay any AI operations.

---

## Avatar States

The avatar has five defined states:

| State       | Description                                                                |
| ----------- | -------------------------------------------------------------------------- |
| `idle`      | Subtle ambient animation. Breathing, slight head movement.                 |
| `listening` | Alert posture. Visual indication that input is being captured.             |
| `thinking`  | Processing animation. A visual cue that a response is being generated.     |
| `speaking`  | Mouth movement driven by audio amplitude or visemes. Active body language. |
| `error`     | Neutral, slightly withdrawn. Used when a failure occurs.                   |

State transitions are animated. Abrupt jumps between states are avoided.

---

## Mouth Movement

Phase M6 implements amplitude-based mouth movement:

- The frontend measures audio amplitude from the TTS output in real time
- Amplitude is mapped to a blend shape weight on the avatar's jaw or mouth mesh
- The result is approximate but visually convincing for most speech patterns

Phase M9 or later adds viseme-based lip sync:

- The TTS service or a separate analysis step provides phoneme timing
- Phonemes are mapped to MPEG-4 or ARKit viseme blend shapes
- Mouth movement becomes more accurate and less mechanical

---

## Avatar Model

Phase M6 uses a placeholder:

- A simple geometric head with enough mesh detail to show mouth movement
- Or a low-poly stylized character model under a permissive license

The placeholder is designed so that a real character model can be dropped in by replacing the model file and updating blend shape mappings. The state machine and animation logic remain the same.

---

## Performance Requirements

The avatar must not degrade conversation performance:

- Canvas rendering targets 60fps
- Avatar animations run in the Three.js render loop, not the React render cycle
- No avatar operation should block the main thread during voice recording or API calls
- If the device cannot sustain 30fps in the canvas, the avatar degrades to a 2D illustration fallback

---

## Responsive Layout

- Desktop: avatar in a panel beside the conversation
- Mobile: avatar minimized or hidden by default, togglable
- The UI is usable without the avatar visible

---

## State Management Integration

The avatar reads from a dedicated slice of the Zustand store:

```ts
interface AvatarState {
  state: "idle" | "listening" | "thinking" | "speaking" | "error";
  amplitude: number; // 0 to 1, updated at ~60fps during speaking
}
```

The voice state machine writes to `avatarState.state`. The audio player writes `avatarState.amplitude` during TTS playback. The avatar component subscribes to both.
