import {
  context,
  u128,
  PersistentMap,
  ContractPromiseBatch,
} from "near-sdk-as";
import { PersistentLottery } from "./lottery";
import {
  AccountId,
  NFTContractMetadata,
  Payout,
  PersistentNFT,
  TokenMetadata,
} from "./nft";

@nearBindgen
export class Event {
  title: string = ""; // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
  description: string = ""; // free-form description
  media_hash: string = ""; // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
  issued_at: u64 = 0; // When token was issued or minted, Unix epoch in milliseconds
  starts_at: u64 = 0; // When token starts being valid, Unix epoch in milliseconds
  reference_hash: string = ""; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

@nearBindgen
export class Tier {
  title: string = ""; // free-form description
  issued_at: u64 = 0; // When token was issued or minted, Unix epoch in milliseconds
  copies: u32 = 1;
  price: u128 = u128.Zero;
}

@nearBindgen
export class Ticket {
  copies: u32 = 1;
  for_sale: u32 = 0;
  expires_at: u64 = 0; // When token expires, Unix epoch in milliseconds
}

@nearBindgen
export class CreateEvent_Tier extends Tier {
  recipientId: string = context.predecessor;
}

function getEventId(ticketId: string): string {
  return ticketId.split("/")[0];
}

function getTierId(ticketId: string): string {
  const parts = ticketId.split("/");
  parts.pop();
  return parts.join("/");
}

@nearBindgen
export class NFTContract extends PersistentNFT {
  private events: PersistentMap<string, Event>;
  private tiers: PersistentMap<string, Tier>;
  private tickets: PersistentMap<string, Ticket>;

  constructor(metadata: NFTContractMetadata) {
    metadata.reference = metadata.base_uri;
    super("Token", metadata);
    this.events = new PersistentMap("Event");
    this.tiers = new PersistentMap("Tier");
    this.tickets = new PersistentMap("Ticket");
  }

  nft_metadata(): NFTContractMetadata {
    return this.metadata;
  }

  protected getMetadata(token_id: string): TokenMetadata | null {
    const eventId = token_id.split("/")[0];
    const event = this.events.getSome(eventId);
    const metadata = <TokenMetadata>{
      title: event.title,
      description: event.description,
      starts_at: event.starts_at,
      media_hash: event.media_hash,
    };
    metadata.reference = this.metadata.base_uri + "/" + token_id;
    if (metadata.media_hash) {
      metadata.media = metadata.reference + ":media";
    }

    const isTicket = eventId !== token_id;
    if (isTicket) {
      const tier = this.tiers.getSome(getTierId(token_id));
      if (tier.title) {
        metadata.title += " - " + tier.title;
      }
      metadata.issued_at = tier.issued_at;
      metadata.copies = tier.copies;
      metadata.extra = "{price: " + tier.price.toString() + "}";

      const ticket = this.tickets.getSome(token_id);
      if (ticket.copies > 1) {
        metadata.title += " x " + ticket.copies.toString();
      }
      metadata.expires_at = ticket.expires_at;
      // metadata.updated_at = ticket.updated_at;
    }

    return metadata;
  }

  createEvent(
    eventId: string,
    event: Event,
    tickets: CreateEvent_Tier[]
  ): void {
    //oneYocto();

    this.mint(eventId, context.predecessor);
    const issued_at = context.blockTimestamp % <u64>1_000_000;
    this.events.set(eventId, event);

    for (let i = 0; i < tickets.length; i++) {
      const tier = tickets[i];
      const tierId = eventId + "/" + i.toString();
      const ticketId = tierId + "/0";
      this.mint(ticketId, tier.recipientId);
      this.tiers.set(tierId, {
        title: tier.title,
        issued_at,
        copies: tier.copies,
        price: tier.price,
      });
      this.tickets.set(ticketId, {
        copies: tier.copies,
        for_sale: tier.price ? tier.copies : 0,
        expires_at: 0,
      });
    }
  }

  listForSale(ticketId: string, quantity: u32): u32 {
    //oneYocto();
    this.predecesorIsOwner(ticketId);

    const ticket = this.tickets.getSome(ticketId);
    assert(quantity <= ticket.copies, "Sale quantity too large");

    if (quantity > 0) {
      const tierId = getTierId(ticketId);
      const lottery = new PersistentLottery<string>(tierId);
      while (lottery.entryCount > 0 && quantity > 0) {
        // TODO: This code runs with O(quantity), so might run out of gas for large sales. Refactor?
        const winnerId = lottery.roll();
        this.prepaidTransfer(winnerId, ticketId, 1);
        quantity--;
      }
    }

    ticket.for_sale = quantity;
    this.tickets.set(ticketId, ticket);
    return quantity;
  }

  buy(ticketId: string, quantity: u32): void {
    const tierId = getTierId(ticketId);
    const tier = this.tiers.getSome(tierId);
    assert(
      context.attachedDeposit === u128.mul(tier.price, u128.from(quantity)),
      "Incorrect attachedDeposit"
    );

    const buyerId = context.predecessor;
    this.prepaidTransfer(buyerId, ticketId, quantity);
  }

