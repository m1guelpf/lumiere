import { gql } from '@apollo/client'

const CREATE_MIRROR_SIG = gql`
	mutation ($request: CreateMirrorRequest!) {
		createMirrorTypedData(request: $request) {
			id
			expiresAt
			typedData {
				types {
					MirrorWithSig {
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
					profileIdPointed
					pubIdPointed
					referenceModule
					referenceModuleData
					referenceModuleInitData
				}
			}
		}
	}
`

export default CREATE_MIRROR_SIG
