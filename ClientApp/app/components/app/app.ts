import { bindable } from 'aurelia-framework';
import { autoinject, SingletonRegistration, BindingEngine } from 'aurelia-framework';
import { Aurelia, PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { HttpClient, json } from 'aurelia-fetch-client';
// import * as SignalR from "@aspnet/signalr";
import "./keyboard-route-map";
import { Contact } from './contact';
import { EventAggregator } from 'aurelia-event-aggregator';
import { OrderRow } from './order-row';
import { relativeTimeThreshold } from 'moment';
import { ModernDialog } from '../../../resources/modern-dialog/modern-dialog';
import { GridRow } from '../../../resources/grid/grid';
import { Settings } from './settings';
import { Mesh } from './mesh';
import { Cut } from './cut';
import { MeshCounts } from './meshcounts';

@autoinject
export class App {
  settings: Settings = new Settings();
  labelStyle = `<style>
  .label-mesh {
    font-family: Consolas;
    font-size: 24pt;
    height: 25mm;
    width: 90mm;
  }

  table {
    border-top: 1mm dotted white;
    border-left: 1mm dotted white;
  }

  html,body,table,tr,td {
    margin: 0;
    padding: 0;
  }
</style>`;
  public printLabel(html: string): void {
    this.http.fetch(this.settings.labelServiceUrl, {
      method: "post",
      body: json({
        printer: this.settings.labelPrinter,
        html: `${this.labelStyle}\r\n${html}`
      })
    }).then(json)
      .then(response => {
        console.log('Success:', JSON.stringify(response))
      })
      .catch(error => {
        console.error('Error:', error)
      });
  }
  private dialog?: ModernDialog;
  public staff?: Contact[];
  @bindable operator?: Contact;
  router?: Router;
  public isLoading = true;
  public meshes: Array<string> = ["AL", "FF", "GD", "PT", "SL"];
  //public signalr: SignalR.HubConnection;
  public items?: OrderRow[];
  public urgentCount: number = 0;
  public orderCount: number = 0;
  public mesh = new Mesh();
  public selectedGridRow?: GridRow;
  public refreshCountdown = 0;
  protected keymap: KeyMap = {};
  public get isModalActive() {
    return this._isModalActive;
  }
  private _isModalActive = false;
  public async showDialog(title: string, body: string): Promise<void> {
    if (this.dialog) {
      this._isModalActive = true;
      console.log("isModalActive =", this._isModalActive);
      var that = this;
      try {
        await this.dialog.show(title, body);
        that._isModalActive = false;
        console.log("isModalActive =", this._isModalActive);
      }
      catch (reason) {
        that._isModalActive = false;
        console.log("isModalActive =", this._isModalActive);
        throw reason;
      }
    } else {
      throw "Dialog is not defined";
    }
  }
  public keydown: EventListener;
  constructor(public http: HttpClient, public ea: EventAggregator, private bindingEngine: BindingEngine) {
    var that = this;
    this.http.fetch("api/Settings").then(response => response.json()).then(data => {
      that.settings = data;
      that.refreshCountdown = data.refreshIntervalSeconds;
    });
    this.keydown = (ke: Event | KeyboardEvent) => {
      if (that._isModalActive) return true;
      if (that.router && ke instanceof KeyboardEvent) {
        let fragment = that.router.currentInstruction.fragment;
        if (fragment !== "/orders-find") {
          let proposed = that.keymap[ke.key];
          if (proposed && proposed !== fragment.substring(1)) {
            that.router.navigate(proposed);
          }
        }
      } else {
        return true; // ALLOW default processing
      }
    };

    // this.signalr = new SignalR.HubConnection("message");
    // this.signalr.on("stateChange", data => this.subscribers.forEach(subscriber => subscriber.publish(data)));
    // this.signalr.start().then(result => {
    //     console.log("hub started");
    // }).catch(err => {
    //     console.log(`hub failed to start with this msg ${JSON.stringify(err)}`);
    // });

    http.fetch("api/Staff")
      .then(result => result.json() as Promise<Contact[]>)
      .then(data => {
        that.staff = data;
        that.http.fetch("api/Login").then(result => result.json()).then(loginState => {
          if (that.staff && loginState.transition == "LOGON") {
            var opid = loginState.operator;
            var op = that.staff.find(op => op.contact_Key == opid) as Contact;
            that.operator = op;
            that.ea.publish("operator_loaded", op);
          }
        });
      });
    that.getItems().then(x => that.items = x);
    setInterval(() => {
      if (!this.isModalActive && 0 === that.refreshCountdown--) {
        if (that.settings) {
          that.refreshCountdown = that.settings.refreshIntervalSeconds;
        }
        that.getItems().then(x => that.items = x);
      }
    }, 1000);
  }
  public operatorLogoff(contact: Contact) {
    console.log(`${contact.firstName} ${contact.surname} LOGGING OFF`);
    this.http.fetch(`api/Login?wstn=Meshcutter&opid=${contact.contact_Key}&state=false`, { method: "POST" })
      .then(x => {
        this.operator = undefined;
      });
  }
  public operatorLogon(contact: Contact) {
    console.log(`${contact.firstName} ${contact.surname} LOGGING ON`);
    this.http.fetch(`api/Login?wstn=Meshcutter&opid=${contact.contact_Key}&state=true`, { method: "POST" })
      .then(x => {
        this.operator = contact;
      });
  }
  private async getItems(): Promise<OrderRow[]> {
    var that = this;
    const result = await this.http.fetch('api/Meshcutter');
    const data = await (result.json() as Promise<OrderRow[]>);
    that.meshes.forEach(meshType => that.mesh[meshType] = new MeshCounts());
    for (var item of data) {
      let m = that.mesh[item.meshType];
      m.itemCount++;
      if (item.isUrgent)
        m.urgentCount++;
    }
    ;
    that.mesh["EVERYTHING"] = {
      itemCount: data.length,
      urgentCount: data.filter(x => x.isUrgent).length
    };
    that.mesh["NONLVD"] = {
      itemCount: data.length - that.mesh["FF"].itemCount - that.mesh["PT"].itemCount - that.mesh["GD"].itemCount,
      urgentCount: that.mesh["EVERYTHING"].urgentCount - that.mesh["FF"].urgentCount - that.mesh["PT"].urgentCount - that.mesh["GD"].urgentCount
    };
    that.mesh["URGENT"] = {
      itemCount: that.mesh["EVERYTHING"].urgentCount,
      urgentCount: that.mesh["EVERYTHING"].urgentCount
    };
    that.mesh["HUNG"] = {
      itemCount: data.filter(x => x.isHung).length,
      urgentCount: data.filter(x => x.isUrgent && x.isHung).length
    };
    that.isLoading = false;
    return data;
  }
  public async getCutlist(OrderLine_Key: string): Promise<Cut> {
    const result = await this.http.fetch("api/Cutlist/" + OrderLine_Key);
    return result.json();
  }
  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Mesh cut';
    let routemap = [
      {
        route: 'operator',
        name: 'operator',
        settings: { icon: 'list', keys: "0" },
        moduleId: PLATFORM.moduleName('../operator/operator'),
        nav: true,
        title: 'Operator'
      },
      {
        route: "everything",
        name: 'everything',
        settings: { icon: 'list', keys: "1", tag: "EVERYTHING" },
        moduleId: PLATFORM.moduleName('../everything/everything'),
        nav: true,
        title: 'Everything'
      },
      {
        route: ["non-lvd", ""],
        name: 'NON-LVD',
        settings: { icon: 'list', keys: "2", tag: "NONLVD" },
        moduleId: PLATFORM.moduleName('../non-lvd/non-lvd'),
        nav: true,
        title: 'NON-LVD'
      },
      {
        route: "forcefield",
        name: 'forcefield',
        settings: { icon: 'list', keys: "3", tag: "FF" },
        moduleId: PLATFORM.moduleName('../forcefield/forcefield'),
        nav: true,
        title: 'Forcefield'
      },
      {
        route: "guardian",
        name: 'guardian',
        settings: { icon: 'list', keys: "4", tag: "GD" },
        moduleId: PLATFORM.moduleName('../guardian/guardian'),
        nav: true,
        title: 'Guardian'
      },
      {
        route: "protec",
        name: 'protec',
        settings: { icon: 'list', keys: "5", tag: "PT" },
        moduleId: PLATFORM.moduleName('../protec/protec'),
        nav: true,
        title: 'Protec'
      },
      {
        route: "snaplock",
        name: 'snaplock',
        settings: { icon: 'list', keys: "6", tag: "SL" },
        moduleId: PLATFORM.moduleName('../snaplock/snaplock'),
        nav: true,
        title: 'Snaplock'
      },
      // {
      //   route: 'urgent',
      //   name: 'urgent',
      //   settings: { icon: 'list', keys: "7", tag: "URGENT" },
      //   moduleId: PLATFORM.moduleName('../urgent/urgent'),
      //   nav: true,
      //   title: 'Urgent'
      // },
      // {
      //   route: 'hung',
      //   name: 'hung',
      //   settings: { icon: 'list', keys: ["8"], tag: "HUNG" },
      //   moduleId: PLATFORM.moduleName('../hung/hung'),
      //   nav: true,
      //   title: 'Hung'
      // },
      // {
      //     route: 'orders-find',
      //     name: 'orders-find',
      //     settings: { icon: 'list', keys: ["+", "Add"] },
      //     moduleId: PLATFORM.moduleName('../orders-find/orders-find'),
      //     nav: true,
      //     title: 'Find'
      // }
    ];
    // assign key mappings by declaration order
    for (var i = 0; i < routemap.length; i++) {
      let r = routemap[i].route;
      // valid route contains at least one string
      let foo = Array.isArray(r) ? r.find(x => x !== "") : r;
      if (typeof foo === "string") {
        for (var key of routemap[i].settings.keys)
          this.keymap[key] = foo;
      }
    }
    config.map(routemap);

    this.router = router;
  }
  public itemKey(data: OrderRow): string {
    return (data.isUrgent ? "A" : "B") + data.fidNumber + data.itemNumber;
  }
  public markComplete(olk: string) {
    this.http.fetch("api/Meshcutter", { method: "POST", body: JSON.stringify(olk) })
  }
  attached() {
    window.addEventListener('keydown', this.keydown);
  }
  detached() {
    window.removeEventListener('keydown', this.keydown);
  }
}