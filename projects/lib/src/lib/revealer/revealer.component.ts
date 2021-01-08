import { Component } from '@angular/core';

@Component({
  selector: 'lib-revealer',
  templateUrl: './revealer.component.html',
  styleUrls: ['./revealer.component.css'],
})
export class RevealerComponent {
  public revealed = false;

  reveal(): void {
    if (this.revealed) throw new Error('unable to reveal twice');
    this.revealed = true;
  }
}
