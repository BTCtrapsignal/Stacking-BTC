/**
 * usePrice — fetches live BTC/USD from CoinGecko
 *            AND live USD/THB from exchangerate-api.com (free tier).
 * Returns { loading, updatedAt, refresh }
 * Calls onPriceUpdate({ btcUsd, usdthb }) on success.
 */
import { useState, useCallback } from 'react'

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'

const EXCHANGERATE_URL =
  'https://api.exchangerate-api.com/v4/latest/USD'

export function usePrice(onPriceUpdate) {
  const [loading,   setLoading]   = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch BTC/USD and USD/THB in parallel
      const [btcRes, fxRes] = await Promise.allSettled([
        fetch(COINGECKO_URL).then(r => r.json()),
        fetch(EXCHANGERATE_URL).then(r => r.json()),
      ])

      const btcUsd = btcRes.status === 'fulfilled'
        ? +btcRes.value?.bitcoin?.usd || 0
        : 0

      const usdthb = fxRes.status === 'fulfilled'
        ? +fxRes.value?.rates?.THB || 0
        : 0

      // Only update what we successfully fetched
      const update = {}
      if (btcUsd > 0) update.btcUsd = btcUsd
      if (usdthb > 0) update.usdthb = usdthb

      if (Object.keys(update).length > 0) {
        onPriceUpdate(update)
        setUpdatedAt(new Date())
      }
    } catch (e) {
      console.warn('Price fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }, [onPriceUpdate])

  return { loading, updatedAt, refresh }
}