  private prepaidTransfer(
    buyerId: string,
    ticketId: string,
    quantity: u32
  ): void {
    const tierId = getTierId(ticketId);
    const ticket = this.tickets.getSome(ticketId);
    assert(quantity <= ticket.copies, "Insufficient seller owned tickets");
    assert(quantity <= ticket.for_sale, "Insufficient forSale tickets");

    const previous_owner_id = this.tokenOwners.getSome(ticketId);
    assert(
      previous_owner_id !== buyerId,
      "Buyer and ticket owner need to be different people"
    );

    if (quantity < ticket.copies) {
      // Mint a new ticket batch
      const newTicketIndex = U32.parseInt(ticketId.split("/")[2]) + quantity;
      const newTicketId = tierId + "/" + newTicketIndex.toString();
      this.mint(newTicketId, buyerId);
      this.tickets.set(newTicketId, {
        copies: ticket.copies - quantity,
        for_sale: ticket.for_sale - quantity,
        expires_at: 0,
      });
    }

    // Transfer ownership of original ticket batch
    this.setTokenOwner(ticketId, buyerId);

    // Take sold tickets off market
    ticket.copies = quantity;
    ticket.for_sale = 0;
    this.tickets.set(ticketId, ticket);

    // Pay previous owner
    ContractPromiseBatch.create(previous_owner_id).transfer(
      context.attachedDeposit
    );
  }

  // TODO: Separate lottery / marketplace code from the contract to restrict atack surface.
  // TODO: Use utility tokens instead of NEAR and/or add holding periods to prevent risk of fund robbery.

  buyLotteryTicket(tierId: string): void {
    const tier = this.tiers.getSome(tierId);
    assert(context.attachedDeposit === tier.price, "Incorrect attachedDeposit");

    const lottery = new PersistentLottery<string>(tierId);
    lottery.add(context.predecessor);
  }

  giveUpLottery(tierId: string): void {
    const buyer_id = context.predecessor;
    const lottery = new PersistentLottery<string>(tierId);
    lottery.remove(buyer_id);

    // Refund participant
    const tier = this.tiers.getSome(tierId);
    ContractPromiseBatch.create(buyer_id).transfer(tier.price);
  }

  invalidate(ticketId: string): void {
    //oneYocto();

    const eventId = getEventId(ticketId);
    const eventOwnerId = this.tokenOwners.getSome(eventId);
    assert(
      context.predecessor === eventOwnerId,
      "Only event owners can invalidate tickets"
    );

    const ticket = this.tickets.getSome(ticketId);
    assert(!ticket.expires_at, "Ticket already invalidated");

    if (ticket.for_sale > 0) {
      ticket.for_sale--;
    }

    if (ticket.copies > 1) {
      // Mint a new ticket batch
      const tierId = getTierId(ticketId);
      const newTicketIndex = U32.parseInt(ticketId.split("/")[2]) + 1;
      const newTicketId = tierId + "/" + newTicketIndex.toString();
      const owner_id = this.tokenOwners.getSome(ticketId);
      this.mint(newTicketId, owner_id);
      this.tickets.set(newTicketId, {
        copies: ticket.copies - 1,
        for_sale: ticket.for_sale,
        expires_at: 0,
      });
      ticket.copies = 1;
      ticket.for_sale = 0;
    }

    ticket.expires_at = context.blockTimestamp / 1_000_000;
    this.tickets.set(ticketId, ticket);
  }

  reactivate(ticketId: string): void {
    //oneYocto();

    const eventId = getEventId(ticketId);
    const eventOwnerId = this.tokenOwners.getSome(eventId);
    assert(
      context.predecessor === eventOwnerId,
      "Only event owners can invalidate tickets"
    );

    const ticket = this.tickets.getSome(ticketId);
    assert(ticket.expires_at, "Ticket already active");

    ticket.expires_at = 0;
    this.tickets.set(ticketId, ticket);
  }

  nft_payout(
    token_id: string,
    balance: u128,
    max_len_payout: u32 = 10
  ): Payout {
    const eventId = getEventId(token_id);
    const isTicket = eventId !== token_id;
    if (!isTicket) {
      return super.nft_payout(token_id, balance, max_len_payout);
    }

    const tierId = getTierId(token_id);
    const tier = this.tiers.getSome(tierId);
    if (balance <= tier.price) {
      return super.nft_payout(token_id, balance, max_len_payout);
    }

    // Anti-scalping: Limit max payout to an event ticket owner to ticket face value.
    const ticketOwnerId = this.tokenOwners.getSome(token_id);
    const eventOwnerId = this.tokenOwners.getSome(token_id);
    const payout = new Map<AccountId, u128>();
    payout.set(ticketOwnerId, tier.price);
    payout.set(eventOwnerId, u128.sub(balance, tier.price));
    return {
      payout,
    };
  }
}
