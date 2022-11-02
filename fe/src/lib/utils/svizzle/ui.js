import {getTruthyValuesKeys} from '@svizzle/utils';
import * as _ from 'lamb';

export const getOrientation = _.pipe([
	getTruthyValuesKeys,
	_.pairs,
	_.getPath('0.1')
]);

const makeGetFirstTrueValueOf = keyBoolObj => _.pipe([
	_.mapWith(key => [key, keyBoolObj[key]]),
	_.filterWith(([, value]) => value),
	_.getPath('0.0')
]);

export const getScreenType = sizes => {
	if (sizes.xSmall) {
		return 'xSmall';
	}

	const getType = makeGetFirstTrueValueOf(sizes);
	const orderedSizes = ['xLarge', 'large', 'medium', 'small'];

	return getType(orderedSizes);
};

export const resizeHandler = (
	node,
	{
		onResize,
		onResizeEnd,
		onResizeStart,
		timeout = 500
	} = {}
) => {
	let resizing = false;

	const started = size => {
		resizing = true;
		onResizeStart?.(size);
	}
	const scheduleEnded = _.debounce(size => {
		resizing = false;
		onResizeEnd?.(size);
	}, timeout);

	const observer = new ResizeObserver(entries => {
		const [size] = entries[0].borderBoxSize;
		!resizing && started(size);

		onResize?.(size);

		scheduleEnded(size);
	});
	observer.observe(node);

	return () => {
		observer.disconnect();
	}
}
