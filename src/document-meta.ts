import { EditionMeta, Meta, isValidMeta, isValidEditionMeta } from './types';

export default class DocumentMeta {
  private _data: Meta = {};

  public constructor(data: unknown) {
    if (isValidMeta(data)) {
      this._data = data;
    }
  }

  public has(id: string): boolean {
    return typeof this._data[id] !== `undefined`;
  }

  public get(id: string): EditionMeta | null {
    if (!this.has(id)) {
      return null;
    }

    return this.clone(this._data[id]);
  }

  public get data(): Meta {
    return this.clone(this._data);
  }

  public set(id: string, editionMeta: EditionMeta): void {
    const cloned: unknown = this.clone(editionMeta);
    if (isValidEditionMeta(cloned)) {
      this._data[id] = cloned;
    }
  }

  public delete(id: string): void {
    delete this._data[id];
  }

  public getAll(): [string, EditionMeta][] {
    return [...this];
  }

  public *[Symbol.iterator](): IterableIterator<[string, EditionMeta]> {
    for (const id of Object.keys(this._data)) {
      yield [id, this.clone(this._data[id])];
    }
  }

  // prevent handing out (or receiving) mutable refs
  private clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }
}
