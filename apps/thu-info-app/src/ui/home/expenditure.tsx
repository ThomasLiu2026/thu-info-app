import {
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	BackHandler,
	FlatList,
	Modal,
	NativeModules,
	Platform,
	RefreshControl,
	SectionList,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {RouteProp} from "@react-navigation/native";
import {getStr} from "../../utils/i18n";
import themes from "../../assets/themes/themes";
import {resolveIsDarkMode} from "../../assets/themes/presets";
import {styles} from "../../ui/settings/settings";
import {helper, State} from "../../redux/store";
import {
	addOtherSubcategory,
	removeOtherSubcategory,
	setMerchantCategoryOverride,
	setOtherMerchantSubcategory,
} from "../../redux/slices/campusCard";
import {
	CardTransaction,
	CardTransactionType,
} from "@thu-info/lib/src/models/card/transaction";
import {BottomPopupTriggerView, RoundedView} from "../../components/views";
import IconDown from "../../assets/icons/IconDown";
import IconLeft from "../../assets/icons/IconLeft";
import IconRight from "../../assets/icons/IconRight";
import IconCheck from "../../assets/icons/IconCheck";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import {NetworkRetry} from "../../components/easySnackbars";
import {Snackbar} from "react-native-snackbar";
import dayjs from "dayjs";
import IconRice from "../../assets/icons/IconRice";
import IconWechat from "../../assets/icons/IconWechat";
import IconAlipay from "../../assets/icons/IconAlipay";
import IconBankCard from "../../assets/icons/IconBankCard";
import IconShower from "../../assets/icons/IconShower";
import IconPot from "../../assets/icons/IconPot";
import IconDrink from "../../assets/icons/IconDrink";
import IconWater from "../../assets/icons/IconWater";
import IconHamburger from "../../assets/icons/IconHamburger";
import IconNoodles from "../../assets/icons/IconNoodles";
import IconShopping from "../../assets/icons/IconShopping";
import IconSwim from "../../assets/icons/IconSwim";
import {
	analyzeMonthlyExpenditure,
	CategorizedTransaction,
	CATEGORY_PALETTE_DARK,
	CATEGORY_PALETTE_LIGHT,
	classifyExpenditureByKeywords,
	EXPENDITURE_CATEGORIES,
	ExpenditureCategory,
	MealPeriod,
	prepareMonthlyTransactions,
	ShowerSubCategory,
} from "../../utils/expenditureAnalysis";
import {
	buildPouchCampusPayload,
	pouchPayloadSignature,
	syncCampusPayloadToPouch,
} from "../../utils/pouchSync";
import type {RootStackParamList} from "../../components/Root";

const getTransactionIcon = (tx: CardTransaction, iconSize = 32): ReactElement => {
	if (tx.name?.includes("微信")) {
		return <IconWechat height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("支付宝")) {
		return <IconAlipay height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("中行")) {
		return <IconBankCard height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("天猫")) {
		return <IconShopping height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("淋浴") || tx.name?.includes("洗漱")) {
		return <IconShower height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("香锅")) {
		return <IconPot height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("饮水") || tx.name?.includes("开水")) {
		return <IconWater height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("饮")) {
		return <IconDrink height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("快餐")) {
		return <IconHamburger height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("牛拉")) {
		return <IconNoodles height={iconSize} width={iconSize} />;
	} else if (tx.name?.includes("游泳")) {
		return <IconSwim height={iconSize} width={iconSize} />;
	} else {
		return <IconRice height={iconSize} width={iconSize} />;
	}
};

const getCategoryIcon = (
	category: ExpenditureCategory,
	iconSize = 22,
): ReactElement => {
	switch (category) {
		case "dining":
			return <IconRice height={iconSize} width={iconSize} />;
		case "water":
			return <IconWater height={iconSize} width={iconSize} />;
		case "shower":
			return <IconShower height={iconSize} width={iconSize} />;
		case "other":
			return <IconShopping height={iconSize} width={iconSize} />;
	}
};

const getCategoryLabel = (category: ExpenditureCategory): string => {
	switch (category) {
		case "dining":
			return getStr("catDining");
		case "water":
			return getStr("catWater");
		case "shower":
			return getStr("catShower");
		case "other":
			return getStr("catOther");
	}
};

const getMealLabel = (meal: MealPeriod): string => {
	switch (meal) {
		case "breakfast":
			return getStr("mealBreakfast");
		case "lunch":
			return getStr("mealLunch");
		case "dinner":
			return getStr("mealDinner");
	}
};

const getShowerSubLabel = (sub: ShowerSubCategory): string =>
	sub === "foot" ? getStr("subShowerFoot") : getStr("subShowerBath");

const TransactionItem = ({tx}: {tx: CardTransaction}) => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);

	const sign = tx.amount > 0 ? "+" : "";

	return (
		<View
			style={{
				marginHorizontal: 16,
				flexDirection: "row",
				justifyContent: "space-between",
			}}>
			<View style={{padding: 4, marginRight: 4, alignSelf: "center"}}>
				{getTransactionIcon(tx, 32)}
			</View>
			<View style={{flex: 2, alignItems: "flex-start"}}>
				<Text style={{fontSize: 16, marginVertical: 2, color: colors.text}}>
					{tx.name}
				</Text>
				<Text style={{color: "grey", marginVertical: 2}}>
					{dayjs(tx.timestamp).format("YYYY-MM-DD HH:mm")}
				</Text>
			</View>
			<View style={{flex: 1, alignItems: "flex-end", justifyContent: "center"}}>
				<Text
					style={{
						fontSize: 20,
						color: colors.text,
						fontVariant: ["tabular-nums"],
					}}>
					{sign}
					{Math.abs(tx.amount).toFixed(2)}
				</Text>
			</View>
		</View>
	);
};

interface TxByMonth {
	year: number;
	month: number;
	income: number;
	expenditure: number;
	data: CardTransaction[];
}

type ActiveSubFilter =
	| {type: "shower"; sub: ShowerSubCategory}
	| {type: "meal"; meal: MealPeriod}
	| {type: "canteen"; canteen: string}
	| {type: "otherSub"; sub: string}
	| undefined;

const MIN_YEAR = 2023;
const EMPTY_SUBCATEGORIES: string[] = [];

const ymKey = (year: number, month: number) =>
	`${year}-${String(month).padStart(2, "0")}`;

