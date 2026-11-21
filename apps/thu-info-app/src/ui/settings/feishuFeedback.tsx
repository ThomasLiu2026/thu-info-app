import {KeyboardAvoidingView, Platform} from "react-native";
import {useColorScheme} from "react-native";
import themes from "../../assets/themes/themes";
import {resolveIsDarkMode} from "../../assets/themes/presets";
import {WebView} from "react-native-webview";
import VersionNumber from "react-native-version-number";
import DeviceInfo from "react-native-device-info";
import {useSelector} from "react-redux";
import {State} from "../../redux/store";

export const FeishuFeedbackScreen = () => {
	const themeName = useColorScheme();
	const dark = useSelector((s: State) => s.config.darkMode);
	const colorSchemeMode = useSelector((s: State) => s.config.colorSchemeMode);
	useSelector((s: State) => s.config.themePreset);
	const {colors} = themes(themeName);
	const isDark = resolveIsDarkMode(colorSchemeMode, dark, themeName);

	const osVersion = `${Platform.OS} ${Platform.Version}`;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{flex: 1}}>
			<WebView
				forceDarkOn={isDark}
				style={{
					backgroundColor: colors.themeBackground,
					color: colors.text,
				}}
				setSupportMultipleWindows={false}
				source={{
					uri: "https://thu-info.feishu.cn/share/base/form/shrcnf5hn4C4Dy91Gkhl0t9gouc",
				}}
				injectedJavaScript={`
function inject_autoFill() {
    e = document.querySelector("#field-item-fldWP4XSFc div[contenteditable=true]");
    if (e === null) return false;
    e.focus();
    document.execCommand("insertText", false, "${VersionNumber.appVersion}");
    e.contentEditable = false;

    e = document.querySelector("#field-item-fldKYBkoZ4 div[contenteditable=true]");
    if (e === null) return false;
    e.focus();
    document.execCommand("insertText", false, "${osVersion}");
    e.contentEditable = false;

    e = document.querySelector("#field-item-fldUfa9jMZ div[contenteditable=true]");
    if (e === null) return false;
    e.focus();
    document.execCommand("insertText", false, \`${DeviceInfo.getModel()}\`);
    e.contentEditable = false;

    return true;
}

function inject_retry() {
    if (!inject_autoFill()) {
        setTimeout(inject_retry, 100);
    }
}

localStorage.clear();
inject_retry();
true;
			`}
				onMessage={() => {}}
			/>
		</KeyboardAvoidingView>
	);
};
