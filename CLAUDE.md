# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A canvas-based drawing application that allows users to create and manipulate geometric shapes (rectangles, ellipses) with features like selection, resizing, moving, zoom, pan, and grid snapping. Built with TypeScript, Vite, and MobX for state management.

## Development Commands

```bash
# Development server with HMR
yarn dev

# Type checking without emitting files
yarn validate:ts

# Production build (type checks + build)
yarn prod

# Linting
yarn lint

# Format checking and fixing
yarn prettier       # check formatting
yarn prettier:fix   # fix formatting
```

## Architecture

### Core Patterns

**MVC-like Architecture**: The codebase follows a Model-View-Controller pattern:
- **Model (Store)**: MobX observable stores in `src/store/` manage application state
- **View (Renderer)**: Canvas rendering logic in `src/renderer/` (observers)
- **Controller**: Event handlers in `src/core/controllers/` and operations in `src/core/operations/`

**Entity System**: Hierarchical entity structure with polymorphic rendering:
```
Entity (abstract base)
├── Drawable (user-created shapes)
│   ├── Rectangle
│   └── Ellipse
├── Selection (UI overlays)
│   ├── SelectionBox
│   ├── SelectionPreview
│   └── SelectionHover
└── Grid (coordinate system visualization)
```

Each entity subclass implements its own `isPointInside()` hit-testing logic and has a corresponding renderer.

### State Management

**MobX Stores** (all in `src/store/`):
- `RootStore`: Central store containing all sub-stores
- `DrawableStore`: Manages user-created shapes and drawing state
- `SelectionStore`: Manages selection state (box, preview, hover)
- `SceneStore`: Manages viewport (zoom, pan, origin, tool, grid)
- `ClientStore`: Client-specific settings (DPI)

**State Persistence**: `DrawableStore` and `SceneStore` implement the `Storable` interface and automatically persist to localStorage using debounced saves (1000ms). State is loaded on initialization in `src/index.ts`.

### Coordinate Systems

**Two coordinate systems**:
1. **Client coordinates**: Browser pixel coordinates (origin top-left)
2. **Scene coordinates**: World space coordinates (origin at center, Y-up)

Transform stack in `SceneRenderer.render()`:
```
1. translate(screenCenter)    // move origin to center
2. scale(zoom, -zoom)          // apply zoom and flip Y-axis
3. translate(-origin)          // offset to current viewport
```

Use `SceneStore.getSceneCoordinates(clientCoords, snap?)` to convert client → scene coordinates. The `snap` parameter enables grid snapping.

### Controllers and Operations

**Controllers** (`src/core/controllers/`): Handle raw DOM events
- `MouseController`: Mouse events (down, move, up, contextmenu)
- `KeyboardController`: Keyboard shortcuts (Delete, arrow keys, Cmd+A)
- `WheelController`: Zoom with mouse wheel (touchpad-aware sensitivity)
- `ToolbarController`: UI interaction for tool/grid toggle

**Operations** (`src/core/operations/`): Encapsulate multi-step user workflows
- `DrawingOperation`: Creating new shapes (start → update → finish)
- `SelectionOperation`: Selection, move, resize operations
- `NavigationOperation`: Zoom, pan

Each controller delegates to appropriate operations. Controllers use `AbortController` for cleanup.

### Renderer Hierarchy

```
SceneRenderer (orchestrates scene rendering)
└── EntityRenderer (dispatches to type-specific renderers)
    ├── DrawableRenderer
    │   ├── RectangleRenderer
    │   └── EllipseRenderer
    ├── SelectionRenderer
    │   ├── SelectionBoxRenderer
    │   ├── SelectionPreviewRenderer
    │   └── SelectionHoverRenderer
    └── GridRenderer
```

All renderers extend the abstract `Renderer` base class. `SceneRenderer` uses MobX `autorun()` for reactive rendering.

### Entity Registration

**Adding new drawable types**: When adding a new shape type:
1. Create entity class extending `Drawable` in `src/store/entity/drawable/` with static `type` property
2. Implement `isPointInside(point: Position): boolean` for hit-testing
3. Add case to `createEntity()` factory in `src/store/entity/utils.ts`
4. Create renderer extending `Renderer` in `src/renderer/scene/entity/drawable/`
5. Add rendering logic to `DrawableRenderer.render()`

The factory pattern ensures proper deserialization from localStorage.

## Key Implementation Details

### Grid Snapping
- Grid step is `10` scene units (configurable in `SceneStore.gridStep`)
- Snapping multiplier of `10x` when Shift is held (for coarse adjustments)
- Use `snapToGrid(value, step)` from `src/shared/utils/snap.ts`
- All drawing/move/resize operations support snapping via the `snap` parameter in `getSceneCoordinates()`

### Aspect Ratio Lock
- Hold Shift during drawing or resizing to maintain 1:1 aspect ratio
- Implemented in `DrawingOperation.update()` and `SelectionOperation.updateResize()`

### Z-Order and Hit Testing
- Drawables array order determines Z-order (later = on top)
- `DrawableStore.getDrawableAtPosition()` iterates backwards to find topmost drawable
- Each drawable uses geometric shape testing (not bounding box) for precise selection

### Retina Display Support
- `retinaFix()` utility adjusts canvas resolution for high-DPI displays
- Canvas buffer size scaled by DPR while CSS size remains unchanged
- Prevents blurry rendering on retina displays

## Path Aliases

The project uses `@/` alias for `src/` directory (configured in `tsconfig.json` and `vite.config.ts`).

## Package Manager

This project uses Yarn 4.10.3. Always use `yarn` instead of `npm`.
