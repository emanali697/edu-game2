import PARENTAL_RESPECT from "./parental_respect";
import HONESTY from "./honesty";
import FORGIVENESS from "./forgiveness";
import TRUSTWORTHINESS from "./trustworthiness";
import ELDER_RESPECT from "./elder_respect";

const VIRTUE_REGISTRY = {
  parental_respect: PARENTAL_RESPECT,
  honesty: HONESTY,
  forgiveness: FORGIVENESS,
  trustworthiness: TRUSTWORTHINESS,
  elder_respect: ELDER_RESPECT,
};

export function getVirtueData(virtueId) {
  return VIRTUE_REGISTRY[virtueId] || null;
}

export function hasVirtueData(virtueId) {
  return virtueId in VIRTUE_REGISTRY;
}

export function getAllVirtueIds() {
  return Object.keys(VIRTUE_REGISTRY);
}

export default VIRTUE_REGISTRY;
