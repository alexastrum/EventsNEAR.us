export interface Event {
  image?: string;
  title?: string;
  description?: string;
  tags?: string[];
  createdDate: Date;
  featured?: boolean;
  latest?: boolean;
  approved?: boolean;
  ownerUid?: string;
}

export interface Ticket {
  forSale?: boolean;
  eventId?: string;
  quantity?: number;
  description?: string;
  ownerUid?: string;
  price?: number;
}

export interface User {
  image?: string;
  hostedEventsCount?: number;
  attendedEventsCount?: number;
}
