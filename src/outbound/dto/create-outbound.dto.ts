export class CreateOutboundDto {
  outboundDate?: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  customer: string;
  memo?: string;
}

