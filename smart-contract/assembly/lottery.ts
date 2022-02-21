import { math, PersistentMap, PersistentVector, RNG } from "near-sdk-as";

@nearBindgen
export class PersistentLottery<T> {
  private entries: PersistentVector<T>;
  private entryHashes: PersistentMap<Uint8Array, i32>;

  constructor(prefix: string) {
    this.entries = new PersistentVector(prefix);
    this.entryHashes = new PersistentMap(prefix + "#");
  }

  get entryCount(): i32 {
    return this.entries.length;
  }

  /**
   * Helper function to hash items in the Set as Uint8Arrays.
   *
   * @param item The item to hash
   * @internal
   */
  private hashedItem(item: T): Uint8Array {
    let encodedItem = encode<T, Uint8Array>(item); // prep for hash
    return math.keccak256(encodedItem); // produce the key
  }

  /**
   * Registers a new entry into the lottery pot.
   *
   * Throws if this entry is already registered.
   *
   * @param entry
   * @returns Total ticket count
   */
  add(entry: T): i32 {
    const hash = this.hashedItem(entry);
    assert(!this.entryHashes.contains(hash), "Duplicate lottery entry");
    const index = this.entries.push(entry);
    this.entryHashes.set(hash, index);
    return index;
  }

  remove(entry: T): void {
    const hash = this.hashedItem(entry);
    const index = this.entryHashes.getSome(hash);
    this.swap_remove(index);
  }

  /**
   * Retrieves a winning entry from the pot.
   *
   * @returns
   */
  roll(): T {
    const roll = new RNG<i32>(1, this.entries.length);
    const winnerIndex = roll.next();
    return this.swap_remove(winnerIndex);
  }

  private swap_remove(index: i32): T {
    this.entryHashes.set(this.hashedItem(this.entries.back), index);
    return this.entries.swap_remove(index);
  }
}
