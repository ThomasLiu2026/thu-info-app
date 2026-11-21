import "./utils/extensions";
import {Provider, useSelector} from "react-redux";
import {navigationRef, persistor, State, store} from "./redux/store";
import {PersistGate} from "redux-persist/integration/react";
import {useRef} from "react";
import {
	DefaultTheme,
	NavigationContainer,
	NavigationContainerRef,
	NavigationIndependentTree,
} from "@react-navigation/native";
import {Dimensions, StatusBar, useColorScheme} from "react-native";
import themes from "./assets/themes/themes";
import {DigitalPasswordScreen} from "./ui/settings/digitalPassword";
import {Root} from "./components/Root";
import {SplitViewProvider} from "./components/SplitView";
import DeviceInfo from "react-native-device-info";

const RootComponent = () => {
	const themeName = useColorScheme();
	const dark = useSelector((s: State) => s.config.darkMode);
	// Subscribe to themePreset so NavigationContainer & StatusBar update live.
	useSelector((s: State) => s.config.themePreset);
	const theme = themes(themeName);
	const darkModeHook = Boolean(dark) || themeName === "dark";

	const appLocked = useSelector((s: State) => s.config.appLocked);
	const tabletMode = useSelector((s: State) => s.config.tabletMode);

	const detailNavigationContainerRef = useRef<NavigationContainerRef<{}>>(null);

	const windowWidth = Dimensions.get("window").width;
	const showDetail = windowWidth >= 400;
	const splitEnabled = (tabletMode ?? false) && DeviceInfo.isTablet();

	return (
		<>
			<StatusBar
				barStyle={darkModeHook ? "light-content" : "dark-content"}
				backgroundColor={theme.colors.themeBackground}
				animated
			/>
			<SplitViewProvider
				splitEnabled={splitEnabled}
				detailNavigationContainerRef={
					showDetail ? detailNavigationContainerRef : null
				}
				showDetail={showDetail}>
				<NavigationContainer
					ref={navigationRef}
					theme={{
						...DefaultTheme,
						colors: {
							...DefaultTheme.colors,
							primary: theme.colors.themePurple,
							text: theme.colors.text,
							background: theme.colors.themeBackground,
							card: theme.colors.contentBackground,
							border: darkModeHook ? "#2A2A2A" : DefaultTheme.colors.border,
						},
					}}>
					{appLocked === true ? (
						<DigitalPasswordScreen
							navigation={undefined}
							// @ts-ignore
							route={{params: {action: "verify"}}}
						/>
					) : (
						<Root showRootTabs />
					)}
				</NavigationContainer>
				{splitEnabled && (
					<NavigationIndependentTree>
						<NavigationContainer
							ref={detailNavigationContainerRef}
							theme={{
								...DefaultTheme,
								colors: {
									...DefaultTheme.colors,
									primary: theme.colors.themePurple,
									text: theme.colors.text,
									background: theme.colors.themeBackground,
									card: theme.colors.contentBackground,
									border: darkModeHook
										? "white"
										: DefaultTheme.colors.border,
								},
							}}>
							<Root showRootTabs={false} />
						</NavigationContainer>
					</NavigationIndependentTree>
				)}
			</SplitViewProvider>
		</>
	);
};

export const App = () => {
	return (
		<Provider store={store}>
			<PersistGate persistor={persistor}>
				<RootComponent />
			</PersistGate>
		</Provider>
	);
};
