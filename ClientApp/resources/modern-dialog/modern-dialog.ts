import { bindable, autoinject } from "aurelia-framework";
//import { App } from "../app/app";

@autoinject
export class ModernDialog {
  @bindable owner?: IOwner;
  protected showSpinner: boolean = false;
  protected heading: string = "";
  protected body: string = "";
  protected status = "hidden";
  public buttonOk?: HTMLButtonElement;
  keydown(ke: KeyboardEvent) {
    switch (ke.key) {
      case "Enter":
        this.ok();
        break;
      case "Esc":
      case "Escape":
        this.cancel();
        break;
      default:
        return true; // ALLOW default processing 
    }
  }
  public ok() {
    this.status = "ok";
  }
  public cancel() {
    this.status = "cancel";
  }
  public show(title: string, body: string): Promise<void> {
    this.status = "modal";
    this.heading = title;
    this.body = body;
    var that = this;
    setTimeout(() => {
      // allow dialog to become visible prior to setting focus 
      if (that.buttonOk)
        that.buttonOk.focus();
    }, 300);
    return new Promise<void>((resolve, reject) => {
      (function showing() {
        setTimeout(() => {
          switch (that.status) {
            case "modal":
              showing.apply(that);
              break;
            case "ok":
              resolve();
              break;
            case "cancel":
              reject();
          }
        }, 300)
      })();
    });
  }
  //constructor(public app: App) { }
  attached() {
    if (this.owner) {
      this.owner.dialog = this;
    }
  }
}

export interface IOwner {
  dialog: ModernDialog;
}