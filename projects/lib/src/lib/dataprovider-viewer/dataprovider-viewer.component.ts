import { Component, Input } from '@angular/core';

import { Table } from '../table';

@Component({
  selector: 'lib-dataprovider-viewer',
  templateUrl: './dataprovider-viewer.component.html',
})
export class DataproviderViewerComponent {
  @Input() public table: Table | null | undefined;
}
