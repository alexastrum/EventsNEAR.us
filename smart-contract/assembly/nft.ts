import {
  context,
  ContractPromise,
  env,
  logging,
  PersistentMap,
  PersistentVector,
  u128,
} from "near-sdk-as";

const XCC_GAS: u64 = 30_000_000_000_000;

export type AccountId = string;

@nearBindgen
export class NFTContractMetadata {
  spec: string = "nft-1.0.0"; // required, essentially a version like "nft-1.0.0"
  name: string; // required, ex. "Mochi Rising — Digital Edition" or "Metaverse 3"
  symbol: string; // required, ex. "MOCHI"
  icon: string = ""; // Data URL
  base_uri: string = ""; // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
  reference: string = ""; // URL to a JSON file with more info
  reference_hash: string = ""; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

@nearBindgen
export class TokenMetadata {
  title: string = ""; // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
  description: string = ""; // free-form description
  media: string = ""; // URL to associated media, preferably to decentralized, content-addressed storage
  media_hash: string = ""; // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
  copies: u32 = 1; // number of copies of this set of metadata in existence when token was minted.
  issued_at: u64 = 0; // When token was issued or minted, Unix epoch in milliseconds
  starts_at: u64 = 0; // When token starts being valid, Unix epoch in milliseconds
  expires_at: u64 = 0; // When token expires, Unix epoch in milliseconds
  updated_at: u64 = 0; // When token was last updated, Unix epoch in milliseconds
  extra: string = ""; // anything extra the NFT wants to store on-chain. Can be stringified JSON.
  reference: string = ""; // URL to an off-chain JSON file with more info.
  reference_hash: string = ""; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

// The base structure that will be returned for a token. If contract is using
// extensions such as Approval Management, Metadata, or other
// attributes may be included in this structure.
@nearBindgen
export class Token {
  id: string;
  owner_id: string;
  metadata: TokenMetadata | null;
}

@nearBindgen
export class Payout {
  payout: Map<AccountId, u128>;
}

/**
 * Minimal implementation of NEP-171
 */
@nearBindgen
export class PersistentNFT {
  protected tokenOwners: PersistentMap<string, string>;

  protected tokens: PersistentVector<string>;

  constructor(
    protected prefix: string,
    protected metadata: NFTContractMetadata,
    private xcc_gas: u64 = XCC_GAS
  ) {
    this.tokenOwners = new PersistentMap(prefix + "#");
    this.tokens = new PersistentVector(prefix);
  }

  nft_metadata(): NFTContractMetadata {
    return this.metadata;
  }

  protected mint(id: string, owner_id: AccountId = context.predecessor): void {
    assert(!this.tokenOwners.contains(id), "token id not unique");

    this.setTokenOwner(id, owner_id);
    this.tokens.push(id);
  }

  /**
   * Throws if context.predecessor is not token_id owner
   *
   * @param token_id
   */
  protected predecesorIsOwner(token_id: string): void {
    const owner_id = this.tokenOwners.getSome(token_id);
    assert(
      owner_id === context.predecessor,
      "predecessor is not the token owner"
    );
  }

  /**
   * Safely transfers token_id from sender_id to receiver_id.
   *
   * @param params
   * @returns
   */
  protected transferOwnToken(
    sender_id: AccountId,
    receiver_id: AccountId,
    token_id: string
  ): AccountId {
    const owner_id = this.tokenOwners.getSome(token_id);
    assert(owner_id === sender_id, "sender_id is not the token owner");

    this.setTokenOwner(token_id, receiver_id);
    return owner_id;
  }

  protected setTokenOwner(
    token_id: string,
    new_owner_id: AccountId
  ): AccountId {
    assert(env.isValidAccountID(new_owner_id), "new_owner_id not valid");

    // TODO: Track token ownership

    const previous_owner_id = this.tokenOwners.getSome(token_id);
    this.tokenOwners.set(token_id, new_owner_id);
    return previous_owner_id;
  }

  // Simple transfer. Transfer a given `token_id` from current owner to
  // `receiver_id`.
  //
  // Requirements
  // * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  // * Contract MUST panic if called by someone other than token owner or,
  //   if using Approval Management, one of the approved accounts
  // * `approval_id` is for use with Approval Management extension, see
  //   that document for full explanation.
  // * If using Approval Management, contract MUST nullify approved accounts on
  //   successful transfer.
  //
  // Arguments:
  // * `receiver_id`: the valid NEAR account receiving the token
  // * `token_id`: the token to transfer
  // * `approval_id`: expected approval ID. A number smaller than
  //    2^53, and therefore representable as JSON. See Approval Management
  //    standard for full explanation.
  // * `memo` (optional): for use cases that may benefit from indexing or
  //    providing information for a transfer
  nft_transfer(
    receiver_id: AccountId,
    token_id: string,
    approval_id: u64 = 0, // not used
    memo: string = "" // not used
  ): void {
    oneYocto();

    const sender_id = context.predecessor;
    this.transferOwnToken(sender_id, receiver_id, token_id);
  }

