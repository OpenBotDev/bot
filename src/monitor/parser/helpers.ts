import { utils } from "@coral-xyz/anchor";
import {
    AccountMeta,
    CompiledInstruction,
    LoadedAddresses,
    Message,
    MessageCompiledInstruction,
    PartiallyDecodedInstruction,
    PublicKey,
    TransactionInstruction,
    VersionedMessage,
    VersionedTransactionResponse,
} from "@solana/web3.js";

import { LogContext } from "./pinterfaces";

export function hexToBuffer(data: string) {
    const rawHex = data.startsWith("0x") ? data.slice(2) : data;

    return Buffer.from(rawHex);
}

/**
 * Parse transaction message and extract account metas
 * @param message transaction message
 * @returns parsed accounts metas
 */
export function parseTransactionAccounts<T extends Message | VersionedMessage>(
    message: T,
    loadedAddresses: T extends VersionedMessage ? LoadedAddresses | undefined : undefined = undefined,
): AccountMeta[] {
    const accounts: PublicKey[] = message.version === "legacy" ? message.accountKeys : message.staticAccountKeys;
    const readonlySignedAccountsCount = message.header.numReadonlySignedAccounts;
    const readonlyUnsignedAccountsCount = message.header.numReadonlyUnsignedAccounts;
    const requiredSignaturesAccountsCount = message.header.numRequiredSignatures;
    const totalAccounts = accounts.length;
    let parsedAccounts: AccountMeta[] = accounts.map((account, idx) => {
        const isWritable =
            idx < requiredSignaturesAccountsCount - readonlySignedAccountsCount ||
            (idx >= requiredSignaturesAccountsCount && idx < totalAccounts - readonlyUnsignedAccountsCount);

        return {
            isSigner: idx < requiredSignaturesAccountsCount,
            isWritable,
            pubkey: new PublicKey(account),
        } as AccountMeta;
    });
    const [ALTWritable, ALTReadOnly] =
        message.version === "legacy" ? [[], []] : loadedAddresses ? [loadedAddresses.writable, loadedAddresses.readonly] : [[], []]; // message.getAccountKeys({ accountKeysFromLookups: loadedAddresses }).keySegments().slice(1); // omit static keys
    if (ALTWritable) parsedAccounts = [...parsedAccounts, ...ALTWritable.map((pubkey) => ({ isSigner: false, isWritable: true, pubkey }))];
    if (ALTReadOnly) parsedAccounts = [...parsedAccounts, ...ALTReadOnly.map((pubkey) => ({ isSigner: false, isWritable: false, pubkey }))];

    return parsedAccounts;
}

/**
 * Converts compiled instruction into common TransactionInstruction
 * @param compiledInstruction
 * @param parsedAccounts account meta, result of {@link parseTransactionAccounts}
 * @returns TransactionInstruction
 */
export function compiledInstructionToInstruction<Ix extends CompiledInstruction | MessageCompiledInstruction>(
    compiledInstruction: Ix,
    parsedAccounts: AccountMeta[],
): TransactionInstruction {
    if (typeof compiledInstruction.data === "string") {
        const ci = compiledInstruction as CompiledInstruction;

        return new TransactionInstruction({
            data: utils.bytes.bs58.decode(ci.data),
            programId: parsedAccounts[ci.programIdIndex].pubkey,
            keys: ci.accounts.map((accountIdx) => parsedAccounts[accountIdx]),
        });
    } else {
        const ci = compiledInstruction as MessageCompiledInstruction;

        return new TransactionInstruction({
            data: Buffer.from(ci.data),
            programId: parsedAccounts[ci.programIdIndex].pubkey,
            keys: ci.accountKeyIndexes.map((accountIndex) => {
                if (accountIndex >= parsedAccounts.length)
                    throw new Error(
                        `Trying to resolve account at index ${accountIndex} while parsedAccounts is only ${parsedAccounts.length}. \
						Looks like you're trying to parse versioned transaction, make sure that LoadedAddresses are passed to the \
						parseTransactionAccounts function`,
                    );

                return parsedAccounts[accountIndex];
            }),
        });
    }
}

function parsedAccountsToMeta(accounts: PublicKey[], accountMeta: AccountMeta[]): AccountMeta[] {
    const meta = accountMeta.map((m) => ({ pk: m.pubkey.toString(), ...m }));

    return accounts.map((account) => {
        const encoded = account.toString();
        const found = meta.find((item) => item.pk === encoded);
        if (!found) throw new Error(`Account ${encoded} not present in account meta!`);

        return found;
    });
}

export function parsedInstructionToInstruction(parsedInstruction: PartiallyDecodedInstruction, accountMeta: AccountMeta[]): TransactionInstruction {
    return new TransactionInstruction({
        data: utils.bytes.bs58.decode(parsedInstruction.data),
        programId: parsedInstruction.programId,
        keys: parsedAccountsToMeta(parsedInstruction.accounts, accountMeta),
    });
}

/**
 * Converts transaction response with CPI into artifical transaction that contains all instructions from tx and CPI
 * @param transaction transactionResponse to convert from
 * @returns Transaction object
 */
