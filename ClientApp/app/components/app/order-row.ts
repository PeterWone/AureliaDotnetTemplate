export interface OrderRow {
  fidNumber: string;
  itemNumber: number;
  midrails: number;
  mullions: number;
  stage: string;
  At: Date;
  doorOrWindow:string;
  isActiveDoor:boolean;
  isUrgent: boolean;
  meshType:string;
  maxDrop:number;
  maxWidth:number;
  productDescription:string;
  groupCode:string;
  lockSide:string;
  daysInFactory: Date;
  customersClientName: string;
  order_Key:string;
  orderLine_Key: string;
  painted: Date;
  isWonky:boolean;
  isHung:boolean;
  shoulder: number;
}

