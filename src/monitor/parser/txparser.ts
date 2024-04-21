import { Buffer } from "buffer";

import {
    PublicKey,
    TransactionInstruction,
    SystemInstruction,
    SystemProgram,
    Connection,
    Message,
    Transaction,
    AccountMeta,
    ParsedMessage,
    PartiallyDecodedInstruction,
    Finality,
    VersionedMessage,
    LoadedAddresses,
} from "@solana/web3.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    AuthorityType,
    TOKEN_PROGRAM_ID,
    //TokenInstruction,
    // decodeApproveCheckedInstruction,
    // decodeApproveInstruction,
    // decodeBurnCheckedInstruction,
    // decodeBurnInstruction,
    // decodeCloseAccountInstruction,
    // decodeFreezeAccountInstruction,
    // decodeInitializeAccountInstruction,
    // decodeInitializeMintInstruction,
    // decodeInitializeMintInstructionUnchecked,
    // decodeInitializeMultisigInstruction,
    // decodeMintToCheckedInstruction,
    // decodeMintToInstruction,
    // decodeRevokeInstruction,
    // decodeSetAuthorityInstruction,
    // decodeThawAccountInstruction,
    // decodeTransferCheckedInstruction,
    // decodeTransferInstruction,
} from "@solana/spl-token";
import { BN, BorshInstructionCoder, Idl, SystemProgram as SystemProgramIdl } from "@coral-xyz/anchor";
//import { BN, Idl, IdlTypes } from "@coral-xyz/anchor";
import { blob, struct, u8 } from "@solana/buffer-layout";

import {
    AssociatedTokenProgramIdlLike,
    IdlAccount,
    IdlAccountItem,
    IdlAccounts,
    InstructionNames,
    InstructionParserInfo,
    InstructionParsers,
    ParsedIdlArgs,
    ParsedIdlInstruction,
    ParsedInstruction,
    ParserFunction,
    ProgramInfoType,
    SplToken,
    UnknownInstruction,
} from "./pinterfaces";
import { compiledInstructionToInstruction, flattenTransactionResponse, parsedInstructionToInstruction, parseTransactionAccounts } from "./helpers";


export class TestSolanaParser {

    private instructionParsers: InstructionParsers;



    ////     constructor(programInfos: ProgramInfoType[], parsers?: InstructionParserInfo[]) {
    constructor(idl: Idl, programID: PublicKey) {
        const coder = new BorshInstructionCoder(idl);
        //const parsedIx = coder.decode(instruction.data);
        //const result = coder.accounts.decode('ammInfo', binaryData);
    }

}