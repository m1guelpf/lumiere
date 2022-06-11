import { gql } from '@apollo/client'

const GET_PUBLICATION_COMMENTS = gql`
	query GetVideoComments($id: InternalPublicationId!, $cursor: Cursor) {
		comments: publications(request: { limit: 50, cursor: $cursor, commentsOf: $id }) {
			items {
				... on Comment {
					...CommentFields
				}
			}
			pageInfo {
				prev
				next
				totalCount
			}
		}
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

	fragment MirrorBaseFields on Mirror {
		id
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

	fragment CommentBaseFields on Comment {
		id
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

	fragment CommentFields on Comment {
		...CommentBaseFields
		mainPost {
			... on Post {
				...PostFields
			}
			... on Mirror {
				...MirrorBaseFields
				mirrorOf {
					... on Post {
						...PostFields
					}
					... on Comment {
						...CommentMirrorOfFields
					}
				}
			}
		}
	}

	fragment CommentMirrorOfFields on Comment {
		...CommentBaseFields
		mainPost {
			... on Post {
				...PostFields
			}
			... on Mirror {
				...MirrorBaseFields
			}
		}
	}
`

export default GET_PUBLICATION_COMMENTS
