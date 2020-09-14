import { Graph3d } from 'vis-graph3d/peer'

import { Component, ElementRef, OnChanges, Input } from '@angular/core'

import { VisPoint } from './types'

@Component({
  selector: 'vis-graph3d',
  template: '',
})
export class VisGraph3dComponent implements OnChanges {
  @Input() public data: VisPoint[] | null | undefined
  @Input() public options: any | null | undefined

  constructor (private readonly element: ElementRef) {}

  ngOnChanges (): void {
    if (this.data === null || this.data === undefined ||
      this.options === null || this.options === undefined) {
      return
    }

    new Graph3d(this.element.nativeElement, this.data, this.options)
  }
}
