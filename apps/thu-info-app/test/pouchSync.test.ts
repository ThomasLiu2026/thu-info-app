import {describe, expect, test} from "@jest/globals";
import {CardTransaction} from "@thu-info/lib/src/models/card/transaction";
import {
	analyzeMonthlyExpenditure,
	prepareMonthlyTransactions,
} from "../src/utils/expenditureAnalysis";
import {
	buildPouchCampusPayload,
	inferCampusRechargeChannel,
	pouchPayloadSignature,
} from "../src/utils/pouchSync";

const makeTx = (
	id: string,
	name: string | undefined,
	amount: number,
	extra?: Partial<CardTransaction>,
): CardTransaction => ({
	id,
	summary: extra?.summary ?? "消费",
	timestamp: extra?.timestamp ?? ("2026-11-17 14:25:00" as unknown as Date),
	balance: extra?.balance ?? 500,
	amount,
	address: extra?.address ?? "",
	name,
	txName: extra?.txName ?? "持卡人消费",
});

describe("pouchSync", () => {
	test("builds exact monthly Pouch payload with SQL timestamps, custom overrides, and recharge channels", () => {
		const raw: CardTransaction[] = [
			makeTx("r1", "综合服务微信扫码充值", 400, {
				txName: "微信充值",
				timestamp: "2026-11-01 08:51:00" as unknown as Date,
			}),
			makeTx("r2", "支付宝校园卡充值", 200, {
				txName: "支付宝充值",
				timestamp: "2026-11-10 10:15:00" as unknown as Date,
			}),
			makeTx("r3", "中行圈存充值", 100, {
				txName: "银行圈存",
				timestamp: "2026-11-12 09:00:00" as unknown as Date,
			}),
			makeTx("r4", "学校餐补发放", 50, {
				txName: "补助",
				timestamp: "2026-11-15 08:00:00" as unknown as Date,
			}),
			makeTx("e1", "丁香园_一层_小炒", 18.61, {
				timestamp: "2026-11-19 11:19:00" as unknown as Date,
			}),
			makeTx("e2", "南区31号楼_直饮水", 0.35, {
				timestamp: "2026-11-19 13:05:00" as unknown as Date,
			}),
			makeTx("e3", "紫荆2号楼_淋浴", 1.8, {
				timestamp: "2026-11-19 22:10:00" as unknown as Date,
			}),
			makeTx("e4", "天猫校园", 12.0, {
				timestamp: "2026-11-19 15:00:00" as unknown as Date,
			}),
		];

		const prepared = prepareMonthlyTransactions(raw);
		const analysis = analyzeMonthlyExpenditure(prepared.data, {
			天猫校园: "dining",
		});

		const payload = buildPouchCampusPayload(
			2026,
			11,
			prepared.data,
			analysis,
			502.76,
			1795250000000,
		);

		expect(payload.v).toBe(1);
		expect(payload.yearMonth).toBe("2026-11");
		expect(payload.totalExpense).toBe(32.76);
		expect(payload.rechargeTotal).toBe(700);
		expect(payload.balance).toBe(502.76);
		expect(payload.categories).toEqual([
			{subCategory: "饮食", amountCny: 30.61, count: 2},
			{subCategory: "喝水", amountCny: 0.35, count: 1},
			{subCategory: "洗漱", amountCny: 1.8, count: 1},
			{subCategory: "其他", amountCny: 0, count: 0},
		]);
		expect(payload.recharges.length).toBe(4);
		expect(payload.recharges.map((r) => r.channelHint)).toEqual([
			"WECHAT",
			"ALIPAY",
			"BANK",
			"SUBSIDY",
		]);
		expect(payload.recharges[0].timestampMillis).toBeGreaterThan(0);

		// Signature ignores syncedAtMillis so identical data does not re-broadcast
		const payload2 = buildPouchCampusPayload(
			2026,
			11,
			prepared.data,
			analysis,
			502.76,
			1795259999999,
		);
		expect(pouchPayloadSignature(payload)).toBe(
			pouchPayloadSignature(payload2),
		);

		expect(
			inferCampusRechargeChannel(makeTx("c1", "微信扫码充值", 100)),
		).toBe("WECHAT");
	});
});
