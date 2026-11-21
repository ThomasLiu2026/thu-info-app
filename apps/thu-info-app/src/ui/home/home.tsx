import {
	Alert,
	Animated,
	BackHandler,
	Dimensions,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {ReactElement, useEffect, useMemo, useRef, useState} from "react";
import {RootNav, RootStackParamList} from "../../components/Root";
import IconReport from "../../assets/icons/IconReport";
import IconExpenditure from "../../assets/icons/IconExpenditure";
import IconClassroom from "../../assets/icons/IconClassroom";
import IconEvaluation from "../../assets/icons/IconEvaluation";
import IconLibrary from "../../assets/icons/IconLibrary";
import zh from "../../assets/translations/zh";
import {getStr} from "../../utils/i18n";
import themedStyles from "../../utils/themedStyles";
import IconWasher from "../../assets/icons/IconWasher";
import IconWater from "../../assets/icons/IconWater";
import IconSports from "../../assets/icons/IconSports";
import IconBankPayment from "../../assets/icons/IconBankPayment";
import IconInvoice from "../../assets/icons/IconInvoice";
import IconIncome from "../../assets/icons/IconIncome";
import IconEleRecharge from "../../assets/icons/IconEleRecharge";
import IconLibRoom from "../../assets/icons/IconLibRoom";
import IconCr from "../../assets/icons/IconCr";
import IconNetworkDetail from "../../assets/icons/IconNetworkDetail";
import IconNetworkOnlineDevices from "../../assets/icons/IconNetworkOnlineDevices";
import IconCalendar from "../../assets/icons/IconCalendar";
import IconRight from "../../assets/icons/IconRight";
import themes from "../../assets/themes/themes";
import {resolveIsDarkMode} from "../../assets/themes/presets";
import {useDispatch, useSelector} from "react-redux";
import {currState, helper, State} from "../../redux/store";
import {top5Update} from "../../redux/slices/top5";
import {LibraryReservationCard} from "./library";
import {
	setActiveLibBookRecord,
	setActiveSportsReservationRecord,
} from "../../redux/slices/reservation";
import {configSet} from "../../redux/slices/config";
import {addUsageStat, FunctionType} from "../../utils/webApi";
import {StackActions} from "@react-navigation/native";
import {setCrTimetable} from "../../redux/slices/timetable";
import {getStatusBarHeight} from "react-native-safearea-height";
import {setBalance} from "../../redux/slices/campusCard";
import VersionNumber from "react-native-version-number";
import Svg, {Path} from "react-native-svg";
import {InfoHelper} from "@thu-info/lib";
import useDetailNavigator from "../../utils/useDetailNavigator";
import dayjs from "dayjs";
import {
	getDrawerHomeFunctions,
	getPinnedHomeFunctions,
	HomeFunction,
	ManagedHomeFunction,
} from "../../utils/homeOrder";

export type {HomeFunction, ManagedHomeFunction};

const EMPTY_DISABLED: HomeFunction[] = [];

const DRAWER_GROUP_ORDER: readonly (keyof typeof zh)[] = [
	"reservation",
	"study",
	"seasonalFeatures",
	"campusFinance",
	"dorm",
	"network",
];

const subFunctionLocked = () => {
	const s = currState();
	const currTime = Date.now();
	const lastTime = s.config.exitTimestamp ?? 0;
	const numMinutes = (currTime - lastTime) / 1000 / 60;
	return (
		numMinutes > (s.config.appSecretLockMinutes ?? 0) &&
		s.config.subFunctionUnlocked === false
	);
};

export interface HomeFunctionMeta {
	key: ManagedHomeFunction;
	titleKey: keyof typeof zh;
	groupKey: keyof typeof zh;
	renderIcon: (size: number) => ReactElement;
	onTrigger: (
		navigate: (name: keyof RootStackParamList, params?: any) => void,
	) => void;
}

export const HOME_FUNCTION_META: Record<ManagedHomeFunction, HomeFunctionMeta> =
	{
		campusCard: {
			key: "campusCard",
			titleKey: "campusCard",
			groupKey: "campusFinance",
			renderIcon: (size) => <IconExpenditure width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.CampusCard);
				if (
					currState().config.verifyPasswordBeforeEnterFinance &&
					subFunctionLocked()
				) {
					navigate("DigitalPassword", {
						action: "verify",
						target: "CampusCard",
					});
				} else {
					navigate("CampusCard");
				}
			},
		},
		electricity: {
			key: "electricity",
			titleKey: "electricity",
			groupKey: "dorm",
			renderIcon: (size) => <IconEleRecharge width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.Electricity);
				navigate("Electricity");
			},
		},
		washer: {
			key: "washer",
			titleKey: "washer",
			groupKey: "dorm",
			renderIcon: (size) => <IconWasher width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.WasherInfo);
				navigate("Washer");
			},
		},
		qzyq: {
			key: "qzyq",
			titleKey: "qzyq",
			groupKey: "dorm",
			renderIcon: (size) => <IconWater width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.QZYQ);
				navigate("Qzyq", {ticketNumber: 0});
			},
		},
		library: {
			key: "library",
			titleKey: "library",
			groupKey: "reservation",
			renderIcon: (size) => <IconLibrary width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.Library);
				navigate("Library");
			},
		},
		libRoomBook: {
			key: "libRoomBook",
			titleKey: "libRoomBook",
			groupKey: "reservation",
			renderIcon: (size) => <IconLibRoom width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.PrivateRooms);
				navigate("LibRoomSelect");
			},
		},
		sportsBook: {
			key: "sportsBook",
			titleKey: "sportsBook",
			groupKey: "reservation",
			renderIcon: (size) => <IconSports width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.GymnasiumReg);
				navigate("Sports");
			},
		},
		report: {
			key: "report",
			titleKey: "report",
			groupKey: "study",
			renderIcon: (size) => <IconReport width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.Report);
				if (
					currState().config.verifyPasswordBeforeEnterReport &&
					subFunctionLocked()
				) {
					navigate("DigitalPassword", {
						action: "verify",
						target: "Report",
					});
				} else {
					navigate("Report");
				}
			},
		},
		classroomState: {
			key: "classroomState",
			titleKey: "classroomState",
			groupKey: "study",
			renderIcon: (size) => <IconClassroom width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.Classrooms);
				navigate("ClassroomList");
			},
		},
		cr: {
			key: "cr",
			titleKey: "courseRegistration",
			groupKey: "study",
			renderIcon: (size) => <IconCr width={size} height={size} />,
			onTrigger: (navigate) => {
				navigate("CrHome");
			},
		},
		teachingEvaluation: {
			key: "teachingEvaluation",
			titleKey: "teachingEvaluation",
			groupKey: "seasonalFeatures",
			renderIcon: (size) => <IconEvaluation width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.TeachingEvaluation);
				navigate("Evaluation");
			},
		},
		schoolCalendar: {
			key: "schoolCalendar",
			titleKey: "schoolCalendar",
			groupKey: "study",
			renderIcon: (size) => <IconCalendar width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.SchoolCalendar);
				navigate("SchoolCalendar");
			},
		},
		networkDetail: {
			key: "networkDetail",
			titleKey: "networkDetail",
			groupKey: "network",
			renderIcon: (size) => <IconNetworkDetail width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.NetworkDetail);
				navigate("NetworkDetail");
			},
		},
		onlineDevices: {
			key: "onlineDevices",
			titleKey: "onlineDevices",
			groupKey: "network",
			renderIcon: (size) => (
				<IconNetworkOnlineDevices width={size} height={size} />
			),
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.OnlineDevices);
				navigate("OnlineDevices");
			},
		},
		bankPayment: {
			key: "bankPayment",
			titleKey: "bankPayment",
			groupKey: "campusFinance",
			renderIcon: (size) => <IconBankPayment width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.Bank);
				if (
					currState().config.verifyPasswordBeforeEnterFinance &&
					subFunctionLocked()
				) {
					navigate("DigitalPassword", {
						action: "verify",
						target: "BankPayment",
					});
				} else {
					navigate("BankPayment");
				}
			},
		},
		invoice: {
			key: "invoice",
			titleKey: "invoice",
			groupKey: "campusFinance",
			renderIcon: (size) => <IconInvoice width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.Invoice);
				if (
					currState().config.verifyPasswordBeforeEnterFinance &&
					subFunctionLocked()
				) {
					navigate("DigitalPassword", {
						action: "verify",
						target: "Invoice",
					});
				} else {
					navigate("Invoice");
				}
			},
		},
		income: {
			key: "income",
			titleKey: "graduateIncome",
			groupKey: "campusFinance",
			renderIcon: (size) => <IconIncome width={size} height={size} />,
			onTrigger: (navigate) => {
				addUsageStat(FunctionType.Income);
				if (
					currState().config.verifyPasswordBeforeEnterFinance &&
					subFunctionLocked()
				) {
					navigate("DigitalPassword", {
						action: "verify",
						target: "Income",
					});
				} else {
					navigate("Income");
				}
			},
		},
	};

