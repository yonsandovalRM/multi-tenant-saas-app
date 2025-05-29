export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  tenantId?: string; // Solo presente para usuarios de tenant
  isCoreUser: boolean;
}
