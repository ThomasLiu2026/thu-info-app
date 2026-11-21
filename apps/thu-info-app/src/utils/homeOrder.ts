export type ManagedHomeFunction =
	| "campusCard"
	| "electricity"
	| "washer"
	| "qzyq"
	| "library"
	| "libRoomBook"
	| "sportsBook"
	| "report"
	| "classroomState"
	| "cr"
	| "teachingEvaluation"
	| "schoolCalendar"
	| "networkDetail"
	| "onlineDevices"
	| "bankPayment"
	| "invoice"
	| "income";

// Keep legacy union members assignable for backward-compatible persisted Redux state,
// while excluding removed functions ("physicalExam", "dormScore") from active lists.
export type HomeFunction =
	| ManagedHomeFunction
	| "physicalExam"
	| "dormScore"
	| "reserve"
	| "reservesLib"
	| "expenditure"
	| "finance"
	| "campusMap"
	| "dormitory"
	| "network";

export const DEFAULT_HOME_FUNCTION_ORDER: readonly ManagedHomeFunction[] = [
	"campusCard",
	"electricity",
	"washer",
	"qzyq",
	"library",
	"libRoomBook",
	"sportsBook",
	"report",
	"classroomState",
	"cr",
	"teachingEvaluation",
	"schoolCalendar",
	"networkDetail",
	"onlineDevices",
	"bankPayment",
	"invoice",
	"income",
];

export const DEFAULT_PINNED_HOME_FUNCTIONS: readonly ManagedHomeFunction[] = [
	"electricity",
	"washer",
	"library",
	"classroomState",
	"report",
	"schoolCalendar",
];

const VALID_MANAGED_SET = new Set<string>(DEFAULT_HOME_FUNCTION_ORDER);
const MOBILE_ONLY_FUNCTIONS = new Set<ManagedHomeFunction>(["cr", "invoice"]);

export const isFunctionSupportedOnPlatform = (
	func: ManagedHomeFunction,
	platformOS: string,
): boolean => {
	if (MOBILE_ONLY_FUNCTIONS.has(func)) {
		return platformOS === "android" || platformOS === "ios";
	}
	return true;
};

export const getEffectiveHomeFunctionOrder = (
	savedOrder: readonly string[] | undefined,
	platformOS: string,
): ManagedHomeFunction[] => {
	const seen = new Set<ManagedHomeFunction>();
	const result: ManagedHomeFunction[] = [];

	for (const item of savedOrder ?? []) {
		if (VALID_MANAGED_SET.has(item)) {
			const typed = item as ManagedHomeFunction;
			if (!seen.has(typed) && isFunctionSupportedOnPlatform(typed, platformOS)) {
				seen.add(typed);
				result.push(typed);
			}
		}
	}

	for (const def of DEFAULT_HOME_FUNCTION_ORDER) {
		if (!seen.has(def) && isFunctionSupportedOnPlatform(def, platformOS)) {
			seen.add(def);
			result.push(def);
		}
	}

	return result;
};

export const getVisibleHomeFunctions = (
	savedOrder: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
): ManagedHomeFunction[] => {
	const disabledSet = new Set(disabledList ?? []);
	return getEffectiveHomeFunctionOrder(savedOrder, platformOS).filter(
		(f) => !disabledSet.has(f),
	);
};

export const moveVisibleHomeFunction = (
	savedOrder: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
	func: ManagedHomeFunction,
	action: "up" | "down" | "top",
): ManagedHomeFunction[] => {
	const effective = getEffectiveHomeFunctionOrder(savedOrder, platformOS);
	const disabledSet = new Set(disabledList ?? []);
	const visible = effective.filter((f) => !disabledSet.has(f));
	const hidden = effective.filter((f) => disabledSet.has(f));

	const idx = visible.indexOf(func);
	if (idx === -1) {
		return effective;
	}

	const nextVisible = [...visible];
	if (action === "top") {
		if (idx === 0) {
			return effective;
		}
		nextVisible.splice(idx, 1);
		nextVisible.unshift(func);
	} else if (action === "up") {
		if (idx === 0) {
			return effective;
		}
		[nextVisible[idx - 1], nextVisible[idx]] = [
			nextVisible[idx],
			nextVisible[idx - 1],
		];
	} else if (action === "down") {
		if (idx >= nextVisible.length - 1) {
			return effective;
		}
		[nextVisible[idx], nextVisible[idx + 1]] = [
			nextVisible[idx + 1],
			nextVisible[idx],
		];
	}

	return [...nextVisible, ...hidden];
};

