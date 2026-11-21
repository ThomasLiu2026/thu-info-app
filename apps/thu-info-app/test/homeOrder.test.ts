import {describe, expect, test} from "@jest/globals";
import {
	DEFAULT_PINNED_HOME_FUNCTIONS,
	getDrawerHomeFunctions,
	getEffectiveHomeFunctionOrder,
	getPinnedHomeFunctions,
	getVisibleHomeFunctions,
	movePinnedHomeFunction,
	moveVisibleHomeFunction,
	pinHomeFunction,
	reorderVisibleHomeFunction,
	unpinHomeFunction,
} from "../src/utils/homeOrder";
import {
	applyThemePreset,
	DEFAULT_THEME_PRESET,
	getThemePreset,
	THEME_PRESETS,
} from "../src/assets/themes/presets";
import {colorLight} from "../src/assets/colors/light";
import {colorDark} from "../src/assets/colors/dark";

describe("homeOrder", () => {
	test("strips removed legacy functions (physicalExam, dormScore) and appends defaults", () => {
		const order = getEffectiveHomeFunctionOrder(
			["physicalExam", "library", "dormScore", "campusCard"],
			"android",
		);
		expect(order[0]).toBe("library");
		expect(order[1]).toBe("campusCard");
		expect(order.includes("physicalExam" as never)).toBe(false);
		expect(order.includes("dormScore" as never)).toBe(false);
	});

	test("reorders visible items cleanly even when some functions are disabled", () => {
		const saved = ["campusCard", "electricity", "washer", "library"];
		const disabled = ["electricity"];

		// Moving "washer" up should place it ahead of "campusCard", not get stuck on disabled "electricity"
		const movedUp = moveVisibleHomeFunction(
			saved,
			disabled,
			"android",
			"washer",
			"up",
		);
		const visibleAfterUp = getVisibleHomeFunctions(
			movedUp,
			disabled,
			"android",
		);
		expect(visibleAfterUp.slice(0, 3)).toEqual([
			"washer",
			"campusCard",
			"library",
		]);

		// Pinning "library" to top should place it at index 0
		const pinned = moveVisibleHomeFunction(
			movedUp,
			disabled,
			"android",
			"library",
			"top",
		);
		const visibleAfterPin = getVisibleHomeFunctions(
			pinned,
			disabled,
			"android",
		);
		expect(visibleAfterPin[0]).toBe("library");

		// Dragging from index 0 to index 2 moves "library" right after "campusCard"
		const dragged = reorderVisibleHomeFunction(
			pinned,
			disabled,
			"android",
			0,
			2,
		);
		expect(getVisibleHomeFunctions(dragged, disabled, "android").slice(0, 3)).toEqual([
			"washer",
			"campusCard",
			"library",
		]);
	});

	test("splits pinned common apps and drawer apps cleanly and supports customization", () => {
		const defaultPinned = getPinnedHomeFunctions(undefined, [], "android");
		expect(defaultPinned).toEqual([...DEFAULT_PINNED_HOME_FUNCTIONS]);

		const defaultDrawer = getDrawerHomeFunctions(undefined, undefined, [], "android");
		expect(defaultDrawer.includes("campusCard")).toBe(true);
		expect(defaultDrawer.includes("electricity")).toBe(false);

		const afterPin = pinHomeFunction(defaultPinned, [], "android", "qzyq");
		expect(afterPin[afterPin.length - 1]).toBe("qzyq");

		const afterMove = movePinnedHomeFunction(afterPin, [], "android", "qzyq", "top");
		expect(afterMove[0]).toBe("qzyq");

		const afterUnpin = unpinHomeFunction(afterMove, [], "android", "qzyq");
		expect(afterUnpin.includes("qzyq")).toBe(false);

		const drawerAfterUnpin = getDrawerHomeFunctions(afterUnpin, undefined, [], "android");
		expect(drawerAfterUnpin.includes("qzyq")).toBe(true);
	});

	test("resolves all color theme presets cleanly in light and dark modes", () => {
		expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(5);
		expect(getThemePreset(undefined).id).toBe(DEFAULT_THEME_PRESET);
		expect(getThemePreset("unknownPreset").id).toBe(DEFAULT_THEME_PRESET);

		for (const preset of THEME_PRESETS) {
			const light = applyThemePreset(colorLight, preset.id, false);
			const dark = applyThemePreset(colorDark, preset.id, true);
			expect(light.heroCardBg).toBe(preset.light.heroCardBg);
			expect(dark.heroCardBg).toBe(preset.dark.heroCardBg);
		}
	});
});
