import type {ColorTheme} from "./themes";

export type ThemePresetId =
	| "tsinghuaPurple"
	| "shuimuBlue"
	| "pineInk"
	| "ginkgoAmber"
	| "graphiteMono";

export interface ThemePresetColors {
	primaryLight: string;
	primary: string;
	primaryDark: string;
	mainTheme: string;
	themePurple: string;
	themeDarkPurple: string;
	themeLightPurple: string;
	themeTransparentPurple: string;
	themeBackground: string;
	heroCardBg: string;
	softTintBg: string;
	softBorder: string;
	drawerPillBg: string;
}

export interface ThemePresetDefinition {
	id: ThemePresetId;
	nameKey:
		| "themeTsinghuaPurple"
		| "themeShuimuBlue"
		| "themePineInk"
		| "themeGinkgoAmber"
		| "themeGraphiteMono";
	descKey:
		| "themeTsinghuaPurpleDesc"
		| "themeShuimuBlueDesc"
		| "themePineInkDesc"
		| "themeGinkgoAmberDesc"
		| "themeGraphiteMonoDesc";
	swatch: string;
	accentPreview: string;
	light: ThemePresetColors;
	dark: ThemePresetColors;
}

export const DEFAULT_THEME_PRESET: ThemePresetId = "tsinghuaPurple";

