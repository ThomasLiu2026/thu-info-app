import type {CardTransaction} from "@thu-info/lib/src/models/card/transaction";

export type ExpenditureCategory = "dining" | "water" | "shower" | "other";

export const EXPENDITURE_CATEGORIES: readonly ExpenditureCategory[] = [
	"dining",
	"water",
	"shower",
	"other",
];

// Validated via dataviz/scripts/validate_palette.js against #FFFFFF (light) and #222222 (dark):
// Passes lightness band, chroma floor, CVD separation (ΔE >= 17.3), normal-vision floor (ΔE >= 20.9), and >= 3:1 surface contrast.
export const CATEGORY_PALETTE_LIGHT: Record<ExpenditureCategory, string> = {
	dining: "#eb6834",
	water: "#2a78d6",
	shower: "#159c6c",
	other: "#6250d6",
};

export const CATEGORY_PALETTE_DARK: Record<ExpenditureCategory, string> = {
	dining: "#d95926",
	water: "#3987e5",
	shower: "#199e70",
	other: "#9085e9",
};

const INCOME_KEYWORDS = /充值|圈存|补助|补贴|退款|退费|冲正/;

const SHOWER_KEYWORDS = /淋浴|浴室|澡堂|洗澡|洗浴|浴池/;

const WATER_KEYWORDS =
	/直饮水|饮水|开水|纯净水|矿泉水|桶装水|清紫源泉|打水|水控|控水/;

// Explicit non-dining campus merchants checked before broad canteen building names
// so e.g. "天猫校园紫荆园店" or "观畴园超市" is classified as "other" rather than "dining".
const EXPLICIT_OTHER_KEYWORDS =
	/天猫|超市|便利|小卖部|商贸|书店|文具|眼镜|纪念品|照相|理发|美发|游泳|体育|羽毛球|乒乓|网球|篮球|健身|气膜|冰场|场馆|洗衣|烘干|洗鞋|电费|购电|网费|网络|打印|复印|文印|自助机|校车|摆渡车|医院|医疗|药房|门诊|挂号|体检|图书馆|赔书|党费|团费|补卡|工本费/;

const DINING_KEYWORDS =
	/紫荆园|桃李园|清芬园|听涛园|观畴园|万人|丁香园|芝兰园|玉树园|荷园|澜园|寓园|家园|南园|北园|融园|熙春园|近春园|甲所|丙所|清青|食堂|餐厅|餐饮|饮食|膳食|美食|快餐|风味|基本伙|自选|香锅|麻辣烫|牛拉|拉面|面馆|粉|饺|包|饼|粥|饭|菜|烤|炸鸡|汉堡|西餐|披萨|比萨|咖啡|瑞幸|星巴克|水吧|奶茶|茶饮|冷饮|热饮|饮品|甜品|烘焙|面包|蛋糕|酸奶|水果|夜宵|早点|早餐|午餐|晚餐/;

export const normalizeMerchantName = (tx: CardTransaction): string => {
	const raw = tx.name || tx.txName || tx.summary || tx.address || "";
	return raw.replace(/_/g, "/").trim();
};

export const isIncomeTransaction = (tx: CardTransaction): boolean => {
	const combined = `${normalizeMerchantName(tx)} ${tx.txName ?? ""} ${tx.summary ?? ""}`;
	return INCOME_KEYWORDS.test(combined);
};

export interface PreparedMonthlyTransactions {
	income: number;
	expenditure: number;
	data: CardTransaction[];
}

export const prepareMonthlyTransactions = (
	transactions: CardTransaction[],
): PreparedMonthlyTransactions => {
	let incomeCents = 0;
	let expenditureCents = 0;
	const data = transactions.map((tx) => {
		const normalizedName = normalizeMerchantName(tx);
		const absAmount = Math.abs(tx.amount);
		const cents = Math.round(absAmount * 100);
		const incomeTx = isIncomeTransaction({...tx, name: normalizedName});
		if (incomeTx) {
			incomeCents += cents;
			return {
				...tx,
				name: normalizedName,
				amount: absAmount,
			};
		} else {
			expenditureCents += cents;
			return {
				...tx,
				name: normalizedName,
				amount: absAmount === 0 ? 0 : -absAmount,
			};
		}
	});
	return {
		income: incomeCents / 100,
		expenditure: expenditureCents / 100,
		data,
	};
};

export const classifyExpenditureByKeywords = (
	tx: CardTransaction,
): ExpenditureCategory => {
	const combined = `${normalizeMerchantName(tx)} ${tx.address ?? ""} ${tx.summary ?? ""} ${tx.txName ?? ""}`;
	if (SHOWER_KEYWORDS.test(combined)) {
		return "shower";
	}
	if (WATER_KEYWORDS.test(combined)) {
		return "water";
	}
	if (EXPLICIT_OTHER_KEYWORDS.test(combined)) {
		return "other";
	}
	if (DINING_KEYWORDS.test(combined)) {
		return "dining";
	}
	return "other";
};

export const classifyExpenditure = (
	tx: CardTransaction,
	overrides?: Record<string, ExpenditureCategory>,
): {category: ExpenditureCategory; isOverridden: boolean; merchant: string} => {
	const merchant = normalizeMerchantName(tx);
	const overridden = merchant ? overrides?.[merchant] : undefined;
	if (overridden) {
		return {
			category: overridden,
			isOverridden: true,
			merchant,
		};
	}
	return {
		category: classifyExpenditureByKeywords(tx),
		isOverridden: false,
		merchant,
	};
};

export interface CategoryStat {
	category: ExpenditureCategory;
	amount: number;
	count: number;
	percentage: number;
}

export interface CategorizedTransaction {
	tx: CardTransaction;
	merchant: string;
	category: ExpenditureCategory;
	isOverridden: boolean;
}

export interface MonthlyExpenditureAnalysis {
	totalExpenditure: number;
	totalCount: number;
	categories: CategoryStat[];
	items: CategorizedTransaction[];
}

export const analyzeMonthlyExpenditure = (
	transactions: CardTransaction[],
	overrides?: Record<string, ExpenditureCategory>,
): MonthlyExpenditureAnalysis => {
	const centsByCat: Record<ExpenditureCategory, number> = {
		dining: 0,
		water: 0,
		shower: 0,
		other: 0,
	};
	const countByCat: Record<ExpenditureCategory, number> = {
		dining: 0,
		water: 0,
		shower: 0,
		other: 0,
	};

	const items: CategorizedTransaction[] = [];
	let totalCents = 0;

	for (const tx of transactions) {
		if (isIncomeTransaction(tx)) {
			continue;
		}
		const absCents = Math.round(Math.abs(tx.amount) * 100);
		if (absCents <= 0) {
			continue;
		}
		const {category, isOverridden, merchant} = classifyExpenditure(
			tx,
			overrides,
		);
		centsByCat[category] += absCents;
		countByCat[category] += 1;
		totalCents += absCents;
		items.push({
			tx: {
				...tx,
				name: merchant,
				amount: -absCents / 100,
			},
			merchant,
			category,
			isOverridden,
		});
	}

	items.sort(
		(a, b) =>
			new Date(b.tx.timestamp).getTime() - new Date(a.tx.timestamp).getTime(),
	);

	const categories: CategoryStat[] = EXPENDITURE_CATEGORIES.map((category) => ({
		category,
		amount: centsByCat[category] / 100,
		count: countByCat[category],
		percentage: totalCents > 0 ? (centsByCat[category] / totalCents) * 100 : 0,
	}));

	return {
		totalExpenditure: totalCents / 100,
		totalCount: items.length,
		categories,
		items,
	};
};
