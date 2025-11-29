export class CreateOutboundDto {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  customer: string;
  memo?: string;
}
