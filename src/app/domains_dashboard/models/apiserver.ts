import { Server } from './server';
export interface ApiServer {
  disklimit: string;
  diskused: string;
  domain: string;
  name: string;
  email: string;
  plan: string;
  maxftp: number;
  maxlst: number;
  maxparked: number;
  maxpop: number;//Maximo de contas
  maxsql: number;
  startdate: Date;
  uid: number;
  user: string;
  owner: string;
  ip: string;
  dns: string;
  outgoing_mail_hold: number;
  outgoing_mail_suspend: number;
  max_email_per_hour: number;
  max_emailacct_quota: number;
}

export interface Contrato {
  "id": number,
  "nome_pessoa": string,
  "nome_fantasia": string,
  "observacao": string,
  "mensalidade": number,
  "email_service": string[],
  "email_services_count": number,
  "status": string,
  "deleted_at": string,
  "created_at": string,
  "updated_at": string
}

export interface ApiServerBackend {
  disk_limit_human: string;
  disk_limit_bytes: number;
  disk_used_human: string;
  disk_used_bytes: number;
  domain: string;
  email: string;
  plan: string;
  max_pop: number;//Maximo de contas
  server_id: number;
  service_id: number;
  name: string;
  outgoing_mail_hold: number;
  used_emails: number;
  user: string;
  id: number;
  ip: string;
  dns: string;
  panel_type: string;
  suspended: boolean;
  contrato_id: number;
  Contrato: Contrato
  price: number | null;
}

export interface ServerData {
  domain: string;
  maxStorage: string;
  maxStorageBytes: number;
  usedStorage: string;
  usedStorageBytes: number;
  remainingStorage: string;
  usedStoragePercentage: number;
  price: number;

  maxUsers: number;
  usedUsers: number;
  remainingUsers: number;
  usedUsersPercentage: number;

  unlimitedStorage: boolean;
  unlimitedUsers: boolean;

  pacote: string;
  ip: string;
  dns: string;
  serviceId: number;
  serverId: number;
  serverType: string;

  uuid: string;

  suspended: boolean;
  contratoID: number;
  contrato: Contrato;

}

export function formatBytes(bytes : number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function humanizeBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  let parsedNumber : any = (bytes / Math.pow(1024, i))
  if (sizes[i] == 'Bytes' || sizes[i] == 'KB' || sizes[i] == 'MB')
    parsedNumber = parsedNumber.toFixed(0)
  else
    parsedNumber = parsedNumber.toFixed(2)
  return parseFloat(parsedNumber) + ' ' + sizes[i];
}

export function convertToBytes(value: string): number {
  const units: { [unit: string]: number } = {
    'B': 1,
    'K': 1024,
    'M': 1024 * 1024,
    'G': 1024 * 1024 * 1024,
    'T': 1024 * 1024 * 1024 * 1024,
    'P': 1024 * 1024 * 1024 * 1024 * 1024,
    'E': 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    'Z': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    'Y': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  };

  const regex = /(\d+)(B|K|M|G|T|P|E|Z|Y)?/;
  const matches = value.match(regex);
  if (!matches) {
    if (value === 'unlimited') {
      return Number.MAX_VALUE;
    }
    if (value === 'none'){
      return 0;
    }
    throw new Error('Invalid format');
  }

  const numberPart = parseInt(matches[1]);
  const unit = matches[2] || 'B';
  return numberPart * units[unit];
}
