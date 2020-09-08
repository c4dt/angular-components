import { List, Map } from 'immutable'

import { Component, Input } from '@angular/core'

import { ColumnType } from '../columns'

type TableElement = number | Date | string
type TableObject = Array<{ [_: string]: [ColumnType, TableElement] }>

export class Table {
  public readonly rows: List<List<string>>

  public constructor (
    public readonly types: List<ColumnType>,
    public readonly header: List<string>,
    rows: List<string[]>, // https://github.com/ng-packagr/ng-packagr/issues/1742
  ) {
    if (types.size !== header.size) {
      throw new Error('unconsistent width for types')
    }

    for (const row of rows) {
      if (row.length !== header.size) {
        throw new Error('unconsistent width')
      }
    }
    this.rows = rows.map(l => List(l))
  }

  public toObject (): TableObject {
    const ret = this.rows.map(row => this.types.zip(row).zip(this.header)
      .reduce((acc, [[type, value], name]) =>
        acc.set(name, [type, type.forRow(value)]), Map())
    ).toJS()
    return ret
  }
}

@Component({
  selector: 'lib-dataprovider-viewer',
  templateUrl: './dataprovider-viewer.component.html'
})
export class DataproviderViewerComponent {
  @Input() public table: Table | null | undefined
}
