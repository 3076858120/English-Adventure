import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// 3D 宠物:用基础几何体拼出的小萌宠,支持拖动旋转 + 待机动画
// WebGL 不可用时自动退回大 emoji,绝不白屏
export default function Pet3D({ color = '#FFD54F', emoji = '🐥', height = 260 }) {
  const mountRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setFailed(true)
      return undefined
    }

    const width = mount.clientWidth || 300
    const viewH = height
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, viewH)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / viewH, 0.1, 100)
    camera.position.set(0, 1.1, 4.2)
    camera.lookAt(0, 0.6, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(2, 4, 3)
    scene.add(sun)
    const rim = new THREE.DirectionalLight(0xb3e5fc, 0.7)
    rim.position.set(-3, 2, -2)
    scene.add(rim)

    const group = new THREE.Group()
    scene.add(group)

    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 })
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4 })
    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xffa7a7, roughness: 0.8 })

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), bodyMat)
    body.position.y = 0.55
    body.scale.set(1, 1.05, 0.95)
    group.add(body)

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 24), bellyMat)
    belly.position.set(0, 0.42, 0.5)
    belly.scale.set(1, 0.9, 0.55)
    group.add(belly)

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 32), bodyMat)
    head.position.y = 1.55
    group.add(head)

    const earGeo = new THREE.SphereGeometry(0.2, 16, 16)
    const earL = new THREE.Mesh(earGeo, bodyMat)
    earL.position.set(-0.42, 2.12, 0)
    earL.scale.set(1, 1.4, 0.8)
    group.add(earL)
    const earR = earL.clone()
    earR.position.x = 0.42
    group.add(earR)

    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12)
    const eyeL = new THREE.Mesh(eyeGeo, darkMat)
    eyeL.position.set(-0.24, 1.62, 0.6)
    group.add(eyeL)
    const eyeR = eyeL.clone()
    eyeR.position.x = 0.24
    group.add(eyeR)

    const cheekGeo = new THREE.SphereGeometry(0.09, 12, 12)
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat)
    cheekL.position.set(-0.4, 1.46, 0.52)
    cheekL.scale.set(1, 0.6, 0.5)
    group.add(cheekL)
    const cheekR = cheekL.clone()
    cheekR.position.x = 0.4
    group.add(cheekR)

    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), bodyMat)
    tail.position.set(0, 0.62, -0.95)
    group.add(tail)

    // 地面小影子
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -0.42
    scene.add(shadow)

    // 拖动旋转
    let dragging = false
    let lastX = 0
    let lastY = 0
    const el = renderer.domElement
    el.style.touchAction = 'pan-y'
    const onDown = (e) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      el.setPointerCapture && el.setPointerCapture(e.pointerId)
    }
    const onMove = (e) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      group.rotation.y += dx * 0.01
      group.rotation.x = Math.max(-0.5, Math.min(0.5, group.rotation.x + dy * 0.008))
    }
    const onUp = () => {
      dragging = false
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    // 待机动画
    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      if (!dragging) group.rotation.y += 0.004
      group.position.y = Math.sin(t * 2) * 0.05
      earL.rotation.z = Math.sin(t * 3) * 0.12
      earR.rotation.z = -Math.sin(t * 3) * 0.12
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth || width
      camera.aspect = w / viewH
      camera.updateProjectionMatrix()
      renderer.setSize(w, viewH)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointerdown', onDown)
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) obj.material.dispose()
      })
      if (el.parentNode === mount) mount.removeChild(el)
    }
  }, [color, height])

  return (
    <div className="pet3d-wrap" style={{ height }}>
      <div ref={mountRef} className="pet3d-mount" />
      {failed && (
        <div className="pet3d-fallback" style={{ height, lineHeight: `${height}px` }} aria-label={emoji}>
          {emoji}
        </div>
      )}
      <div className="pet3d-hint">👉 拖动可以旋转宠物</div>
    </div>
  )
}
