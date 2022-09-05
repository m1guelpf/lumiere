import { useMemo } from 'react'
import { Erc20 } from '@/types/lens'
import { gql, useQuery } from '@apollo/client'

const CURRENCY_QUERY = gql`
	query EnabledModuleCurrencies {
		enabledModuleCurrencies {
			name
			symbol
			decimals
			address
		}
	}
`

const useApprovedCurrencies = (): { currencies: Erc20[]; loading: boolean } => {
	const { data, loading } = useQuery<{ enabledModuleCurrencies: Erc20[] }>(CURRENCY_QUERY)

	const currencies = useMemo<Erc20[]>(() => data?.enabledModuleCurrencies ?? [], [data])

	return { currencies, loading }
}

export default useApprovedCurrencies
