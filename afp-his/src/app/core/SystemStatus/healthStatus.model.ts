export interface HealthStatus {
  service: string;
  database: string;
  uptime: number;
}

export const healthStatusMock: HealthStatus = {
  service: 'KO',
  database: 'KO',
  uptime: -1
};