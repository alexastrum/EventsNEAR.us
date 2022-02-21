import { context } from "near-sdk-as";
import { createEvent_Tier, NFTContract } from "./contract";
import { PersistentLottery } from "./lottery";

// --- contract code goes below

const contract = new NFTContract({
  spec: "nft-1.0.0",
  name: "EventsNEAR.us",
  symbol: "EVNS",
  icon: "",
  base_uri: "https://eventsnear.us/api/nft",
  reference: "",
  reference_hash: "",
});

export function createEvent(
  id: string,
  title: string,
  description: string,
  tickets: createEvent_Tier[]
): void {
  contract.createEvent(id, title, description, "", 0, "", tickets);
}

// TODO: Expose NEP-171 APIs

export function transfer(receiverId: string, ticketId: string): void {
  contract.nft_transfer(receiverId, ticketId, 0, "");
}

export function listForSale(ticketId: string): void {
  contract.listForSale(ticketId, 1);
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
