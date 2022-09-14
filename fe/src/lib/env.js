import {PUBLIC_BACKEND_BASE, PUBLIC_TEST} from '$env/static/public';

export const isDev = import.meta.env.DEV;

export const backendBase = import.meta.env.VITE_BACKEND_BASE;

console.log('dev', isDev);
console.log('backendBase', backendBase, PUBLIC_BACKEND_BASE);
console.log('PUBLIC_TEST', PUBLIC_TEST);
