export class CreateInboundDto {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  memo?: string;
}
