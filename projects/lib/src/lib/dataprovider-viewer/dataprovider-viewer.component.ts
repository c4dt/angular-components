import { List } from 'immutable';

import { Component, Input, OnChanges } from '@angular/core';

import { Table } from '../table';
import { AngularColumnTypes, toAngularColumnTypes } from '../columns';

@Component({
  selector: 'lib-dataprovider-viewer',
  templateUrl: './dataprovider-viewer.component.html',
})
export class DataproviderViewerComponent implements OnChanges {
  @Input() public table: Table | null | undefined;

  public columnTypes: AngularColumnTypes[] | undefined;
  public headersName: List<string> | undefined;

  async ngOnChanges(): Promise<void> {
    if (this.table === undefined || this.table === null) return;
    this.columnTypes = this.table.columns.map(toAngularColumnTypes).toArray();
    this.headersName = this.table.columns.map((column) => column.name);
  }

  get(columnIndex: number, rowIndex: number): unknown | undefined {
    if (this.table === undefined || this.table === null) return undefined;

    const column = this.table.columns.get(columnIndex);
    if (column === undefined) return undefined;

    return column.rows.get(rowIndex);
  }
}
