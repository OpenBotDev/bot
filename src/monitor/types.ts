import { ParsedTransactionWithMeta } from "@solana/web3.js";

export class PoolFeesModel {
    constructor(
        public minSeparateNumerator: string,
        public minSeparateDenominator: string,
        public tradeFeeNumerator: string,
        public tradeFeeDenominator: string,
        public pnlNumerator: string,
        public pnlDenominator: string,
        public swapFeeNumerator: string,
        public swapFeeDenominator: string
    ) { }
}

export class PoolOutputModel {
    constructor(
        public needTakePnlCoin: string,
        public needTakePnlPc: string,
        public totalPnlPc: string,
        public totalPnlCoin: string,
        public poolOpenTime: string,
        public punishPcAmount: string,
        public punishCoinAmount: string,
        public orderbookToInitTime: string,
        public swapCoinInAmount: string,
        public swapPcOutAmount: string,
        public swapTakePcFee: string,
        public swapPcInAmount: string,
        public swapCoinOutAmount: string,
        public swapTakeCoinFee: string
    ) { }
}

export class PoolModel {
    constructor(
        public blockTime: number,
        public poolAccount: string,
        public status: string,
        public nonce: string,
        public orderNum: string,
        public depth: string,
        public coinDecimals: string,
        public pcDecimals: string,
        public coinAmount: string,
        public pcAmount: string,
        public state: string,
        public resetFlag: string,
        public minSize: string,
        public volMaxCutRatio: string,
        public amountWave: string,
        public coinLotSize: string,
        public pcLotSize: string,
        public minPriceMultiplier: string,
        public maxPriceMultiplier: string,
        public sysDecimalValue: string,
        public fees: PoolFeesModel,
        public outPut: PoolOutputModel,
        public tokenCoin: string,
        public tokenPc: string,
        public coinMint: string,
        public pcMint: string,
        public lpMint: string,
        public openOrders: string,
        public market: string,
        public serumDex: string,
        public targetOrders: string,
        public withdrawQueue: string,
        public tokenTempLp: string,
        public ammOwner: string,
        public lpAmount: string,
        public clientOrderId: string,
        public padding: string[]
    ) { }
}

export class TokenModel {
    constructor(
        public name: string,
        public symbol: string,
        public address: string,
        public description: string,
        public creator_name: string,
        public creator_site: string,
        public supply: string
    ) { }
}

export type MonitorMessage = {
    poolAddress: string;
    signature: string;
    time: number;
};

export type User = {
    name: string;
};


export type PoolDetectionMessage = {
    poolAddress: string;
    time: number;
    signature: string;
};

export type buy_tx = {
    "type": string,
    "sol_spent": string,
    "token_received": string,
    "buyer": string,
    "tx_signature": string,
};

export type sell_tx = {
    "type": string,
    "sol_received": string,
    "token_spent": string,
    "seller": string,
    "tx_signature": string,
};

export interface ModelDictionary {
    [key: string]: any;
}

export class PairModel {
    constructor(public token: TokenModel, public base: TokenModel) { }
}


export interface IPoolInfo {
    poolAddress: string;
    launchTime: string;
    tokenAddress: string;
    lpBurn: boolean;
    tokenMintBurn: boolean;
    txPerMinute: number;
    tokenDecimal: number;
    tokenName: string;
    tokenSymbol: string;
    mintPercentage: number;
}

export type AnalyzerMessage = {
    tries: number;
    poolAddress: string;
    signature: string;
};



export interface Pool {
    pool_account: string;
    block_time: number;
    lp_amount: string;
    pool_open_time: string;
    pool_mint_signature: string;
    pair_details: {
        coin_decimals: number;
        pc_decimals: number;
        fees: {
            min_separate_numerator: string;
            min_separate_denominator: string;
            trade_fee_numerator: string;
            trade_fee_denominator: string;
            pnl_numerator: string;
            pnl_denominator: string;
            swap_fee_numerator: string;
            swap_fee_denominator: string;
        };
        token_coin: string;
        token_pc: string;
        coin_mint: string;
        pc_mint: string;
        coin_amount: string;
        pc_amount: string;
        SOL_TOKEN_ACCOUNT: string;
        lp_mint: string;
        open_orders: string;
        market: string;
        serum_dex: string;
        target_orders: string;
        amm_owner: string;
        swap_take_coin_fee: string;
    };
    token: {
        name: string;
        symbol: string;
        address: string;
        description: string;
        creator_name?: string | null;
        creator_site: string;
        supply: string;
    };
    first_swap_at: number;
    first_swap_block: number;
    pool_creator: string;
    status: "waiting_for_analysis" | "failed_analysis",
    error: "mint_not_revoked" | "lp_burn_fail" | "lp_mint_fail" | "lp_allocation_percent_fail" | "lp_allocation_sol_fail" | "unknown_error" | "",
}


export interface TransactionInfo {
    blockTime: number;
    meta: {
        computeUnitsConsumed: number;
        err: any;
        fee: number;
        innerInstructions: any[];
        logMessages: string[];
        postBalances: number[];
        postTokenBalances: {
            accountIndex: number;
            mint: string;
            owner: string;
            programId: string;
            uiTokenAmount: {
                amount: string;
                decimals: number;
                uiAmount: number | null;
                uiAmountString: string;
            };
        }[];
        preBalances: number[];
        preTokenBalances: {
            accountIndex: number;
            mint: string;
            owner: string;
            programId: string;
            uiTokenAmount: {
                amount: string;
                decimals: number;
                uiAmount: number | null;
                uiAmountString: string;
            };
        }[];
        rewards: any[];
        status: {
            Ok: any;
        };
    };
    slot: number;
    transaction: {
        message: {
            accountKeys: any[];
            instructions: any[];
            recentBlockhash: string;
        };
        signatures: string[];
    };
    version: string;
}

interface InnerInstruction {
    index: number;
    instructions: InstructionDetail[];
}

interface InstructionDetail {
    parsed: {
        info: object;
        type: string;
    };
    program: string;
    programId: string;
    stackHeight: number;
}


export type PoolCreationTx = {
    poolAddress: string;
    tx: ParsedTransactionWithMeta;
};


export type Holders = {
    pool_address: string;
    token_address: string;
    supply: number;
    decimals: number;
    holders: {
        public_address: string;
        token_address: string;
        amount: number;
        percent: number;
    }[] | [];
};
