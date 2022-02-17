import { context, u128, PersistentVector, PersistentMap } from "near-sdk-as";

@nearBindgen
export class Event {
  constructor(
    public ownerAccountId: string,
    public title: string,
    // public description: string,
    // public tags: string[],
    public ticketPrice: u128
  ) {}
}

@nearBindgen
export class Ticket {
  public isScanned = false;
  public isListedForSale = false;

  constructor(public eventId: string, public ownerAccountId: string) {}
}

export const events = new PersistentMap<string, Event>("e");
export const tickets = new PersistentMap<string, Ticket>("t");

/**
 * Exporting a new class PostedMessage so it can be used outside of this file.
 */
@nearBindgen
export class PostedMessage {
  premium: boolean;
  sender: string;
  constructor(public text: string) {
    this.premium =
      context.attachedDeposit >= u128.from("10000000000000000000000");
    this.sender = context.sender;
  }
}
/**
 * collections.vector is a persistent collection. Any changes to it will
 * be automatically saved in the storage.
 * The parameter to the constructor needs to be unique across a single contract.
 * It will be used as a prefix to all keys required to store data in the storage.
 */
export const messages = new PersistentVector<PostedMessage>("m");
