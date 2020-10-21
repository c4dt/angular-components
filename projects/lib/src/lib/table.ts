import { List } from 'immutable';

import * as csv from 'papaparse';

import {
  DatedYearsColumn,
  DatedDaysColumn,
  NumberColumn,
  StringColumn,
  ColumnTypes,
} from './columns';

export class Table {
  constructor(public readonly columns: List<ColumnTypes>) {
    const firstColumn = columns.get(0);
    if (firstColumn === undefined) throw new Error('no columns');
    const rowCount = firstColumn.rows.size;

    if (columns.shift().some((column) => column.rows.size !== rowCount))
      throw new Error('unconsistent width');
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
    throw new Error(`parse as CSV: ${err.message}`);

  const dataset = List(results.data.map((row: string[]) => List(row)));

  const firstLine = dataset.get(0);
  if (firstLine === undefined) throw new Error('dataset is empty');

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
  if (header === undefined) throw new Error('dataset is empty');

  const typesStr = (await typesCSV).get(0);
  if ((await typesCSV).size !== 1 || typesStr === undefined)
    throw new Error("dataset's types should contain a single line");
  if (header.size !== typesStr.size)
    throw new Error("dataset and dataset's types aren't of the same width");

  const dataset = (await datasetCSV).shift();
  return new Table(
    header.zip(typesStr).map(([name, t], columnIndex) => {
      if (t === 'string')
        return new StringColumn(
          name,
          dataset.map((row) => row.get(columnIndex) as string)
        );

      const numericMatches = t.match(/^number(\.(\d))?(\*(\d+))?$/);
      if (numericMatches !== null) {
        const decimalCountStr = numericMatches[2];
        const factorStr = numericMatches[4];

        let decimalCount;
        if (decimalCountStr !== undefined) {
          decimalCount = Number.parseInt(decimalCountStr);
          if (Number.isNaN(decimalCount))
            throw new Error(`parse decimal count as int: ${decimalCountStr}`);
        }

        let factor;
        if (factorStr !== undefined) {
          factor = Number.parseInt(factorStr);
          if (Number.isNaN(factor))
            throw new Error(`parse factor as int: ${factorStr}`);
        }

        return new NumberColumn(
          name,
          dataset.map((row) => {
            const value = Number.parseFloat(row.get(columnIndex) as string);
            if (Number.isNaN(value))
              throw new Error(`parse as float: ${value}`);
            return value;
          }),
          decimalCount,
          factor
        );
      }

      const dateMatches = t.match(/^date\/(years|days)\+(\d+)years$/);
      if (dateMatches !== null) {
        const offset = Number.parseInt(dateMatches[2]);
        if (Number.isNaN(offset))
          throw new Error(`parse as int: ${dateMatches[2]}`);
        const date = new Date(0);
        date.setFullYear(offset);

        if (dateMatches[1] !== 'years' && dateMatches[1] !== 'days')
          throw new Error(`unknown dataset's date type: ${dateMatches[1]}`);
        const dateType = dateMatches[1];

        const rows = dataset.map((row) => {
          const value = Number.parseInt(row.get(columnIndex) as string);
          if (Number.isNaN(value)) throw new Error(`parse as int: ${value}`);
          return value;
        });

        switch (dateType) {
          case 'years':
            return new DatedYearsColumn(name, rows, date);
          case 'days':
            return new DatedDaysColumn(name, rows, date);
        }
      }

      throw new Error(`unknown dataset's type: ${t}`);
    })
  );
}