export const ExpenditureScreen = ({
	route,
}: {
	route?: RouteProp<RootStackParamList, "Expenditure">;
}) => {
	const dispatch = useDispatch();
	const darkModeConfig = useSelector((s: State) => s.config.darkMode);
	const colorSchemeMode = useSelector((s: State) => s.config.colorSchemeMode);
	useSelector((s: State) => s.config.themePreset);
	const overrides = useSelector(
		(s: State) => s.campusCard.merchantCategoryOverrides,
	);
	const otherSubcategories = useSelector(
		(s: State) => s.campusCard.otherSubcategories ?? EMPTY_SUBCATEGORIES,
	);
	const otherMerchantSubcategories = useSelector(
		(s: State) => s.campusCard.otherMerchantSubcategories,
	);
	const campusCardBalance = useSelector((s: State) => s.campusCard.balance);

	const today = dayjs();
	const currentYear = today.year();
	const currentMonth = today.month() + 1;

	const [activeTab, setActiveTab] = useState<"list" | "analysis">(
		route?.params?.initialTab ?? "list",
	);

	useEffect(() => {
		if (route?.params?.initialTab) {
			setActiveTab(route.params.initialTab);
		}
	}, [route?.params?.initialTab]);

	const [monthCache, setMonthCache] = useState<Record<string, TxByMonth>>({});
	const monthCacheRef = useRef<Record<string, TxByMonth>>({});
	const inFlightRef = useRef<Set<string>>(new Set());

	const [listMonths, setListMonths] = useState<{year: number; month: number}[]>(
		[{year: currentYear, month: currentMonth}],
	);
	const [analysisYm, setAnalysisYm] = useState<{year: number; month: number}>({
		year: currentYear,
		month: currentMonth,
	});

	// null = Bill Analysis Home (shows ONLY the 4 top-level categories, zero subcategories).
	// Non-null = Drill-down into that parent category, revealing its subcategories.
	const [selectedCategory, setSelectedCategory] =
		useState<ExpenditureCategory | null>(null);
	const [subFilter, setSubFilter] = useState<ActiveSubFilter>(undefined);

	const [addingOtherSub, setAddingOtherSub] = useState(false);
	const [newOtherSubName, setNewOtherSubName] = useState("");

	const [editingItem, setEditingItem] = useState<
		CategorizedTransaction | undefined
	>(undefined);

	const [refreshing, setRefreshing] = useState(false);

	const [popupYear, setPopupYear] = useState<number>(currentYear);
	const [popupMonth, setPopupMonth] = useState<number>(currentMonth);

	const themeName = useColorScheme();
	const isDark = resolveIsDarkMode(colorSchemeMode, darkModeConfig, themeName);
	const {colors} = themes(themeName);
	const style = styles(themeName);
	const categoryColors = isDark
		? CATEGORY_PALETTE_DARK
		: CATEGORY_PALETTE_LIGHT;

	useEffect(() => {
		if (activeTab !== "analysis" || selectedCategory === null) {
			return;
		}
		const sub = BackHandler.addEventListener("hardwareBackPress", () => {
			setSelectedCategory(null);
			setSubFilter(undefined);
			setAddingOtherSub(false);
			return true;
		});
		return () => sub.remove();
	}, [activeTab, selectedCategory]);

	const years = useMemo(
		() =>
			Array.from(
				new Array(Math.max(1, currentYear - MIN_YEAR + 1)),
				(_, k) => k + MIN_YEAR,
			),
		[currentYear],
	);

	const months = useMemo(() => Array.from(new Array(12), (_, k) => k + 1), []);

	const fetchMonth = useCallback(
		(year: number, month: number, force = false) => {
			const key = ymKey(year, month);
			if (!force && monthCacheRef.current[key]) {
				return;
			}
			if (inFlightRef.current.has(key)) {
				return;
			}
			inFlightRef.current.add(key);
			setRefreshing(true);

			const firstDay = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
			const lastDay = firstDay.endOf("month");
			helper
				.getCampusCardTransactions(
					firstDay.format("YYYY-MM-DD"),
					lastDay.format("YYYY-MM-DD"),
					CardTransactionType.Any,
				)
				.then((transactions) => {
					const prepared = prepareMonthlyTransactions(transactions);
					const entry: TxByMonth = {
						year,
						month,
						income: prepared.income,
						expenditure: prepared.expenditure,
						data: prepared.data,
					};
					monthCacheRef.current = {
						...monthCacheRef.current,
						[key]: entry,
					};
					setMonthCache((prev) => ({...prev, [key]: entry}));
				})
				.catch(NetworkRetry)
				.then(() => {
					inFlightRef.current.delete(key);
					if (inFlightRef.current.size === 0) {
						setRefreshing(false);
					}
				});
		},
		[],
	);

	useEffect(() => {
		const tail = listMonths[listMonths.length - 1];
		if (tail) {
			fetchMonth(tail.year, tail.month);
		}
	}, [listMonths, fetchMonth]);

	useEffect(() => {
		if (activeTab === "analysis") {
			fetchMonth(analysisYm.year, analysisYm.month);
		}
	}, [activeTab, analysisYm, fetchMonth]);

	const txList = useMemo(
		() =>
			listMonths
				.map(({year, month}) => monthCache[ymKey(year, month)])
				.filter((section): section is TxByMonth => section !== undefined),
		[listMonths, monthCache],
	);

	const currentAnalysisMonth =
		monthCache[ymKey(analysisYm.year, analysisYm.month)];
	const currentCalendarMonth = monthCache[ymKey(currentYear, currentMonth)];
	const lastSyncedSigRef = useRef<string>("");

	const analysis = useMemo(
		() =>
			analyzeMonthlyExpenditure(
				currentAnalysisMonth?.data ?? [],
				overrides,
				otherSubcategories,
				otherMerchantSubcategories,
				getStr("otherCanteen"),
			),
		[
			currentAnalysisMonth,
			overrides,
			otherSubcategories,
			otherMerchantSubcategories,
		],
	);

	// Silently broadcast structured monthly campus summary to Pouch whenever data or custom categories update
	useEffect(() => {
		const targetMonth =
			activeTab === "analysis" ? currentAnalysisMonth : currentCalendarMonth;
		if (!targetMonth) {
			return;
		}
		const targetAnalysis =
			activeTab === "analysis"
				? analysis
				: analyzeMonthlyExpenditure(
						targetMonth.data,
						overrides,
						otherSubcategories,
						otherMerchantSubcategories,
						getStr("otherCanteen"),
				  );
		const payload = buildPouchCampusPayload(
			targetMonth.year,
			targetMonth.month,
			targetMonth.data,
			targetAnalysis,
			campusCardBalance,
		);
		const sig = pouchPayloadSignature(payload);
		if (sig === lastSyncedSigRef.current) {
			return;
		}
		lastSyncedSigRef.current = sig;
		syncCampusPayloadToPouch(payload, Platform.OS, NativeModules.PouchSync);
	}, [
		activeTab,
		currentAnalysisMonth,
		currentCalendarMonth,
		analysis,
		overrides,
		otherSubcategories,
		otherMerchantSubcategories,
		campusCardBalance,
	]);

	const handleManualSyncToPouch = useCallback(async () => {
		if (!currentAnalysisMonth) {
			return;
		}
		const payload = buildPouchCampusPayload(
			currentAnalysisMonth.year,
			currentAnalysisMonth.month,
			currentAnalysisMonth.data,
			analysis,
			campusCardBalance,
		);
		lastSyncedSigRef.current = pouchPayloadSignature(payload);
		const res = await syncCampusPayloadToPouch(
			payload,
			Platform.OS,
			NativeModules.PouchSync,
		);
		const msg =
			res === "synced"
				? getStr("syncToPouchSuccess")
				: res === "not_installed"
				  ? getStr("syncToPouchNotInstalled")
				  : getStr("syncToPouchFailed");
		Snackbar.show({
			text: msg,
			duration: Snackbar.LENGTH_SHORT,
		});
	}, [currentAnalysisMonth, analysis, campusCardBalance]);

	const activeParentStat = useMemo(
		() =>
			selectedCategory
				? analysis.categories.find((c) => c.category === selectedCategory)
				: undefined,
		[analysis.categories, selectedCategory],
	);

	const filteredItems = useMemo(() => {
		if (selectedCategory === null) {
			return analysis.items;
		}
		const parentItems = analysis.items.filter(
			(item) => item.category === selectedCategory,
		);
		if (!subFilter) {
			return parentItems;
		}
		switch (subFilter.type) {
			case "shower":
				return parentItems.filter(
					(item) => item.showerSubCategory === subFilter.sub,
				);
			case "meal":
				return parentItems.filter(
					(item) => item.mealPeriod === subFilter.meal,
				);
			case "canteen":
				return parentItems.filter(
					(item) => item.canteen === subFilter.canteen,
				);
			case "otherSub":
				if (subFilter.sub === "__uncategorized__") {
					return parentItems.filter((item) => !item.otherSubCategory);
				}
				return parentItems.filter(
					(item) => item.otherSubCategory === subFilter.sub,
				);
		}
	}, [analysis.items, selectedCategory, subFilter]);

	const nonZeroCategories = useMemo(
		() => analysis.categories.filter((c) => c.amount > 0),
		[analysis.categories],
	);

	const canGoPrevMonth =
		analysisYm.year > MIN_YEAR ||
		(analysisYm.year === MIN_YEAR && analysisYm.month > 1);
	const canGoNextMonth =
		analysisYm.year < currentYear ||
		(analysisYm.year === currentYear && analysisYm.month < currentMonth);

	const stepAnalysisMonth = (delta: -1 | 1) => {
		setSubFilter(undefined);
		setAnalysisYm((prev) => {
			let nextYear = prev.year;
			let nextMonth = prev.month + delta;
			if (nextMonth < 1) {
				nextYear -= 1;
				nextMonth = 12;
			} else if (nextMonth > 12) {
				nextYear += 1;
				nextMonth = 1;
			}
			return {year: nextYear, month: nextMonth};
		});
	};

	const renderMonthWheelContent = (baseYear: number, baseMonth: number) => (
		<View style={{flexDirection: "row"}}>
			<ScrollPicker
				style={{flex: 1}}
				dataSource={years}
				selectedIndex={Math.max(0, years.indexOf(baseYear))}
				renderItem={(data) => (
					<Text style={{color: colors.fontB1, fontSize: 20}} key={data}>
						{data}
					</Text>
				)}
				onValueChange={(_, selectedIndex) => {
					setPopupYear(years[selectedIndex]);
				}}
				wrapperHeight={200}
				wrapperBackground={colors.contentBackground}
				itemHeight={48}
				highlightColor={colors.themeGrey}
				highlightBorderWidth={1}
			/>
			<ScrollPicker
				style={{flex: 1}}
				dataSource={months}
				selectedIndex={Math.max(0, months.indexOf(baseMonth))}
				renderItem={(data) => (
					<Text style={{color: colors.fontB1, fontSize: 20}} key={data}>
						{data}
					</Text>
				)}
				onValueChange={(_, selectedIndex) => {
					setPopupMonth(months[selectedIndex]);
				}}
				wrapperHeight={200}
				wrapperBackground={colors.contentBackground}
				itemHeight={48}
				highlightColor={colors.themeGrey}
				highlightBorderWidth={1}
			/>
		</View>
	);

	const renderMonthSelectorRow = () => (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
			}}>
			<TouchableOpacity
				disabled={!canGoPrevMonth}
				hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
				style={{
					padding: 4,
					opacity: canGoPrevMonth ? 1 : 0.3,
				}}
				onPress={() => stepAnalysisMonth(-1)}>
				<IconLeft width={20} height={20} />
			</TouchableOpacity>
			<BottomPopupTriggerView
				style={{
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 8,
					paddingVertical: 4,
				}}
				popupTitle={`${popupYear} 年 ${popupMonth} 月`}
				popupOnTriggered={() => {
					setPopupYear(analysisYm.year);
					setPopupMonth(analysisYm.month);
				}}
				popupContent={renderMonthWheelContent(
					analysisYm.year,
					analysisYm.month,
				)}
				popupCanFulfill={true}
				popupOnFulfilled={() => {
					setSubFilter(undefined);
					setAnalysisYm({year: popupYear, month: popupMonth});
					fetchMonth(popupYear, popupMonth);
				}}
				popupOnCancelled={() => {}}>
				<Text
					style={{
						color: colors.text,
						fontSize: 16,
						fontWeight: "600",
					}}>
					{analysisYm.year} 年 {analysisYm.month} 月
				</Text>
				<IconDown height={18} width={18} />
			</BottomPopupTriggerView>
			<TouchableOpacity
				disabled={!canGoNextMonth}
				hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
				style={{
					padding: 4,
					opacity: canGoNextMonth ? 1 : 0.3,
				}}
				onPress={() => stepAnalysisMonth(1)}>
				<IconRight width={20} height={20} />
			</TouchableOpacity>
		</View>
	);

	const renderSubStatRow = ({
		rowKey,
		label,
		count,
		percentage,
		amount,
		accentColor,
		selected,
		onPress,
		onDelete,
	}: {
		rowKey: string;
		label: string;
		count: number;
		percentage: number;
		amount: number;
		accentColor: string;
		selected: boolean;
		onPress: () => void;
		onDelete?: () => void;
	}) => (
		<TouchableOpacity
			key={rowKey}
			style={{
				flexDirection: "row",
				alignItems: "center",
				paddingVertical: 10,
				paddingHorizontal: 8,
				borderRadius: 8,
				backgroundColor: selected ? colors.themeBackground : "transparent",
			}}
			onPress={onPress}>
			<View
				style={{
					width: 8,
					height: 8,
					borderRadius: 2,
					backgroundColor: accentColor,
					marginRight: 10,
				}}
			/>
			<Text
				style={{
					flex: 1,
					color: colors.text,
					fontSize: 14,
					fontWeight: selected ? "600" : "400",
				}}
				numberOfLines={1}>
				{label}
			</Text>
			<Text
				style={{
					color: colors.fontB2,
					fontSize: 12,
					marginRight: 10,
					fontVariant: ["tabular-nums"],
				}}>
				{count} {getStr("txCountUnit")}
			</Text>
			<Text
				style={{
					color: colors.fontB2,
					fontSize: 12,
					width: 50,
					textAlign: "right",
					marginRight: 8,
					fontVariant: ["tabular-nums"],
				}}>
				{percentage.toFixed(1)}%
			</Text>
			<Text
				style={{
					color: colors.text,
					fontSize: 14,
					fontWeight: "600",
					minWidth: 70,
					textAlign: "right",
					fontVariant: ["tabular-nums"],
				}}>
				￥{amount.toFixed(2)}
			</Text>
			{onDelete && (
				<TouchableOpacity
					hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
					style={{marginLeft: 10, paddingHorizontal: 4}}
					onPress={onDelete}>
					<Text style={{color: colors.statusWarning, fontSize: 12}}>
						{getStr("delete")}
					</Text>
				</TouchableOpacity>
			)}
		</TouchableOpacity>
	);

	const submitNewOtherSubcategory = () => {
		const trimmed = newOtherSubName.trim();
		if (trimmed) {
			dispatch(addOtherSubcategory(trimmed));
		}
		setNewOtherSubName("");
		setAddingOtherSub(false);
	};

	return (
		<View style={{flex: 1, backgroundColor: colors.themeBackground}}>
			{/* Top Segmented Switcher */}
			<View
				style={{
					backgroundColor: colors.contentBackground,
					paddingHorizontal: 16,
					paddingVertical: 10,
					borderBottomWidth: 0.5,
					borderBottomColor: colors.themeGrey,
				}}>
				<View
					style={{
						flexDirection: "row",
						backgroundColor: colors.themeBackground,
						borderRadius: 8,
						padding: 3,
					}}>
					{(["list", "analysis"] as const).map((tab) => {
						const active = activeTab === tab;
						return (
							<TouchableOpacity
								key={tab}
								style={{
									flex: 1,
									paddingVertical: 7,
									borderRadius: 6,
									alignItems: "center",
									backgroundColor: active
										? colors.contentBackground
										: "transparent",
								}}
								onPress={() => setActiveTab(tab)}>
								<Text
									style={{
										fontSize: 14,
										fontWeight: active ? "600" : "400",
										color: active ? colors.themePurple : colors.fontB2,
									}}>
									{getStr(
										tab === "list" ? "expenditureList" : "billAnalysis",
									)}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			</View>

			{activeTab === "list" ? (
				<SectionList
					sections={txList}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => {
								setListMonths([{year: currentYear, month: currentMonth}]);
								fetchMonth(currentYear, currentMonth, true);
							}}
							colors={[colors.accent]}
							progressBackgroundColor={colors.contentBackground}
						/>
					}
					onEndReached={() => {
						if (!refreshing && listMonths.length > 0) {
							setListMonths((prev) => {
								const last = prev[prev.length - 1];
								const next =
									last.month <= 1
										? {year: last.year - 1, month: 12}
										: {year: last.year, month: last.month - 1};
								if (next.year < MIN_YEAR) {
									return prev;
								}
								if (
									prev.some(
										(m) => m.year === next.year && m.month === next.month,
									)
								) {
									return prev;
								}
								return [...prev, next];
							});
						}
					}}
					stickySectionHeadersEnabled={true}
					renderSectionHeader={({section}) => (
						<View
							style={{
								padding: 8,
								backgroundColor: colors.contentBackground,
							}}>
							<BottomPopupTriggerView
								style={{
									flexDirection: "row",
									alignItems: "center",
									marginLeft: 8,
								}}
								popupTitle={`${popupYear} 年 ${popupMonth} 月`}
								popupOnTriggered={() => {
									setPopupYear(section.year);
									setPopupMonth(section.month);
								}}
								popupContent={renderMonthWheelContent(
									section.year,
									section.month,
								)}
								popupCanFulfill={true}
								popupOnFulfilled={() => {
									setListMonths([{year: popupYear, month: popupMonth}]);
									setAnalysisYm({year: popupYear, month: popupMonth});
									fetchMonth(popupYear, popupMonth);
								}}
								popupOnCancelled={() => {}}>
								<Text style={{color: colors.text, fontSize: 16}}>
									{section.year} 年 {section.month} 月
								</Text>
								<IconDown height={18} width={18} />
							</BottomPopupTriggerView>
							<Text style={{color: colors.fontB2, fontSize: 14, marginLeft: 8}}>
								{getStr("outgo")} ￥ {section.expenditure.toFixed(2)}
								{"  "}
								{getStr("income")} ￥ {section.income.toFixed(2)}
							</Text>
						</View>
					)}
					renderItem={({item, index}) => (
						<View key={item.id}>
							{index > 0 && <View style={style.separator} />}
							<TransactionItem tx={item} />
						</View>
					)}
					contentContainerStyle={{
						backgroundColor: colors.contentBackground,
						padding: 16,
					}}
				/>
			) : (
				<FlatList
					data={filteredItems}
					keyExtractor={(item, idx) => `${item.tx.id}-${idx}`}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => {
								fetchMonth(analysisYm.year, analysisYm.month, true);
							}}
							colors={[colors.accent]}
							progressBackgroundColor={colors.contentBackground}
						/>
					}
					ListHeaderComponent={
						selectedCategory === null ? (
							/* Bill Analysis Home: ONLY the 4 top-level categories, ZERO subcategories */
							<View>
								<RoundedView
									style={{
										marginHorizontal: 12,
										marginTop: 12,
										paddingHorizontal: 16,
									}}>
									{renderMonthSelectorRow()}

									<View style={{alignItems: "center", marginVertical: 14}}>
										<Text style={{color: colors.fontB2, fontSize: 12}}>
											{getStr("monthlyOutgo")}
										</Text>
										<Text
											style={{
												color: colors.text,
												fontSize: 30,
												fontWeight: "bold",
												marginTop: 4,
											}}>
											￥{analysis.totalExpenditure.toFixed(2)}
										</Text>
										<Text
											style={{
												color: colors.fontB2,
												fontSize: 12,
												marginTop: 4,
											}}>
											{analysis.totalCount} {getStr("txCountUnit")}
											{"  ·  "}
											{getStr("income")} ￥
											{(currentAnalysisMonth?.income ?? 0).toFixed(2)}
										</Text>
										{currentAnalysisMonth !== undefined && (
											<TouchableOpacity
												style={{
													marginTop: 10,
													paddingHorizontal: 14,
													paddingVertical: 5,
													borderRadius: 14,
													borderWidth: 1,
													borderColor: colors.themePurple,
												}}
												onPress={handleManualSyncToPouch}>
												<Text
													style={{
														color: colors.themePurple,
														fontSize: 12,
														fontWeight: "600",
													}}>
													{getStr("syncToPouch")}
												</Text>
											</TouchableOpacity>
										)}
									</View>

									{/* Part-to-whole Horizontal Stacked Bar */}
									<View
										style={{
											flexDirection: "row",
											height: 14,
											borderRadius: 4,
											overflow: "hidden",
											backgroundColor:
												nonZeroCategories.length > 0
													? colors.contentBackground
													: colors.themeBackground,
											marginBottom: 14,
										}}>
										{nonZeroCategories.map((c, idx) => (
											<View
												key={c.category}
												style={{
													flex: c.amount,
													minWidth: 4,
													marginLeft: idx > 0 ? 2 : 0,
													backgroundColor: categoryColors[c.category],
												}}
											/>
										))}
									</View>

									{/* 4 Top-Level Parent Rows */}
									{analysis.categories.map((stat, idx) => (
										<View key={stat.category}>
											{idx > 0 && (
												<View
													style={{
														height: 0.5,
														backgroundColor: colors.themeGrey,
														marginVertical: 2,
													}}
												/>
											)}
											<TouchableOpacity
												style={{
													flexDirection: "row",
													alignItems: "center",
													paddingVertical: 11,
													paddingHorizontal: 6,
												}}
												onPress={() => {
													setSelectedCategory(stat.category);
													setSubFilter(undefined);
													setAddingOtherSub(false);
												}}>
												<View
													style={{
														width: 10,
														height: 10,
														borderRadius: 3,
														backgroundColor: categoryColors[stat.category],
														marginRight: 10,
													}}
												/>
												<View style={{marginRight: 8}}>
													{getCategoryIcon(stat.category, 20)}
												</View>
												<View style={{flex: 1}}>
													<Text
														style={{
															color: colors.text,
															fontSize: 15,
															fontWeight: "500",
														}}>
														{getCategoryLabel(stat.category)}
													</Text>
												</View>
												<Text
													style={{
														color: colors.fontB2,
														fontSize: 12,
														marginRight: 10,
														fontVariant: ["tabular-nums"],
													}}>
													{stat.count} {getStr("txCountUnit")}
												</Text>
												<Text
													style={{
														color: colors.fontB2,
														fontSize: 13,
														width: 52,
														textAlign: "right",
														marginRight: 8,
														fontVariant: ["tabular-nums"],
													}}>
													{stat.percentage.toFixed(1)}%
												</Text>
												<Text
													style={{
														color: colors.text,
														fontSize: 15,
														fontWeight: "600",
														minWidth: 74,
														textAlign: "right",
														marginRight: 4,
														fontVariant: ["tabular-nums"],
													}}>
													￥{stat.amount.toFixed(2)}
												</Text>
												<IconRight width={16} height={16} />
											</TouchableOpacity>
										</View>
									))}
								</RoundedView>

								<View
									style={{
										marginHorizontal: 16,
										marginTop: 18,
										marginBottom: 8,
									}}>
									<Text
										style={{
											color: colors.text,
											fontSize: 15,
											fontWeight: "600",
										}}>
										{getStr("allExpenditureDetails")}
										{` (${filteredItems.length})`}
									</Text>
									<Text
										style={{
											color: colors.fontB3,
											fontSize: 11,
											marginTop: 2,
										}}>
										{getStr("tapToChangeCategoryHint")}
									</Text>
								</View>
							</View>
						) : (
							/* Parent Category Drill-down View: Subcategories appear ONLY here */
							<View>
								<RoundedView
									style={{
										marginHorizontal: 12,
										marginTop: 12,
										paddingHorizontal: 16,
									}}>
									<TouchableOpacity
										style={{
											flexDirection: "row",
											alignItems: "center",
											alignSelf: "flex-start",
											paddingVertical: 2,
											marginBottom: 8,
										}}
										onPress={() => {
											setSelectedCategory(null);
											setSubFilter(undefined);
											setAddingOtherSub(false);
										}}>
										<IconLeft width={18} height={18} />
										<Text
											style={{
												color: colors.themePurple,
												fontSize: 14,
												fontWeight: "500",
												marginLeft: 2,
											}}>
											{getStr("backToBillOverview")}
										</Text>
									</TouchableOpacity>

									{renderMonthSelectorRow()}

									{/* Focused Parent Headline */}
									<View style={{alignItems: "center", marginVertical: 12}}>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
											}}>
											<View
												style={{
													width: 10,
													height: 10,
													borderRadius: 3,
													backgroundColor: categoryColors[selectedCategory],
													marginRight: 6,
												}}
											/>
											<Text
												style={{
													color: colors.fontB1,
													fontSize: 14,
													fontWeight: "600",
												}}>
												{getCategoryLabel(selectedCategory)}
											</Text>
										</View>
										<Text
											style={{
												color: colors.text,
												fontSize: 28,
												fontWeight: "bold",
												marginTop: 4,
											}}>
											￥{(activeParentStat?.amount ?? 0).toFixed(2)}
										</Text>
										<Text
											style={{
												color: colors.fontB2,
												fontSize: 12,
												marginTop: 4,
											}}>
											{activeParentStat?.count ?? 0} {getStr("txCountUnit")}
											{"  ·  "}
											{(activeParentStat?.percentage ?? 0).toFixed(1)}%
										</Text>
									</View>

									{/* Washing ("洗漱") Subcategories: Shower (>0.16) & Foot Wash (<=0.16) */}
									{selectedCategory === "shower" && (
										<View style={{marginTop: 4}}>
											<Text
												style={{
													color: colors.fontB3,
													fontSize: 11,
													marginBottom: 8,
													marginLeft: 4,
												}}>
												{getStr("showerRuleHint")}
											</Text>
											{analysis.showerSubCategories.map((subStat, idx) => (
												<View key={subStat.key}>
													{idx > 0 && (
														<View
															style={{
																height: 0.5,
																backgroundColor: colors.themeGrey,
																marginVertical: 2,
															}}
														/>
													)}
													{renderSubStatRow({
														rowKey: subStat.key,
														label: getShowerSubLabel(subStat.key),
														count: subStat.count,
														percentage: subStat.percentage,
														amount: subStat.amount,
														accentColor: categoryColors.shower,
														selected:
															subFilter?.type === "shower" &&
															subFilter.sub === subStat.key,
														onPress: () =>
															setSubFilter((prev) =>
																prev?.type === "shower" &&
																prev.sub === subStat.key
																	? undefined
																	: {type: "shower", sub: subStat.key},
															),
													})}
												</View>
											))}
										</View>
									)}

									{/* Dining ("饮食") Subcategories: By Meal + By Canteen */}
									{selectedCategory === "dining" && (
										<View style={{marginTop: 4}}>
											<Text
												style={{
													color: colors.fontB2,
													fontSize: 13,
													fontWeight: "600",
													marginBottom: 4,
													marginLeft: 4,
												}}>
												{getStr("diningByMeal")}
											</Text>
											{analysis.diningMeals.map((mealStat, idx) => (
												<View key={mealStat.key}>
													{idx > 0 && (
														<View
															style={{
																height: 0.5,
																backgroundColor: colors.themeGrey,
																marginVertical: 2,
															}}
														/>
													)}
													{renderSubStatRow({
														rowKey: mealStat.key,
														label: getMealLabel(mealStat.key),
														count: mealStat.count,
														percentage: mealStat.percentage,
														amount: mealStat.amount,
														accentColor: categoryColors.dining,
														selected:
															subFilter?.type === "meal" &&
															subFilter.meal === mealStat.key,
														onPress: () =>
															setSubFilter((prev) =>
																prev?.type === "meal" &&
																prev.meal === mealStat.key
																	? undefined
																	: {type: "meal", meal: mealStat.key},
															),
													})}
												</View>
											))}

											<Text
												style={{
													color: colors.fontB2,
													fontSize: 13,
													fontWeight: "600",
													marginTop: 14,
													marginBottom: 4,
													marginLeft: 4,
												}}>
												{getStr("diningByCanteen")}
											</Text>
											{analysis.diningCanteens.length === 0 ? (
												<Text
													style={{
														color: colors.fontB3,
														fontSize: 13,
														paddingVertical: 8,
														marginLeft: 4,
													}}>
													{getStr("noData")}
												</Text>
											) : (
												analysis.diningCanteens.map((canteenStat, idx) => (
													<View key={canteenStat.key}>
														{idx > 0 && (
															<View
																style={{
																	height: 0.5,
																	backgroundColor: colors.themeGrey,
																	marginVertical: 2,
																}}
															/>
														)}
														{renderSubStatRow({
															rowKey: canteenStat.key,
															label: canteenStat.key,
															count: canteenStat.count,
															percentage: canteenStat.percentage,
															amount: canteenStat.amount,
															accentColor: categoryColors.dining,
															selected:
																subFilter?.type === "canteen" &&
																subFilter.canteen === canteenStat.key,
															onPress: () =>
																setSubFilter((prev) =>
																	prev?.type === "canteen" &&
																	prev.canteen === canteenStat.key
																		? undefined
																		: {
																				type: "canteen",
																				canteen: canteenStat.key,
																		  },
																),
														})}
													</View>
												))
											)}
										</View>
									)}

									{/* Other ("其他") Subcategories: User-Customizable Add / Delete */}
									{selectedCategory === "other" && (
										<View style={{marginTop: 4}}>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													justifyContent: "space-between",
													marginBottom: 6,
													marginHorizontal: 4,
												}}>
												<Text
													style={{
														color: colors.fontB2,
														fontSize: 13,
														fontWeight: "600",
													}}>
													{getStr("customSubcategories")}
												</Text>
												<TouchableOpacity
													onPress={() => setAddingOtherSub((v) => !v)}
													style={{paddingVertical: 2, paddingHorizontal: 4}}>
													<Text
														style={{
															color: colors.themePurple,
															fontSize: 13,
															fontWeight: "500",
														}}>
														+ {getStr("addSubcategory")}
													</Text>
												</TouchableOpacity>
											</View>

											{addingOtherSub && (
												<View
													style={{
														flexDirection: "row",
														alignItems: "center",
														marginBottom: 8,
														paddingHorizontal: 4,
													}}>
													<TextInput
														value={newOtherSubName}
														onChangeText={setNewOtherSubName}
														placeholder={getStr("enterSubcategoryName")}
														placeholderTextColor={colors.fontB3}
														onSubmitEditing={submitNewOtherSubcategory}
														style={{
															flex: 1,
															borderWidth: 1,
															borderColor: colors.inputBorder,
															borderRadius: 6,
															paddingHorizontal: 10,
															paddingVertical: 6,
															fontSize: 14,
															color: colors.text,
															marginRight: 8,
														}}
													/>
													<TouchableOpacity
														onPress={submitNewOtherSubcategory}
														style={{
															backgroundColor: colors.themePurple,
															paddingHorizontal: 12,
															paddingVertical: 7,
															borderRadius: 6,
														}}>
														<Text
															style={{
																color: "#FFFFFF",
																fontSize: 13,
																fontWeight: "500",
															}}>
															{getStr("add")}
														</Text>
													</TouchableOpacity>
												</View>
											)}

											{analysis.otherSubCategoryStats.length === 0 ? (
												<Text
													style={{
														color: colors.fontB3,
														fontSize: 12,
														paddingVertical: 8,
														marginLeft: 4,
													}}>
													{getStr("noCustomSubcategories")}
												</Text>
											) : (
												analysis.otherSubCategoryStats.map((subStat, idx) => (
													<View key={subStat.key}>
														{idx > 0 && (
															<View
																style={{
																	height: 0.5,
																	backgroundColor: colors.themeGrey,
																	marginVertical: 2,
																}}
															/>
														)}
														{renderSubStatRow({
															rowKey: subStat.key,
															label: subStat.isUncategorized
																? getStr("uncategorizedOther")
																: subStat.key,
															count: subStat.count,
															percentage: subStat.percentage,
															amount: subStat.amount,
															accentColor: categoryColors.other,
															selected:
																subFilter?.type === "otherSub" &&
																subFilter.sub === subStat.key,
															onPress: () =>
																setSubFilter((prev) =>
																	prev?.type === "otherSub" &&
																	prev.sub === subStat.key
																		? undefined
																		: {type: "otherSub", sub: subStat.key},
																),
															onDelete: subStat.isUncategorized
																? undefined
																: () => {
																		if (
																			subFilter?.type === "otherSub" &&
																			subFilter.sub === subStat.key
																		) {
																			setSubFilter(undefined);
																		}
																		dispatch(
																			removeOtherSubcategory(subStat.key),
																		);
																  },
														})}
													</View>
												))
											)}
										</View>
									)}
								</RoundedView>

								{/* Filtered Details Section Header inside Parent Drill-down */}
								<View
									style={{
										marginHorizontal: 16,
										marginTop: 18,
										marginBottom: 8,
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "space-between",
									}}>
									<View>
										<Text
											style={{
												color: colors.text,
												fontSize: 15,
												fontWeight: "600",
											}}>
											{`${getCategoryLabel(selectedCategory)}${getStr("categoryDetailsSuffix")}`}
											{` (${filteredItems.length})`}
										</Text>
										<Text
											style={{
												color: colors.fontB3,
												fontSize: 11,
												marginTop: 2,
											}}>
											{getStr("tapToChangeCategoryHint")}
										</Text>
									</View>
									{subFilter !== undefined && (
										<TouchableOpacity
											onPress={() => setSubFilter(undefined)}
											style={{paddingVertical: 4, paddingHorizontal: 8}}>
											<Text
												style={{
													color: colors.themePurple,
													fontSize: 13,
													fontWeight: "500",
												}}>
												{getStr("showAll")}
											</Text>
										</TouchableOpacity>
									)}
								</View>
							</View>
						)
					}
					ListEmptyComponent={
						<RoundedView
							style={{
								marginHorizontal: 12,
								paddingHorizontal: 16,
								paddingVertical: 28,
								alignItems: "center",
							}}>
							<Text style={{color: colors.fontB2, fontSize: 14}}>
								{refreshing && !currentAnalysisMonth
									? getStr("loading")
									: getStr("noExpenditureInMonth")}
							</Text>
						</RoundedView>
					}
					renderItem={({item, index}) => {
						const isFirst = index === 0;
						const isLast = index === filteredItems.length - 1;
						let detailBadge = getCategoryLabel(item.category);
						if (selectedCategory !== null) {
							if (item.category === "shower" && item.showerSubCategory) {
								detailBadge = getShowerSubLabel(item.showerSubCategory);
							} else if (item.category === "dining" && item.canteen) {
								detailBadge = `${item.canteen}${item.mealPeriod ? ` · ${getMealLabel(item.mealPeriod)}` : ""}`;
							} else if (item.category === "other") {
								detailBadge =
									item.otherSubCategory ?? getStr("uncategorizedOther");
							}
						}
						return (
							<View
								style={{
									marginHorizontal: 12,
									backgroundColor: colors.contentBackground,
									borderTopLeftRadius: isFirst ? 12 : 0,
									borderTopRightRadius: isFirst ? 12 : 0,
									borderBottomLeftRadius: isLast ? 12 : 0,
									borderBottomRightRadius: isLast ? 12 : 0,
									paddingTop: isFirst ? 8 : 0,
									paddingBottom: isLast ? 8 : 0,
								}}>
								{!isFirst && <View style={style.separator} />}
								<TouchableOpacity
									style={{
										paddingHorizontal: 16,
										paddingVertical: 8,
										flexDirection: "row",
										alignItems: "center",
									}}
									onPress={() => setEditingItem(item)}>
									<View style={{padding: 4, marginRight: 8}}>
										{getTransactionIcon(item.tx, 28)}
									</View>
									<View style={{flex: 1, marginRight: 8}}>
										<Text
											style={{
												fontSize: 15,
												color: colors.text,
											}}
											numberOfLines={1}>
											{item.mergedMerchants && item.mergedMerchants.length > 1
												? item.mergedMerchants.join(" + ")
												: item.merchant}
										</Text>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												marginTop: 4,
												flexWrap: "wrap",
											}}>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													backgroundColor: colors.themeBackground,
													paddingHorizontal: 6,
													paddingVertical: 2,
													borderRadius: 4,
													marginRight: 8,
												}}>
												<View
													style={{
														width: 6,
														height: 6,
														borderRadius: 2,
														backgroundColor: categoryColors[item.category],
														marginRight: 4,
													}}
												/>
												<Text style={{fontSize: 11, color: colors.fontB2}}>
													{detailBadge}
													{item.mergedCount && item.mergedCount > 1
														? ` · ${getStr("mergedSwipesPrefix")}${item.mergedCount}${getStr("mergedSwipesSuffix")}`
														: ""}
													{item.isOverridden
														? ` · ${getStr("customClassified")}`
														: ""}
												</Text>
											</View>
											<Text style={{color: colors.fontB3, fontSize: 12}}>
												{dayjs(item.tx.timestamp).format("MM-DD HH:mm")}
											</Text>
										</View>
									</View>
									<Text
										style={{
											fontSize: 17,
											fontWeight: "500",
											color: colors.text,
											fontVariant: ["tabular-nums"],
										}}>
										-{Math.abs(item.tx.amount).toFixed(2)}
									</Text>
								</TouchableOpacity>
							</View>
						);
					}}
					contentContainerStyle={{paddingBottom: 24}}
				/>
			)}

			{/* Single Controlled Modal for Reclassifying a Merchant */}
			<Modal
				visible={editingItem !== undefined}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setEditingItem(undefined)}>
				<View
					style={{
						flex: 1,
						justifyContent: "flex-end",
						backgroundColor: "rgba(0, 0, 0, 0.45)",
					}}>
					<TouchableOpacity
						style={{flex: 1}}
						activeOpacity={1}
						onPress={() => setEditingItem(undefined)}
					/>
					{editingItem && (
						<View
							style={{
								backgroundColor: colors.contentBackground,
								borderTopLeftRadius: 14,
								borderTopRightRadius: 14,
								paddingHorizontal: 16,
								paddingTop: 16,
								paddingBottom: 28,
							}}>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									marginBottom: 8,
								}}>
								<Text
									style={{
										color: colors.text,
										fontSize: 17,
										fontWeight: "600",
									}}>
									{getStr("changeMerchantCategory")}
								</Text>
								<TouchableOpacity onPress={() => setEditingItem(undefined)}>
									<Text style={{color: colors.fontB2, fontSize: 15}}>
										{getStr("cancel")}
									</Text>
								</TouchableOpacity>
							</View>
							<Text
								style={{
									color: colors.fontB1,
									fontSize: 14,
									fontWeight: "500",
								}}>
								{editingItem.mergedMerchants &&
								editingItem.mergedMerchants.length > 1
									? editingItem.mergedMerchants.join(" + ")
									: editingItem.merchant}
							</Text>
							<Text
								style={{
									color: colors.fontB3,
									fontSize: 12,
									marginTop: 2,
									marginBottom: 12,
								}}>
								{getStr("changeMerchantCategoryHint")}
							</Text>

							{EXPENDITURE_CATEGORIES.map((cat, idx) => {
								const selected = editingItem.category === cat;
								return (
									<View key={cat}>
										{idx > 0 && (
											<View
												style={{
													height: 0.5,
													backgroundColor: colors.themeGrey,
												}}
											/>
										)}
										<TouchableOpacity
											style={{
												flexDirection: "row",
												alignItems: "center",
												paddingVertical: 13,
											}}
											onPress={() => {
												const targets =
													editingItem.mergedMerchants &&
													editingItem.mergedMerchants.length > 0
														? editingItem.mergedMerchants
														: editingItem.merchant
														  ? [editingItem.merchant]
														  : [];
												for (const targetMerchant of targets) {
													const autoCat = classifyExpenditureByKeywords({
														...editingItem.tx,
														name: targetMerchant,
													});
													dispatch(
														setMerchantCategoryOverride({
															merchant: targetMerchant,
															category: cat === autoCat ? undefined : cat,
														}),
													);
													if (cat !== "other") {
														dispatch(
															setOtherMerchantSubcategory({
																merchant: targetMerchant,
																subCategory: undefined,
															}),
														);
													}
												}
												setEditingItem(undefined);
											}}>
											<View
												style={{
													width: 10,
													height: 10,
													borderRadius: 3,
													backgroundColor: categoryColors[cat],
													marginRight: 10,
												}}
											/>
											<View style={{marginRight: 10}}>
												{getCategoryIcon(cat, 20)}
											</View>
											<Text
												style={{
													flex: 1,
													color: colors.text,
													fontSize: 16,
													fontWeight: selected ? "600" : "400",
												}}>
												{getCategoryLabel(cat)}
											</Text>
											{selected && <IconCheck width={20} height={20} />}
										</TouchableOpacity>
									</View>
								);
							})}

							{/* Custom Subcategory Chips for "Other" when available */}
							{otherSubcategories.length > 0 && (
								<View
									style={{
										flexDirection: "row",
										flexWrap: "wrap",
										marginTop: 6,
									}}>
									{otherSubcategories.map((sub) => {
										const subActive =
											editingItem.category === "other" &&
											editingItem.otherSubCategory === sub;
										return (
											<TouchableOpacity
												key={sub}
												style={{
													paddingHorizontal: 10,
													paddingVertical: 5,
													borderRadius: 6,
													marginRight: 8,
													marginTop: 6,
													backgroundColor: subActive
														? colors.themePurple
														: colors.themeBackground,
												}}
												onPress={() => {
													const targets =
														editingItem.mergedMerchants &&
														editingItem.mergedMerchants.length > 0
															? editingItem.mergedMerchants
															: editingItem.merchant
															  ? [editingItem.merchant]
															  : [];
													for (const targetMerchant of targets) {
														const autoCat = classifyExpenditureByKeywords({
															...editingItem.tx,
															name: targetMerchant,
														});
														dispatch(
															setMerchantCategoryOverride({
																merchant: targetMerchant,
																category:
																	autoCat === "other" ? undefined : "other",
															}),
														);
														dispatch(
															setOtherMerchantSubcategory({
																merchant: targetMerchant,
																subCategory: subActive ? undefined : sub,
															}),
														);
													}
													setEditingItem(undefined);
												}}>
												<Text
													style={{
														color: subActive ? "#FFFFFF" : colors.fontB1,
														fontSize: 12,
													}}>
													{`${getStr("catOther")} · ${sub}`}
												</Text>
											</TouchableOpacity>
										);
									})}
								</View>
							)}

							{(editingItem.isOverridden ||
								editingItem.otherSubCategory !== undefined) && (
								<TouchableOpacity
									style={{
										marginTop: 12,
										paddingVertical: 10,
										borderRadius: 8,
										backgroundColor: colors.themeBackground,
										alignItems: "center",
									}}
									onPress={() => {
										const targets =
											editingItem.mergedMerchants &&
											editingItem.mergedMerchants.length > 0
												? editingItem.mergedMerchants
												: editingItem.merchant
												  ? [editingItem.merchant]
												  : [];
										for (const targetMerchant of targets) {
											dispatch(
												setMerchantCategoryOverride({
													merchant: targetMerchant,
													category: undefined,
												}),
											);
											dispatch(
												setOtherMerchantSubcategory({
													merchant: targetMerchant,
													subCategory: undefined,
												}),
											);
										}
										setEditingItem(undefined);
									}}>
									<Text
										style={{
											color: colors.themePurple,
											fontSize: 14,
											fontWeight: "500",
										}}>
										{getStr("resetAutoCategory")}
									</Text>
								</TouchableOpacity>
							)}
						</View>
					)}
				</View>
			</Modal>
		</View>
	);
};
