export class CreateWarehouseDto {
  warehouseCode?: string; // 선택사항, 없으면 자동 생성
  warehouseName: string;
  location: string;
  capacity: number;
  currentStock?: number;
  manager: string;
  phone: string;
  description?: string;
}
