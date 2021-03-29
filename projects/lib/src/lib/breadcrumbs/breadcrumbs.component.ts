import { List } from 'immutable';

import { Component, Input } from '@angular/core';

export type BreadCrumb = { label: string; link: URL };

@Component({
  selector: 'lib-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
})
export class BreadcrumbsComponent {
  @Input() showcaseBreadCrumb: BreadCrumb | null | undefined;

  public readonly baseBreadCrumbs: List<BreadCrumb> = List.of(
    { label: 'Factory', link: new URL('https://www.c4dt.org/factory') },
    { label: 'Incubator', link: new URL('https://incubator.c4dt.org') }
  );
}