export const reorderVisibleHomeFunction = (
	savedOrder: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
	fromIndex: number,
	toIndex: number,
): ManagedHomeFunction[] => {
	const effective = getEffectiveHomeFunctionOrder(savedOrder, platformOS);
	const disabledSet = new Set(disabledList ?? []);
	const visible = effective.filter((f) => !disabledSet.has(f));
	const hidden = effective.filter((f) => disabledSet.has(f));

	if (
		fromIndex < 0 ||
		fromIndex >= visible.length ||
		toIndex < 0 ||
		toIndex >= visible.length ||
		fromIndex === toIndex
	) {
		return effective;
	}

	const nextVisible = [...visible];
	const [moved] = nextVisible.splice(fromIndex, 1);
	nextVisible.splice(toIndex, 0, moved);

	return [...nextVisible, ...hidden];
};

export const getPinnedHomeFunctions = (
	savedPinned: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
): ManagedHomeFunction[] => {
	const disabledSet = new Set(disabledList ?? []);
	const source: readonly string[] =
		savedPinned === undefined ? DEFAULT_PINNED_HOME_FUNCTIONS : savedPinned;
	const seen = new Set<ManagedHomeFunction>();
	const result: ManagedHomeFunction[] = [];

	for (const item of source) {
		if (VALID_MANAGED_SET.has(item)) {
			const typed = item as ManagedHomeFunction;
			if (
				!seen.has(typed) &&
				!disabledSet.has(typed) &&
				isFunctionSupportedOnPlatform(typed, platformOS)
			) {
				seen.add(typed);
				result.push(typed);
			}
		}
	}

	return result;
};

export const getDrawerHomeFunctions = (
	savedPinned: readonly string[] | undefined,
	savedOrder: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
): ManagedHomeFunction[] => {
	const pinnedSet = new Set<ManagedHomeFunction>(
		getPinnedHomeFunctions(savedPinned, disabledList, platformOS),
	);
	return getVisibleHomeFunctions(savedOrder, disabledList, platformOS).filter(
		(f) => !pinnedSet.has(f),
	);
};

export const pinHomeFunction = (
	savedPinned: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
	func: ManagedHomeFunction,
): ManagedHomeFunction[] => {
	const current = getPinnedHomeFunctions(savedPinned, disabledList, platformOS);
	if (
		current.includes(func) ||
		!isFunctionSupportedOnPlatform(func, platformOS)
	) {
		return current;
	}
	return [...current, func];
};

export const unpinHomeFunction = (
	savedPinned: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
	func: ManagedHomeFunction,
): ManagedHomeFunction[] => {
	const current = getPinnedHomeFunctions(savedPinned, disabledList, platformOS);
	return current.filter((item) => item !== func);
};

export const movePinnedHomeFunction = (
	savedPinned: readonly string[] | undefined,
	disabledList: readonly string[] | undefined,
	platformOS: string,
	func: ManagedHomeFunction,
	action: "up" | "down" | "top",
): ManagedHomeFunction[] => {
	const current = getPinnedHomeFunctions(savedPinned, disabledList, platformOS);
	const idx = current.indexOf(func);
	if (idx === -1) {
		return current;
	}
	const next = [...current];
	if (action === "top") {
		if (idx === 0) {
			return current;
		}
		next.splice(idx, 1);
		next.unshift(func);
	} else if (action === "up") {
		if (idx === 0) {
			return current;
		}
		[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
	} else if (action === "down") {
		if (idx >= next.length - 1) {
			return current;
		}
		[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
	}
	return next;
};