  // Returns `true` if the token was transferred from the sender's account.
  //
  // Transfer token and call a method on a receiver contract. A successful
  // workflow will end in a success execution outcome to the callback on the NFT
  // contract at the method `nft_resolve_transfer`.
  //
  // You can think of this as being similar to attaching native NEAR tokens to a
  // function call. It allows you to attach any Non-Fungible Token in a call to a
  // receiver contract.
  //
  // Requirements:
  // * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  //   purposes
  // * Contract MUST panic if called by someone other than token owner or,
  //   if using Approval Management, one of the approved accounts
  // * The receiving contract must implement `nft_on_transfer` according to the
  //   standard. If it does not, FT contract's `nft_resolve_transfer` MUST deal
  //   with the resulting failed cross-contract call and roll back the transfer.
  // * Contract MUST implement the behavior described in `nft_resolve_transfer`
  // * `approval_id` is for use with Approval Management extension, see
  //   that document for full explanation.
  // * If using Approval Management, contract MUST nullify approved accounts on
  //   successful transfer.
  //
  // Arguments:
  // * `receiver_id`: the valid NEAR account receiving the token.
  // * `token_id`: the token to send.
  // * `approval_id`: expected approval ID. A number smaller than
  //    2^53, and therefore representable as JSON. See Approval Management
  //    standard for full explanation.
  // * `memo` (optional): for use cases that may benefit from indexing or
  //    providing information for a transfer.
  // * `msg`: specifies information needed by the receiving contract in
  //    order to properly handle the transfer. Can indicate both a function to
  //    call and the parameters to pass to that function.
  nft_transfer_call(
    receiver_id: AccountId,
    token_id: string,
    approval_id: u64 = 0, // not used
    memo: string = "", // not used
    msg: string = ""
  ): void {
    oneYocto();

    const sender_id = context.predecessor;
    const previous_owner_id = this.transferOwnToken(
      sender_id,
      receiver_id,
      token_id
    );

    ContractPromise.create<nft_on_transfer>(
      receiver_id,
      "nft_on_transfer",
      { sender_id, previous_owner_id, token_id, msg },
      this.xcc_gas
    )
      .then<nft_resolve_transfer>(
        context.contractName,
        "nft_resolve_transfer",
        {
          owner_id: previous_owner_id,
          receiver_id,
          token_id,
          approved_account_ids: null,
        },
        this.xcc_gas
      )
      .returnAsResult();
  }

  // Returns the token with the given `token_id` or `null` if no such token.
  nft_token(token_id: string): Token | null {
    const owner_id = this.tokenOwners.get(token_id);
    const metadata = this.getMetadata(token_id);
    return owner_id ? { id: token_id, owner_id, metadata } : null;
  }

  protected getMetadata(token_id: string): TokenMetadata | null {
    return null;
  }

  // Finalize an `nft_transfer_call` chain of cross-contract calls.
  //
  // The `nft_transfer_call` process:
  //
  // 1. Sender calls `nft_transfer_call` on NFT contract
  // 2. NFT contract transfers token from sender to receiver
  // 3. NFT contract calls `nft_on_transfer` on receiver contract
  // 4+. [receiver contract may make other cross-contract calls]
  // N. NFT contract resolves promise chain with `nft_resolve_transfer`, and may
  //    transfer token back to sender
  //
  // Requirements:
  // * Contract MUST forbid calls to this function by any account except self
  // * If promise chain failed, contract MUST revert token transfer
  // * If promise chain resolves with `true`, contract MUST return token to
  //   `owner_id`
  //
  // Arguments:
  // * `owner_id`: the original owner of the NFT.
  // * `receiver_id`: the `receiver_id` argument given to `nft_transfer_call`
  // * `token_id`: the `token_id` argument given to `nft_transfer_call`
  // * `approved_account_ids `: if using Approval Management, contract MUST provide
  //   record of original approved accounts in this argument, and restore these
  //   approved accounts and their approval IDs in case of revert.
  //
  // Returns true if token was successfully transferred to `receiver_id`.
  @contractPrivate()
  nft_resolve_transfer(
    owner_id: AccountId,
    receiver_id: AccountId,
    token_id: string,
    approved_account_ids: Map<string, u32> | null
  ): boolean {
    assert(
      context.predecessor == context.contractName,
      "Contract MUST forbid calls to nft_resolve_transfer by any account except self"
    );

    const results = ContractPromise.getResults();
    assert(
      results.length == 1,
      "nft_resolve_transfer is a callback with 1 promise"
    );

    if (results[0].failed) {
      // If promise chain failed, contract MUST revert token transfer
      logging.log("nft_transfer_call failed, revert");
      this.transferOwnToken(receiver_id, owner_id, token_id);
      return false;
    }

    if (results[0].decode<boolean>()) {
      // If promise chain resolves with `true`, contract MUST return token to `owner_id`
      logging.log("return token to previous owner");
      this.transferOwnToken(receiver_id, owner_id, token_id);
      return false;
    }

    return true;
  }

