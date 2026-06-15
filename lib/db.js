import { Redis } from '@upstash/redis';
import { DEFAULT_SOINS, DEFAULT_CONFIG } from './soins.js';

// Lit automatiquement UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN
export const redis = Redis.fromEnv();

export const KEYS = {
  services: 'services',
  availability: 'availability',
  reservations: 'reservations',
  config: 'config',
};

export async function getServices() {
  let s = await redis.get(KEYS.services);
  if (!s) { s = DEFAULT_SOINS; await redis.set(KEYS.services, s); }
  return s;
}

export async function setServices(s) {
  await redis.set(KEYS.services, s);
}

export async function getConfig() {
  const c = await redis.get(KEYS.config);
  return { ...DEFAULT_CONFIG, ...(c || {}) };
}

export async function setConfig(patch) {
  const cur = await getConfig();
  await redis.set(KEYS.config, { ...cur, ...patch });
}

export async function getAvailability() {
  return (await redis.get(KEYS.availability)) || {};
}

export async function setAvailability(dispos) {
  await redis.set(KEYS.availability, dispos || {});
}

export async function getReservations() {
  return (await redis.get(KEYS.reservations)) || [];
}

export async function setReservations(list) {
  await redis.set(KEYS.reservations, list);
}
