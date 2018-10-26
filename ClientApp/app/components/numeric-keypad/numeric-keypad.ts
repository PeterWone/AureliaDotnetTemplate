export class NumericKeypadCustomElement {
  public handlerKeyDown: EventListener;
  public isNumLockActive?: boolean = undefined;
  public isKeyboardStateAvailable: boolean = false;
  public handlerWindowBlur: EventListener;
  public attached() {
    window.addEventListener("keydown", this.handlerKeyDown, false);
    window.addEventListener("blur", this.handlerWindowBlur, false);
  }
  public detached() {
    window.removeEventListener("keydown", this.handlerKeyDown);
    window.removeEventListener("blur", this.handlerWindowBlur);
  }
  constructor() {
    this.handlerWindowBlur = be => {
      this.isKeyboardStateAvailable = false;
    };
    this.handlerKeyDown = (ke: Event | KeyboardEvent) => {
      if (ke instanceof KeyboardEvent) {
        this.isKeyboardStateAvailable = true;
        this.isNumLockActive = ke.getModifierState("Numlock") || ke.getModifierState("NumLock");
      }
    }
  }
}