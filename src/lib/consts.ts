import { chain } from 'wagmi'

export const APP_ID = 'lumiere'
export const APP_NAME = 'Lumiere'
export const ERROR_MESSAGE = 'Something went wrong! Please try again'

export const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK == 'mainnet'
export const CHAIN = IS_MAINNET ? chain.polygon : chain.polygonMumbai
export const API_URL = IS_MAINNET ? 'https://api.lens.dev' : 'https://api-mumbai.lens.dev'
export const LENSHUB_PROXY = IS_MAINNET
	? '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'
	: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82'
export const LENS_PERIPHERY = IS_MAINNET
	? '0xeff187b4190E551FC25a7fA4dFC6cf7fDeF7194f'
	: '0xD5037d72877808cdE7F669563e9389930AF404E8'

export const RELAYER_HOSTS = ['http://localhost:4783', 'https://lumiere.withlens.app']
export const RELAYER_ON = RELAYER_HOSTS.includes(process.env.NEXT_PUBLIC_URL)

export const verifiedProfiles = IS_MAINNET
	? [
			'0x1eb8' /** @kartik.lens */,
			'0x5138' /** @fabien.lens */,
			'0x3498' /** @sassal.lens */,
			'0x2e02' /** @rabbithole.lens */,
			'0x3479' /** @aavegotchi.lens */,
			'0x2f70' /** @owocki.lens */,
			'0x20c6' /** @coopahtroopa.lens */,
			'0xa1' /** @pealco.lens */,
			'0x24' /** @bradorbradley.lens */,
			'0x2e0a' /** @sandeep.lens */,
			'0x228d' /** @wongmjane.lens */,
			'0x28a2' /** @nader.lens */,
			'0x266b' /** @ryansadams.lens */,
			'0x25f3' /** @opensea.lens */,
			'0x26e5' /** @sismo.lens */,
			'0x16' /** @davidev.lens */,
			'0x23ac' /** @devpillme.lens */,
			'0xf5' /** @m1guelpf.lens */,
			'0x1b2f' /** @mudit.lens */,
			'0xcc' /** @indexcoop.lens */,
			'0x1cef' /** @trustlessstate.lens */,
			'0x38' /** @cashmere.lens */,
			'0x0210' /** @paris.lens */,
			'0x0160' /** @ethglobal.lens */,
			'0x8e' /** @christina.lens */,
			'0x0b' /** @zer0dot.lens */,
			'0x10' /** @damarnez.lens */,
			'0x09' /** @nicolo.lens */,
			'0x08' /** @donosonaumczuk.lens */,
			'0x06' /** @wagmi.lens */,
			'0x05' /** @stani.lens */,
			'0x04' /** @letsraave.lens */,
			'0x03' /** @aavegrants.lens */,
			'0x02' /** @aaveaave.lens */,
			'0x0c' /** @lenster.lens */,
			'0x0d' /** @yoginth.lens */,
			'0x01' /** @lensprotocol */,
	  ]
	: [
			'0x15' /** @yoginth.test */,
			'0x01' /** @lensprotocol.test */,
			'0x02' /** @donosonaumczuk.test */,
			'0x035d' /** @m1guelpf.test */,
	  ]
