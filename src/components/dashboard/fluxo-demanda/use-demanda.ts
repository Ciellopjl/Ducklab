import useSWR from 'swr'
import { DemandaResponse } from './types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useDemanda() {
  const { data, error, isLoading, mutate } = useSWR<DemandaResponse>(
    '/api/dashboard/demanda',
    fetcher,
    {
      refreshInterval: 30000, // Revalidação a cada 30 segundos
      revalidateOnFocus: true,
    }
  )

  return {
    demanda: data,
    isLoading,
    isError: error,
    mutate,
  }
}
