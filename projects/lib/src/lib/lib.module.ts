import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';

import * as PlotlyJS from 'plotly.js';
import { PlotlyModule } from 'angular-plotly.js';

import { DataproviderViewerComponent } from './dataprovider-viewer/dataprovider-viewer.component';
import { ResultsPlotterComponent } from './results-plotter/results-plotter.component';
import { VisGraph3dComponent } from './results-plotter/vis-graph3d.component';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    DataproviderViewerComponent,
    ResultsPlotterComponent,
    VisGraph3dComponent,
  ],
  imports: [CommonModule, PlotlyModule, MatTableModule, ScrollingModule],
  exports: [DataproviderViewerComponent, ResultsPlotterComponent],
})
export class LibModule {}
