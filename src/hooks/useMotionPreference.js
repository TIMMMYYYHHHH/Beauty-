import { useEffect, useState } from 'react'

export function useMotionPreference() {
  const [systemReduced, setSystemReduced] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReduced(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  const motionActive = !systemReduced && !paused

  return {
    motionActive,
    paused: systemReduced || paused,
    systemReduced,
    toggleMotion: () => !systemReduced && setPaused((current) => !current),
  }
}
