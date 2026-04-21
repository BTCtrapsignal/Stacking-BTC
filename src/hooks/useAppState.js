/**
 * useAppState — central state hook.
 * Persists to localStorage. Initialises from seed data.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_SETTINGS, DCA_ENTRIES, DIP_ENTRIES,
  FUTURES_ENTRIES, GRID_ENTRIES, TRIGGERS,
} from '../data/seed'

const STORAGE_KEY = 'btc-stack-v5'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function buildInitialState() {
  const saved = loadState()
  return {
    settings: { ...DEFAULT_SETTINGS, ...(saved?.settings || {}) },
    dca:      saved?.dca      ?? DCA_ENTRIES,
    dip:      saved?.dip      ?? DIP_ENTRIES,
    futures:  saved?.futures  ?? FUTURES_ENTRIES,
    grid:     saved?.grid     ?? GRID_ENTRIES,
    triggers: saved?.triggers ?? TRIGGERS,
  }
}

export function useAppState() {
  const [state, setState] = useState(buildInitialState)

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const updateSettings = useCallback((patch) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const addEntry = useCallback((type, entry) => {
    setState(s => ({ ...s, [type]: [entry, ...s[type]] }))
  }, [])

  const updateTriggers = useCallback((triggers) => {
    setState(s => ({ ...s, triggers }))
  }, [])

  return { state, updateSettings, addEntry, updateTriggers }
}
