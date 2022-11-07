import { get } from 'svelte/store';

export default {
	isActiveForm: (ctx, event) => {
		const selectedForm = get(ctx.selectedForm);
		return selectedForm && selectedForm.id === event.formId;
	}
};
