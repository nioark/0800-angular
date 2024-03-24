import { ApiServer } from "./apiserver";

export interface Contrato {
	id: number;
	nome_pessoa: string;
	nome_fantasia: string;
	observacao: string;
	mensalidade: number;
	email_services: ApiServer[];
	email_services_count: number;
	status: string;
	has_invalid_domains: boolean;
	invalid_domains: string;
}
