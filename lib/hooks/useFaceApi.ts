'use client'

import { useEffect, useState } from 'react'
import * as faceapi from 'face-api.js'

export interface UseFaceApiReturn {
  modelsLoaded: boolean
  isLoading: boolean
  error: string | null
}

export function useFaceApi(): UseFaceApiReturn {
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const MODEL_URL = '/models'

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])

        setModelsLoaded(true)
        console.log('Face-api.js models loaded successfully')
      } catch (err) {
        console.error('Error loading face-api.js models:', err)
        setError(err instanceof Error ? err.message : 'Failed to load models')
      } finally {
        setIsLoading(false)
      }
    }

    loadModels()
  }, [])

  return { modelsLoaded, isLoading, error }
}

export async function detectFaceDescriptor(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  try {
    const detection = await faceapi
      .detectSingleFace(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      return null
    }

    return detection.descriptor
  } catch (error) {
    console.error('Error detecting face:', error)
    return null
  }
}

export function createFaceMatcher(
  labeledDescriptors: faceapi.LabeledFaceDescriptors[],
  distanceThreshold = 0.6
): faceapi.FaceMatcher {
  return new faceapi.FaceMatcher(labeledDescriptors, distanceThreshold)
}

export function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}
