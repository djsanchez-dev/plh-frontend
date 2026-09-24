export type InventoryCategory = 'ASSET' | 'MATERIAL' | 'TOOL';
export type InventoryMovementType = 'LOAN' | 'RETURN' | 'CONSUMPTION' | 'ADJUSTMENT';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minStock: number | null;
  lowStock?: boolean;
  unit: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemForm {
  code: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  notes: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: InventoryMovementType;
  quantity: number;
  responsiblePerson: string;
  destinationArea: string | null;
  notes: string | null;
  movementAt: string;
  returnedAt: string | null;
  receivedBy?: string | null;
}

export interface InventoryMovementForm {
  type: InventoryMovementType;
  quantity: number;
  responsiblePerson: string;
  destinationArea: string;
  notes: string;
  movementAt: string;
  receivedBy: string;
}
