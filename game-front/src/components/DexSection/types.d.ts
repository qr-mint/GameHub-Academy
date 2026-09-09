export interface DexInfo {
  dexName: string // какой это DEX, напр. "STON.fi"
  pair: string // пара, напр. "TON / WHG"
  jettonSymbol: string // символ джеттона, напр. "WHG"
  lpBalance: number // текущий баланс LP Token
  lpInitial: number // сколько было LP Token когда положили
  tonInLiquidity: number // сколько TON положено в ликвидность
  jettonInLiquidity: number // сколько джеттона в ликвидности
  apr: number // годовой процент (APR), %
  tvl: number // TVL пула в TON
}