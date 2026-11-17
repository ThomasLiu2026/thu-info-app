import {describe, expect, test} from "@jest/globals";
import {CardTransaction} from "@thu-info/lib/src/models/card/transaction";
import {
	analyzeMonthlyExpenditure,
	classifyExpenditure,
	extractCanteenName,
	getMealPeriod,
	prepareMonthlyTransactions,
} from "../src/utils/expenditureAnalysis";

const makeTx = (
	id: string,
	name: string | undefined,
	amount: number,
	extra?: Partial<CardTransaction>,
): CardTransaction => ({
	id,
	summary: extra?.summary ?? "消费",
	timestamp: extra?.timestamp ?? new Date(2026, 10, 10, 12, 0),
	balance: extra?.balance ?? 100,
	amount,
	address: extra?.address ?? "",
	name,
	txName: extra?.txName ?? "持卡人消费",
});

describe("expenditureAnalysis", () => {
	test("classifies dining, drinking water, washing (shower/foot), and other accurately", () => {
		expect(
			classifyExpenditure(makeTx("1", "饮食中心_紫荆园一层_快餐", 12.5))
				.category,
		).toBe("dining");
		expect(
			classifyExpenditure(makeTx("2", "清芬园_水吧", 8)).category,
		).toBe("dining");
		expect(
			classifyExpenditure(makeTx("3", "听涛园-陕西风味", 15)).category,
		).toBe("dining");

		expect(
			classifyExpenditure(makeTx("4", "学生公寓_紫荆2号楼_直饮水", 0.35))
				.category,
		).toBe("water");
		expect(
			classifyExpenditure(makeTx("5", "紫荆公寓_开水房", 0.2)).category,
		).toBe("water");

		expect(
			classifyExpenditure(makeTx("7", "学生公寓_紫荆2号楼_淋浴水控", 1.8))
				.category,
		).toBe("shower");
		expect(
			classifyExpenditure(makeTx("8", "天猫校园_紫荆园店", 15.6)).category,
		).toBe("other");
	});

	test("normalizes canteen names to canteen level and splits meal periods", () => {
		expect(extractCanteenName(makeTx("1", "听涛园-陕西风味", 15))).toBe(
			"听涛园",
		);
		expect(extractCanteenName(makeTx("2", "饮食中心_紫荆园一层_快餐", 12))).toBe(
			"紫荆园",
		);
		expect(extractCanteenName(makeTx("3", "桃李园二层/麻辣香锅", 24))).toBe(
			"桃李园",
		);
		expect(extractCanteenName(makeTx("4", "清芬园地下一层-清青快餐", 18))).toBe(
			"清芬园",
		);

		expect(getMealPeriod(new Date(2026, 10, 10, 7, 40))).toBe("breakfast");
		expect(getMealPeriod(new Date(2026, 10, 10, 12, 15))).toBe("lunch");
		expect(getMealPeriod(new Date(2026, 10, 10, 18, 30))).toBe("dinner");
	});

	test("splits washing into foot wash (<= 0.16) and shower (> 0.16), plus dining & custom other subcategories", () => {
		const raw = [
			makeTx("1", "综合服务微信扫码充值", 100, {txName: "微信充值"}),
			makeTx("2", "听涛园-陕西风味", 6.5, {
				timestamp: new Date(2026, 10, 10, 8, 10),
			}),
			makeTx("3", "听涛园-川湘风味", 15.5, {
				timestamp: new Date(2026, 10, 10, 12, 20),
			}),
			makeTx("4", "饮食中心_紫荆园二层_基本伙", 18.0, {
				timestamp: new Date(2026, 10, 10, 18, 5),
			}),
			makeTx("5", "紫荆2号楼_淋浴", 0.16, {
				timestamp: new Date(2026, 10, 10, 21, 0),
			}),
			makeTx("6", "紫荆2号楼_淋浴", 0.12, {
				timestamp: new Date(2026, 10, 10, 21, 5),
			}),
			makeTx("7", "紫荆2号楼_淋浴", 1.72, {
				timestamp: new Date(2026, 10, 10, 22, 0),
			}),
			makeTx("8", "天猫校园", 10.0),
		];

		const prepared = prepareMonthlyTransactions(raw);
		const analysis = analyzeMonthlyExpenditure(
			prepared.data,
			undefined,
			["超市", "文印"],
			{天猫校园: "超市"},
		);

		expect(analysis.totalExpenditure).toBe(52);

		// Washing breakdown: 0.16 + 0.12 = 0.28 foot wash; 1.72 bath
		const showerMap = Object.fromEntries(
			analysis.showerSubCategories.map((s) => [s.key, s]),
		);
		expect(showerMap.foot.amount).toBe(0.28);
		expect(showerMap.foot.count).toBe(2);
		expect(showerMap.bath.amount).toBe(1.72);
		expect(showerMap.bath.count).toBe(1);

		// Dining by canteen: 听涛园 merged (6.5 + 15.5 = 22), 紫荆园 (18)
		const canteenMap = Object.fromEntries(
			analysis.diningCanteens.map((c) => [c.key, c]),
		);
		expect(canteenMap["听涛园"].amount).toBe(22);
		expect(canteenMap["听涛园"].count).toBe(2);
		expect(canteenMap["紫荆园"].amount).toBe(18);

		// Dining by meal
		const mealMap = Object.fromEntries(
			analysis.diningMeals.map((m) => [m.key, m]),
		);
		expect(mealMap.breakfast.amount).toBe(6.5);
		expect(mealMap.lunch.amount).toBe(15.5);
		expect(mealMap.dinner.amount).toBe(18);

		// Other custom subcategories
		const otherSubMap = Object.fromEntries(
			analysis.otherSubCategoryStats.map((o) => [o.key, o]),
		);
		expect(otherSubMap["超市"].amount).toBe(10);
		expect(otherSubMap["文印"].amount).toBe(0);
	});

	test("merges dining swipes within 30 minutes across different stalls of the same canteen, and merges same-merchant water swipes", () => {
		const raw = [
			// Same stall 3 minutes apart + different stall in the SAME canteen (桃李园) 2 minutes later -> all 3 merged into 1 meal!
			makeTx("d1", "桃李园一层_基本伙", 6.0, {
				timestamp: new Date(2026, 10, 12, 12, 0),
			}),
			makeTx("d2", "桃李园一层_基本伙", 0.8, {
				timestamp: new Date(2026, 10, 12, 12, 3),
			}),
			makeTx("d4", "桃李园二层_麻辣香锅", 15.0, {
				timestamp: new Date(2026, 10, 12, 12, 5),
			}),
			// DIFFERENT canteen (紫荆园) 5 minutes later -> NOT merged with 桃李园
			makeTx("d5", "紫荆园一层_水吧", 8.0, {
				timestamp: new Date(2026, 10, 12, 12, 10),
			}),
			// Same canteen (桃李园) 31 minutes after d4 (12:05 -> 12:36) -> NOT merged (new meal)
			makeTx("d3", "桃李园一层_基本伙", 10.0, {
				timestamp: new Date(2026, 10, 12, 12, 36),
			}),
			// Two drinking-water swipes at the same dispenser 30 minutes apart -> merged into 1
			makeTx("w1", "紫荆2号楼_直饮水", 0.2, {
				timestamp: new Date(2026, 10, 12, 14, 0),
			}),
			makeTx("w2", "紫荆2号楼_直饮水", 0.3, {
				timestamp: new Date(2026, 10, 12, 14, 30),
			}),
		];

		const prepared = prepareMonthlyTransactions(raw);
		const analysis = analyzeMonthlyExpenditure(prepared.data);

		const catMap = Object.fromEntries(
			analysis.categories.map((c) => [c.category, c]),
		);
		expect(catMap.dining.amount).toBe(39.8);
		expect(catMap.dining.count).toBe(3); // (d1+d2+d4 at 桃李园), d5 at 紫荆园, d3 at 桃李园 (>30 min later)

		const canteenMap = Object.fromEntries(
			analysis.diningCanteens.map((c) => [c.key, c]),
		);
		expect(canteenMap["桃李园"].amount).toBe(31.8);
		expect(canteenMap["桃李园"].count).toBe(2); // (d1+d2+d4) + d3
		expect(canteenMap["紫荆园"].amount).toBe(8);
		expect(canteenMap["紫荆园"].count).toBe(1);

		expect(catMap.water.amount).toBe(0.5);
		expect(catMap.water.count).toBe(1); // (w1+w2)

		const mergedDining = analysis.items.find((i) => i.tx.id === "d1");
		expect(mergedDining?.tx.amount).toBe(-21.8);
		expect(mergedDining?.mergedCount).toBe(3);
		expect(mergedDining?.mergedMerchants).toEqual([
			"桃李园一层/基本伙",
			"桃李园二层/麻辣香锅",
		]);

		const mergedWater = analysis.items.find((i) => i.tx.id === "w1");
		expect(mergedWater?.tx.amount).toBe(-0.5);
		expect(mergedWater?.mergedCount).toBe(2);
	});

	test("parses SQL space-separated timestamp strings (Hermes-safe) and merges descending API rows", () => {
		// Simulate card.tsinghua.edu.cn returning newest-first rows with "YYYY-MM-DD HH:mm:ss" timestamps
		const raw = [
			makeTx("2", "听涛园-陕西风味", 2.0, {
				timestamp: "2026-11-17 12:08:15" as unknown as Date,
			}),
			makeTx("1", "听涛园-陕西风味", 12.0, {
				timestamp: "2026-11-17 12:05:00" as unknown as Date,
			}),
		];
		const prepared = prepareMonthlyTransactions(raw);
		const analysis = analyzeMonthlyExpenditure(prepared.data);
		expect(analysis.totalCount).toBe(1);
		expect(analysis.totalExpenditure).toBe(14);
		expect(analysis.items[0].mergedCount).toBe(2);
		expect(analysis.items[0].mealPeriod).toBe("lunch");
	});
});
