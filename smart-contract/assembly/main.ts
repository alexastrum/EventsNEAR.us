import { context } from "near-sdk-as";
import {
  PostedMessage,
  messages,
  Event,
  Ticket,
  events,
  tickets,
} from "./model";

// --- contract code goes below

export function createEvent(
  title: string,
  ticketPrice: string[],
  ticketOwners: {
    accountId: string;
    quantity: u32;
  }[]
): void {
  const event = new Event(context.sender, title, ticketPrice);
  events.set("id", event);
  tickets.set("id", new Ticket());
  // new Ticket();
}

export function transfer(ticketId: string, recipientAccountId: string): void {}

export function listForSale(ticketId: string): void {}

export function unlistForSale(ticketId: string): void {}

export function buy(ticketId: string): void {}

export function scan(ticketId: string): void {}

export function unscan(ticketId: string): void {}

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addMessage(text: string): void {
  // Creating a new message and populating fields with our data
  const message = new PostedMessage(text);
  // Adding the message to end of the persistent collection
  messages.push(message);
}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getMessages(): PostedMessage[] {
  const numMessages = min(MESSAGE_LIMIT, messages.length);
  const startIndex = messages.length - numMessages;
  const result = new Array<PostedMessage>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}
