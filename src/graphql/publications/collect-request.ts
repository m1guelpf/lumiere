import { gql } from '@apollo/client'

const COLLECT_SIG = gql`
	mutation CreateCollectTypedData($options: TypedDataOptions, $request: CreateCollectRequest!) {
		createCollectTypedData(options: $options, request: $request) {
			id
			expiresAt
			typedData {
				types {
					CollectWithSig {
						name
						type
					}
				}
				domain {
					name
					chainId
					version
					verifyingContract
				}
				value {
					nonce
					deadline
					profileId
					pubId
					data
				}
			}
		}
	}
`

export default COLLECT_SIG
