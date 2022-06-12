import { gql } from '@apollo/client'

const GET_PROFILE = gql`
	query GetProfile($handle: Handle!) {
		profile(request: { handle: $handle }) {
			id
			handle
			name
			bio
			stats {
				totalFollowers
				totalPosts
			}
			picture {
				__typename
				... on NftImage {
					contractAddress
					tokenId
					uri
					verified
				}
				... on MediaSet {
					original {
						url
						mimeType
					}
				}
			}
			coverPicture {
				__typename
				... on NftImage {
					contractAddress
					tokenId
					uri
					verified
				}
				... on MediaSet {
					original {
						url
						mimeType
					}
				}
			}
			attributes {
				key
				traitType
				value
			}
			followModule {
				... on FeeFollowModuleSettings {
					type
					amount {
						asset {
							symbol
							name
							decimals
							address
						}
						value
					}
					recipient
				}
				... on ProfileFollowModuleSettings {
					type
				}
				... on RevertFollowModuleSettings {
					type
				}
			}
		}
	}
`

export default GET_PROFILE
