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
  styleUrls: ['./table-viewer.component.css'],
})
export class TableViewerComponent implements OnChanges {
  @Input() public table: Table | null | undefined;

  public readonly lineNumberHeaderName = 'Line number';

  public dataSource: string[][] = [];
  public headersName: string[] = [];
  public columnsName: string[] = [];

  async ngOnChanges(): Promise<void> {
    if (this.table === undefined || this.table === null) return;

    const columnsName = this.table.columns.map((column) => column.name);
    this.columnsName = columnsName.toArray();
    this.headersName = columnsName.unshift(this.lineNumberHeaderName).toArray();

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

    const firstColumn = columns.first(undefined);
    if (firstColumn === undefined) throw new Error('no column');

    this.dataSource = firstColumn
      .map((_, rowIndex) =>
        columns.map((column) => column.get(rowIndex) as string).toArray()
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
