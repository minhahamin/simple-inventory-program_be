export class CreateItemDto {
  itemCode?: string; // 선택사항, 없으면 자동 생성
  itemName: string;
  unitPrice: number;
  unit: string;
  category: string;
  description: string;
}
