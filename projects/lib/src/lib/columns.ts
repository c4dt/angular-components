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

export abstract class ColumnDated extends ColumnMapper<Date> {
  constructor(
    name: string,
    public readonly offset: Date,
    public readonly dateSetter: (toSet: Date, value: number) => void
  ) {
    super(name);
  }

  equals(other: ColumnMapper<unknown>): boolean {
    return (
      other instanceof ColumnDated &&
      other.name === this.name &&
      other.offset.getTime() === this.offset.getTime()
    );
  }

  forRow(value: string): Date {
    const date = Number.parseInt(value, 10);
    if (Number.isNaN(date) || date < 0 || date > 365)
      throw new Error(`invalid date: ${value}`);

    const ret = new Date(this.offset.getTime());
    this.dateSetter(ret, date);
    return ret;
  }
}

export class ColumnDatedDays extends ColumnDated {
  public readonly kind = 'date/days';

  constructor(name: string, offset: Date) {
    super(name, offset, (toSet: Date, value: number) => toSet.setDate(value));
  }
}

export class ColumnDatedYears extends ColumnDated {
  public readonly kind = 'date/years';

  constructor(name: string, offset: Date) {
    super(name, offset, (toSet: Date, value: number) =>
      toSet.setFullYear(offset.getFullYear() + value)
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
