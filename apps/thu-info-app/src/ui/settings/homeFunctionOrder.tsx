import {
	LayoutAnimation,
	Platform,
	ScrollView,
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
	DEFAULT_HOME_FUNCTION_ORDER,
	getVisibleHomeFunctions,
	HomeFunction,
	ManagedHomeFunction,
	moveVisibleHomeFunction,
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
	const {colors} = themes(themeName);
	const style = styles(themeName);
	const dispatch = useDispatch();

	const homeFunctionOrder = useSelector(
		(s: State) => s.config.homeFunctionOrder,
	);
	const disabledList = useSelector(
		(s: State) => s.config.homeFunctionDisabled ?? EMPTY_DISABLED,
	);

	const visibleOrder = getVisibleHomeFunctions(
		homeFunctionOrder,
		disabledList,
		Platform.OS,
	);

	const handleMove = (
		func: ManagedHomeFunction,
		action: "up" | "down" | "top",
	) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const nextOrder = moveVisibleHomeFunction(
			homeFunctionOrder,
			disabledList,
			Platform.OS,
			func,
			action,
		);
		dispatch(configSet({key: "homeFunctionOrder", value: nextOrder}));
	};

	const handleReset = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		dispatch(
			configSet({
				key: "homeFunctionOrder",
				value: [...DEFAULT_HOME_FUNCTION_ORDER],
			}),
		);
	};

	return (
		<ScrollView style={{flex: 1, padding: 12}}>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					marginHorizontal: 8,
					marginTop: 4,
				}}>
				<Text style={{color: colors.fontB2, fontSize: 13}}>
					{getStr("homeFunctionOrderTip")}
				</Text>
				<TouchableOpacity
					onPress={handleReset}
					style={{paddingVertical: 4, paddingHorizontal: 4}}>
					<Text
						style={{
							color: colors.themePurple,
							fontSize: 13,
							fontWeight: "500",
						}}>
						{getStr("resetDefaultOrder")}
					</Text>
				</TouchableOpacity>
			</View>

			<RoundedView style={[style.rounded, {marginTop: 8, paddingVertical: 8}]}>
				{visibleOrder.length === 0 ? (
					<View style={{paddingVertical: 24, alignItems: "center"}}>
						<Text style={{color: colors.fontB2}}>{getStr("emptyList")}</Text>
					</View>
				) : (
					visibleOrder.map((funcKey, index) => {
						const meta = HOME_FUNCTION_META[funcKey];
						const isFirst = index === 0;
						const isLast = index === visibleOrder.length - 1;
						return (
							<View key={funcKey}>
								{index > 0 && (
									<View
										style={[
											style.separator,
											{marginVertical: 4, marginHorizontal: 16},
										]}
									/>
								)}
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										paddingHorizontal: 14,
										paddingVertical: 8,
									}}>
									<Text
										style={{
											width: 24,
											fontSize: 13,
											color: colors.fontB3,
											fontVariant: ["tabular-nums"],
										}}>
										{index + 1}
									</Text>
									<View style={{marginRight: 10}}>{meta.renderIcon(22)}</View>
									<Text
										style={{
											flex: 1,
											fontSize: 15,
											color: colors.text,
										}}
										numberOfLines={1}>
										{getStr(meta.titleKey)}
									</Text>

									{!isFirst && (
										<TouchableOpacity
											onPress={() => handleMove(funcKey, "top")}
											style={{
												paddingHorizontal: 8,
												paddingVertical: 5,
												borderRadius: 6,
												backgroundColor: colors.themeBackground,
												marginRight: 6,
											}}>
											<Text
												style={{
													fontSize: 12,
													color: colors.themePurple,
													fontWeight: "500",
												}}>
												{getStr("pinToTop")}
											</Text>
										</TouchableOpacity>
									)}
									<TouchableOpacity
										disabled={isFirst}
										onPress={() => handleMove(funcKey, "up")}
										style={{
											paddingHorizontal: 10,
											paddingVertical: 5,
											borderRadius: 6,
											backgroundColor: colors.themeBackground,
											marginRight: 6,
											opacity: isFirst ? 0.35 : 1,
										}}>
										<Text style={{fontSize: 13, color: colors.text}}>↑</Text>
									</TouchableOpacity>
									<TouchableOpacity
										disabled={isLast}
										onPress={() => handleMove(funcKey, "down")}
										style={{
											paddingHorizontal: 10,
											paddingVertical: 5,
											borderRadius: 6,
											backgroundColor: colors.themeBackground,
											opacity: isLast ? 0.35 : 1,
										}}>
										<Text style={{fontSize: 13, color: colors.text}}>↓</Text>
									</TouchableOpacity>
								</View>
							</View>
						);
					})
				)}
			</RoundedView>
			<View style={{height: 32}} />
		</ScrollView>
	);
};
