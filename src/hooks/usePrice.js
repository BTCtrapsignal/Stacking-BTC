/**
 * usePrice — fetches live BTC/USD price from CoinGecko.
 * Returns { price, updatedAt, loading, refresh }
 */
import { useState, useCallback } from 'react'

export function usePrice(onPriceUpdate) {
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      const data = await res.json()
      if (data?.bitcoin?.usd) {
        onPriceUpdate(+data.bitcoin.usd)
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
