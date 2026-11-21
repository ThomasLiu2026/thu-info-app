import {useState} from "react";
import {getStr} from "../../utils/i18n";
import {RootNav, RootStackParamList} from "../../components/Root";
import {helper, State} from "../../redux/store";
import {
	Alert,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
	Platform,
	ScrollView,
	StyleSheet,
} from "react-native";
import {Snackbar} from "react-native-snackbar";
import {setDormPassword} from "../../redux/slices/credentials";
import {login, logout} from "../../redux/slices/auth";
import {RoundedView} from "../../components/views";
import themedStyles from "../../utils/themedStyles";
import IconRight from "../../assets/icons/IconRight";
import VersionNumber from "react-native-version-number";
import themes from "../../assets/themes/themes";
import {useDispatch, useSelector} from "react-redux";
import {
	setActiveLibBookRecord,
	setActiveSportsReservationRecord,
} from "../../redux/slices/reservation";
import {setBalance} from "../../redux/slices/campusCard";
import useDetailNavigator from "../../utils/useDetailNavigator";
import {StackActions} from "@react-navigation/native";
import {
	getEffectiveColorSchemeMode,
	getThemePreset,
	resolveIsDarkMode,
} from "../../assets/themes/presets";
import {getPinnedHomeFunctions, HomeFunction} from "../../utils/homeOrder";

const EMPTY_DISABLED: HomeFunction[] = [];

const performLogout = () => {
	helper
		.logout()
		.then(() =>
			Snackbar.show({
				text: getStr("logoutSuccessful"),
				duration: Snackbar.LENGTH_SHORT,
			}),
		)
		.catch(() =>
			Snackbar.show({
				text: getStr("logoutFailed"),
				duration: Snackbar.LENGTH_SHORT,
			}),
		);
};

