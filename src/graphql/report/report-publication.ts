import { gql } from '@apollo/client'

const REPORT_PUBLICATION = gql`
	mutation ReportPublication($request: ReportPublicationRequest!) {
		reportPublication(request: $request)
	}
`

export default REPORT_PUBLICATION
