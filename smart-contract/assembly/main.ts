import { u128 } from "near-sdk-as";
import { CreateEvent_Tier, Event, NFTContract } from "./contract";
import { AccountId, NFTContractMetadata, Payout, Token } from "./nft";

const contract = new NFTContract(<NFTContractMetadata>{
  name: "EventsNEAR.us",
  symbol: "EVNS",
  base_uri: "https://eventsnear.us/api/nft",
});

// --- NEP-171

export function nft_transfer(
  receiver_id: string,
  token_id: string,
  approval_id: u32 = 0,
  memo: string = ""
): void {
  contract.nft_transfer(receiver_id, token_id, approval_id, memo);
}

export function nft_transfer_call(
  receiver_id: string,
  token_id: string,
  approval_id: u32 = 0, // not used
  memo: string = "", // not used
  msg: string = ""
): void {
  contract.nft_transfer_call(receiver_id, token_id, approval_id, memo, msg);
}

export function nft_token(token_id: string): Token | null {
  return contract.nft_token(token_id);
}

export function nft_resolve_transfer(
  owner_id: string,
  receiver_id: string,
  token_id: string,
  approved_account_ids: Map<string, u32> | null
): boolean {
  return contract.nft_resolve_transfer(
    owner_id,
    receiver_id,
    token_id,
    approved_account_ids
  );
}

// --- NEP-177

export function nft_metadata(): NFTContractMetadata {
  return contract.nft_metadata();
}

// --- NEP-181

export function nft_total_supply(): u128 {
  return contract.nft_total_supply();
}

export function nft_tokens(
  from_index: string = "0", // default: "0"
  limit: i32 = 0 // default: unlimited (could fail due to gas limit)
): Token[] {
  return contract.nft_tokens(from_index, limit);
}

export function nft_supply_for_owner(account_id: string): string {
  return contract.nft_supply_for_owner(account_id);
}

export function nft_tokens_for_owner(
  account_id: string,
  from_index: string = "0",
  limit: number = 0 // default: unlimited (could fail due to gas limit)
): Token[] {
  return contract.nft_tokens_for_owner(account_id, from_index, limit);
}

// --- NEP-199

export function nft_payout(
  token_id: string,
  balance: u128,
  max_len_payout: u32 = 10
): Payout {
  return contract.nft_payout(token_id, balance, max_len_payout);
}

export function nft_transfer_payout(
  receiver_id: AccountId,
  token_id: string,
  approval_id: u64,
  balance: u128,
  max_len_payout: u32 = 10
): Payout {
  return contract.nft_transfer_payout(
    receiver_id,
    token_id,
    approval_id,
    balance,
    max_len_payout
  );
}

// --- NEP-297

// TODO: https://github.com/near/NEPs/blob/master/specs/Standards/EventsFormat.md

// --- EventsNEAR.us APIs

export function createEvent(
  eventId: string,
  event: Event,
  tickets: CreateEvent_Tier[] = [<CreateEvent_Tier>{}]
): void {
  contract.createEvent(eventId, event, tickets);
}

export function listForSale(ticketId: string): u32 {
  return contract.listForSale(ticketId, 1);
}

export function unlistForSale(ticketId: string): void {
  contract.listForSale(ticketId, 0);
}

export function buy(ticketId: string): void {
  contract.buy(ticketId, 1);
}

export function scan(ticketId: string): void {
  contract.invalidate(ticketId);
}

export function unscan(ticketId: string): void {
  contract.reactivate(ticketId);
}

export function buyLotteryTicket(tierId: string): void {
  contract.buyLotteryTicket(tierId);
}

export function giveUpLottery(tierId: string): void {
  contract.giveUpLottery(tierId);
}

export function helloWorld(id: string): string {
  return id + "ok";
}
