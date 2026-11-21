import type {CardTransaction} from "@thu-info/lib/src/models/card/transaction";
import {
	ExpenditureCategory,
	isIncomeTransaction,
	MonthlyExpenditureAnalysis,
	normalizeMerchantName,
	parseSafeTimestamp,
} from "./expenditureAnalysis";

export interface PouchCampusCategoryItem {
	subCategory: string;
	amountCny: number;
	count: number;
}

export type PouchRechargeChannel =
	| "WECHAT"
	| "ALIPAY"
	| "BANK"
	| "SUBSIDY"
	| "OTHER";

export interface PouchCampusRechargeItem {
	timestampMillis: number;
	amountCny: number;
	channelHint: PouchRechargeChannel;
	title: string;
}

export interface PouchCampusSyncPayload {
	v: number;
	yearMonth: string;
	totalExpense: number;
	rechargeTotal: number;
	balance: number | null;
	syncedAtMillis: number;
	categories: PouchCampusCategoryItem[];
	recharges: PouchCampusRechargeItem[];
}

export type PouchSyncResult =
	| "synced"
	| "not_installed"
	| "unavailable"
	| "failed";

const CATEGORY_TO_POUCH_LABEL: Record<ExpenditureCategory, string> = {
	dining: "饮食",
	water: "喝水",
	shower: "洗漱",
	other: "其他",
};

const roundCents = (v: number): number => Math.round(v * 100) / 100;

export const inferCampusRechargeChannel = (
	tx: CardTransaction,
): PouchRechargeChannel => {
	const combined = `${normalizeMerchantName(tx)} ${tx.txName ?? ""} ${tx.summary ?? ""}`;
	if (/补助|补贴|退款|退费|冲正/.test(combined)) {
		return "SUBSIDY";
	}
	if (/微信|财付通/.test(combined)) {
		return "WECHAT";
	}
	if (/支付宝/.test(combined)) {
		return "ALIPAY";
	}
	if (/中行|中国银行|工行|工商银行|招行|招商银行|银行|圈存/.test(combined)) {
		return "BANK";
	}
	return "OTHER";
};

export const buildPouchCampusPayload = (
	year: number,
	month: number,
	transactions: CardTransaction[],
	analysis: MonthlyExpenditureAnalysis,
	balance?: number | null,
	syncedAtMillis: number = Date.now(),
): PouchCampusSyncPayload => {
	const yearMonth = `${year}-${String(month).padStart(2, "0")}`;

	const categories: PouchCampusCategoryItem[] = analysis.categories.map(
		(stat) => ({
			subCategory: CATEGORY_TO_POUCH_LABEL[stat.category],
			amountCny: roundCents(stat.amount),
			count: stat.count,
		}),
	);

	const recharges: PouchCampusRechargeItem[] = [];
	let rechargeCents = 0;

	for (const tx of transactions) {
		if (!isIncomeTransaction(tx)) {
			continue;
		}
		const absAmt = Math.abs(tx.amount);
		const cents = Math.round(absAmt * 100);
		if (cents <= 0) {
			continue;
		}
		const parsedDate = parseSafeTimestamp(tx.timestamp);
		const tsMillis = Number.isNaN(parsedDate.getTime())
			? 0
			: parsedDate.getTime();
		const channelHint = inferCampusRechargeChannel(tx);
		const title =
			normalizeMerchantName(tx) || tx.txName || tx.summary || "校园卡充值";
		recharges.push({
			timestampMillis: tsMillis,
			amountCny: cents / 100,
			channelHint,
			title,
		});
		if (channelHint !== "SUBSIDY") {
			rechargeCents += cents;
		}
	}

	const cleanBalance =
		typeof balance === "number" && Number.isFinite(balance)
			? roundCents(balance)
			: null;

	return {
		v: 1,
		yearMonth,
		totalExpense: roundCents(analysis.totalExpenditure),
		rechargeTotal: rechargeCents / 100,
		balance: cleanBalance,
		syncedAtMillis,
		categories,
		recharges,
	};
};

export const pouchPayloadSignature = (
	payload: PouchCampusSyncPayload,
): string =>
	JSON.stringify({
		v: payload.v,
		yearMonth: payload.yearMonth,
		totalExpense: payload.totalExpense,
		rechargeTotal: payload.rechargeTotal,
		balance: payload.balance,
		categories: payload.categories,
		recharges: payload.recharges,
	});

export interface PouchSyncNativeBridge {
	syncCampusCard?: (payloadJson: string) => Promise<boolean>;
}

export const syncCampusPayloadToPouch = async (
	payload: PouchCampusSyncPayload,
	platformOs: string,
	bridge?: PouchSyncNativeBridge,
): Promise<PouchSyncResult> => {
	if (platformOs !== "android") {
		return "unavailable";
	}
	if (!bridge || typeof bridge.syncCampusCard !== "function") {
		return "unavailable";
	}
	try {
		const ok = await bridge.syncCampusCard(JSON.stringify(payload));
		return ok ? "synced" : "not_installed";
	} catch {
		return "failed";
	}
};
