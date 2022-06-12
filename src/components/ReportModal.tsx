import toast from 'react-hot-toast'
import { classNames } from '@/lib/utils'
import { useMutation } from '@apollo/client'
import { ERROR_MESSAGE } from '@/lib/consts'
import { Dialog, Transition } from '@headlessui/react'
import { FC, Fragment, useRef, useState } from 'react'
import { ExclamationIcon } from '@heroicons/react/outline'
import REPORT_PUBLICATION from '@/graphql/report/report-publication'
import {
	PublicationReportingFraudSubreason,
	PublicationReportingIllegalSubreason,
	PublicationReportingReason,
	PublicationReportingSensitiveSubreason,
	ReportPublicationRequest,
} from '@/types/lens'

type Subreason =
	| PublicationReportingFraudSubreason
	| PublicationReportingIllegalSubreason
	| PublicationReportingSensitiveSubreason

const ReportModal: FC<{ open: boolean; onClose: () => void; videoId: string }> = ({ open, onClose, videoId }) => {
	const reportTypeRef = useRef(null)
	const [reportType, setReportType] = useState<PublicationReportingReason>(null)
	const [reason, setReason] = useState<Subreason>(null)
	const [comments, setComments] = useState<string>('')

	const [report, { loading }] = useMutation<void, { request: ReportPublicationRequest }>(REPORT_PUBLICATION, {
		variables: {
			request: {
				publicationId: videoId,
				additionalComments: comments,
				reason: {
					[`${reportType?.toLowerCase()}Reason`]: {
						reason: reportType,
						subreason: reason,
					},
				},
			},
		},
		onError: error => {
			toast.error(error?.message ?? ERROR_MESSAGE)
			closeForm(null, true)
		},
		onCompleted: () => {
			toast.success('Video reported successfully!')
			closeForm(null, true)
		},
	})

	const closeForm = (event = null, forceClose = false) => {
		event?.preventDefault?.()

		if (loading && !forceClose) return

		setReason(null)
		setReportType(null)

		onClose()
	}

	const handleSubmitForm = event => {
		event.preventDefault()

		report()
	}

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as="div" className="relative z-10" initialFocus={reportTypeRef} onClose={closeForm}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</Transition.Child>

				<div className="fixed z-10 inset-0 overflow-y-auto ">
					<div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel
								as="form"
								onSubmit={handleSubmitForm}
								onReset={closeForm}
								className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full"
							>
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-center">
										<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
											<ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
										</div>
										<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
											<Dialog.Title
												as="h3"
												className="text-lg leading-6 font-medium text-gray-900"
											>
												Report post
											</Dialog.Title>
											<div className="mt-1">
												<p className="text-sm text-gray-500 text-center sm:text-left">
													Help us understand the problem. What is going on with this video?
												</p>
											</div>
										</div>
									</div>
									<div>
										<label htmlFor="type" className="block text-sm font-medium text-gray-700">
											Type
										</label>
										<select
											ref={reportTypeRef}
											id="type"
											value={reportType}
											onChange={event =>
												setReportType(event.target.value as PublicationReportingReason)
											}
											name="type"
											required
											className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
										>
											<option value="" selected disabled hidden>
												Select an option...
											</option>
											<option value={PublicationReportingReason.Fraud}>Fraud</option>
											<option value={PublicationReportingReason.Illegal}>Illegal</option>
											<option value={PublicationReportingReason.Sensitive}>Sensitive</option>
										</select>
									</div>
									{reportType && (
										<div className="mt-3">
											<label htmlFor="reason" className="block text-sm font-medium text-gray-700">
												Reason
											</label>
											<select
												id="reason"
												required
												value={reason}
												onChange={event => setReason(event.target.value as Subreason)}
												name="reason"
												className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
											>
												<option value="" selected disabled hidden>
													Select an option...
												</option>
												{reportType == PublicationReportingReason.Fraud && (
													<>
														<option value={PublicationReportingFraudSubreason.Scam}>
															Scam
														</option>
														<option
															value={PublicationReportingFraudSubreason.Impersonation}
														>
															Impersonation
														</option>
													</>
												)}
												{reportType == PublicationReportingReason.Illegal && (
													<>
														<option
															value={PublicationReportingIllegalSubreason.AnimalAbuse}
														>
															Animal Abuse
														</option>
														<option
															value={PublicationReportingIllegalSubreason.AnimalAbuse}
														>
															Human Abuse
														</option>
													</>
												)}
												{reportType == PublicationReportingReason.Sensitive && (
													<>
														<option value={PublicationReportingSensitiveSubreason.Nsfw}>
															NSFW
														</option>
														<option
															value={PublicationReportingSensitiveSubreason.Offensive}
														>
															Offensive
														</option>
													</>
												)}
											</select>
										</div>
									)}
									{reason && (
										<div className="mt-3">
											<label
												htmlFor="comment"
												className="block text-sm font-medium text-gray-700"
											>
												Additional Comments
											</label>
											<div className="mt-1">
												<textarea
													rows={4}
													value={comments}
													onChange={event => setComments(event.target.value)}
													name="comment"
													id="comment"
													className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
													defaultValue={''}
												/>
											</div>
										</div>
									)}
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
									<button
										type="submit"
										disabled={!reportType || !reason || loading}
										className={classNames(
											loading
												? 'disabled:cursor-wait disabled:animate-pulse'
												: 'disabled:cursor-not-allowed',
											'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 disabled:bg-red-400 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm'
										)}
									>
										Report
									</button>
									<button
										disabled={loading}
										type="reset"
										className="mt-3 w-full disabled:cursor-wait disabled:text-gray-400 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 disabled:hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
									>
										Cancel
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	)
}

export default ReportModal
