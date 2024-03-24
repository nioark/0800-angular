
// export interface Server {
//   id: number
//   domain: string;
//   webDomain: string;
//   emailDomain: string;
//   contas: string;
//   contasUsed: number;
//   contasTotal: number;
//   contasPercentage: number;
//   storage: string;
//   storageUsed: string;

//   storageNumber: number;
//   storageUsedNumber: number;
//   storageType: string;
//   storageRemaining: number;
//   usedStoragePercent: number;
//   valor: string;
//   pacoteId: number;
//   pacoteValue: string;
// }

export interface Server {
  id: number;
  domainName: string;
  webDomainName: string;
  emailDomainName: string;
  accounts: string;
  usedAccounts: number;
  totalAccounts: number;
  accountPercentage: number;
  storageCapacity: string;
  usedStorageCapacity: string;
  storageCapacityNumber: number;
  usedStorageCapacityNumber: number;
  storageCapacityType: string;
  remainingStorageCapacity: number;
  usedStorageCapacityPercentage: number;
  value: string;
  packageId: number;
  packageValue: string;
}
