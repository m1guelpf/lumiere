import { gql } from '@apollo/client'

const GET_PUBLICATION = gql`
	query GetVideo($id: InternalPublicationId!) {
		video: publication(request: { publicationId: $id }) {
			... on Post {
				...PostFields
			}
		}
	}

	fragment MediaFields on Media {
		url
		mimeType
	}

	fragment PublicationStatsFields on PublicationStats {
		totalUpvotes
		totalDownvotes
		totalAmountOfMirrors
		totalAmountOfCollects
		totalAmountOfComments
	}

	fragment MetadataOutputFields on MetadataOutput {
		name
		description
		content
		cover {
			original {
				...MediaFields
			}
		}
		media {
			original {
				...MediaFields
			}
		}
		attributes {
			displayType
			traitType
			value
		}
	}

	fragment Erc20Fields on Erc20 {
		name
		symbol
		decimals
		address
	}

	fragment CollectModuleFields on CollectModule {
		__typename
		... on FreeCollectModuleSettings {
			type
			followerOnly
			contractAddress
		}
		... on FeeCollectModuleSettings {
			type
			amount {
				asset {
					...Erc20Fields
				}
				value
			}
			recipient
			referralFee
		}
		... on LimitedFeeCollectModuleSettings {
			type
			collectLimit
			amount {
				asset {
					...Erc20Fields
				}
				value
			}
			recipient
			referralFee
		}
		... on LimitedTimedFeeCollectModuleSettings {
			type
			collectLimit
			amount {
				asset {
					...Erc20Fields
				}
				value
			}
			recipient
			referralFee
			endTimestamp
		}
		... on RevertCollectModuleSettings {
			type
		}
		... on TimedFeeCollectModuleSettings {
			type
			amount {
				asset {
					...Erc20Fields
				}
				value
			}
			recipient
			referralFee
			endTimestamp
		}
	}

	fragment PostFields on Post {
		id
		stats {
			...PublicationStatsFields
		}
		metadata {
			...MetadataOutputFields
		}
		profile {
			id
			handle
			name
			bio
			stats {
				totalFollowers
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
						...MediaFields
					}
				}
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
		createdAt
		collectModule {
			...CollectModuleFields
		}
		referenceModule {
			... on FollowOnlyReferenceModuleSettings {
				type
			}
		}
		appId
	}
`

export default GET_PUBLICATION
