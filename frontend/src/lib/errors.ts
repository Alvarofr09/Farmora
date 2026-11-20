import axios from "axios";

export function getErrorMessage(error: unknown, fallback:string): string {
	if (axios.isAxiosError(error)) {
		if(error.response) {
			if (error.response.data) {
				
			}
		} else {
			return 'No se ha podido conectar con el servidor';
		}
	}
	return fallback;
}

export function isConflict(error: unknown): error is axios.AxiosError {
	if (axios.AxiosError(error)) {
		
	}
	return true;
}