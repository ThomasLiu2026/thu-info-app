import type {CardTransaction} from "@thu-info/lib/src/models/card/transaction";

export type ExpenditureCategory = "dining" | "water" | "shower" | "other";
export type ShowerSubCategory = "bath" | "foot";
export type MealPeriod = "breakfast" | "lunch" | "dinner";

export const EXPENDITURE_CATEGORIES: readonly ExpenditureCategory[] = [
	"dining",
	"water",
	"shower",
	"other",
];

export const MEAL_PERIODS: readonly MealPeriod[] = [
	"breakfast",
	"lunch",
	"dinner",
];

// <= 0.16 CNY (16 cents) is classified as foot-washing ("洗脚"), > 0.16 CNY as shower ("洗澡").
export const FOOT_WASH_MAX_CENTS = 16;

// Consecutive dining or drinking-water transactions from the same merchant within 30 minutes merge into one.
export const MERGE_WINDOW_MS = 30 * 60 * 1000;

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

const SHOWER_KEYWORDS = /淋浴|浴室|澡堂|洗澡|洗浴|浴池|洗漱/;

const WATER_KEYWORDS =
	/直饮水|饮水|开水|纯净水|矿泉水|桶装水|清紫源泉|打水|水控|控水/;

// Explicit non-dining campus merchants checked before broad canteen building names
// so e.g. "天猫校园紫荆园店" or "观畴园超市" is classified as "other" rather than "dining".
const EXPLICIT_OTHER_KEYWORDS =
	/天猫|超市|便利|小卖部|商贸|书店|文具|眼镜|纪念品|照相|理发|美发|游泳|体育|羽毛球|乒乓|网球|篮球|健身|气膜|冰场|场馆|洗衣|烘干|洗鞋|电费|购电|网费|网络|打印|复印|文印|自助机|校车|摆渡车|医院|医疗|药房|门诊|挂号|体检|图书馆|赔书|党费|团费|补卡|工本费/;

const DINING_KEYWORDS =
	/紫荆园|桃李园|清芬园|听涛园|观畴园|万人|丁香园|芝兰园|玉树园|荷园|澜园|寓园|家园|南园|北园|融园|熙春园|近春园|洁华园|双清|甲所|丙所|清青|食堂|餐厅|餐饮|饮食|膳食|美食|快餐|风味|基本伙|自选|香锅|麻辣烫|牛拉|拉面|面馆|粉|饺|包|饼|粥|饭|菜|烤|炸鸡|汉堡|西餐|披萨|比萨|咖啡|瑞幸|星巴克|水吧|奶茶|茶饮|冷饮|热饮|饮品|甜品|烘焙|面包|蛋糕|酸奶|水果|夜宵|早点|早餐|午餐|晚餐/;

// Canonical Tsinghua canteens (matched at canteen level, ignoring stall/floor suffixes).
const CANONICAL_CANTEENS: readonly {pattern: RegExp; name: string}[] = [
	{pattern: /紫荆园|紫荆餐厅/, name: "紫荆园"},
	{pattern: /桃李园|桃李餐厅/, name: "桃李园"},
	{pattern: /清芬园|清芬餐厅/, name: "清芬园"},
	{pattern: /听涛园|听涛餐厅/, name: "听涛园"},
	{pattern: /观畴园|观畴餐厅|万人/, name: "观畴园"},
	{pattern: /丁香园|丁香餐厅/, name: "丁香园"},
	{pattern: /芝兰园|芝兰餐厅/, name: "芝兰园"},
	{pattern: /玉树园|玉树餐厅/, name: "玉树园"},
	{pattern: /荷园/, name: "荷园"},
	{pattern: /澜园/, name: "澜园"},
	{pattern: /寓园/, name: "寓园"},
	{pattern: /融园/, name: "融园"},
	{pattern: /熙春园|熙春餐厅/, name: "熙春园"},
	{pattern: /近春园/, name: "近春园"},
	{pattern: /洁华园/, name: "洁华园"},
	{pattern: /南园/, name: "南园"},
	{pattern: /北园/, name: "北园"},
	{pattern: /家园/, name: "家园"},
	{pattern: /双清/, name: "双清餐厅"},
	{pattern: /甲所/, name: "甲所"},
	{pattern: /丙所/, name: "丙所"},
];

