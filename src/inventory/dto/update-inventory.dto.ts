export class UpdateInventoryDto {
  itemCode?: string;
  itemName?: string;
  currentStock?: number;
  safeStock?: number;
  unit?: string;
  location?: string;
  status?: string;
}
