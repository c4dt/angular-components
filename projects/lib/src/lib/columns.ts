abstract class ColumnMapper<T> {
  public abstract readonly kind:
    | 'date/days'
    | 'date/years'
    | 'multiplied'
    | 'string';
  constructor(public readonly name: string) {}
  abstract equals(other: ColumnMapper<unknown>): boolean;
  abstract forRow(value: string): T;
}

export class ColumnDatedDays extends ColumnMapper<Date> {
  public readonly kind = 'date/days';

  constructor(name: string, public readonly offset: Date) {
    super(name);
  }

  forRow(value: string): Date {
    const days = Number.parseInt(value, 10);
    if (Number.isNaN(days) || days < 0 || days > 365)
      throw new Error(`invalid days count: ${value}`);

    const ret = new Date(this.offset.getTime());
    ret.setDate(days);
    return ret;
  }

  equals(other: ColumnMapper<unknown>): boolean {
    return (
      other instanceof ColumnDatedDays &&
      other.name === this.name &&
      other.offset.getTime() === this.offset.getTime()
    );
  }
}

export class ColumnDatedYears extends ColumnMapper<Date> {
  public readonly kind = 'date/years';

  constructor(name: string, public readonly offset: Date) {
    super(name);
  }

  forRow(value: string): Date {
    const years = Number.parseInt(value, 10);
    if (Number.isNaN(years) || years < 0)
      throw new Error(`invalid years count: ${value}`);

    const ret = new Date(this.offset.getTime());
    ret.setFullYear(this.offset.getFullYear() + years);
    return ret;
  }

  equals(other: ColumnMapper<unknown>): boolean {
    return (
      other instanceof ColumnDatedYears &&
      other.name === this.name &&
      other.offset.getTime() === this.offset.getTime()
    );
  }
}

export class ColumnMultiplied extends ColumnMapper<number> {
  public readonly kind = 'multiplied';

  constructor(name: string, public readonly factor: number) {
    super(name);
  }

  equals(other: ColumnMapper<unknown>): boolean {
    return (
      other instanceof ColumnMultiplied &&
      other.name === this.name &&
      other.factor === this.factor
    );
  }

  forRow(value: string): number {
    const num = Number.parseInt(value, 10);
    if (Number.isNaN(num)) throw new Error(`invalid number: ${value}`);

    return this.factor * num;
  }
}

export class ColumnString extends ColumnMapper<string> {
  public readonly kind = 'string';

  constructor(name: string) {
    super(name);
  }

  equals(other: ColumnMapper<unknown>): boolean {
    return other instanceof ColumnString && other.name === this.name;
  }

  forRow(value: string): string {
    return value;
  }
}

export type ColumnType =
  | ColumnDatedDays
  | ColumnDatedYears
  | ColumnMultiplied
  | ColumnString;

export function isColumnType(obj: unknown): obj is ColumnType {
  return (
    obj instanceof ColumnDatedDays ||
    obj instanceof ColumnDatedYears ||
    obj instanceof ColumnMultiplied ||
    obj instanceof ColumnString
  );
}
