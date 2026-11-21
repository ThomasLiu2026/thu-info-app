import {colorLight} from "../colors/light";
import {colorDark} from "../colors/dark";
import {currState} from "../../redux/store";
import {enableEasterEgg} from "../../utils/easterEgg";
import {colorPkuDark} from "../colors/pkuDark";
import {colorPkuLight} from "../colors/pkuLight";
import {applyThemePreset} from "./presets";

export interface ColorTheme {
	primaryLight: string;
	primary: string;
	primaryDark: string;
	accent: string;
	text: string;
	contentBackground: string;
	themeBackground: string;
	inputBorder: string;
	transparent: string;

	mainTheme: string;
	fontB0: string;
	fontB1: string;
	fontB2: string;
	fontB3: string;
	statusNormal: string;
	statusDisabled: {rgb: string; alpha: number};
	statusWarning: string;
	statusWarningOpacity: string;
	statusError: string;
	themeGreen: string;
	themeBlue: string;
	themeTransparentPurple: string;
	themePurple: string;
	themeDarkPurple: string;
	themeLightPurple: string;
	themeDarkGrey: string;
	themeGrey: string;
	themeLightGrey: string;
	themeTransparentGrey: string;
	themeGold: string;
	courseItemColorList: string[];
	heroCardBg: string;
	softTintBg: string;
	softBorder: string;
	drawerPillBg: string;
}

export interface Theme {
	colors: ColorTheme;
}

export default (themeName: string | null | undefined): Theme => {
	const cfg = currState().config;
	const isDark = Boolean(cfg.darkMode) || themeName === "dark";
	const base = isDark
		? enableEasterEgg()
			? colorPkuDark
			: colorDark
		: enableEasterEgg()
		? colorPkuLight
		: colorLight;
	return {
		colors: applyThemePreset(base, cfg.themePreset, isDark),
	};
};
