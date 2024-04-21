import { Idl, Coder } from "@coral-xyz/anchor";

import { RaydiumAmmAccountsCoder } from "./accounts.js";
import { RaydiumAmmEventsCoder } from "./events.js";
import { RaydiumAmmInstructionCoder } from "./instructions.js";
import { RaydiumAmmStateCoder } from "./state.js";
import { RaydiumAmmTypesCoder } from "./types.js";


/**
 * Coder for RaydiumAmm
 */
export class RaydiumAmmCoder implements Coder {
  readonly accounts: RaydiumAmmAccountsCoder;
  readonly events: RaydiumAmmEventsCoder;
  readonly instruction: RaydiumAmmInstructionCoder;
  readonly state: RaydiumAmmStateCoder;
  readonly types: RaydiumAmmTypesCoder;

  constructor(idl: Idl) {
    this.accounts = new RaydiumAmmAccountsCoder(idl);
    this.events = new RaydiumAmmEventsCoder(idl);
    this.instruction = new RaydiumAmmInstructionCoder(idl);
    this.state = new RaydiumAmmStateCoder(idl);
    this.types = new RaydiumAmmTypesCoder(idl);
  }
}
