export class CreateInboundDto {
  inboundDate?: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  memo?: string;
}

