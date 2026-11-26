import type * as React from "react"
import type {
  BoopFace,
  BoopFaceMotion,
  BoopFaceSkin,
  BoopFaceWakeOn,
} from "boopface"

export interface BoopFaceElementProps
  extends React.HTMLAttributes<BoopFace> {
  ref?: React.Ref<BoopFace>
  size?: number | string
  view?: "2d" | "3d"
  color?: string
  "eye-color"?: string
  "eye-style"?: "round" | "sharp"
  skin?: BoopFaceSkin | "none"
  antenna?: "true" | "false"
  motion?: BoopFaceMotion
  "auto-sleep"?: number | string
  "wake-on"?: BoopFaceWakeOn
  "idle-gaze"?: "true" | "false"
  petting?: "true" | "false"
  "press-squeeze"?: "true" | "false"
  "antenna-drag"?: "true" | "false"
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "boop-face": BoopFaceElementProps
    }
  }
}
