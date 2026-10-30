import { create } from 'zustand'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// World store
//
// Single source of truth for 3D world state.
// Kept separate from UI store so UI re-renders never touch the 3D loop.
// ─────────────────────────────────────────────────────────────────────────────

interface WorldState {
  characterPosition: THREE.Vector3
  activeSceneId:     string | null

  setCharacterPosition: (pos: THREE.Vector3) => void
  setActiveScene:       (id: string | null)  => void
}

export const useWorldStore = create<WorldState>((set) => ({
  characterPosition: new THREE.Vector3(0, 0, 0),
  activeSceneId:     null,

  setCharacterPosition: (pos) => set({ characterPosition: pos.clone() }),
  setActiveScene:       (id)  => set({ activeSceneId: id }),
}))

// ─────────────────────────────────────────────────────────────────────────────
// UI store — separate so UI components don't subscribe to 3D state
// ─────────────────────────────────────────────────────────────────────────────

interface UIState {
  menuOpen:    boolean
  dialogueId:  string | null
  setMenuOpen: (open: boolean) => void
  setDialogue: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  menuOpen:    false,
  dialogueId:  null,
  setMenuOpen: (open) => set({ menuOpen: open }),
  setDialogue: (id)   => set({ dialogueId: id }),
}))