export const THEME_PRESETS: readonly ThemePresetDefinition[] = [
	{
		id: "tsinghuaPurple",
		nameKey: "themeTsinghuaPurple",
		descKey: "themeTsinghuaPurpleDesc",
		swatch: "#671E7F",
		accentPreview: "#F3EAFB",
		light: {
			primaryLight: "#9E64FF",
			primary: "#671E7F",
			primaryDark: "#380052",
			mainTheme: "#B791F0",
			themePurple: "#7B32A8",
			themeDarkPurple: "#58176E",
			themeLightPurple: "#A883E8",
			themeTransparentPurple: "#8B55E46A",
			themeBackground: "#F8F7FA",
			heroCardBg: "#671E7F",
			softTintBg: "#F3EAFB",
			softBorder: "#E5DDF0",
			drawerPillBg: "#F2EEF8",
		},
		dark: {
			primaryLight: "#BA7EE0",
			primary: "#9A4EC4",
			primaryDark: "#3E0558",
			mainTheme: "#7A3CC9",
			themePurple: "#A560D4",
			themeDarkPurple: "#C48CEB",
			themeLightPurple: "#B578DE",
			themeTransparentPurple: "#9A4EC46A",
			themeBackground: "#0E0D11",
			heroCardBg: "#4B165E",
			softTintBg: "#271B31",
			softBorder: "#3A2B47",
			drawerPillBg: "#21192A",
		},
	},
	{
		id: "shuimuBlue",
		nameKey: "themeShuimuBlue",
		descKey: "themeShuimuBlueDesc",
		swatch: "#1D4B8F",
		accentPreview: "#E8F0FA",
		light: {
			primaryLight: "#4B83D4",
			primary: "#1D4B8F",
			primaryDark: "#102E5C",
			mainTheme: "#8AB0E8",
			themePurple: "#2860B2",
			themeDarkPurple: "#153A72",
			themeLightPurple: "#6593D6",
			themeTransparentPurple: "#2860B25A",
			themeBackground: "#F5F7FA",
			heroCardBg: "#1D4B8F",
			softTintBg: "#E8F0FA",
			softBorder: "#D6E2F2",
			drawerPillBg: "#EBF1FA",
		},
		dark: {
			primaryLight: "#7DA7E8",
			primary: "#5B92E5",
			primaryDark: "#10284D",
			mainTheme: "#3B6CB8",
			themePurple: "#5B92E5",
			themeDarkPurple: "#84B1F2",
			themeLightPurple: "#7DA7E8",
			themeTransparentPurple: "#5B92E55A",
			themeBackground: "#0C0F14",
			heroCardBg: "#163462",
			softTintBg: "#19263B",
			softBorder: "#273A57",
			drawerPillBg: "#162235",
		},
	},
	{
		id: "pineInk",
		nameKey: "themePineInk",
		descKey: "themePineInkDesc",
		swatch: "#1E4D3B",
		accentPreview: "#E6F2EC",
		light: {
			primaryLight: "#3E8B6C",
			primary: "#1E4D3B",
			primaryDark: "#102D22",
			mainTheme: "#7DC0A4",
			themePurple: "#2A6B52",
			themeDarkPurple: "#153B2C",
			themeLightPurple: "#5E9C82",
			themeTransparentPurple: "#2A6B525A",
			themeBackground: "#F5F7F6",
			heroCardBg: "#1E4D3B",
			softTintBg: "#E6F2EC",
			softBorder: "#D2E5DC",
			drawerPillBg: "#EAF3EE",
		},
		dark: {
			primaryLight: "#6BC29E",
			primary: "#4BA883",
			primaryDark: "#112E22",
			mainTheme: "#2D7A5C",
			themePurple: "#4BA883",
			themeDarkPurple: "#72C4A3",
			themeLightPurple: "#68B897",
			themeTransparentPurple: "#4BA8835A",
			themeBackground: "#0C100E",
			heroCardBg: "#15382B",
			softTintBg: "#172B23",
			softBorder: "#244035",
			drawerPillBg: "#14261F",
		},
	},
	{
		id: "ginkgoAmber",
		nameKey: "themeGinkgoAmber",
		descKey: "themeGinkgoAmberDesc",
		swatch: "#8F4D12",
		accentPreview: "#F7EDE0",
		light: {
			primaryLight: "#C77A32",
			primary: "#8F4D12",
			primaryDark: "#542B08",
			mainTheme: "#E2AA6F",
			themePurple: "#A85E1B",
			themeDarkPurple: "#703A0B",
			themeLightPurple: "#CE8A47",
			themeTransparentPurple: "#A85E1B5A",
			themeBackground: "#FAF8F5",
			heroCardBg: "#8F4D12",
			softTintBg: "#F7EDE0",
			softBorder: "#EAD8C2",
			drawerPillBg: "#F5EEE4",
		},
		dark: {
			primaryLight: "#E8A45E",
			primary: "#D98A3C",
			primaryDark: "#452307",
			mainTheme: "#A86320",
			themePurple: "#D98A3C",
			themeDarkPurple: "#EBA863",
			themeLightPurple: "#E09A52",
			themeTransparentPurple: "#D98A3C5A",
			themeBackground: "#110F0C",
			heroCardBg: "#572E0B",
			softTintBg: "#2E2115",
			softBorder: "#453220",
			drawerPillBg: "#261C12",
		},
	},
	{
		id: "graphiteMono",
		nameKey: "themeGraphiteMono",
		descKey: "themeGraphiteMonoDesc",
		swatch: "#23262E",
		accentPreview: "#ECEEF1",
		light: {
			primaryLight: "#555C6B",
			primary: "#23262E",
			primaryDark: "#111318",
			mainTheme: "#9098A8",
			themePurple: "#3A3F4B",
			themeDarkPurple: "#181A20",
			themeLightPurple: "#6C7382",
			themeTransparentPurple: "#3A3F4B5A",
			themeBackground: "#F6F7F8",
			heroCardBg: "#23262E",
			softTintBg: "#ECEEF1",
			softBorder: "#DCE0E6",
			drawerPillBg: "#EFF1F4",
		},
		dark: {
			primaryLight: "#ADB6C7",
			primary: "#8C95A6",
			primaryDark: "#191C22",
			mainTheme: "#5E6675",
			themePurple: "#9EA7B8",
			themeDarkPurple: "#CBD2DF",
			themeLightPurple: "#A6B0C2",
			themeTransparentPurple: "#8C95A65A",
			themeBackground: "#0D0E11",
			heroCardBg: "#252932",
			softTintBg: "#1E2128",
			softBorder: "#303540",
			drawerPillBg: "#1B1E25",
		},
	},
];

const PRESET_MAP: Record<ThemePresetId, ThemePresetDefinition> =
	THEME_PRESETS.reduce((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, {} as Record<ThemePresetId, ThemePresetDefinition>);

export const getThemePreset = (
	presetId: string | undefined,
): ThemePresetDefinition => {
	if (presetId && presetId in PRESET_MAP) {
		return PRESET_MAP[presetId as ThemePresetId];
	}
	return PRESET_MAP[DEFAULT_THEME_PRESET];
};

export const applyThemePreset = (
	base: Omit<
		ColorTheme,
		"heroCardBg" | "softTintBg" | "softBorder" | "drawerPillBg"
	>,
	presetId: string | undefined,
	isDark: boolean,
): ColorTheme => {
	const preset = getThemePreset(presetId);
	const override = isDark ? preset.dark : preset.light;
	return {
		...base,
		...override,
	};
};
