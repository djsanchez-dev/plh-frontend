export interface DashboardUserStats {
  total: number;
  owners: number;
  employeeAccounts: number;
  residents: number;
  board: number;
  admins: number;
  assistantAdmins: number;
  pendingApproval: number;
}

export interface DashboardStaffStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
}

export interface DashboardInventoryStats {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  byCategory: Record<string, number>;
}

export interface DashboardConsumptionStats {
  currentMonthWater: number;
  currentMonthKwh: number;
  previousMonthWater: number;
  previousMonthKwh: number;
  currentMonthRecords: number;
}

export interface DashboardCommunityStats {
  condominiums: number;
  activeCondominiums: number;
  points: number;
}

export interface DashboardMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'LOAN' | 'RETURN' | 'CONSUMPTION' | 'ADJUSTMENT';
  quantity: number;
  responsiblePerson: string;
  destinationArea?: string | null;
  notes?: string | null;
  movementAt: string;
  returnedAt?: string | null;
  receivedBy?: string | null;
}

export interface DashboardSummary {
  users: DashboardUserStats;
  staff: DashboardStaffStats;
  inventory: DashboardInventoryStats;
  consumption: DashboardConsumptionStats;
  community: DashboardCommunityStats;
  recentMovements: DashboardMovement[];
}