  /// Given a `token_id` and NEAR-denominated balance, return the `Payout`.
  /// struct for the given token. Panic if the length of the payout exceeds
  /// `max_len_payout.`
  nft_payout(
    token_id: string,
    balance: u128,
    max_len_payout: u32 = 10
  ): Payout {
    const owner_id = this.tokenOwners.getSome(token_id);
    const payout = new Map<AccountId, u128>();
    payout.set(owner_id, balance);
    return {
      payout,
    };
  }

  /// Given a `token_id` and NEAR-denominated balance, transfer the token
  /// and return the `Payout` struct for the given token. Panic if the
  /// length of the payout exceeds `max_len_payout.`
  nft_transfer_payout(
    receiver_id: AccountId,
    token_id: string,
    approval_id: u64,
    balance: u128,
    max_len_payout: u32 = 10
  ): Payout {
    this.nft_transfer(receiver_id, token_id, approval_id);
    return this.nft_payout(token_id, balance, max_len_payout);
  }

  // Returns the total supply of non-fungible tokens as a string representing an
  // unsigned 128-bit integer to avoid JSON number limit of 2^53; and "0" if there are no tokens.
  nft_total_supply(): u128 {
    return u128.from(this.tokens.length);
  }

  // Get a list of all tokens
  //
  // Arguments:
  // * `from_index`: a string representing an unsigned 128-bit integer,
  //    representing the starting index of tokens to return
  // * `limit`: the maximum number of tokens to return
  //
  // Returns an array of Token objects, as described in Core standard, and an empty array if there are no tokens
  nft_tokens(
    from_index: string = "0",
    limit: i32 = 0 // default: unlimited (could fail due to gas limit)
  ): Token[] {
    let result = new Array<Token>();
    const n = limit ? min(limit, this.tokens.length) : this.tokens.length;
    for (let i = from_index ? I32.parseInt(from_index) : 0; i < n; i++) {
      const token = this.nft_token(this.tokens[i]);
      if (token) {
        result.push(token);
      }
    }
    return result;
  }

  // Get number of tokens owned by a given account
  //
  // Arguments:
  // * `account_id`: a valid NEAR account
  //
  // Returns the number of non-fungible tokens owned by given `account_id` as
  // a string representing the value as an unsigned 128-bit integer to avoid JSON
  // number limit of 2^53; and "0" if there are no tokens.
  nft_supply_for_owner(account_id: string): string {
    // TODO: Implement token supply for owner
    return "0";
  }

  // Get list of all tokens owned by a given account
  //
  // Arguments:
  // * `account_id`: a valid NEAR account
  // * `from_index`: a string representing an unsigned 128-bit integer,
  //    representing the starting index of tokens to return
  // * `limit`: the maximum number of tokens to return
  //
  // Returns a paginated list of all tokens owned by this account, and an empty array if there are no tokens
  nft_tokens_for_owner(
    account_id: string,
    from_index: string = "0", // default: 0
    limit: number = 0 // default: unlimited (could fail due to gas limit)
  ): Token[] {
    return [];
  }
}

// Take some action after receiving a non-fungible token
//
// Requirements:
// * Contract MUST restrict calls to this function to a set of whitelisted NFT
//   contracts
//
// Arguments:
// * `sender_id`: the sender of `nft_transfer_call`
// * `previous_owner_id`: the account that owned the NFT prior to it being
//   transferred to this contract, which can differ from `sender_id` if using
//   Approval Management extension
// * `token_id`: the `token_id` argument given to `nft_transfer_call`
// * `msg`: information necessary for this contract to know how to process the
//   request. This may include method names and/or arguments.
//
// Returns true if token should be returned to `sender_id`
@nearBindgen
class nft_on_transfer {
  sender_id: AccountId;
  previous_owner_id: AccountId;
  token_id: string;
  msg: string;
}

@nearBindgen
class nft_resolve_transfer {
  owner_id: AccountId;
  receiver_id: AccountId;
  token_id: string;
  approved_account_ids: Map<string, u64> | null;
}
