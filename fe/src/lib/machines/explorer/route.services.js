import {updateDataset} from '$lib/stores/dataset';

export default {
	loadData: async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		json && updateDataset(json);
	}
}
