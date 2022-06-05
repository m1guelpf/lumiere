import { gql } from '@apollo/client'

const GET_PROFILES = gql`
	query ($address: EthereumAddress!) {
		profiles(request: { ownedBy: [$address], limit: 5 }) {
			items {
				id
				isDefault
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
			}
		}
	}
`

export default GET_PROFILES
