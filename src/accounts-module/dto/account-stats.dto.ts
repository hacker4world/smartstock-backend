export interface AccountStats {
  roles: Record<string, number>; // role name → count
  unassigned: number; // accounts with no role
}
