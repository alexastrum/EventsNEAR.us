import {
  context,
  u128,
  PersistentVector,
  PersistentMap,
  ContractPromiseBatch,
} from "near-sdk-as";
import { PersistentLottery } from "./lottery";
import { NFTContractMetadata, PersistentNFT, TokenMetadata } from "./nft";

@nearBindgen
class EventData {
  title: string; // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
  description: string; // free-form description
  media_hash: string; // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
  issued_at: u64; // When token was issued or minted, Unix epoch in milliseconds
  starts_at: u64; // When token starts being valid, Unix epoch in milliseconds
  reference_hash: string; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

@nearBindgen
class Tier {
  title: string; // free-form description
  issued_at: u64; // When token was issued or minted, Unix epoch in milliseconds
  copies: u32;
  price: u128;
}

@nearBindgen
class Ticket {
  copies: u32;
  forSale: u32;
  expires_at: u64; // When token expires, Unix epoch in milliseconds
}

@nearBindgen
export class createEvent_Tier {
  quantity: u32;
  description: string;
  recipientId: string;
  price: u128;
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
  private events: PersistentMap<string, EventData>;
  private tiers: PersistentMap<string, Tier>;
  private tickets: PersistentMap<string, Ticket>;

  constructor(private metadata: NFTContractMetadata) {
    metadata.reference = metadata.base_uri;
    super("O");
    this.events = new PersistentMap("E");
    this.tiers = new PersistentMap("T");
    this.tickets = new PersistentMap("K");
  }

  nft_metadata(): NFTContractMetadata {
    return this.metadata;
  }

  protected getMetadata(token_id: string): TokenMetadata | null {
    const eventId = token_id.split("/")[0];
    const event = this.events.getSome(eventId);
    const metadata: any = event;
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
      if (tier.issued_at) {
        metadata.issued_at = tier.issued_at;
      }
      metadata.copies = tier.copies;
      metadata.extra = "{price: " + tier.price.toString() + "}";

      const ticket = this.tickets.getSome(token_id);
      if (ticket.copies > 1) {
        metadata.title += " x " + ticket.copies.toString();
      }
      if (ticket.expires_at) {
        metadata.expires_at = ticket.expires_at;
      }
      // if (ticket.updated_at) {
      //   metadata.updated_at = ticket.updated_at;
      // }
    }

    return metadata;
  }

  createEvent(
    id: string,
    title: string,
    description: string,
    media_hash: string,
    starts_at: u64, // When token starts being valid, Unix epoch in milliseconds
    reference_hash: string,
    tickets: createEvent_Tier[]
  ): void {
    oneYocto();

    this.mint(id, context.predecessor);
    const issued_at = div<u64>(context.blockTimestamp, 1_000_000);
    this.events.set(id, {
      title,
      description,
      media_hash,
      starts_at,
      reference_hash,
      issued_at,
    });

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const tierId = id + "/" + i.toString();
      const ticketId = tierId + "/0";
      this.mint(ticketId, ticket.recipientId);
      this.tiers.set(tierId, {
        title: ticket.description,
        issued_at,
        copies: ticket.quantity,
        price: ticket.price,
      });
      this.tickets.set(ticketId, {
        copies: ticket.quantity,
        forSale: ticket.price ? ticket.quantity : 0,
        expires_at: 0,
      });
    }
  }

  listForSale(ticketId: string, quantity: u32): void {
    oneYocto();
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

    ticket.forSale = quantity;
    this.tickets.set(ticketId, ticket);
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
    assert(quantity <= ticket.forSale, "Insufficient forSale tickets");

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
        forSale: ticket.forSale - quantity,
        expires_at: 0,
      });
    }

    // Transfer ownership of original ticket batch
    this.tokenOwners.set(ticketId, buyerId);

    // Take sold tickets off market
    ticket.copies = quantity;
    ticket.forSale = 0;
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
    oneYocto();

    const eventId = getEventId(ticketId);
    const eventOwnerId = this.tokenOwners.getSome(eventId);
    assert(
      context.predecessor === eventOwnerId,
      "Only event owners can invalidate tickets"
    );

    const ticket = this.tickets.getSome(ticketId);
    assert(!ticket.expires_at, "Ticket already invalidated");

    if (ticket.forSale > 0) {
      ticket.forSale--;
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
        forSale: ticket.forSale,
        expires_at: 0,
      });
      ticket.copies = 1;
      ticket.forSale = 0;
    }

    ticket.expires_at = context.blockTimestamp / 1_000_000;
    this.tickets.set(ticketId, ticket);
  }

  reactivate(ticketId: string): void {
    oneYocto();

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
}
