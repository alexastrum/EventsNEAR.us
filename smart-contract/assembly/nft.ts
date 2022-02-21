import {
  context,
  ContractPromise,
  env,
  logging,
  PersistentMap,
  PersistentVector,
} from "near-sdk-as";

const XCC_GAS: u64 = 30_000_000_000_000;

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

/**
 * Minimal implementation of NEP-171
 */
@nearBindgen
export class PersistentNFT {
  protected tokenOwners: PersistentMap<string, string>;

  // TODO: https://nomicon.io/Standards/NonFungibleToken/Enumeration
  protected tokens: PersistentVector<string>;

  // TODO: https://nomicon.io/Standards/NonFungibleToken/Payout
  // Not sure {payout: HashMap} return value is supported by NEAR AS SDK
  // Payout should be up to `tier.price + small fee to cover gas and inetrest` to current owner; balance to `event.owner`

  constructor(prefix: string, private xcc_gas: u64 = XCC_GAS) {
    this.tokenOwners = new PersistentMap(prefix);
  }

  protected mint(id: string, owner_id: string = context.predecessor): void {
    assert(!this.tokenOwners.contains(id), "token id not unique");

    this.tokenOwners.set(id, owner_id);
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
    sender_id: string,
    receiver_id: string,
    token_id: string
  ): string {
    const owner_id = this.tokenOwners.getSome(token_id);
    assert(owner_id === sender_id, "sender_id is not the token owner");
    assert(env.isValidAccountID(receiver_id), "receiver_id not valid");

    this.tokenOwners.set(token_id, receiver_id);
    return owner_id || "";
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
    receiver_id: string,
    token_id: string,
    approval_id: u32 = 0, // not used
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
    receiver_id: string,
    token_id: string,
    approval_id: u32 = 0, // not used
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
  nft_resolve_transfer(
    owner_id: string,
    receiver_id: string,
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
  sender_id: string;
  previous_owner_id: string;
  token_id: string;
  msg: string;
}

@nearBindgen
class nft_resolve_transfer {
  owner_id: string;
  receiver_id: string;
  token_id: string;
  approved_account_ids: Map<string, u32> | null;
}
