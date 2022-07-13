import {interpret, Machine} from 'xstate';
import {get, writable} from 'svelte/store';
import * as _ from 'lamb';
import {stringify} from '@svizzle/utils';

export function bindToStore (interpreter) {
	const machineStore = writable(interpreter.initialState, () => {
		// service.start();
		// Unsubscribing here works for machines subcribed to only once,
		// but can wreak havoc if subcsriptions are changiong all the time.
		// TODO Perhaps implement reference counting or remove if intended
		// for more general use.
		// return () => service.stop();
	});

	interpreter.onTransition(nextState => {
		machineStore.set(nextState);
	});

	return {
		subscribe: machineStore.subscribe,
		send: interpreter.send,
	};
}

/**
 * Creates an xstate machine and places it into a svelte store.
 * Also creates a svelte store to be passed to the machine as context
 *
 * @param machineConfig - A valid xstate configuration object
 * @param machineOptions - A valid xstate options object: guards, actions, services, activities
 * @param contextStores - The default store(s) to be passed to xstate as context
 * @returns An object containing two objects. One being a store containing the xstate machine, the other containing the stores passed in as context.
 */
export function createMachina (machineConfig, machineOptions, contextStores) {
	const machine = Machine({
		...machineConfig,
		context: contextStores
	}, machineOptions);

	const interpreter = interpret(machine, { devTools: process.env.INSPECT === 'true' });

	interpreter.start();

	return {
		machine: bindToStore(interpreter),
		contextStores
	};
}


export const stringifyContextStores = _.pipe([_.mapValuesWith(get), stringify]);
