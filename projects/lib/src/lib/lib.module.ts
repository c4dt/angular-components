import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';

import { DataproviderViewerComponent } from './dataprovider-viewer/dataprovider-viewer.component';

@NgModule({
  declarations: [DataproviderViewerComponent],
  imports: [CommonModule, MatTableModule, ScrollingModule],
  exports: [DataproviderViewerComponent],
})
export class LibModule {}
