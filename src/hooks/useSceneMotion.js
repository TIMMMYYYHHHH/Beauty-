import { useEffect } from 'react'

export function useSceneMotion(active) {
  useEffect(() => {
    const root = document.documentElement
    if (!active) {
      root.classList.remove('motion-active')
      root.style.setProperty('--mx', '0')
      root.style.setProperty('--my', '0')
      return undefined
    }

    root.classList.add('motion-active')
    let frame = 0
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2

    const update = () => {
      frame = 0
      const width = Math.max(window.innerWidth, 1)
      const height = Math.max(window.innerHeight, 1)
      root.style.setProperty('--mx', ((pointerX / width) - 0.5).toFixed(3))
      root.style.setProperty('--my', ((pointerY / height) - 0.5).toFixed(3))
      root.style.setProperty('--page-scroll', `${window.scrollY}px`)

      document.querySelectorAll('[data-scene]').forEach((scene) => {
        const rect = scene.getBoundingClientRect()
        const progress = (height - rect.top) / (height + rect.height)
        scene.style.setProperty('--scene-progress', Math.max(0, Math.min(1, progress)).toFixed(3))
      })
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    const onPointer = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      requestUpdate()
    }

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('pointermove', onPointer, { passive: true })
    update()

    return () => {
      root.classList.remove('motion-active')
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('pointermove', onPointer)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [active])
}
