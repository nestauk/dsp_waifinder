
import {backendBase} from '$lib/config';

export async function request (
	method,
	url,
	{ headers = {}, data, fetch = window && window.fetch, type = 'json' } = {}
) {
	let reqOptions = { method, headers };
	if (data) {
		if (data instanceof FormData) {
			reqOptions.headers["content-type"] = "multipart/form-data";
			reqOptions.body = data;
		} else {
			reqOptions.headers["content-type"] = "application/json";
			reqOptions.body = JSON.stringify(data);
		}
	}
	let response;
	try {
		response = await fetch(url, reqOptions);
		if (Math.floor(response.status / 100) !== 2) {
			throw new Error(
				`API request failed! - ${response.status}: ${response.statusText}`
			);
		}
		return response[type]();
	} catch (error) {
		if (response) {
			error.jsonMessage = await response.clone().json();
		}
		// logError(error, error.stack);
		throw error;
	}
}

export const getNextIds = (userId, chunkSize) => request(
	'post',
	`${backendBase}/next_ids`,
	{
		data: {
			userId,
			chunkSize
		}
	}
);

export const getOrgById = orgId => request(
	'get',
	`${backendBase}/orgs/${orgId}`
);

export const getNextOrg = userId => request(
	'post',
	`${backendBase}/next_org`,
	{
		data: {
			userId
		}
	}
);

export const sendEvaluations = (userEmail, orgId, evaluations) => request(
	'post',
	`${backendBase}/eval/${orgId}`,
	{
		data: 	{
			userId: userEmail,
			topics: evaluations
		}
	}
);
