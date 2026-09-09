import { useState, useCallback } from 'react'
import axiosClient from '../api/axiosClient'

export const useHouseBalances = (houseId) => {
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!houseId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await axiosClient.get(`/houses/${houseId}/balances`)
      setBalances(data.balances || [])
      setSettlements(data.settlementSuggestions || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load balances')
    } finally {
      setLoading(false)
    }
  }, [houseId])

  return { balances, settlements, loading, error, refetch: fetch }
}