export const SettingsScreen = ({navigation}: {navigation: RootNav}) => {
	const themeName = useColorScheme();
	const dark = useSelector((s: State) => s.config.darkMode);
	const colorSchemeMode = useSelector((s: State) => s.config.colorSchemeMode);
	const themePreset = useSelector((s: State) => s.config.themePreset);
	const homePinnedFunctions = useSelector(
		(s: State) => s.config.homePinnedFunctions,
	);
	const homeFunctionDisabled = useSelector(
		(s: State) => s.config.homeFunctionDisabled ?? EMPTY_DISABLED,
	);
	const style = styles(themeName);
	const theme = themes(themeName);
	const darkModeHook = resolveIsDarkMode(colorSchemeMode, dark, themeName);
	const activeMode = getEffectiveColorSchemeMode(colorSchemeMode, dark);
	const modeLabel =
		activeMode === "dark"
			? getStr("darkModeLabel")
			: activeMode === "light"
			? getStr("lightModeLabel")
			: getStr("followSystemLabel");
	const {userId, password} = useSelector((s: State) => s.auth);
	const dispatch = useDispatch();
	const detailNavigator = useDetailNavigator();
	const activePreset = getThemePreset(themePreset);
	const pinnedCount = getPinnedHomeFunctions(
		homePinnedFunctions,
		homeFunctionDisabled,
		Platform.OS,
	).filter((f) => f !== "campusCard").length;

	const handleNavigate = (name: keyof RootStackParamList) => {
		if (detailNavigator) {
			detailNavigator.dispatch(
				StackActions.replace(name, {
					disableAnimation: true,
				}),
			);
		} else {
			navigation.navigate(name);
		}
	};

	const [forceLoginDisabled, setForceLoginDisabled] = useState(false);
	return (
		<ScrollView style={{backgroundColor: theme.colors.themeBackground}}>
			<View
				style={{flex: 1, padding: 12}}
				key={`${String(darkModeHook)}-${String(themePreset)}`}>
				<RoundedView style={style.rounded}>
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("Account")}>
						<Text style={style.text}>{getStr("accountAndSecurity")}</Text>
						<IconRight height={20} width={20} />
					</TouchableOpacity>
				</RoundedView>
				<RoundedView style={style.rounded}>
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("HomeFunctionOrder")}>
						<Text style={style.text}>{getStr("commonAppsManagement")}</Text>
						<View style={{flexDirection: "row", alignItems: "center"}}>
							<Text style={[style.version, {fontSize: 14, marginRight: 4}]}>
								{`${pinnedCount}${getStr("itemsCountSuffix")}`}
							</Text>
							<IconRight height={20} width={20} />
						</View>
					</TouchableOpacity>
					<View style={style.separator} />
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("ThemePreset")}>
						<Text style={style.text}>{getStr("themeColorPreset")}</Text>
						<View style={{flexDirection: "row", alignItems: "center"}}>
							<View
								style={{
									width: 10,
									height: 10,
									borderRadius: 5,
									backgroundColor: activePreset.swatch,
									marginRight: 6,
								}}
							/>
							<Text style={[style.version, {fontSize: 14, marginRight: 4}]}>
								{`${getStr(activePreset.nameKey)} · ${modeLabel}`}
							</Text>
							<IconRight height={20} width={20} />
						</View>
					</TouchableOpacity>
					<View style={style.separator} />
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("FunctionManagement")}>
						<Text style={style.text}>{getStr("functionManagement")}</Text>
						<IconRight height={20} width={20} />
					</TouchableOpacity>
					<View style={style.separator} />
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("General")}>
						<Text style={style.text}>{getStr("general")}</Text>
						<IconRight height={20} width={20} />
					</TouchableOpacity>
				</RoundedView>
				<RoundedView style={style.rounded}>
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("Privacy")}>
						<Text style={style.text}>{getStr("privacy")}</Text>
						<IconRight height={20} width={20} />
					</TouchableOpacity>
					<View style={style.separator} />
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("HelpAndFeedback")}>
						<Text style={style.text}>{getStr("helpAndFeedback")}</Text>
						<IconRight height={20} width={20} />
					</TouchableOpacity>
					<View style={style.separator} />
					<TouchableOpacity
						style={style.touchable}
						onPress={() => handleNavigate("About")}>
						<Text style={style.text}>{getStr("aboutApp")}</Text>
						<View style={{flexDirection: "row", alignItems: "center"}}>
							<Text style={style.version}>
								{getStr("version")} {VersionNumber.appVersion}
							</Text>
							<IconRight height={20} width={20} />
						</View>
					</TouchableOpacity>
				</RoundedView>
				<View style={{flex: 1}} />
				<RoundedView style={style.rounded}>
					<TouchableOpacity
						style={style.touchable}
						onPress={async () => {
							setForceLoginDisabled(true);
							try {
								Snackbar.show({
									text: getStr("processing"),
									duration: Snackbar.LENGTH_SHORT,
								});
								try {
									await helper.logout();
								} catch {}
								dispatch(login({userId, password}));
								await helper.login({userId, password});
								Snackbar.show({
									text: getStr("success"),
									duration: Snackbar.LENGTH_SHORT,
								});
							} catch (e: any) {
								Snackbar.show({
									text: getStr("networkRetry") + e?.message,
									duration: Snackbar.LENGTH_SHORT,
								});
							}
							setForceLoginDisabled(false);
						}}
						disabled={forceLoginDisabled}>
						<Text style={[style.text, {textAlign: "center", flex: 1}]}>
							{helper.userId ? getStr("forceLogin") : getStr("login")}
						</Text>
					</TouchableOpacity>
				</RoundedView>
				{helper.userId && (
					<RoundedView style={style.rounded}>
						<TouchableOpacity
							style={style.touchable}
							onPress={() => {
								Alert.alert(
									getStr("logout"),
									getStr("confirmLogout"),
									[
										...(Platform.OS === "android" || Platform.OS === "ios"
											? [{text: getStr("cancel")}]
											: []),
										{
											text: getStr("no"),
											onPress: () => {
												performLogout();
												dispatch(logout());
											},
										},
										{
											text: getStr("yes"),
											onPress: () => {
												helper.userId = "";
												helper.password = "";
												performLogout();
												dispatch(logout());
												dispatch(setDormPassword(""));
												dispatch(setActiveLibBookRecord([]));
												dispatch(setActiveSportsReservationRecord([]));
												dispatch(setBalance(0));
											},
										},
									],
									{cancelable: true},
								);
							}}>
							<Text
								style={[
									style.text,
									{
										textAlign: "center",
										flex: 1,
										color: theme.colors.statusWarning,
									},
								]}>
								{getStr("logout")}
							</Text>
						</TouchableOpacity>
					</RoundedView>
				)}
				<View style={{height: 80}} />
			</View>
		</ScrollView>
	);
};

export const styles = themedStyles(({colors}) => ({
	rounded: {
		marginTop: 16,
	},
	touchable: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
	},
	text: {
		color: colors.text,
		fontSize: 16,
	},
	version: {
		color: colors.fontB3,
		fontSize: 16,
	},
	separator: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.themeGrey,
		marginVertical: 12,
		marginHorizontal: 16,
	},
}));
