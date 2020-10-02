import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';

import { DataproviderViewerComponent } from './dataprovider-viewer/dataprovider-viewer.component';
import { ResultsPlotterComponent } from './results-plotter/results-plotter.component';
import { VisGraph3dComponent } from './results-plotter/vis-graph3d.component';

@NgModule({
  declarations: [
    DataproviderViewerComponent,
    ResultsPlotterComponent,
    VisGraph3dComponent,
  ],
  imports: [CommonModule, ScrollingModule, MatTableModule],
  exports: [DataproviderViewerComponent, ResultsPlotterComponent],
})
export class LibModule {}
