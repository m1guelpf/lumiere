import { gql } from '@apollo/client'

const GET_USER_PUBLICATIONS = gql`
	query GetVideos($profileId: ProfileId!, $cursor: Cursor) {
		videos: publications(
			request: {
				profileId: $profileId
				publicationTypes: [POST]
				limit: 25
				cursor: $cursor
				sources: ["lumiere"]
			}
		) {
			items {
				__typename
				... on Post {
					...PostFields
				}
			}
			pageInfo {
				prev
				next
				totalCount
			}
		}
	}

	fragment MediaFields on Media {
		url
		mimeType
	}

	fragment PublicationStatsFields on PublicationStats {
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
		hidden
		stats {
			...PublicationStatsFields
		}
		metadata {
			...MetadataOutputFields
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

export default GET_USER_PUBLICATIONS
