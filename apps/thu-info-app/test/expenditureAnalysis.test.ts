import {describe, expect, test} from "@jest/globals";
import {CardTransaction} from "@thu-info/lib/src/models/card/transaction";
import {
	analyzeMonthlyExpenditure,
	classifyExpenditure,
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
	timestamp: extra?.timestamp ?? new Date("2026-11-10T12:00:00Z"),
	balance: extra?.balance ?? 100,
	amount,
	address: extra?.address ?? "",
	name,
	txName: extra?.txName ?? "持卡人消费",
});

describe("expenditureAnalysis", () => {
	test("classifies dining, drinking water, shower, and other accurately", () => {
		// Dining: canteens and "饮食中心" must NOT be misclassified as water
		expect(
			classifyExpenditure(makeTx("1", "饮食中心_紫荆园一层_快餐", 12.5))
				.category,
		).toBe("dining");
		expect(
			classifyExpenditure(makeTx("2", "清芬园_水吧", 8)).category,
		).toBe("dining");
		expect(
			classifyExpenditure(makeTx("3", "桃李园二层_香锅", 24.8)).category,
		).toBe("dining");

		// Drinking water: dorm hot water / direct drinking water
		expect(
			classifyExpenditure(makeTx("4", "学生公寓_紫荆2号楼_直饮水", 0.35))
				.category,
		).toBe("water");
		expect(
			classifyExpenditure(makeTx("5", "紫荆公寓_开水房", 0.2)).category,
		).toBe("water");
		expect(
			classifyExpenditure(makeTx("6", "六教_饮水机", 0.4)).category,
		).toBe("water");

		// Shower: prioritized even when merchant name also contains "水控"
		expect(
			classifyExpenditure(makeTx("7", "学生公寓_紫荆2号楼_淋浴水控", 1.8))
				.category,
		).toBe("shower");

		// Other: supermarkets or sports even if located in a canteen building
		expect(
			classifyExpenditure(makeTx("8", "天猫校园_紫荆园店", 15.6)).category,
		).toBe("other");
		expect(
			classifyExpenditure(makeTx("9", "陈明游泳馆", 20)).category,
		).toBe("other");
	});

	test("applies manual merchant overrides over keyword rules", () => {
		const tx = makeTx("10", "清芬园_水吧", 9.5);
		const overrides = {"清芬园/水吧": "water" as const};

		const res = classifyExpenditure(tx, overrides);
		expect(res.category).toBe("water");
		expect(res.isOverridden).toBe(true);
		expect(res.merchant).toBe("清芬园/水吧");
	});

	test("excludes recharges/subsidies from expenditure and preserves cent-exact totals", () => {
		const raw = [
			makeTx("1", "综合服务微信扫码充值", 100, {txName: "微信充值"}),
			makeTx("2", "中行圈存", 50, {txName: "银行圈存"}),
			makeTx("3", "观畴园_基本伙", 12.1),
			makeTx("4", "紫荆2号楼_开水", 0.2),
			makeTx("5", "紫荆2号楼_淋浴", 1.65),
			makeTx("6", "天猫校园", 6.05),
		];

		const prepared = prepareMonthlyTransactions(raw);
		expect(prepared.income).toBeCloseTo(150, 2);
		expect(prepared.expenditure).toBeCloseTo(20.0, 2);

		// Idempotency check if called again on prepared data
		const preparedAgain = prepareMonthlyTransactions(prepared.data);
		expect(preparedAgain.income).toBeCloseTo(150, 2);
		expect(preparedAgain.expenditure).toBeCloseTo(20.0, 2);

		const analysis = analyzeMonthlyExpenditure(prepared.data);
		expect(analysis.totalExpenditure).toBe(20);
		expect(analysis.totalCount).toBe(4);

		const byCat = Object.fromEntries(
			analysis.categories.map((c) => [c.category, c]),
		);
		expect(byCat.dining.amount).toBe(12.1);
		expect(byCat.water.amount).toBe(0.2);
		expect(byCat.shower.amount).toBe(1.65);
		expect(byCat.other.amount).toBe(6.05);

		const sumCategories = analysis.categories.reduce(
			(acc, c) => acc + Math.round(c.amount * 100),
			0,
		);
		expect(sumCategories).toBe(Math.round(analysis.totalExpenditure * 100));
	});
});