// Standalone campus dining brands when not located under a named XX园 canteen.
const STANDALONE_DINING_BRANDS: readonly {pattern: RegExp; name: string}[] = [
	{pattern: /清青快餐/, name: "清青快餐"},
	{pattern: /清青永和/, name: "清青永和"},
	{pattern: /清青咖啡/, name: "清青咖啡"},
	{pattern: /清青披萨|清青比萨/, name: "清青披萨"},
	{pattern: /清青牛拉/, name: "清青牛拉"},
	{pattern: /清青休闲/, name: "清青休闲"},
	{pattern: /清青/, name: "清青餐饮"},
	{pattern: /瑞幸/, name: "瑞幸咖啡"},
	{pattern: /星巴克/, name: "星巴克"},
];

const GENERIC_ORG_PREFIXES = new Set([
	"饮食中心",
	"餐饮服务中心",
	"餐饮中心",
	"膳食中心",
	"后勤",
	"清华大学",
]);

export const normalizeMerchantName = (tx: CardTransaction): string => {
	const raw = tx.name || tx.txName || tx.summary || tx.address || "";
	return raw.replace(/_/g, "/").trim();
};

export const normalizePayeeForMerge = (merchant: string): string =>
	merchant
		.replace(/[/_\-—－\s]+/g, "/")
		.replace(/(?:\/)?(?:\d{1,2}号机|POS\d+|终端\d+|[#＃]\d+)$/i, "")
		.trim();

export const parseSafeTimestamp = (timestamp: Date | string | number): Date => {
	if (timestamp instanceof Date && !Number.isNaN(timestamp.getTime())) {
		return timestamp;
	}
	if (typeof timestamp === "number") {
		return new Date(timestamp);
	}
	if (typeof timestamp === "string") {
		const trimmed = timestamp.trim();
		if (/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) {
			return new Date(trimmed);
		}
		const m =
			/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.\d+)?)?$/.exec(
				trimmed,
			);
		if (m) {
			return new Date(
				Number(m[1]),
				Number(m[2]) - 1,
				Number(m[3]),
				m[4] ? Number(m[4]) : 0,
				m[5] ? Number(m[5]) : 0,
				m[6] ? Number(m[6]) : 0,
			);
		}
		return new Date(trimmed);
	}
	return timestamp instanceof Date ? timestamp : new Date(NaN);
};

export const extractCanteenName = (
	tx: CardTransaction,
	fallbackLabel = "其他食堂",
): string => {
	const combined = `${normalizeMerchantName(tx)} ${tx.address ?? ""}`;
	for (const {pattern, name} of CANONICAL_CANTEENS) {
		if (pattern.test(combined)) {
			return name;
		}
	}
	for (const {pattern, name} of STANDALONE_DINING_BRANDS) {
		if (pattern.test(combined)) {
			return name;
		}
	}

	const segments = normalizeMerchantName(tx)
		.split(/[/_\-—·\s]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !GENERIC_ORG_PREFIXES.has(s));

	if (segments.length > 0) {
		const cleaned = segments[0]
			.replace(/(?:地下)?(?:[一二三四五六1-6Bb][层楼]|[东西南北中]厅).*$/g, "")
			.trim();
		if (cleaned.length > 0) {
			return cleaned;
		}
		return segments[0];
	}
	return fallbackLabel;
};

export const getMealPeriod = (timestamp: Date | string | number): MealPeriod => {
	const d = parseSafeTimestamp(timestamp);
	const totalMinutes = d.getHours() * 60 + d.getMinutes();
	// 04:00 - 10:29 -> breakfast; 10:30 - 15:59 -> lunch; 16:00 - 03:59 -> dinner
	if (totalMinutes >= 240 && totalMinutes < 630) {
		return "breakfast";
	}
	if (totalMinutes >= 630 && totalMinutes < 960) {
		return "lunch";
	}
	return "dinner";
};

export const getShowerSubCategory = (absCents: number): ShowerSubCategory =>
	absCents <= FOOT_WASH_MAX_CENTS ? "foot" : "bath";

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

export interface SubCategoryStat<K extends string = string> {
	key: K;
	amount: number;
	count: number;
	percentage: number;
}

export interface CategorizedTransaction {
	tx: CardTransaction;
	merchant: string;
	category: ExpenditureCategory;
	isOverridden: boolean;
	mergedCount?: number;
	mergedMerchants?: string[];
	showerSubCategory?: ShowerSubCategory;
	mealPeriod?: MealPeriod;
	canteen?: string;
	otherSubCategory?: string;
}

export interface MonthlyExpenditureAnalysis {
	totalExpenditure: number;
	totalCount: number;
	categories: CategoryStat[];
	showerSubCategories: SubCategoryStat<ShowerSubCategory>[];
	diningMeals: SubCategoryStat<MealPeriod>[];
	diningCanteens: SubCategoryStat<string>[];
	otherSubCategoryStats: (SubCategoryStat<string> & {
		isUncategorized?: boolean;
	})[];
	items: CategorizedTransaction[];
}

export const analyzeMonthlyExpenditure = (
	transactions: CardTransaction[],
	overrides?: Record<string, ExpenditureCategory>,
	otherSubcategories: string[] = [],
	otherMerchantSubcategories?: Record<string, string>,
	otherCanteenLabel = "其他食堂",
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

	const showerSubCents: Record<ShowerSubCategory, number> = {bath: 0, foot: 0};
	const showerSubCount: Record<ShowerSubCategory, number> = {bath: 0, foot: 0};

	const mealCents: Record<MealPeriod, number> = {
		breakfast: 0,
		lunch: 0,
		dinner: 0,
	};
	const mealCount: Record<MealPeriod, number> = {
		breakfast: 0,
		lunch: 0,
		dinner: 0,
	};

	const canteenMap = new Map<string, {cents: number; count: number}>();

	const validOtherSubSet = new Set(otherSubcategories);
	const otherSubMap = new Map<string, {cents: number; count: number}>();
	for (const sub of otherSubcategories) {
		otherSubMap.set(sub, {cents: 0, count: 0});
	}
	let otherUncategorizedCents = 0;
	let otherUncategorizedCount = 0;

	const items: CategorizedTransaction[] = [];
	let totalCents = 0;

	interface RawConsumptionSession {
		tx: CardTransaction;
		merchant: string;
		category: ExpenditureCategory;
		isOverridden: boolean;
		absCents: number;
		startTimeMs: number;
		lastTimeMs: number;
		mergedCount: number;
		mergedMerchants: string[];
	}

	const rawCandidates: RawConsumptionSession[] = [];
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
		const parsedDate = parseSafeTimestamp(tx.timestamp);
		const timeMs = parsedDate.getTime();
		rawCandidates.push({
			tx: {...tx, timestamp: parsedDate},
			merchant,
			category,
			isOverridden,
			absCents,
			startTimeMs: timeMs,
			lastTimeMs: timeMs,
			mergedCount: 1,
			mergedMerchants: merchant ? [merchant] : [],
		});
	}

	// Sort chronologically ascending so <= 30 min same-canteen dining or same-merchant water swipes merge cleanly.
	rawCandidates.sort((a, b) => {
		if (Number.isNaN(a.startTimeMs) || Number.isNaN(b.startTimeMs)) {
			return 0;
		}
		return a.startTimeMs - b.startTimeMs;
	});

	const mergedSessions: RawConsumptionSession[] = [];
	const lastMergeableByKey = new Map<string, RawConsumptionSession>();

	for (const candidate of rawCandidates) {
		const isMergeableCategory =
			candidate.category === "dining" || candidate.category === "water";
		const payeeKey =
			candidate.category === "dining"
				? extractCanteenName(candidate.tx, "") ||
				  normalizePayeeForMerge(candidate.merchant)
				: normalizePayeeForMerge(candidate.merchant);
		if (
			isMergeableCategory &&
			payeeKey &&
			Number.isFinite(candidate.startTimeMs)
		) {
			const mergeKey = `${candidate.category}::${payeeKey}`;
			const prevSession = lastMergeableByKey.get(mergeKey);
			if (
				prevSession &&
				Number.isFinite(prevSession.lastTimeMs) &&
				candidate.startTimeMs - prevSession.lastTimeMs <= MERGE_WINDOW_MS
			) {
				prevSession.absCents += candidate.absCents;
				prevSession.lastTimeMs = candidate.startTimeMs;
				prevSession.mergedCount += 1;
				prevSession.isOverridden =
					prevSession.isOverridden || candidate.isOverridden;
				if (
					candidate.merchant &&
					!prevSession.mergedMerchants.includes(candidate.merchant)
				) {
					prevSession.mergedMerchants.push(candidate.merchant);
				}
				continue;
			}
			const session = {
				...candidate,
				mergedMerchants: [...candidate.mergedMerchants],
			};
			mergedSessions.push(session);
			lastMergeableByKey.set(mergeKey, session);
		} else {
			mergedSessions.push({
				...candidate,
				mergedMerchants: [...candidate.mergedMerchants],
			});
		}
	}

	for (const session of mergedSessions) {
		const {
			tx,
			merchant,
			category,
			isOverridden,
			absCents,
			mergedCount,
			mergedMerchants,
		} = session;
		centsByCat[category] += absCents;
		countByCat[category] += 1;
		totalCents += absCents;

		const item: CategorizedTransaction = {
			tx: {
				...tx,
				name: merchant,
				amount: -absCents / 100,
			},
			merchant,
			category,
			isOverridden,
			mergedCount,
			mergedMerchants:
				mergedMerchants.length > 1 ? mergedMerchants : undefined,
		};

		if (category === "shower") {
			const sub = getShowerSubCategory(absCents);
			item.showerSubCategory = sub;
			showerSubCents[sub] += absCents;
			showerSubCount[sub] += 1;
		} else if (category === "dining") {
			const meal = getMealPeriod(tx.timestamp);
			const canteen = extractCanteenName(tx, otherCanteenLabel);
			item.mealPeriod = meal;
			item.canteen = canteen;
			mealCents[meal] += absCents;
			mealCount[meal] += 1;
			const prev = canteenMap.get(canteen) ?? {cents: 0, count: 0};
			canteenMap.set(canteen, {
				cents: prev.cents + absCents,
				count: prev.count + 1,
			});
		} else if (category === "other") {
			const mappedSub = merchant
				? otherMerchantSubcategories?.[merchant]
				: undefined;
			if (mappedSub && validOtherSubSet.has(mappedSub)) {
				item.otherSubCategory = mappedSub;
				const prev = otherSubMap.get(mappedSub) ?? {cents: 0, count: 0};
				otherSubMap.set(mappedSub, {
					cents: prev.cents + absCents,
					count: prev.count + 1,
				});
			} else {
				otherUncategorizedCents += absCents;
				otherUncategorizedCount += 1;
			}
		}

		items.push(item);
	}

	items.sort((a, b) => {
		const ta = parseSafeTimestamp(a.tx.timestamp).getTime();
		const tb = parseSafeTimestamp(b.tx.timestamp).getTime();
		if (Number.isNaN(ta) || Number.isNaN(tb)) {
			return 0;
		}
		return tb - ta;
	});

	const categories: CategoryStat[] = EXPENDITURE_CATEGORIES.map((category) => ({
		category,
		amount: centsByCat[category] / 100,
		count: countByCat[category],
		percentage: totalCents > 0 ? (centsByCat[category] / totalCents) * 100 : 0,
	}));

	const showerTotal = centsByCat.shower;
	const showerSubCategories: SubCategoryStat<ShowerSubCategory>[] = (
		["bath", "foot"] as const
	).map((sub) => ({
		key: sub,
		amount: showerSubCents[sub] / 100,
		count: showerSubCount[sub],
		percentage:
			showerTotal > 0 ? (showerSubCents[sub] / showerTotal) * 100 : 0,
	}));

	const diningTotal = centsByCat.dining;
	const diningMeals: SubCategoryStat<MealPeriod>[] = MEAL_PERIODS.map(
		(meal) => ({
			key: meal,
			amount: mealCents[meal] / 100,
			count: mealCount[meal],
			percentage: diningTotal > 0 ? (mealCents[meal] / diningTotal) * 100 : 0,
		}),
	);

	const diningCanteens: SubCategoryStat<string>[] = Array.from(
		canteenMap.entries(),
	)
		.sort((a, b) => b[1].cents - a[1].cents)
		.map(([canteen, stat]) => ({
			key: canteen,
			amount: stat.cents / 100,
			count: stat.count,
			percentage: diningTotal > 0 ? (stat.cents / diningTotal) * 100 : 0,
		}));

	const otherTotal = centsByCat.other;
	const otherSubCategoryStats: (SubCategoryStat<string> & {
		isUncategorized?: boolean;
	})[] = otherSubcategories.map((sub) => {
		const stat = otherSubMap.get(sub) ?? {cents: 0, count: 0};
		return {
			key: sub,
			amount: stat.cents / 100,
			count: stat.count,
			percentage: otherTotal > 0 ? (stat.cents / otherTotal) * 100 : 0,
		};
	});

	if (otherUncategorizedCount > 0) {
		otherSubCategoryStats.push({
			key: "__uncategorized__",
			amount: otherUncategorizedCents / 100,
			count: otherUncategorizedCount,
			percentage:
				otherTotal > 0 ? (otherUncategorizedCents / otherTotal) * 100 : 0,
			isUncategorized: true,
		});
	}

	return {
		totalExpenditure: totalCents / 100,
		totalCount: items.length,
		categories,
		showerSubCategories,
		diningMeals,
		diningCanteens,
		otherSubCategoryStats,
		items,
	};
};
