import {useMemo} from "react";
import {
	LayoutAnimation,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	UIManager,
	useColorScheme,
	View,
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {getStr} from "../../utils/i18n";
import {State} from "../../redux/store";
import themes from "../../assets/themes/themes";
import {RoundedView} from "../../components/views";
import {styles} from "./settings";
import {configSet} from "../../redux/slices/config";
import {HOME_FUNCTION_META} from "../home/home";
import {
	DEFAULT_PINNED_HOME_FUNCTIONS,
	getDrawerHomeFunctions,
	getPinnedHomeFunctions,
	HomeFunction,
	ManagedHomeFunction,
	movePinnedHomeFunction,
	pinHomeFunction,
	unpinHomeFunction,
} from "../../utils/homeOrder";

if (
	Platform.OS === "android" &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EMPTY_DISABLED: HomeFunction[] = [];

export const HomeFunctionOrderScreen = () => {
	const themeName = useColorScheme();
	useSelector((s: State) => s.config.themePreset);
	useSelector((s: State) => s.config.darkMode);
	useSelector((s: State) => s.config.colorSchemeMode);
	const {colors} = themes(themeName);
	const style = styles(themeName);
	const dispatch = useDispatch();

	const homePinnedFunctions = useSelector(
		(s: State) => s.config.homePinnedFunctions,
	);
	const homeFunctionOrder = useSelector(
		(s: State) => s.config.homeFunctionOrder,
	);
	const disabledList = useSelector(
		(s: State) => s.config.homeFunctionDisabled ?? EMPTY_DISABLED,
	);

	const pinnedList = useMemo(
		() =>
			getPinnedHomeFunctions(
				homePinnedFunctions,
				disabledList,
				Platform.OS,
			).filter((f) => f !== "campusCard"),
		[homePinnedFunctions, disabledList],
	);

	const drawerList = useMemo(
		() =>
			getDrawerHomeFunctions(
				homePinnedFunctions,
				homeFunctionOrder,
				disabledList,
				Platform.OS,
			).filter((f) => f !== "campusCard"),
		[homePinnedFunctions, homeFunctionOrder, disabledList],
	);

	const handleMove = (
		func: ManagedHomeFunction,
		action: "up" | "down" | "top",
	) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const next = movePinnedHomeFunction(
			homePinnedFunctions,
			disabledList,
			Platform.OS,
			func,
			action,
		);
		dispatch(configSet({key: "homePinnedFunctions", value: next}));
	};

	const handleUnpin = (func: ManagedHomeFunction) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const next = unpinHomeFunction(
			homePinnedFunctions,
			disabledList,
			Platform.OS,
			func,
		);
		dispatch(configSet({key: "homePinnedFunctions", value: next}));
	};

	const handlePin = (func: ManagedHomeFunction) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const next = pinHomeFunction(
			homePinnedFunctions,
			disabledList,
			Platform.OS,
			func,
		);
		dispatch(configSet({key: "homePinnedFunctions", value: next}));
	};

	const handleReset = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		dispatch(
			configSet({
				key: "homePinnedFunctions",
				value: [...DEFAULT_PINNED_HOME_FUNCTIONS],
			}),
		);
	};

	return (
		<ScrollView
			style={{flex: 1, backgroundColor: colors.themeBackground}}
			contentContainerStyle={{padding: 14, paddingBottom: 36}}>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: 14,
					paddingVertical: 11,
					borderRadius: 14,
					backgroundColor: colors.softTintBg,
					borderWidth: 1,
					borderColor: colors.softBorder,
					marginBottom: 14,
				}}>
				<Text
					style={{
						color: colors.text,
						fontSize: 12,
						lineHeight: 18,
						flex: 1,
						marginRight: 10,
					}}>
					{getStr("commonAppsTip")}
				</Text>
				<TouchableOpacity
					onPress={handleReset}
					style={{paddingVertical: 4, paddingHorizontal: 4}}>
					<Text
						style={{
							color: colors.primary,
							fontSize: 13,
							fontWeight: "600",
						}}>
						{getStr("resetDefaultOrder")}
					</Text>
				</TouchableOpacity>
			</View>

			<Text
				style={{
					fontSize: 13,
					fontWeight: "700",
					color: colors.fontB1,
					marginLeft: 6,
					marginBottom: 8,
				}}>
				{`${getStr("pinnedHomeSection")}（${pinnedList.length}）`}
			</Text>
			<RoundedView
				style={[
					style.rounded,
					{marginTop: 0, paddingVertical: 4, borderRadius: 16},
				]}>
				{pinnedList.length === 0 ? (
					<View style={{paddingVertical: 22, paddingHorizontal: 16}}>
						<Text
							style={{
								color: colors.fontB2,
								fontSize: 13,
								textAlign: "center",
							}}>
							{getStr("pinnedEmptyHint")}
						</Text>
					</View>
				) : (
					pinnedList.map((funcKey, index) => {
						const meta = HOME_FUNCTION_META[funcKey];
						const isFirst = index === 0;
						const isLast = index === pinnedList.length - 1;
						return (
							<View
								key={funcKey}
								style={{
									minHeight: 54,
									flexDirection: "row",
									alignItems: "center",
									paddingHorizontal: 14,
									paddingVertical: 8,
									borderTopWidth: isFirst ? 0 : StyleSheet.hairlineWidth,
									borderTopColor: colors.themeGrey,
								}}>
								<Text
									style={{
										width: 20,
										fontSize: 12,
										fontWeight: "700",
										color: colors.primary,
										fontVariant: ["tabular-nums"],
									}}>
									{index + 1}
								</Text>
								<View style={{marginRight: 10}}>{meta.renderIcon(22)}</View>
								<View style={{flex: 1, marginRight: 8}}>
									<Text
										style={{
											fontSize: 15,
											fontWeight: "500",
											color: colors.text,
										}}
										numberOfLines={1}>
										{getStr(meta.titleKey)}
									</Text>
									<Text
										style={{fontSize: 11, color: colors.fontB3, marginTop: 1}}>
										{getStr(meta.groupKey)}
									</Text>
								</View>
								<TouchableOpacity
									disabled={isFirst}
									onPress={() => handleMove(funcKey, "up")}
									style={{
										paddingHorizontal: 9,
										paddingVertical: 6,
										borderRadius: 8,
										backgroundColor: colors.themeBackground,
										marginRight: 6,
										opacity: isFirst ? 0.3 : 1,
									}}>
									<Text style={{fontSize: 13, color: colors.text}}>↑</Text>
								</TouchableOpacity>
								<TouchableOpacity
									disabled={isLast}
									onPress={() => handleMove(funcKey, "down")}
									style={{
										paddingHorizontal: 9,
										paddingVertical: 6,
										borderRadius: 8,
										backgroundColor: colors.themeBackground,
										marginRight: 6,
										opacity: isLast ? 0.3 : 1,
									}}>
									<Text style={{fontSize: 13, color: colors.text}}>↓</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => handleUnpin(funcKey)}
									style={{
										paddingHorizontal: 10,
										paddingVertical: 6,
										borderRadius: 8,
										backgroundColor: colors.themeBackground,
									}}>
									<Text
										style={{
											fontSize: 12,
											fontWeight: "600",
											color: colors.fontB2,
										}}>
										{getStr("moveToDrawer")}
									</Text>
								</TouchableOpacity>
							</View>
						);
					})
				)}
			</RoundedView>

			<Text
				style={{
					fontSize: 13,
					fontWeight: "700",
					color: colors.fontB1,
					marginLeft: 6,
					marginTop: 20,
					marginBottom: 8,
				}}>
				{`${getStr("drawerHiddenSection")}（${drawerList.length}）`}
			</Text>
			<RoundedView
				style={[
					style.rounded,
					{marginTop: 0, paddingVertical: 4, borderRadius: 16},
				]}>
				{drawerList.length === 0 ? (
					<View style={{paddingVertical: 22, paddingHorizontal: 16}}>
						<Text
							style={{
								color: colors.fontB2,
								fontSize: 13,
								textAlign: "center",
							}}>
							{getStr("drawerEmptyHint")}
						</Text>
					</View>
				) : (
					drawerList.map((funcKey, index) => {
						const meta = HOME_FUNCTION_META[funcKey];
						return (
							<View
								key={funcKey}
								style={{
									minHeight: 52,
									flexDirection: "row",
									alignItems: "center",
									paddingHorizontal: 14,
									paddingVertical: 8,
									borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
									borderTopColor: colors.themeGrey,
								}}>
								<View style={{marginRight: 10}}>{meta.renderIcon(22)}</View>
								<View style={{flex: 1, marginRight: 8}}>
									<Text
										style={{
											fontSize: 15,
											fontWeight: "500",
											color: colors.text,
										}}
										numberOfLines={1}>
										{getStr(meta.titleKey)}
									</Text>
									<Text
										style={{fontSize: 11, color: colors.fontB3, marginTop: 1}}>
										{getStr(meta.groupKey)}
									</Text>
								</View>
								<TouchableOpacity
									onPress={() => handlePin(funcKey)}
									style={{
										paddingHorizontal: 11,
										paddingVertical: 6,
										borderRadius: 8,
										backgroundColor: colors.softTintBg,
									}}>
									<Text
										style={{
											fontSize: 12,
											fontWeight: "600",
											color: colors.primary,
										}}>
										{`+ ${getStr("pinToHome")}`}
									</Text>
								</TouchableOpacity>
							</View>
						);
					})
				)}
			</RoundedView>
		</ScrollView>
	);
};