export const HomeReservationSection = () => {
	const themeName = useColorScheme();
	useSelector((s: State) => s.config.themePreset);
	useSelector((s: State) => s.config.darkMode);
	useSelector((s: State) => s.config.colorSchemeMode);
	const style = styles(themeName);
	const activeLibBookRecords = useSelector(
		(s: State) => s.reservation.activeLibBookRecords,
	);
	const hasActiveLibBooking = (activeLibBookRecords ?? []).some((e) => {
		const due = dayjs(e.time, "YYYY-MM-DD HH:mm").add(60, "minute");
		return due.valueOf() > dayjs().valueOf();
	});

	if (!hasActiveLibBooking) {
		return null;
	}

	return (
		<View style={style.SectionContainer}>
			<Text style={style.SectionTitle}>{getStr("reservation")}</Text>
			<LibraryReservationCard />
		</View>
	);
};

export const HomeScreen = ({navigation}: {navigation: RootNav}) => {
	const themeName = useColorScheme();
	const dark = useSelector((s: State) => s.config.darkMode);
	const colorSchemeMode = useSelector((s: State) => s.config.colorSchemeMode);
	const themePreset = useSelector((s: State) => s.config.themePreset);
	const theme = themes(themeName);
	const dispatch = useDispatch();
	const darkModeHook = resolveIsDarkMode(colorSchemeMode, dark, themeName);
	const detailNavigator = useDetailNavigator();

	const campusBalance = useSelector((s: State) => s.campusCard.balance ?? 0);
	const disabledList = useSelector(
		(state: State) => state.config.homeFunctionDisabled ?? EMPTY_DISABLED,
	);
	const homeFunctionOrder = useSelector(
		(state: State) => state.config.homeFunctionOrder,
	);
	const homePinnedFunctions = useSelector(
		(state: State) => state.config.homePinnedFunctions,
	);
	const fingerprintSecure: boolean | undefined = useSelector(
		(state: State) => state.config.fingerprintSecure,
	);
	const privacy312 = useSelector((s: State) => s.config.privacy312);

	const showCampusHero = !disabledList.includes("campusCard");

	const pinnedFunctions = useMemo(
		() =>
			getPinnedHomeFunctions(
				homePinnedFunctions,
				disabledList,
				Platform.OS,
			).filter((f) => !(showCampusHero && f === "campusCard")),
		[homePinnedFunctions, disabledList, showCampusHero],
	);

	const drawerFunctions = useMemo(
		() =>
			getDrawerHomeFunctions(
				homePinnedFunctions,
				homeFunctionOrder,
				disabledList,
				Platform.OS,
			).filter((f) => !(showCampusHero && f === "campusCard")),
		[homePinnedFunctions, homeFunctionOrder, disabledList, showCampusHero],
	);

	const drawerGroups = useMemo(() => {
		const map = new Map<keyof typeof zh, ManagedHomeFunction[]>();
		for (const fn of drawerFunctions) {
			const groupKey = HOME_FUNCTION_META[fn].groupKey;
			const bucket = map.get(groupKey) ?? [];
			bucket.push(fn);
			map.set(groupKey, bucket);
		}
		return DRAWER_GROUP_ORDER.filter((g) => (map.get(g)?.length ?? 0) > 0).map(
			(g) => ({
				groupKey: g,
				items: map.get(g) ?? [],
			}),
		);
	}, [drawerFunctions]);

	const drawerWidth = Math.min(
		Math.round(Dimensions.get("window").width * 0.8),
		320,
	);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const slideAnim = useRef(new Animated.Value(drawerWidth)).current;

	const openDrawer = () => {
		slideAnim.setValue(drawerWidth);
		setDrawerVisible(true);
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 220,
			useNativeDriver: true,
		}).start();
	};

	const closeDrawer = (afterClose?: () => void) => {
		Animated.timing(slideAnim, {
			toValue: drawerWidth,
			duration: 180,
			useNativeDriver: true,
		}).start(() => {
			setDrawerVisible(false);
			if (afterClose) {
				afterClose();
			}
		});
	};

	const navigateWithDetail = (
		name: keyof RootStackParamList,
		params?: RootStackParamList[typeof name],
	) => {
		if (detailNavigator) {
			detailNavigator.dispatch(
				StackActions.replace(name, {
					...(params as object),
					// @ts-ignore
					disableAnimation: true,
				}),
			);
		} else {
			// @ts-ignore
			navigation.navigate(name, params);
		}
	};

	const openCampusExpenditure = () => {
		addUsageStat(FunctionType.Expenditure);
		if (
			currState().config.verifyPasswordBeforeEnterFinance &&
			subFunctionLocked()
		) {
			navigateWithDetail("DigitalPassword", {
				action: "verify",
				target: "Expenditure",
			});
		} else {
			navigateWithDetail("Expenditure", {initialTab: "analysis"});
		}
	};

	const openCampusCard = () => {
		HOME_FUNCTION_META.campusCard.onTrigger(navigateWithDetail);
	};

	useEffect(() => {
		// @ts-ignore
		if (
			Platform.OS !== "ios" &&
			Platform.OS !== "android" &&
			Platform.OS !== "harmony"
		) {
			return;
		}
		if (
			!(Platform.OS === "android" || Platform.OS === "ios") &&
			privacy312 !== true
		) {
			Alert.alert(
				getStr("privacyPolicy"),
				getStr("privacyPolicyPrompt"),
				[
					{
						text: getStr("view"),
						onPress: () => navigation.navigate("Privacy"),
					},
					{
						text: getStr("decline"),
						onPress: () => BackHandler.exitApp(),
					},
				],
				{cancelable: false},
			);
		}
		const invalidHelper = new InfoHelper();
		invalidHelper.userId = helper.userId;
		invalidHelper.password = helper.password;
		invalidHelper.fingerprint = String(undefined);
		invalidHelper.twoFactorMethodHook = async () => {
			dispatch(configSet({key: "fingerprintSecure", value: true}));
			return undefined;
		};

		helper
			.appStartUp(Platform.OS, currState().config.uuid, VersionNumber.appVersion)
			.then(
				({
					bookingRecords,
					sportsReservationRecords,
					crTimetable,
					balance,
				}) => {
					dispatch(setActiveLibBookRecord(bookingRecords));
					dispatch(setActiveSportsReservationRecord(sportsReservationRecords));
					dispatch(setCrTimetable(crTimetable));
					dispatch(setBalance(balance));
					if (
						fingerprintSecure !== true &&
						invalidHelper.userId !== "" &&
						invalidHelper.password !== ""
					) {
						invalidHelper
							.forgetDevice()
							.then(() => {
								dispatch(configSet({key: "fingerprintSecure", value: true}));
							})
							.catch(() => {
								// no-op
							});
					}
				},
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const statusTop = getStatusBarHeight();

	return (
		<View
			style={{
				flex: 1,
				paddingTop: statusTop,
				backgroundColor: theme.colors.themeBackground,
			}}>
			{/* Top Header Bar (clean wordmark only — drawer lives at bottom below grid) */}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 18,
					paddingTop: 14,
					paddingBottom: 10,
				}}>
				<View
					style={{
						width: 34,
						height: 34,
						borderRadius: 10,
						backgroundColor: theme.colors.heroCardBg,
						alignItems: "center",
						justifyContent: "center",
						marginRight: 10,
					}}>
					<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
						<Path
							d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z M12 12l8-4.5 M12 12v9 M12 12L4 7.5"
							stroke="#FFFFFF"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</Svg>
				</View>
				<Text
					style={{
						fontSize: 20,
						fontWeight: "700",
						color: theme.colors.text,
						letterSpacing: -0.3,
					}}>
					THU Info
				</Text>
			</View>

			<ScrollView
				style={{flex: 1}}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 6,
					paddingBottom: 28,
				}}
				key={`${String(darkModeHook)}-${String(themePreset)}`}>
				{/* Campus Card Hero Card */}
				{showCampusHero && (
					<View
						style={{
							borderRadius: 22,
							backgroundColor: theme.colors.heroCardBg,
							padding: 18,
							marginBottom: 18,
							...Platform.select({
								ios: {
									shadowColor: theme.colors.heroCardBg,
									shadowOffset: {width: 0, height: 8},
									shadowOpacity: 0.24,
									shadowRadius: 16,
								},
								android: {elevation: 5},
							}),
						}}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "flex-start",
								justifyContent: "space-between",
							}}>
							<View>
								<Text
									style={{
										fontSize: 12,
										color: "rgba(255,255,255,0.82)",
										fontWeight: "500",
									}}>
									{getStr("campusCardBalanceTitle")}
								</Text>
								<Text
									style={{
										fontSize: 30,
										fontWeight: "700",
										color: "#FFFFFF",
										letterSpacing: -0.6,
										fontVariant: ["tabular-nums"],
										marginTop: 4,
									}}>
									{`¥ ${Number(campusBalance).toFixed(2)}`}
								</Text>
							</View>
							<View
								style={{
									backgroundColor: "rgba(255,255,255,0.16)",
									paddingHorizontal: 10,
									paddingVertical: 5,
									borderRadius: 999,
								}}>
								<Text
									style={{
										fontSize: 11,
										fontWeight: "600",
										color: "#FFFFFF",
									}}>
									{getStr("pouchDirectLinked")}
								</Text>
							</View>
						</View>

						<View
							style={{
								flexDirection: "row",
								marginTop: 16,
							}}>
							<TouchableOpacity
								activeOpacity={0.85}
								onPress={openCampusExpenditure}
								style={{
									flex: 1,
									minHeight: 42,
									borderRadius: 12,
									backgroundColor: "#FFFFFF",
									alignItems: "center",
									justifyContent: "center",
									marginRight: 10,
								}}>
								<Text
									style={{
										fontSize: 13,
										fontWeight: "700",
										color: theme.colors.heroCardBg,
									}}>
									{getStr("campusCardBillAction")}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								activeOpacity={0.82}
								onPress={openCampusCard}
								style={{
									flex: 1,
									minHeight: 42,
									borderRadius: 12,
									borderWidth: 1,
									borderColor: "rgba(255,255,255,0.36)",
									backgroundColor: "rgba(255,255,255,0.12)",
									alignItems: "center",
									justifyContent: "center",
								}}>
								<Text
									style={{
										fontSize: 13,
										fontWeight: "600",
										color: "#FFFFFF",
									}}>
									{getStr("campusCardRechargeAction")}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}

				<HomeReservationSection />

				{/* Pinned Common Apps Springboard Grid */}
				<View
					style={{
						paddingHorizontal: 4,
						marginBottom: 10,
					}}>
					<Text
						style={{
							fontSize: 15,
							fontWeight: "700",
							color: theme.colors.text,
						}}>
						{getStr("pinnedHomeSection")}
					</Text>
				</View>

				<View
					style={{
						backgroundColor: theme.colors.contentBackground,
						borderRadius: 22,
						borderWidth: 1,
						borderColor: theme.colors.softBorder,
						paddingVertical: 14,
						paddingHorizontal: 8,
					}}>
					{pinnedFunctions.length === 0 ? (
						<View
							style={{
								paddingVertical: 26,
								paddingHorizontal: 16,
								alignItems: "center",
							}}>
							<Text
								style={{
									fontSize: 13,
									color: theme.colors.fontB2,
									textAlign: "center",
								}}>
								{getStr("pinnedEmptyHint")}
							</Text>
						</View>
					) : (
						<View style={{flexDirection: "row", flexWrap: "wrap"}}>
							{pinnedFunctions.map((funcKey) => {
								const meta = HOME_FUNCTION_META[funcKey];
								return (
									<TouchableOpacity
										key={funcKey}
										testID={"HomeItem-" + funcKey}
										activeOpacity={0.75}
										onPress={() => {
											dispatch(top5Update(funcKey));
											meta.onTrigger(navigateWithDetail);
										}}
										style={{
											width: "33.3333%",
											alignItems: "center",
											paddingVertical: 10,
											paddingHorizontal: 4,
										}}>
										<View
											style={{
												width: 48,
												height: 48,
												borderRadius: 16,
												backgroundColor: theme.colors.softTintBg,
												alignItems: "center",
												justifyContent: "center",
												marginBottom: 8,
											}}>
											{meta.renderIcon(24)}
										</View>
										<Text
											numberOfLines={1}
											style={{
												fontSize: 12,
												fontWeight: "600",
												color: theme.colors.text,
												textAlign: "center",
											}}>
											{getStr(meta.titleKey)}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					)}
				</View>

				{/* Drawer Entry Banner */}
				{drawerFunctions.length > 0 && (
					<TouchableOpacity
						activeOpacity={0.82}
						onPress={openDrawer}
						style={{
							marginTop: 16,
							minHeight: 54,
							paddingHorizontal: 16,
							borderRadius: 16,
							borderWidth: 1,
							borderColor: theme.colors.softBorder,
							backgroundColor: theme.colors.drawerPillBg,
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
						}}>
						<View style={{flexDirection: "row", alignItems: "center"}}>
							<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
								<Path
									d="M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z"
									stroke={theme.colors.primary}
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</Svg>
							<Text
								style={{
									fontSize: 14,
									fontWeight: "600",
									color: theme.colors.text,
									marginLeft: 10,
								}}>
								{getStr("viewAllDrawerServices")}
							</Text>
						</View>
						<Text
							style={{
								fontSize: 13,
								fontWeight: "700",
								color: theme.colors.primary,
							}}>
							{`${drawerFunctions.length}${getStr("itemsCountSuffix")} →`}
						</Text>
					</TouchableOpacity>
				)}
			</ScrollView>

			{/* Right Slide-Over App Drawer */}
			<Modal
				visible={drawerVisible}
				transparent
				animationType="fade"
				onRequestClose={() => closeDrawer()}>
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						backgroundColor: "rgba(18, 12, 28, 0.38)",
					}}>
					<Pressable style={{flex: 1}} onPress={() => closeDrawer()} />
					<Animated.View
						style={{
							width: drawerWidth,
							height: "100%",
							backgroundColor: theme.colors.contentBackground,
							paddingTop: statusTop + 14,
							paddingHorizontal: 16,
							paddingBottom: 22,
							transform: [{translateX: slideAnim}],
							...Platform.select({
								ios: {
									shadowColor: "#000000",
									shadowOffset: {width: -8, height: 0},
									shadowOpacity: 0.18,
									shadowRadius: 20,
								},
								android: {elevation: 16},
							}),
						}}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								paddingBottom: 12,
								borderBottomWidth: 1,
								borderBottomColor: theme.colors.softBorder,
							}}>
							<View>
								<Text
									style={{
										fontSize: 17,
										fontWeight: "700",
										color: theme.colors.text,
									}}>
									{getStr("appDrawer")}
								</Text>
								<Text
									style={{
										fontSize: 12,
										color: theme.colors.fontB2,
										marginTop: 2,
									}}>
									{`${drawerFunctions.length}${getStr("itemsCountSuffix")}`}
								</Text>
							</View>
							<TouchableOpacity
								activeOpacity={0.75}
								onPress={() => closeDrawer()}
								style={{
									width: 38,
									height: 38,
									borderRadius: 11,
									backgroundColor: theme.colors.themeBackground,
									borderWidth: 1,
									borderColor: theme.colors.softBorder,
									alignItems: "center",
									justifyContent: "center",
								}}>
								<Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
									<Path
										d="M18 6L6 18M6 6l12 12"
										stroke={theme.colors.text}
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</Svg>
							</TouchableOpacity>
						</View>

						<ScrollView
							style={{flex: 1, marginTop: 12}}
							showsVerticalScrollIndicator={false}>
							{drawerGroups.length === 0 ? (
								<View style={{paddingVertical: 32, alignItems: "center"}}>
									<Text style={{fontSize: 13, color: theme.colors.fontB2}}>
										{getStr("drawerEmptyHint")}
									</Text>
								</View>
							) : (
								drawerGroups.map((group) => (
									<View key={group.groupKey} style={{marginBottom: 16}}>
										<Text
											style={{
												fontSize: 12,
												fontWeight: "700",
												color: theme.colors.fontB2,
												marginLeft: 4,
												marginBottom: 7,
											}}>
											{getStr(group.groupKey)}
										</Text>
										{group.items.map((funcKey) => {
											const meta = HOME_FUNCTION_META[funcKey];
											return (
												<TouchableOpacity
													key={funcKey}
													activeOpacity={0.75}
													onPress={() =>
														closeDrawer(() => {
															dispatch(top5Update(funcKey));
															meta.onTrigger(navigateWithDetail);
														})
													}
													style={{
														minHeight: 46,
														paddingHorizontal: 12,
														paddingVertical: 8,
														borderRadius: 12,
														borderWidth: 1,
														borderColor: theme.colors.softBorder,
														backgroundColor: theme.colors.themeBackground,
														flexDirection: "row",
														alignItems: "center",
														marginBottom: 7,
													}}>
													<View style={{marginRight: 10}}>
														{meta.renderIcon(20)}
													</View>
													<Text
														style={{
															flex: 1,
															fontSize: 14,
															fontWeight: "500",
															color: theme.colors.text,
														}}
														numberOfLines={1}>
														{getStr(meta.titleKey)}
													</Text>
													<IconRight width={16} height={16} />
												</TouchableOpacity>
											);
										})}
									</View>
								))
							)}
						</ScrollView>
					</Animated.View>
				</View>
			</Modal>
		</View>
	);
};

const styles = themedStyles((theme) => ({
	SectionContainer: {
		marginBottom: 14,
	},
	SectionContentContainer: {
		backgroundColor: theme.colors.contentBackground,
		shadowColor: "grey",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingTop: 8,
		paddingBottom: 16,
	},
	SectionTitle: {
		textAlign: "left",
		fontSize: 15,
		marginLeft: 4,
		marginBottom: 8,
		fontWeight: "bold",
		color: theme.colors.text,
	},
}));
