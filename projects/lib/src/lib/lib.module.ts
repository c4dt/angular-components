import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { RevealerComponent } from './revealer/revealer.component';
import { RevealerLabelComponent } from './revealer/revealer-label.component';
import { TableViewerComponent } from './table-viewer/table-viewer.component';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    RevealerComponent,
    RevealerLabelComponent,
    TableViewerComponent,
  ],
  imports: [CommonModule, MatTableModule, ScrollingModule],
  exports: [
    BreadcrumbsComponent,
    RevealerComponent,
    RevealerLabelComponent,
    TableViewerComponent,
  ],
})
export class LibModule {}
