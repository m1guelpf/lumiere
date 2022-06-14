import { gql } from '@apollo/client'

const FOLLOW_REQUEST_SIG = gql`
	mutation ($request: FollowRequest!) {
		createFollowTypedData(request: $request) {
			id
			expiresAt
			typedData {
				domain {
					name
					chainId
					version
					verifyingContract
				}
				types {
					FollowWithSig {
						name
						type
					}
				}
				value {
					nonce
					deadline
					profileIds
					datas
				}
			}
		}
	}
`

export default FOLLOW_REQUEST_SIG
