import { List } from 'immutable';

import * as csv from 'papaparse';

import {
  ColumnType,
  ColumnMultiplied,
  ColumnDatedYears,
  ColumnDatedDays,
  ColumnRaw,
} from './columns';

export class Table {
  public constructor(
    public readonly columns: List<
      [header: string, type: ColumnType, rows: List<string>]
    >
  ) {
    const firstColumn = columns.first(undefined);
    if (firstColumn === undefined) throw new Error('no columns');
    const rowCount = firstColumn[2].size;

    if (columns.shift().some((column) => column[2].size !== rowCount))
      throw new Error('unconsistent width');
  }

  public toObject(): Array<{
    [_: string]: [ColumnType, number | Date | string];
  }> {
    const ret = this.columns
      .map(([name, type, rows]) =>
        rows.map((value) => [name, [type, type.forRow(value)]])
      )
      .toJS();
    return ret;
  }
}

async function getAndParseCSV(url: URL): Promise<List<List<string>>> {
  const results = await new Promise<csv.ParseResult<string[]>>(
    (resolve, reject) =>
      csv.parse(url.href, {
        download: true,
        skipEmptyLines: true,
        complete: resolve,
        error: reject,
      })
  );
  for (const err of results.errors)
    throw new Error(`when CSV parsing: ${err.message}`);

  const dataset = List(results.data.map((row: string[]) => List(row)));

  const firstLine = dataset.get(0);
  if (firstLine === undefined)
    throw new Error("dataset's types should contain a single line");

  if (dataset.shift().some((line) => line.size !== firstLine.size))
    throw new Error("dataset isn't rectangular");

  return dataset;
}

export async function fetchDataset(
  datasetURL: URL,
  datasetTypesURL: URL
): Promise<Table> {
  const typesCSV = getAndParseCSV(datasetTypesURL);
  const datasetCSV = getAndParseCSV(datasetURL);

  const header = (await datasetCSV).get(0);
  if (header === undefined) throw new Error("dataset doesn't have any row");

  const typesStr = (await typesCSV).get(0);
  if ((await typesCSV).size !== 1 || typesStr === undefined)
    throw new Error("dataset's types should contain a single line");
  if (header.size !== typesStr.size)
    throw new Error("dataset and dataset's types aren't of the same width");

  const types: List<(_: string) => ColumnType> = typesStr.map((t) => {
    if (t === 'string') return (name: string) => new ColumnRaw(name);

    const numericMatches = t.match(/^\*(\d+)$/);
    if (numericMatches !== null) {
      const value = Number.parseInt(numericMatches[1]);
      if (Number.isNaN(value))
        throw new Error(`unable to parse as int: ${numericMatches[1]}`);

      return (name: string) => new ColumnMultiplied(name, value);
    }

    const dateMatches = t.match(/^date\/(years|days)\+(\d+)$/);
    if (dateMatches !== null) {
      const value = Number.parseInt(dateMatches[2]);
      if (Number.isNaN(value))
        throw new Error(`unable to parse as int: ${dateMatches[2]}`);

      const date = new Date(value, 0);
      switch (dateMatches[1]) {
        case 'years':
          return (name: string) => new ColumnDatedYears(name, date);
        case 'days':
          return (name: string) => new ColumnDatedDays(name, date);
      }
    }

    throw new Error(`unknown dataset's type: ${t}`);
  });

  const content = (await datasetCSV).shift();
  const columns = header
    .zip(types)
    .map(([name, typeConstructor], columnIndex) => {
      const ret: [string, ColumnType, List<string>] = [
        name,
        typeConstructor(name),
        content.map((line) => {
          const element = line.get(columnIndex);
          if (element === undefined)
            throw new Error('missing element in dataset');
          return element;
        }),
      ];
      return ret;
    });

  return new Table(columns);
}
