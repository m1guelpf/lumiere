import { useAccount } from 'wagmi'
import { useQuery } from '@apollo/client'
import GET_PROFILES from '@/graphql/profiles/get-profiles'
import { Maybe, Profile, Query, Scalars } from '@/types/lens'
import { useContext, createContext, Dispatch, SetStateAction, useState, FC, ReactNode, useEffect } from 'react'

type ContextData = {
	profile: Maybe<Profile>
	profiles: Maybe<Profile[]>
	setSelectedProfile: Dispatch<SetStateAction<number>>
	isAuthenticated: boolean
	setAuthenticated: Dispatch<SetStateAction<boolean>>
}

const ProfileContext = createContext<ContextData>(null)
ProfileContext.displayName = 'ProfileContext'

export const useProfile = (): ContextData => {
	return useContext(ProfileContext)
}

export const ProfileProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const { data: accountData } = useAccount()
	const [isAuthenticated, setAuthenticated] = useState<boolean>(false)
	const [selectedProfile, setSelectedProfile] = useState<number>(0)
	const { data: profiles } = useQuery<{ profiles: Query['profiles'] }, { address: Scalars['EthereumAddress'] }>(
		GET_PROFILES,
		{
			variables: { address: accountData?.address },
			skip: !accountData?.address,
		}
	)

	useEffect(() => {
		if (!profiles?.profiles?.items || selectedProfile != 0) return

		const defaultIndex = profiles.profiles.items.findIndex(profile => profile.isDefault)

		setSelectedProfile(defaultIndex == -1 ? 0 : defaultIndex)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profiles])

	return (
		<ProfileContext.Provider
			value={{
				profile: profiles?.profiles?.items?.[selectedProfile],
				profiles: profiles?.profiles?.items,
				setSelectedProfile,
				isAuthenticated,
				setAuthenticated,
			}}
		>
			{children}
		</ProfileContext.Provider>
	)
}

export default ProfileContext
