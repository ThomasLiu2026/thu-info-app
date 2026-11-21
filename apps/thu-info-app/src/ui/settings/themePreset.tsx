import {
	ScrollView,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import Svg, {Path} from "react-native-svg";
import themes from "../../assets/themes/themes";
import {
	DEFAULT_THEME_PRESET,
	THEME_PRESETS,
	ThemePresetId,
} from "../../assets/themes/presets";
import {State} from "../../redux/store";
import {configSet} from "../../redux/slices/config";
import {getStr} from "../../utils/i18n";
import {RoundedView} from "../../components/views";

export const ThemePresetScreen = () => {
	const themeName = useColorScheme();
	const dark = useSelector((s: State) => s.config.darkMode);
	const activePreset =
		useSelector((s: State) => s.config.themePreset) ?? DEFAULT_THEME_PRESET;
	const isDark = Boolean(dark) || themeName === "dark";
	const {colors} = themes(themeName);
	const dispatch = useDispatch();

	const handleSelect = (id: ThemePresetId) => {
		dispatch(configSet({key: "themePreset", value: id}));
	};

	return (
		<ScrollView
			style={{flex: 1, backgroundColor: colors.themeBackground}}
			contentContainerStyle={{padding: 14, paddingBottom: 36}}>
			<Text
				style={{
					color: colors.fontB2,
					fontSize: 13,
					marginHorizontal: 6,
					marginBottom: 12,
				}}>
				{getStr("themePresetTip")}
			</Text>

			{THEME_PRESETS.map((preset) => {
				const selected = activePreset === preset.id;
				const previewPalette = isDark ? preset.dark : preset.light;
				return (
					<TouchableOpacity
						key={preset.id}
						activeOpacity={0.82}
						onPress={() => handleSelect(preset.id)}
						style={{marginBottom: 12}}>
						<RoundedView
							style={{
								paddingVertical: 14,
								paddingHorizontal: 14,
								borderRadius: 16,
								borderWidth: selected ? 1.8 : 1,
								borderColor: selected
									? previewPalette.primary
									: colors.softBorder,
							}}>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
								}}>
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										flex: 1,
									}}>
									<View
										style={{
											width: 46,
											height: 46,
											borderRadius: 14,
											backgroundColor: previewPalette.heroCardBg,
											justifyContent: "flex-end",
											alignItems: "flex-end",
											padding: 6,
											marginRight: 14,
										}}>
										<View
											style={{
												width: 14,
												height: 14,
												borderRadius: 7,
												backgroundColor: previewPalette.softTintBg,
											}}
										/>
									</View>
									<View style={{flex: 1}}>
										<Text
											style={{
												fontSize: 16,
												fontWeight: "600",
												color: colors.text,
											}}>
											{getStr(preset.nameKey)}
										</Text>
										<Text
											style={{
												fontSize: 12,
												color: colors.fontB2,
												marginTop: 3,
											}}>
											{getStr(preset.descKey)}
										</Text>
									</View>
								</View>

								<View
									style={{
										width: 24,
										height: 24,
										borderRadius: 12,
										borderWidth: selected ? 0 : 1.5,
										borderColor: colors.themeGrey,
										backgroundColor: selected
											? previewPalette.primary
											: "transparent",
										alignItems: "center",
										justifyContent: "center",
										marginLeft: 10,
									}}>
									{selected && (
										<Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
											<Path
												d="M5 13l4 4L19 7"
												stroke="#FFFFFF"
												strokeWidth={2.6}
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</Svg>
									)}
								</View>
							</View>
						</RoundedView>
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
};
