import type {ColorTheme} from "./themes";

export type ColorSchemeMode = "system" | "light" | "dark";

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
	contentBackground?: string;
	text?: string;
	fontB1?: string;
	fontB2?: string;
	themeGrey?: string;
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

export const getEffectiveColorSchemeMode = (
	mode: string | undefined,
	legacyDarkMode: boolean | undefined,
): ColorSchemeMode => {
	if (mode === "system" || mode === "light" || mode === "dark") {
		return mode;
	}
	return legacyDarkMode === true ? "dark" : "system";
};

export const resolveIsDarkMode = (
	mode: string | undefined,
	legacyDarkMode: boolean | undefined,
	systemThemeName: string | null | undefined,
): boolean => {
	const effective = getEffectiveColorSchemeMode(mode, legacyDarkMode);
	if (effective === "dark") {
		return true;
	}
	if (effective === "light") {
		return false;
	}
	return systemThemeName === "dark";
};

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
			primary: "#B578E0",
			primaryDark: "#3E0558",
			mainTheme: "#7A3CC9",
			themePurple: "#A560D4",
			themeDarkPurple: "#C994EE",
			themeLightPurple: "#B578DE",
			themeTransparentPurple: "#9A4EC46A",
			themeBackground: "#0E0D12",
			contentBackground: "#1A1820",
			text: "#F2F0F7",
			fontB1: "#DCD8E6",
			fontB2: "#9F99AE",
			themeGrey: "#2F2A3B",
			heroCardBg: "#4F1964",
			softTintBg: "#281D33",
			softBorder: "#3A2C4A",
			drawerPillBg: "#211A2B",
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
			primary: "#6BA0EE",
			primaryDark: "#10284D",
			mainTheme: "#3B6CB8",
			themePurple: "#5B92E5",
			themeDarkPurple: "#8AB6F5",
			themeLightPurple: "#7DA7E8",
			themeTransparentPurple: "#5B92E55A",
			themeBackground: "#0C1016",
			contentBackground: "#151C26",
			text: "#EEF3FA",
			fontB1: "#D3DFEE",
			fontB2: "#95A4BA",
			themeGrey: "#263345",
			heroCardBg: "#183B6E",
			softTintBg: "#1A283D",
			softBorder: "#293D5B",
			drawerPillBg: "#162336",
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
			primary: "#58BA93",
			primaryDark: "#112E22",
			mainTheme: "#2D7A5C",
			themePurple: "#4BA883",
			themeDarkPurple: "#7ACDB0",
			themeLightPurple: "#68B897",
			themeTransparentPurple: "#4BA8835A",
			themeBackground: "#0B110E",
			contentBackground: "#141E1A",
			text: "#EDF5F1",
			fontB1: "#D1E2DA",
			fontB2: "#92A89F",
			themeGrey: "#23362E",
			heroCardBg: "#183E30",
			softTintBg: "#182D24",
			softBorder: "#264438",
			drawerPillBg: "#152720",
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
			primary: "#E29548",
			primaryDark: "#452307",
			mainTheme: "#A86320",
			themePurple: "#D98A3C",
			themeDarkPurple: "#F0B16D",
			themeLightPurple: "#E09A52",
			themeTransparentPurple: "#D98A3C5A",
			themeBackground: "#120F0C",
			contentBackground: "#1E1914",
			text: "#F7F2EC",
			fontB1: "#E4D9CC",
			fontB2: "#ABA092",
			themeGrey: "#382E24",
			heroCardBg: "#62340D",
			softTintBg: "#302216",
			softBorder: "#4A3522",
			drawerPillBg: "#281D13",
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
			primary: "#B4BCCB",
			primaryDark: "#191C22",
			mainTheme: "#5E6675",
			themePurple: "#9EA7B8",
			themeDarkPurple: "#D6DCE8",
			themeLightPurple: "#A6B0C2",
			themeTransparentPurple: "#8C95A65A",
			themeBackground: "#0D0E11",
			contentBackground: "#181A20",
			text: "#F2F4F7",
			fontB1: "#D6DBE4",
			fontB2: "#99A0AE",
			themeGrey: "#2C303A",
			heroCardBg: "#2A2F3A",
			softTintBg: "#22262F",
			softBorder: "#343A46",
			drawerPillBg: "#1E222B",
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
