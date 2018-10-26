import { autoinject } from "aurelia-framework";
import { Contact } from "../app/contact";
import { App } from "../app/app";
import { GridRow, Grid } from "../../../resources/grid/grid";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class Operator {
  constructor(public app: App, private ea: EventAggregator) {
    var that = this;
    ea.subscribeOnce("operator_loaded", (operator: Contact) => {
      if (that.grid) {
        that.grid.value = operator;
      }
    });
  }
  grid?: Grid;
  public logonoff(user: Contact) {
    if (this.app.operator && (this.operatorKey(this.app.operator) === this.operatorKey(user))) {
      this.app.operatorLogoff(user);
    } else {
      this.app.operatorLogon(user);
    }
  }
  attached() {
    if (this.grid) {
      this.grid.value = this.app.operator;
    }
}
  public operatorKey(c: Contact): string {
    return (c.surname + c.firstName + c.contact_Key).toLowerCase();
  }
}
