type EntryType = 'token' | 'ticket' | 'nft'
type Blockchain = 'ton' | 'ethereum' | 'polygon' | 'coredao'
type Token = 'TON' | 'USDT' | 'NOT'
type TournamentType = 'daily' | 'weekly' | 'sponsor'

interface NftPrize {
  name: string
  collection: string
  image: string
  description: string
}

interface WinnerField {
  place: number
  percent: number
  nft: NftPrize | null
}

interface TournamentFormData {
  name: string
  description: string
  playerLimit: number
  tournamentType: TournamentType
  icon: string
  color: number
  start_at: string
  end_at: string
  entryType: EntryType
  network: Blockchain
  token: Token
  entry_amount: string
  entry_tickets: string
  nftRequired: boolean
  collection_address: string
  winnersCount: number
  winners: WinnerField[]
}