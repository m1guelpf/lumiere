import { gql } from '@apollo/client'

const DOES_FOLLOW = gql`
	query ($profileId: ProfileId!) {
		profile(request: { profileId: $profileId }) {
			isFollowedByMe
		}
	}
`

export default DOES_FOLLOW
