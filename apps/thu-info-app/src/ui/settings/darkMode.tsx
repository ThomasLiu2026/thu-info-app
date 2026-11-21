import {getStr} from "../../utils/i18n";
import {State} from "../../redux/store";
import {Text, TouchableOpacity, useColorScheme, View} from "react-native";
import {RoundedView} from "../../components/views";
import {useDispatch, useSelector} from "react-redux";
import {styles} from "./settings";
import IconCheck from "../../assets/icons/IconCheck";
import {configSet} from "../../redux/slices/config";
import {
	ColorSchemeMode,
	getEffectiveColorSchemeMode,
} from "../../assets/themes/presets";

export const DarkModeScreen = () => {
	const themeName = useColorScheme();
	const legacyDark = useSelector((s: State) => s.config.darkMode);
	const savedMode = useSelector((s: State) => s.config.colorSchemeMode);
	useSelector((s: State) => s.config.themePreset);
	const style = styles(themeName);
	const activeMode = getEffectiveColorSchemeMode(savedMode, legacyDark);
	const dispatch = useDispatch();

	const selectMode = (mode: ColorSchemeMode) => {
		dispatch(configSet({key: "colorSchemeMode", value: mode}));
		dispatch(configSet({key: "darkMode", value: mode === "dark"}));
	};

	return (
		<View style={{flex: 1, padding: 12}}>
			<RoundedView style={style.rounded}>
				<TouchableOpacity
					style={style.touchable}
					onPress={() => selectMode("system")}>
					<Text style={style.text}>{getStr("followSystemLabel")}</Text>
					{activeMode === "system" && <IconCheck width={18} height={18} />}
				</TouchableOpacity>
				<View style={style.separator} />
				<TouchableOpacity
					style={style.touchable}
					onPress={() => selectMode("light")}>
					<Text style={style.text}>{getStr("lightModeLabel")}</Text>
					{activeMode === "light" && <IconCheck width={18} height={18} />}
				</TouchableOpacity>
				<View style={style.separator} />
				<TouchableOpacity
					style={style.touchable}
					onPress={() => selectMode("dark")}>
					<Text style={style.text}>{getStr("darkModeLabel")}</Text>
					{activeMode === "dark" && <IconCheck width={18} height={18} />}
				</TouchableOpacity>
			</RoundedView>
		</View>
	);
};
