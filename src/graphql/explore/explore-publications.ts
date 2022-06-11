import { gql } from '@apollo/client'

const EXPLORE_PUBLICATIONS = gql`
	query ExplorePublications {
		explorePublications(
			request: {
				limit: 28
				publicationTypes: [POST]
				sortCriteria: TOP_COLLECTED
				sources: ["lumiere", "Lenstube"]
			}
		) {
			items {
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
		width
		height
		mimeType
	}

	fragment ProfileFields on Profile {
		id
		name
		bio
		attributes {
			displayType
			traitType
			key
			value
		}
		metadata
		isDefault
		handle
		picture {
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
				small {
					...MediaFields
				}
				medium {
					...MediaFields
				}
			}
		}
		coverPicture {
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
				small {
					...MediaFields
				}
				medium {
					...MediaFields
				}
			}
		}
		ownedBy
		dispatcher {
			address
		}
		stats {
			totalFollowers
			totalFollowing
			totalPosts
			totalComments
			totalMirrors
			totalPublications
			totalCollects
		}
		followModule {
			... on FeeFollowModuleSettings {
				type
				amount {
					asset {
						name
						symbol
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

	fragment PublicationStatsFields on PublicationStats {
		totalAmountOfMirrors
		totalAmountOfCollects
		totalAmountOfComments
	}

	fragment MetadataOutputFields on MetadataOutput {
		name
		description
		content
		media {
			original {
				...MediaFields
			}
		}
		cover {
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
		profile {
			...ProfileFields
		}
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

export default EXPLORE_PUBLICATIONS
