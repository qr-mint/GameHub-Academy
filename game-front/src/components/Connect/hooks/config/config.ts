import { http, createConfig } from 'wagmi';
import {
	mainnet, sepolia,
	ancient8 as ancient8, ancient8Sepolia,
	kaia as kaiaMannet,
	coreDao as coreDaoMainet,
	flowMainnet, flowTestnet,
	seiTestnet, sei as seiMainnet,
	bsc as bscMainnet, bscTestnet,
} from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const networkType = import.meta.env.VITE_NETWORK;

const coreDaoTestnet = {
	id: 1114,
	chainName: 'CoreDAO',
	chainId: '0x45a',
	name: 'CoreDao Testnet2',
	network: 'coredao-testnet2',
	nativeCurrency: {
		name: 'tCORE',
		symbol: 'tCORE',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: ['https://rpc.test2.btcs.network'],
		},
	},
	blockExplorers: {
		default: {
			name: 'Core Explorer',
			url: 'https://scan.test2.btcs.network'
		},
	},
	testnet: true,
};
coreDaoMainet.chainId = '0x45c';

const kaiaTestnet = {
	id: 1001,
	chainId: '0x3e9',
	chainName: 'Kaia',
	name: 'Kaia Kairos Testnet',
	nativeCurrency: {
		decimals: 18,
		name: 'Kaia',
		symbol: 'KAIA',
	},
	rpcUrls: {
		default: { http: ['https://public-en-kairos.node.kaia.io'] },
	},
	blockExplorers: {
		default: {
			name: 'KaiaScan',
			url: 'https://kairos.kaiascan.io',
			apiUrl: 'https://api-cypress.klaytnscope.com/api',
		},
	},
};

export const botChainTestnet = {
	id: 968,
	name: 'BOT Chain Testnet',
	network: 'botchain-testnet',

	nativeCurrency: {
		name: 'BOT',
		symbol: 'BOT',
		decimals: 18,
	},

	rpcUrls: {
		default: {
			http: ['https://rpc.bohr.life'],
		},
		public: {
			http: ['https://rpc.bohr.life'],
		},
	},

	blockExplorers: {
		default: {
			name: 'BOT Chain Explorer',
			url: 'https://scan.bohr.life',
		},
	},

	testnet: true,
};

export const botChainMainnet = {
	id: 677,
	name: 'BOT Chain',
	network: 'botchain',

	nativeCurrency: {
		name: 'BOT',
		symbol: 'BOT',
		decimals: 18,
	},

	rpcUrls: {
		default: {
			http: ['https://rpc.botchain.ai'],
		},
		public: {
			http: ['https://rpc.botchain.ai'],
		},
	},

	blockExplorers: {
		default: {
			name: 'BOT Chain Explorer',
			url: 'https://scan.botchain.ai',
		},
	},

	testnet: false,
};

export const coreDao = networkType === 'testnet' ? coreDaoTestnet : coreDaoMainet;
export const ancient = networkType === 'testnet' ? ancient8Sepolia : ancient8;
export const flow = networkType === 'testnet' ? flowTestnet : flowMainnet;
export const sei = networkType === 'testnet' ? seiTestnet : seiMainnet;
export const kaia = networkType === 'testnet' ? kaiaTestnet : kaiaMannet;
export const bsc = networkType === 'testnet' ? bscTestnet : bscMainnet;
export const botChain = networkType === 'testnet' ? botChainTestnet : botChainMainnet;

export const configEvm = createConfig({
	chains: [ mainnet, sepolia, ancient, kaia, coreDao, flow, sei, bsc, botChain ],
	connectors: [
		injected({}),
		walletConnect({
			projectId: import.meta.env.VITE_PROJECT_ID,
			showQrModal: true,
		}),
	],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[ancient.id]: http(),
		[kaia.id]: http(),
		[coreDao.id]: http(),
		[flow.id]: http(),
		[sei.id]: http(),
		[bsc.id]: http(),
		[botChain.id]: http()
		// Добавьте транспорты для других сетей по аналогии
	},
});