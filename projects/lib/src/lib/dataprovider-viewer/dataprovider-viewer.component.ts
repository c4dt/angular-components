import { List } from 'immutable';

import { Component, Input, OnChanges } from '@angular/core';

import { Table } from '../table';

@Component({
  selector: 'lib-dataprovider-viewer',
  templateUrl: './dataprovider-viewer.component.html',
})
export class DataproviderViewerComponent implements OnChanges {
  @Input() public table: Table | null | undefined;

  public headersName: List<string> | undefined;

  async ngOnChanges(): Promise<void> {
    if (this.table === undefined || this.table === null) return;
    this.headersName = this.table.columns.map((header) => header[0]);
  }

  get(columnIndex: number, rowIndex: number): unknown | undefined {
    if (this.table === undefined || this.table === null) return undefined;

    const column = this.table.columns.get(columnIndex);
    if (column === undefined) return undefined;

    const value = column[2].get(rowIndex);
    if (value === undefined) return undefined;

    return column[1].forRow(value);
  }
}
