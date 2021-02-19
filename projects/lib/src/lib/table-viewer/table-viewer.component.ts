import { List } from 'immutable';

import { Component, Input, OnChanges } from '@angular/core';

import { Table } from '../table';
import {
  BooleanColumn,
  DatedDaysColumn,
  DatedYearsColumn,
  NumberColumn,
  StringColumn,
} from '../columns';

@Component({
  selector: 'lib-table-viewer',
  templateUrl: './table-viewer.component.html',
})
export class TableViewerComponent implements OnChanges {
  @Input() public table: Table | null | undefined;

  public dataSource: string[][] = [];
  public headersName: string[] = [];

  async ngOnChanges(): Promise<void> {
    if (this.table === undefined || this.table === null) return;

    this.headersName = this.table.columns
      .map((column) => column.name)
      .toArray();

    const columns = this.table.columns.map((column) => {
      let rows: List<string>;
      if (column instanceof DatedYearsColumn)
        rows = column.rows.map((date) =>
          date.toLocaleDateString(undefined, { year: 'numeric' })
        );
      else if (column instanceof DatedDaysColumn)
        rows = column.rows.map((date) =>
          date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          })
        );
      else if (column instanceof NumberColumn)
        rows = column.rows.map((num) => num.toFixed(column.decimalCount));
      else if (column instanceof StringColumn) rows = column.rows;
      else if (column instanceof BooleanColumn)
        rows = column.rows.map((b) => b.toString());
      else throw new Error("unknown column's type");

      return rows;
    });

    this.dataSource = columns
      .map((_, columnIndex) =>
        columns.map((column) => column.get(columnIndex) as string).toArray()
      )
      .toArray();
  }

  get(columnIndex: number, rowIndex: number): unknown | undefined {
    if (this.table === undefined || this.table === null) return undefined;

    const column = this.table.columns.get(columnIndex);
    if (column === undefined) return undefined;

    return column.rows.get(rowIndex);
  }
}
