import { List } from 'immutable';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

import { Table } from '../table';
import {
  BooleanColumn,
  ColumnTypes,
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
  @Output() selectedRow = new EventEmitter<List<ColumnTypes>>();

  public readonly lineNumberHeaderName = 'Line number';

  public dataSource: List<StringColumn>[] = [];
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

      return new StringColumn(column.name, rows);
    });

    const firstColumn = columns.first(undefined);
    if (firstColumn === undefined) throw new Error('no column');

    this.dataSource = firstColumn.rows
      .map((_, rowIndex) =>
        columns.map(
          (column) =>
            new StringColumn(
              column.name,
              List.of(column.rows.get(rowIndex) as string)
            )
        )
      )
      .toArray();
  }
}