export function flattenTransactionResponse(transaction: VersionedTransactionResponse): TransactionInstruction[] {
    const result: TransactionInstruction[] = [];
    if (transaction === null || transaction === undefined) return [];
    const txInstructions = transaction.transaction.message.compiledInstructions;
    const accountsMeta = parseTransactionAccounts(transaction.transaction.message, transaction.meta?.loadedAddresses);
    const orderedCII = (transaction?.meta?.innerInstructions || []).sort((a, b) => a.index - b.index);
    const totalCalls =
        (transaction.meta?.innerInstructions || []).reduce((accumulator, cii) => accumulator + cii.instructions.length, 0) + txInstructions.length;
    let lastPushedIx = -1;
    let callIndex = -1;
    for (const CII of orderedCII) {
        // push original instructions until we meet CPI
        while (lastPushedIx !== CII.index) {
            lastPushedIx += 1;
            callIndex += 1;
            result.push(compiledInstructionToInstruction(txInstructions[lastPushedIx], accountsMeta));
        }
        for (const CIIEntry of CII.instructions) {
            result.push(compiledInstructionToInstruction(CIIEntry, accountsMeta));
            callIndex += 1;
        }
    }
    while (callIndex < totalCalls - 1) {
        lastPushedIx += 1;
        callIndex += 1;
        result.push(compiledInstructionToInstruction(txInstructions[lastPushedIx], accountsMeta));
    }

    return result;
}

/**
 * @private
 */
function newLogContext(programId: string, depth: number, id: number, instructionIndex: number): LogContext {
    return {
        logMessages: [],
        dataLogs: [],
        rawLogs: [],
        errors: [],
        programId,
        depth,
        id,
        instructionIndex,
    };
}

/**
 * Parses transaction logs and provides additional context such as
 * - programId that generated the message
 * - call id of instruction, that generated the message
 * - call depth of instruction
 * - data messages, log messages and error messages
 * @param logs logs from TransactionResponse.meta.logs
 * @returns parsed logs with call depth and additional context
 */
export function parseLogs(logs: string[]): LogContext[] {
    const parserRe =
        /(?<logTruncated>^Log truncated$)|(?<programInvoke>^Program (?<invokeProgramId>[1-9A-HJ-NP-Za-km-z]{32,}) invoke \[(?<level>\d+)\]$)|(?<programSuccessResult>^Program (?<successResultProgramId>[1-9A-HJ-NP-Za-km-z]{32,}) success$)|(?<programFailedResult>^Program (?<failedResultProgramId>[1-9A-HJ-NP-Za-km-z]{32,}) failed: (?<failedResultErr>.*)$)|(?<programCompleteFailedResult>^Program failed to complete: (?<failedCompleteError>.*)$)|(?<programLog>^^Program log: (?<logMessage>.*)$)|(?<programData>^Program data: (?<data>.*)$)|(?<programConsumed>^Program (?<consumedProgramId>[1-9A-HJ-NP-Za-km-z]{32,}) consumed (?<consumedComputeUnits>\d*) of (?<allComputedUnits>\d*) compute units$)|(?<programReturn>^Program return: (?<returnProgramId>[1-9A-HJ-NP-Za-km-z]{32,}) (?<returnMessage>.*)$)/s;
    const result: LogContext[] = [];
    let id = -1;
    let currentInstruction = 0;
    let currentDepth = 0;
    const callStack = [];
    const callIds: number[] = [];
    for (const log of logs) {
        const match = parserRe.exec(log);
        if (!match || !match.groups) {
            throw new Error(`Failed to parse log line: ${log}`);
        }

        if (match.groups.logTruncated) {
            result[callIds[callIds.length - 1]].invokeResult = "Log truncated";
        } else if (match.groups.programInvoke) {
            callStack.push(match.groups.invokeProgramId);
            id += 1;
            currentDepth += 1;
            callIds.push(id);
            if (match.groups.level != currentDepth.toString()) throw new Error(`invoke depth mismatch, log: ${match.groups.level}, expected: ${currentDepth}`);
            result.push(newLogContext(callStack[callStack.length - 1], callStack.length, id, currentInstruction));
            result[result.length - 1].rawLogs.push(log);
        } else if (match.groups.programSuccessResult) {
            const lastProgram = callStack.pop();
            const lastCallIndex = callIds.pop();
            if (lastCallIndex === undefined) throw new Error("callIds malformed");
            if (lastProgram != match.groups.successResultProgramId) throw new Error("[ProramSuccess] callstack mismatch");
            result[lastCallIndex].rawLogs.push(log);
            currentDepth -= 1;
            if (currentDepth === 0) {
                currentInstruction += 1;
            }
        } else if (match.groups.programFailedResult) {
            const lastProgram = callStack.pop();
            if (lastProgram != match.groups.failedResultProgramId) throw new Error("[ProgramFailed] callstack mismatch");
            result[callIds[callIds.length - 1]].rawLogs.push(log);
            result[callIds[callIds.length - 1]].errors.push(match.groups.failedResultErr);
        } else if (match.groups.programCompleteFailedResult) {
            result[callIds[callIds.length - 1]].rawLogs.push(log);
            result[callIds[callIds.length - 1]].errors.push(match.groups.failedCompleteError);
        } else if (match.groups.programLog) {
            result[callIds[callIds.length - 1]].rawLogs.push(log);
            result[callIds[callIds.length - 1]].logMessages.push(match.groups.logMessage);
        } else if (match.groups.programData) {
            result[callIds[callIds.length - 1]].rawLogs.push(log);
            result[callIds[callIds.length - 1]].dataLogs.push(match.groups.data);
        } else if (match.groups.programConsumed) {
            result[callIds[callIds.length - 1]].rawLogs.push(log);
        } else if (match.groups.programReturn) {
            if (callStack[callStack.length - 1] != match.groups.returnProgramId) throw new Error("[InvokeReturn]: callstack mismatch");
            result[callIds[callIds.length - 1]].invokeResult = match.groups.returnMessage;
        }
    }

    return result;
}