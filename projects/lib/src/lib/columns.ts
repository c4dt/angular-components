import { List } from 'immutable';

abstract class Column<T> {
  constructor(public readonly name: string, public readonly rows: List<T>) {}
}

export class StringColumn extends Column<string> {}
abstract class DatedColumn extends Column<Date> {
  constructor(
    name: string,
    values: List<number>,
    public readonly offset: (value: number) => Date
  ) {
    super(name, values.map(offset));
  }
}
export class DatedDaysColumn extends DatedColumn {
  constructor(name: string, values: List<number>, offset: Date) {
    super(name, values, (value: number) => {
      const ret = new Date(offset);
      ret.setDate(ret.getDate() + value);
      return ret;
    });
  }
}
export class DatedYearsColumn extends DatedColumn {
  constructor(name: string, values: List<number>, offset: Date) {
    super(name, values, (value: number) => {
      const ret = new Date(offset);
      ret.setFullYear(offset.getFullYear() + value);
      return ret;
    });
  }
}
export class MultipliedColumn extends Column<number> {
  constructor(
    name: string,
    values: List<number>,
    private readonly factor: number
  ) {
    super(
      name,
      values.map((value) => MultipliedColumn.multiplyWithFactor(factor, value))
    );
  }

  private static multiplyWithFactor(factor: number, value: number): number {
    return factor * value;
  }
  public multiply(value: number): number {
    return MultipliedColumn.multiplyWithFactor(this.factor, value);
  }
}

export type ColumnTypes =
  | StringColumn
  | DatedDaysColumn
  | DatedYearsColumn
  | MultipliedColumn;
export function isColumnType(obj: unknown): obj is ColumnTypes {
  return (
    obj instanceof StringColumn ||
    obj instanceof DatedDaysColumn ||
    obj instanceof DatedYearsColumn ||
    obj instanceof MultipliedColumn
  );
}

export type AngularColumnTypes =
  | 'date/days'
  | 'date/years'
  | 'number'
  | 'string';
export function toAngularColumnTypes(column: ColumnTypes): AngularColumnTypes {
  if (column instanceof DatedDaysColumn) return 'date/days';
  else if (column instanceof DatedYearsColumn) return 'date/years';
  else if (column instanceof MultipliedColumn) return 'number';
  else if (column instanceof StringColumn) return 'string';
  throw new Error('unknown column type');
}
