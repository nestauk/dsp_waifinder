import {get} from 'svelte/store';
import {_dataset, updateDataset} from '$lib/stores/dataset';

export default {
	loadData: async () => {
		if (get(_dataset).isEmpty) {
			const response = await fetch('/data/ai_map_annotated_orgs.json');
			const json = await response.json();

			json && updateDataset(json);
		}
	}
}
