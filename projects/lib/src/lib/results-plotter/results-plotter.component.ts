import { Collection, List, Range, Repeat, Seq } from 'immutable';

import { Component, Input, OnChanges } from '@angular/core';

import { ColumnType } from '../columns';
import { VisPoint } from './types';

type Point = Collection.Indexed<number>;

@Component({
  selector: 'app-results-plotter',
  templateUrl: './results-plotter.component.html',
})
export class ResultsPlotterComponent implements OnChanges {
  @Input() public factors: List<number> | null | undefined;
  @Input() public columns: List<ColumnType> | null | undefined;

  public plotlyGraph: { data: any[]; layout: any } | undefined;
  public visGraph: { data: VisPoint[]; options: any } | undefined;

  private readonly range = Range(0, 10);

  ngOnChanges(): void {
    if (
      this.factors === undefined ||
      this.factors === null ||
      this.columns === undefined ||
      this.columns === null
    )
      return;

    if (this.factors.size !== 2 && this.factors.size !== 3)
      throw new Error('unable to plot given factors');

    const columns = this.columns;
    const points = this.interpolateFunction(this.factors);
    const scalled = ResultsPlotterComponent.scalePoints(columns, points);
    const ranges: [Point, Point] = [
      scalled.reduce((acc, p) =>
        acc
          .zip(p)
          .map(([x, y]) => (x < y ? x : y))
          .zip(columns)
          .map(([n, col]) => (col.kind === 'multiplied' ? 0 : n))
      ),
      scalled.reduce((acc, p) => acc.zip(p).map(([x, y]) => (x > y ? x : y))),
    ];

    this.plotlyGraph = undefined;
    this.visGraph = undefined;

    if (this.factors.size === 2) {
      this.plotlyGraph = {
        data: [
          scalled.reduce(
            (acc, input) => {
              List.of('x', 'y')
                .zip(input)
                .forEach(([key, i]) => {
                  if (!(key in acc)) {
                    acc[key] = [];
                  }
                  acc[key].push(i);
                });
              return acc;
            },
            {
              type: 'scatter',
              mode: 'lines',
            } as any
          ),
        ],
        layout: this.gen2DOptions(this.columns, ranges),
      };
    } else if (this.factors.size === 3) {
      this.visGraph = {
        data: ResultsPlotterComponent.pointsToDataSet(scalled).toJS(),
        options: this.gen3DOptions(this.columns),
      };
    }
  }

  private interpolateFunction(factors: List<number>): Seq.Indexed<Point> {
    const offset: number = factors.first(0);
    const ranges = Repeat(this.range, factors.size - 1);
    const inputs = ranges.reduce(
      (acc, range) => acc.flatMap((l) => range.map((i) => l.push(i))),
      Seq([List<number>()])
    );

    const interpolated = inputs.map((input) =>
      input
        .zip(factors.shift())
        .map(([l, r]) => l * r)
        .reduce((acc, val) => acc + val, offset)
    );

    return inputs.zip(interpolated).map(([input, value]) => input.push(value));
  }

  private static scalePoints(
    columns: List<ColumnType>,
    points: Seq.Indexed<Point>
  ): Seq.Indexed<Point> {
    const scaler = function (column: ColumnType, value: number): number {
      if (column.kind === 'multiplied') return value * column.factor;

      if (column.kind === 'date/years')
        return value + column.offset.getFullYear();

      throw new Error('columns scaler unmatched to results');
    };

    return points.map((point) =>
      columns.zip(point).map(([col, value]) => scaler(col, value))
    );
  }

  private static pointsToDataSet(
    points: Seq.Indexed<Point>
  ): Seq.Indexed<VisPoint> {
    // TODO unable to inline return: https://github.com/ng-packagr/ng-packagr/issues/696
    const ret = points.map((point, id) => {
      const [x, y] = [point.get(0), point.get(1)];
      if (x === undefined || y === undefined)
        throw new Error('undefined point element');

      return {
        id: id,
        x: x,
        y: y,
        z: point.get(2),
      };
    });
    return ret;
  }

  private static getMaximumWidth(): [number, number] {
    const widthContainers = document.getElementsByTagName('app-query-runner');
    if (widthContainers === null) throw new Error('width container not found');
    const container: HTMLElement = widthContainers[0] as HTMLElement;

    return [container.offsetWidth, container.offsetHeight];
  }

  private gen2DOptions(columns: List<ColumnType>, ranges: [Point, Point]): any {
    const [width, height] = ResultsPlotterComponent.getMaximumWidth();
    const columnsName: List<string> = columns.map((col) => col.name);

    return columnsName
      .zip(List.of('x', 'y', 'z'))
      .zip(ranges[0].zip(ranges[1]))
      .reduce(
        (acc, [[col, n], [min, max]]) => {
          acc[`${n}axis`] = {
            title: col,
            range: [min, max],
          };
          return acc;
        },
        {
          autosize: false,
          width: width,
          height: height,
        } as any
      );
  }

  private gen3DOptions(columns: List<ColumnType>): any {
    const [width, height] = ResultsPlotterComponent.getMaximumWidth();
    const columnsName: List<string> = columns.map((col) => col.name);

    return {
      width: `${width}px`,
      height: `${height}px`,
      style: 'surface',
      showGrid: true,
      keepAspectRatio: false,
      xLabel: columnsName.get(0),
      yLabel: columnsName.get(1),
      zLabel: columnsName.get(2),
      axisFontSize: 20,
      tooltipDelay: 0,
      tooltip: (point: { x: number; y: number; z: number }) =>
        List.of(
          `${columnsName.get(0)}: ${point.x.toFixed()}`,
          `${columnsName.get(1)}: ${point.y.toFixed()}`,
          `${columnsName.get(2)}: ${point.z.toFixed()}`
        ).join('<br>'),
    };
  }
}
