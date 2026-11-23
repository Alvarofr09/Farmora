import axios from "axios";

export function getErrorMessage(error: unknown, fallback:string): string {
	if (!axios.isAxiosError(error)) return fallback;
	if (!error.response) return 'No se ha podido conectar con el servidor';

	const message = error.response.data?.error;
	if ( typeof message === "string" && message.trim() !== "") {
		return message;
	}
	return fallback;
}

export function isConflict(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}