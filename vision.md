# Project Vision: Three-hou (The "XYZ Madness" Engine)

> "A particle physics simulation disguised as a shrine maiden game."

## 1. Executive Summary
**Three-hou** is a high-performance, web-based Bullet Hell (Danmaku) engine built on **Three.js**. It reimagines the classic Touhou aesthetic by exploding the flat 2D plane into a dizzying **2.5D tunnel of "XYZ Madness."**

This is **not** a game remake. It is a **Technical Benchmark** designed to push the browser's limits, rendering 5,000+ interactive bullets at 60 FPS while syncing visual chaos to high-BPM Eurobeat/Piano tracks.

---

## 2. Core Pillars

### I. Performance is the Gameplay
The primary antagonist is the Garbage Collector.
*   **Zero-Allocation Runtime:** Objects are pooled. Arrays are pre-allocated. `new` keyword is banned in the render loop.
*   **GPU First:** Logic that can be offloaded to shaders (visuals, particles) stays on the GPU.
*   **InstancedMesh Everything:** If it moves and there's more than one of it, it's an Instance.

### II. "XYZ Madness" Aesthetic
We reject the flat plane.
*   **Visuals:** 2D Sprites (Billboards) for characters/bullets to maintain the "ZUN" style.
*   **World:** A fully 3D scrolling perspective tunnel (Shrine gates, stars, warp effects).
*   **The Twist:** Bullet patterns utilize the Z-axis for visual flair, creating spiral helixes and depth-based distinct patterns, though hitboxes remain functionally readable.

### III. Modernized Input
*   **Control:** Mouse/Pointer-based movement.
*   **Reasoning:** Navigating a 3D/2.5D space with high-speed bullet patterns requires the precision and speed of a mouse, unlike the digital precision of a keyboard in a pure 2D grid.

---

## 3. Technical Architecture

### The "Double-Camera" Render Stack
To solve the "Perspective vs. Gameplay" conflict:
1.  **Layer 0 (Background):** `PerspectiveCamera`. Renders the scrolling 3D world, starfields, and massive geometry. High FOV for speed sensation.
2.  **Layer 1 (Gameplay):** `OrthographicCamera`. Renders the Player, Boss, and Bullets. Ensures strict pixel-perfect hit detection and consistent bullet sizes regardless of "depth" relative to the camera.
*   *Note:* Visuals from Layer 0 bleed into Layer 1 via Bloom/Post-processing.

### The Danmaku Engine (Data-Oriented Design)
We avoid JavaScript Objects for individual bullets.
*   **Storage:** `Float32Array` buffers (SoA - Structure of Arrays).
    *   `pos_x`, `pos_y`, `pos_z`, `vel_x`, `vel_y`, `vel_z`, `type`, `active`
*   **Rendering:** Single `InstancedMesh` per bullet texture type.
*   **Update Loop:** Linear iteration over typed arrays. No functional programming (`map`, `forEach`) in the hot path.

### Audio-Visual Reactivity
*   **FFT Analysis:** Real-time analysis of frequency data.
*   **Sync:** Background elements (FOV, color intensity, tunnel speed) pulse with the Low/Mid frequencies.

---

## 4. Scope: The "Technical Tech Demo"
We are building a **Vertical Slice of Chaos**.
*   **Phase 1:** The Engine (rendering thousands of spheres).
*   **Phase 2:** The Player (Mouse control, Sprite movement).
*   **Phase 3:** The "Boss" (A generator of complex mathematical patterns).
*   **Phase 4:** The Polish (Bloom, Shaders, "Bad Apple" reactivity).

**Success Criteria:**
*   10,000 Bullets on screen.
*   Stable 60 FPS on mid-range hardware.
*   It looks cool enough to post on Twitter/X.

---

## 5. Asset Strategy
*   **Bullets:** Abstract geometric neon shapes (Code generated / primitives).
*   **Characters:** Placeholder "Programmer Art" or AI-generated "ZUN-style" sprites (Billboards).
*   **Audio:** Classic arrangements (Copyright considerations apply for public deploy, local placeholders for dev).
