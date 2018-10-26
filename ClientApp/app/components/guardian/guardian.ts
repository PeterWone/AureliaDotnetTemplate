import { App } from "../app/app";
import { OrderRow } from "../app/order-row";
import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { Grid, GridRow } from "../../../resources/grid/grid";

@autoinject
export class Guardian {
  grid?: Grid;
  public selectedGridRow?: GridRow;
  public showItem(item: OrderRow) {
    var that = this;
    this.app.getCutlist(item.orderLine_Key).then(cut => {
      var msg: string;
      if (cut.q == 1) {
        msg = `<p>One piece, ${cut.y}&times;${cut.x}mm</p><p>Print label and mark item off?</p>`;
      } else {
        msg = `<p>${cut.q} pieces, each measuring ${cut.y}&times;${cut.x}mm</p><p>Print labels and mark item off?</p>`;
      }
      this.app
        .showDialog(`${item.fidNumber} / ${item.itemNumber}`, msg)
        .then(value => {
          let af = this.element.querySelector("[autofocus='true']") as HTMLElement;
          af && af.focus();
          for (let i = 1; i <= cut.q; i++) {
            setTimeout(() => {
              that.app.printLabel(`<div class="label-mesh"><table><tr><td>${item.fidNumber} - ${item.itemNumber}</td></tr><tr><td>${item.meshType} ${cut.y}&times;${cut.x} ${i}/${cut.q}</td></tr></table></div>`);
            }, (cut.q - i) * that.app.settings.printPauseMs);
          }
          that.app.markComplete(item.orderLine_Key);
        })
        .catch(reason => {
          // if (that.grid)
          //   that.grid.focus();
        });
    });
  }
  public items: OrderRow[] = [];
  constructor(public app: App, private element: Element, private ea: EventAggregator) {
  }
  public where(row: OrderRow): boolean {
    return row.meshType == 'GD';
  }
}