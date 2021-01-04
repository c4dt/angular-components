import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';

import { TableViewerComponent } from './table-viewer/table-viewer.component';

@NgModule({
  declarations: [TableViewerComponent],
  imports: [CommonModule, MatTableModule, ScrollingModule],
  exports: [TableViewerComponent],
})
export class LibModule {}
