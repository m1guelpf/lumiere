import client from '@/lib/apollo'
import { useCallback, useEffect, useMemo } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'
import {
	Maybe,
	TransactionError,
	TransactionResult,
	TransactionReceipt,
	TransactionErrorReasons,
	TransactionIndexedResult,
	PublicationMetadataStatusType,
	QueryHasTxHashBeenIndexedArgs,
} from '@/types/lens'

type WaitForActionProps = {
	txId?: string
	txHash?: string
	onError?: (reason: TransactionErrorReasons | string) => void
	onIndex?: (receipt: TransactionReceipt) => void
	onParse?: (receipt: TransactionReceipt) => void
}

type WaitForAction = {
	indexed: boolean
	loading: boolean
	data: Maybe<TransactionResult>
	waitForAction: ({ txId, txHash }: { txId?: string; txHash?: string }) => Promise<Maybe<TransactionResult>>
	resolveOnAction: ({ txId, txHash }: { txId?: string; txHash?: string }) => () => Promise<Maybe<TransactionResult>>
	error: ApolloError | TransactionErrorReasons | string
	metadataStatus: PublicationMetadataStatusType
}

const INDEXED_REQ = gql`
	query ($request: HasTxHashBeenIndexedRequest!) {
		tx: hasTxHashBeenIndexed(request: $request) {
			... on TransactionIndexedResult {
				indexed
				txReceipt {
					to
					from
					contractAddress
					transactionIndex
					root
					gasUsed
					logsBloom
					blockHash
					transactionHash
					blockNumber
					confirmations
					cumulativeGasUsed
					effectiveGasPrice
					byzantium
					type
					status
					logs {
						blockNumber
						blockHash
						transactionIndex
						removed
						address
						data
						topics
						transactionHash
						logIndex
					}
				}
				metadataStatus {
					status
					reason
				}
			}
			... on TransactionError {
				reason
				txReceipt {
					to
					from
					contractAddress
					transactionIndex
					root
					gasUsed
					logsBloom
					blockHash
					transactionHash
					blockNumber
					confirmations
					cumulativeGasUsed
					effectiveGasPrice
					byzantium
					type
					status
					logs {
						blockNumber
						blockHash
						transactionIndex
						removed
						address
						data
						topics
						transactionHash
						logIndex
					}
				}
			}
			__typename
		}
	}
`

export const hasTxBeenIndexed = ({ txId, txHash }) => {
	return client.query<{ tx: TransactionResult }, QueryHasTxHashBeenIndexedArgs>({
		query: INDEXED_REQ,
		variables: { request: txId ? { txId } : { txHash } },
		fetchPolicy: 'network-only',
	})
}

const useWaitForAction = ({ txId, txHash, onError, onIndex, onParse }: WaitForActionProps): WaitForAction => {
	const {
		data,
		error: queryError,
		loading,
		refetch,
	} = useQuery<{ tx: TransactionResult }, QueryHasTxHashBeenIndexedArgs>(INDEXED_REQ, {
		variables: { request: txId ? { txId } : { txHash } },
		skip: !txId && !txHash,
		fetchPolicy: 'network-only',
	})

	useEffect(() => {
		if (loading || !data) return

		if (data.tx.__typename == 'TransactionError') {
			onError && onError(data.tx.reason)
			throw data.tx.reason
		}

		if (data.tx.indexed && onIndex) onIndex(data.tx.txReceipt)
		if (data.tx.metadataStatus?.status === PublicationMetadataStatusType.Success && onParse) {
			onParse(data.tx.txReceipt)
			return
		}
		if (data.tx.metadataStatus?.status === PublicationMetadataStatusType.MetadataValidationFailed && onError) {
			onError(data.tx.metadataStatus.reason)

			throw data.tx.metadataStatus.reason
		}

		refetch()
	})

	const indexed = useMemo<boolean>(
		() => data?.tx?.__typename == 'TransactionIndexedResult' && data?.tx?.indexed,
		[data]
	)
	const metadataStatus = useMemo<PublicationMetadataStatusType>(
		() => data?.tx?.__typename == 'TransactionIndexedResult' && data?.tx?.metadataStatus?.status,
		[data]
	)
	const error = useMemo(
		() =>
			queryError ||
			(data?.tx as TransactionError)?.reason ||
			(data?.tx as TransactionIndexedResult)?.metadataStatus?.reason,
		[queryError, data]
	)

	const waitForAction = useCallback(
		async ({ txId: _txId, txHash: _txHash }) => {
			if (!txId && !txHash && !_txId && !_txHash) throw new Error('Transaction details not provided.')

			while (true) {
				try {
					const res = await hasTxBeenIndexed({ txId: _txId || txId, txHash: _txHash || txHash })
					const tx = res?.data?.tx

					const error =
						res?.errors?.[0] ||
						(tx as TransactionError)?.reason ||
						(tx as TransactionIndexedResult)?.metadataStatus?.reason

					if (error) throw error
					if (
						tx?.__typename == 'TransactionIndexedResult' &&
						tx?.indexed &&
						tx?.metadataStatus?.status == PublicationMetadataStatusType.Success
					) {
						return tx
					}

					await new Promise(resolve => setTimeout(resolve, 1000))
				} catch (error) {
					console.log({ error })
				}
			}
		},
		[txId, txHash]
	)

	const resolveOnAction = useCallback(
		({ txId, txHash }: { txId?: string; txHash?: string }) => {
			return () => waitForAction({ txId, txHash })
		},
		[waitForAction]
	)

	return {
		error,
		indexed,
		loading,
		waitForAction,
		resolveOnAction,
		data: data?.tx,
		metadataStatus,
	}
}

export default useWaitForAction
