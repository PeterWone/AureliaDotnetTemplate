import { faHome } from '@fortawesome/fontawesome-free-solid';
import { autoinject, bindable, BindingEngine, Disposable, ICollectionObserverSplice, bindingMode, containerless, } from "aurelia-framework";
import { OrderRow } from '../../app/components/app/order-row';
@autoinject
export class Grid {
  @bindable data: Array<any> = [];
  @bindable where = (item: any) => true; // defaults to all
  @bindable key = JSON.stringify;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value: any;
  @bindable supportTagging = false;
  @bindable autofocus = false;
  @bindable parentViewModel?: IGridParent;
  @bindable globalKeyHandling = false;
  private rows: Array<GridRow> = [];
  private taggedRows: Array<GridRow> = [];
  public currentRow?: GridRow;
  constructor(public element: Element, private bindingEngine: BindingEngine) {
    var that = this;
    var Z = 0;
    that.handlerKeyDown = (ke: KeyboardEvent) => {
      let consumeEvent = false;
      console.log(ke.key);
      switch (ke.key) {
        case "Home":
          that.moveCurrentRowToStart();
          consumeEvent = true;
          break;
        case "End":
          that.moveCurrentRowToEnd();
          consumeEvent = true;
          break;
        case "Up":
        case "ArrowUp":
          that.moveCurrentRowUp();
          consumeEvent = true;
          break;
        case "Down":
        case "ArrowDown":
          that.moveCurrentRowDown();
          consumeEvent = true;
          break;
        case "PageUp":
          that.moveCurrentRowUp(window.innerHeight / (that.element.querySelector("tr.row-0") as HTMLTableRowElement).clientHeight);
          consumeEvent = true;
          break;
        case "PageDown":
          that.moveCurrentRowDown(window.innerHeight / (that.element.querySelector("tr.row-0") as HTMLTableRowElement).clientHeight);
          consumeEvent = true;
          break;
        case "Enter":
        case ".":
        case "Del":
        case "Delete":
          that.element.dispatchEvent(new CustomEvent("grid-action", { detail: that, bubbles: true }));
          break;
        case "Space":
        case " ":
        case "Ins":
        case "Insert":
          {
            if (that.currentRow) that.taggle(that.currentRow);
          }
          break;
      }
      if (consumeEvent) {
        ke.stopPropagation();
        ke.preventDefault();
        return false;
      } else {
        return true;
      }
    };
    var propose = (vNew: any, vOld: any) => { that.proposeRowsUpdate.apply(that); };
    bindingEngine.propertyObserver(this, "where").subscribe(propose);
    bindingEngine.propertyObserver(this, "key").subscribe(propose);
    bindingEngine.propertyObserver(this, "data").subscribe(propose);
    var valuechange = (vNew: any, vOld: any) => { that.valueChange.apply(that, [vNew, vOld]); };
    bindingEngine.propertyObserver(this, "value").subscribe(valuechange);
  }
  private taggle(row: GridRow) {
    if (this.supportTagging) {
      if (row.isTagged) {
        row.isTagged = false;
        this.taggedRows.splice(this.taggedRows.indexOf(row), 1);
      } else {
        row.isTagged = true;
        this.taggedRows.push(row);
      }
    }
  }
  private valueChange(vNew?: any, vOld?: any) {
    console.log("VALUE CHANGE EVENT FIRED");
    if (vNew) { // focus corresponding row
      let row = this.findRow(vNew);
      if (row) {
        this.setCurrentRowObject(row);
      }
    } else {
      console.log("VALUE IS NOW NULL");
    }
  }
  private proposeRowsUpdate(vNew?: any, vOld?: any) {
    var that = this;
    if (this.propositionRowsUpdate) {
      clearTimeout(this.propositionRowsUpdate);
    }
    this.propositionRowsUpdate = setTimeout(() => {
      // console.log("DEBOUNCE FINISH - UPDATE ROWS")
      that.rowsUpdate.apply(that);
    }, 200);
  }
  private propositionRowsUpdate?: number;
  private rowsUpdate(): void {
    var that = this;
    let taggedRows = this.supportTagging ? this.rows.filter(row => row.isTagged) : [];
    let filteredRows = this.where ? this.data.filter(this.where) : this.data;
    for (let i = 0; i < filteredRows.length; i++) {
      let item = filteredRows[i];
      let row = new GridRow(item);
      this.rows.splice(i, 1, row);
      let itemKey = that.key(item);
      row.isTagged = !!taggedRows.find(x => that.key(x.model) === itemKey);
    }
    // do not try to convert the comparison function into a method
    // it relies on closing over `that`
    this.rows.sort((A: GridRow, B: GridRow): number => {
      let a = that.key(A.model);
      let b = that.key(B.model);
      return a < b ? -1 : a == b ? 0 : 1;
    });
    if (!this.currentRow && this.value) {
      this.currentRow = this.findRow(this.value);
    }
    if (this.currentRow) { // don't remove this, findRow can return undefined
      that.setCurrentRowObject(this.currentRow);
      let p = this.rows.indexOf(this.currentRow);
      var tr = this.element.querySelector(`tr.row-${p}`) as HTMLTableRowElement;
      // TODO use container.innerHeight where container may not be window
      if (tr.getBoundingClientRect().bottom > window.innerHeight)
        tr.scrollIntoView(false);
    }
  }
  private findRow(model: any): GridRow {
    let k = this.key(model);
    return this.rows.find(row => this.key(row.model) === k) as GridRow;
  }
  public focus() {
    if (this.element) {
      (this.element.querySelector("table") as HTMLTableElement).focus()
    }
  }
  public attached() {
    console.log("GRID ATTACHED");
    var that = this;
    if (this.autofocus) {
      this.focus();
      // setTimeout(() => {
      //   if (that.selectedGridRow) {
      //     that.setSelectionByRow(that.selectedGridRow);
      //   } else {
      //     if (that.rows.length) {
      //       that.setSelectionByIndex(0);
      //     }
      //   }
      // }, 300);
    }
    if (this.parentViewModel) {
      this.parentViewModel.grid = this;
    }
    if (this.element && !this.globalKeyHandling) {
      var tableElement = this.element.querySelector("table") as HTMLTableElement;
      tableElement.addEventListener('keydown', this.handlerKeyDown);
    }
    if (this.globalKeyHandling) {
      window.addEventListener('keydown', this.handlerKeyDown);
    }
  }
  public detached() {
    console.log("GRID DETACHED");
    var that = this;
    if (this.element && !this.globalKeyHandling) {
      var tableElement = this.element.querySelector("table") as HTMLTableElement;
      tableElement.removeEventListener('keydown', this.handlerKeyDown)
    }
    if (this.globalKeyHandling) {
      window.removeEventListener('keydown', this.handlerKeyDown);
    }
  }
  private handlerKeyDown: any;
  public dblclick(target: GridRow): void {
    this.setCurrentRowObject(target);
    this.element.dispatchEvent(new CustomEvent("grid-action", { detail: this, bubbles: true }));
  }
  private setCurrentRowObject(target: GridRow): number {
    console.log("SETTING CURRENT ROW OBJECT");
    // do a fixup in case the rows have been regenerated
    target = this.findRow(target.model);
    // if this is a change of focussed row then defocus the incumbent
    if (this.currentRow !== target && this.currentRow) {
      this.currentRow.hasFocus = false;
    }
    this.currentRow = target;
    target.hasFocus = true;
    return this.rows.indexOf(target);
  }
  private setCurrentRowIndex(i: number): GridRow {
    this.setCurrentRowObject(this.rows[i]);
    return this.rows[i];
  }
  private moveCurrentRowToEnd(): void {
    if (this.rows && this.rows.length) {
      let last = this.rows.length - 1;
      this.setCurrentRowIndex(last);
      (this.element.querySelector(`tr.row-${last}`) as HTMLTableRowElement).scrollIntoView();
    }
  }
  private moveCurrentRowDown(delta = 1): void {
    delta = Math.floor(delta);
    if (this.rows && this.rows.length) {
      if (this.currentRow) {
        this.currentRow = this.findRow(this.currentRow.model);
        let p = this.rows.indexOf(this.currentRow) + delta;
        if (p >= this.rows.length) {
          this.moveCurrentRowToEnd();
        } else {
          this.setCurrentRowIndex(p);
          var tr = this.element.querySelector(`tr.row-${p}`) as HTMLTableRowElement;
          // TODO use container.innerHeight where container may not be window
          if (tr.getBoundingClientRect().bottom > window.innerHeight)
            tr.scrollIntoView(false);
        }
      } else {
        this.setCurrentRowIndex(0);
      }
    }
  }
  private moveCurrentRowToStart(): void {
    this.setCurrentRowIndex(0);
    this.element.scrollIntoView();
  }
  private moveCurrentRowUp(delta = 1): void {
    delta = Math.floor(delta);
    if (this.rows && this.rows.length) {
      if (this.currentRow) {
        this.currentRow = this.findRow(this.currentRow.model);
        let p = this.rows.indexOf(this.currentRow) - delta;
        if (p < 0) {
          this.moveCurrentRowToStart();
        } else {
          this.setCurrentRowIndex(p);
          var tr = this.element.querySelector(`tr.row-${p}`) as HTMLTableRowElement;
          if (tr.getBoundingClientRect().top <= 0) {
            tr.scrollIntoView(true);
          }
        }
      } else {
        this.setCurrentRowIndex(0);
      }
    }
  }
}
export class GridRow {
  public cssClass = "";
  public hasFocus = false;
  public isTagged = false;
  constructor(public model: any) { }
}
export interface IGridParent {
  grid?: Grid;
}