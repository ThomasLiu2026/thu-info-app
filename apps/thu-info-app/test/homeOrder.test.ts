import {describe, expect, test} from "@jest/globals";
import {
	getEffectiveHomeFunctionOrder,
	getVisibleHomeFunctions,
	moveVisibleHomeFunction,
} from "../src/utils/homeOrder";

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
	});
});
