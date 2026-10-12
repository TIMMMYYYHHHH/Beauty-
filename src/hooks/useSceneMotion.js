import { useEffect } from 'react'

export function useSceneMotion(active) {
  useEffect(() => {
    const root = document.documentElement
    const scenes = [...document.querySelectorAll('[data-scene]')]
    if (!active) {
      root.classList.remove('motion-active')
      root.style.setProperty('--mx', '0')
      scenes.forEach((scene) => scene.style.setProperty('--scene-progress', '.65'))
      return undefined
    }

    const visibleScenes = new Set()
    let frame = 0
    let pointerX = window.innerWidth / 2
    let pointerDirty = true
    let scrollDirty = true

    const update = () => {
      frame = 0
      const width = Math.max(window.innerWidth, 1)
      const height = Math.max(window.innerHeight, 1)
      if (pointerDirty) {
        root.style.setProperty('--mx', ((pointerX / width) - 0.5).toFixed(3))
        pointerDirty = false
      }
      if (scrollDirty) {
        const measurements = [...visibleScenes].map((scene) => ({ scene, rect: scene.getBoundingClientRect() }))
        measurements.forEach(({ scene, rect }) => {
          const progress = (height - rect.top) / (height + rect.height)
          scene.style.setProperty('--scene-progress', Math.max(0, Math.min(1, progress)).toFixed(3))
        })
        scrollDirty = false
      }
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    const observer = window.IntersectionObserver ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visibleScenes.add(entry.target) : visibleScenes.delete(entry.target))
      scrollDirty = true
      requestUpdate()
    }, { rootMargin: '80% 0px' }) : null
    scenes.forEach((scene) => {
      scene.style.setProperty('--scene-progress', '.65')
      if (observer) observer.observe(scene)
      else visibleScenes.add(scene)
    })

    if (!document.hidden) root.classList.add('motion-active')
    const onScroll = () => { scrollDirty = true; requestUpdate() }
    const onResize = () => { scrollDirty = true; pointerDirty = true; requestUpdate() }
    const onPointer = (event) => {
      pointerX = event.clientX
      pointerDirty = true
      requestUpdate()
    }
    const onVisibility = () => {
      root.classList.toggle('motion-active', !document.hidden)
      if (!document.hidden) { scrollDirty = true; pointerDirty = true; requestUpdate() }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    update()

    return () => {
      root.classList.remove('motion-active')
      scenes.forEach((scene) => scene.style.setProperty('--scene-progress', '.65'))
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [active])
}
