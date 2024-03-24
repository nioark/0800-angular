
export interface EmailApi {
  domain: string;
  email: string;
  user: string;
  disk_used_human: string;
  disk_used_bytes: number;
}


export interface EmailData {
  domain: string;
  email: string;
  user: string;
  diskUsed: number;
  diskUsedHuman: string;
  storagePercentage: number;
}
