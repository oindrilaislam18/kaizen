"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function BarChart({ data }) {
  const canvasRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const barWidth = (width - padding * 2) / data.length - 10

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map((item) => item.value))

    // Colors based on theme
    const textColor = theme === "dark" ? "#ffffff" : "#000000"
    const barColor = theme === "dark" ? "#3b82f6" : "#2563eb"

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = textColor
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw bars
    data.forEach((item, index) => {
      const x = padding + index * (barWidth + 10) + 5
      const barHeight = (item.value / maxValue) * (height - padding * 2)
      const y = height - padding - barHeight

      ctx.fillStyle = barColor
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)

      // Draw label below bar
      ctx.fillText(item.name, x + barWidth / 2, height - padding + 15)
    })
  }, [data, theme])

  return <canvas ref={canvasRef} width={500} height={300} className="w-full h-full" />
}

export function LineChart({ data }) {
  const canvasRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Colors based on theme
    const textColor = theme === "dark" ? "#ffffff" : "#000000"
    const lineColor1 = theme === "dark" ? "#3b82f6" : "#2563eb"
    const lineColor2 = theme === "dark" ? "#ef4444" : "#dc2626"

    // Find max value for scaling
    const allValues = data.flatMap((item) => [item.completed, item.created])
    const maxValue = Math.max(...allValues)

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = textColor
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw completed line
    ctx.beginPath()
    ctx.strokeStyle = lineColor1
    ctx.lineWidth = 2
    data.forEach((item, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1)
      const y = height - padding - (item.completed / maxValue) * chartHeight
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw created line
    ctx.beginPath()
    ctx.strokeStyle = lineColor2
    ctx.lineWidth = 2
    data.forEach((item, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1)
      const y = height - padding - (item.created / maxValue) * chartHeight
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw labels
    ctx.fillStyle = textColor
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    data.forEach((item, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1)
      ctx.fillText(item.name, x, height - padding + 15)
    })

    // Draw legend
    ctx.fillStyle = lineColor1
    ctx.fillRect(width - padding - 100, padding, 10, 10)
    ctx.fillStyle = textColor
    ctx.textAlign = "left"
    ctx.fillText("Completed", width - padding - 85, padding + 9)

    ctx.fillStyle = lineColor2
    ctx.fillRect(width - padding - 100, padding + 20, 10, 10)
    ctx.fillStyle = textColor
    ctx.fillText("Created", width - padding - 85, padding + 29)
  }, [data, theme])

  return <canvas ref={canvasRef} width={500} height={300} className="w-full h-full" />
}

export function PieChart({ data }) {
  const canvasRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Colors based on theme
    const textColor = theme === "dark" ? "#ffffff" : "#000000"
    const colors = [
      "#3b82f6", // blue
      "#ef4444", // red
      "#10b981", // green
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#ec4899", // pink
    ]

    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Draw pie chart
    let startAngle = 0
    data.forEach((item, index) => {
      const sliceAngle = (2 * Math.PI * item.value) / total
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.fillStyle = colors[index % colors.length]
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(midAngle)
      const labelY = centerY + labelRadius * Math.sin(midAngle)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(item.value.toString(), labelX, labelY)

      startAngle = endAngle
    })

    // Draw legend
    const legendX = width - 120
    const legendY = 40
    data.forEach((item, index) => {
      const y = legendY + index * 25

      ctx.fillStyle = colors[index % colors.length]
      ctx.fillRect(legendX, y, 15, 15)

      ctx.fillStyle = textColor
      ctx.font = "14px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(item.name, legendX + 25, y + 7)
    })
  }, [data, theme])

  return <canvas ref={canvasRef} width={500} height={300} className="w-full h-full" />
}
