import {
	Alert,
	BackHandler,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {ReactElement, useEffect, useState} from "react";
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
import {updateAnnouncements} from "../../redux/slices/announcement";
import {setBalance} from "../../redux/slices/campusCard";
import {gt} from "semver";
import VersionNumber from "react-native-version-number";
import Svg, {Path} from "react-native-svg";
import {InfoHelper} from "@thu-info/lib";
import useDetailNavigator from "../../utils/useDetailNavigator";
import {RoundedView} from "../../components/views";
import {styles as settingsStyles} from "../settings/settings";
import dayjs from "dayjs";
import {
	getVisibleHomeFunctions,
	HomeFunction,
	ManagedHomeFunction,
} from "../../utils/homeOrder";

export type {HomeFunction, ManagedHomeFunction};

const EMPTY_DISABLED: HomeFunction[] = [];

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
	const theme = themes(themeName);
	const settingStyle = settingsStyles(themeName);
	const dispatch = useDispatch();
	const dark = useSelector((s: State) => s.config.darkMode);
	const darkModeHook = dark || themeName === "dark";
	const detailNavigator = useDetailNavigator();

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

	const disabledList = useSelector(
		(state: State) => state.config.homeFunctionDisabled ?? EMPTY_DISABLED,
	);
	const homeFunctionOrder = useSelector(
		(state: State) => state.config.homeFunctionOrder,
	);

	const visibleFunctions = getVisibleHomeFunctions(
		homeFunctionOrder,
		disabledList,
		Platform.OS,
	);

	const fingerprintSecure: boolean | undefined = useSelector(
		(state: State) => state.config.fingerprintSecure,
	);

	const privacy312 = useSelector((s: State) => s.config.privacy312);

	const doNotRemindSemver =
		useSelector((s: State) => s.config.doNotRemindSemver) ?? "0.0.0";
	const latestVersion =
		useSelector((s: State) => s.config.latestVersion) ?? "3.0.0";
	const newVersionAvailable =
		gt(latestVersion, VersionNumber.appVersion) &&
		gt(latestVersion, doNotRemindSemver);
	const [updateBannerDismissed, setUpdateBannerDismissed] = useState(false);
	const showUpdateBanner = newVersionAvailable && !updateBannerDismissed;

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
					latestVersion: remoteLatest,
					latestAnnounces,
				}) => {
					dispatch(setActiveLibBookRecord(bookingRecords));
					dispatch(setActiveSportsReservationRecord(sportsReservationRecords));
					dispatch(setCrTimetable(crTimetable));
					dispatch(
						configSet({
							key: "latestVersion",
							value: remoteLatest.versionName,
						}),
					);
					dispatch(updateAnnouncements(latestAnnounces));
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

	return (
		<View style={{flex: 1, paddingTop: getStatusBarHeight()}}>
			{showUpdateBanner && (
				<View
					style={{
						position: "absolute",
						top: getStatusBarHeight(),
						left: 12,
						right: 12,
						zIndex: 10,
						backgroundColor: theme.colors.contentBackground,
						borderRadius: 8,
						paddingVertical: 12,
						paddingHorizontal: 14,
						...Platform.select({
							ios: {
								shadowColor: "#B8A9D4",
								shadowOffset: {width: 0, height: 0},
								shadowOpacity: 0.45,
								shadowRadius: 14,
							},
							android: {elevation: 8},
						}),
					}}>
					<TouchableOpacity
						hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
						style={{position: "absolute", right: 10, top: 10, zIndex: 1}}
						onPress={() => setUpdateBannerDismissed(true)}>
						<Text
							style={{
								fontSize: 20,
								color: theme.colors.text,
								lineHeight: 24,
							}}>
							×
						</Text>
					</TouchableOpacity>
					<Text
						style={{
							color: theme.colors.text,
							fontSize: 16,
							fontWeight: "600",
							paddingRight: 28,
							marginBottom: 8,
						}}>
						{getStr("updateBannerTitle")}
					</Text>
					<TouchableOpacity
						style={{
							alignSelf: "flex-end",
							flexDirection: "row",
							alignItems: "center",
							gap: 4,
						}}
						onPress={() =>
							navigation.navigate("About", {openCheckUpdate: true})
						}>
						<Text
							style={{
								color: theme.colors.primaryLight,
								fontSize: 14,
							}}>
							{getStr("updateBannerDetailLink")}
						</Text>
						<Svg viewBox="0 0 24 24" width={14} height={14} fill="none">
							<Path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={3}
								stroke={theme.colors.primaryLight}
								d="M9 6L15 12L9 18"
							/>
						</Svg>
					</TouchableOpacity>
				</View>
			)}
			<ScrollView
				style={{
					backgroundColor: theme.colors.themeBackground,
				}}
				contentContainerStyle={showUpdateBanner ? {paddingTop: 76} : undefined}
				key={String(darkModeHook)}>
				<HomeReservationSection />
				<View style={{marginHorizontal: 12, marginTop: 12}}>
					<RoundedView style={{paddingVertical: 8}}>
						{visibleFunctions.length === 0 ? (
							<View
								style={{
									paddingVertical: 24,
									alignItems: "center",
									justifyContent: "center",
								}}>
								<Text style={{color: theme.colors.fontB2}}>
									{getStr("emptyList")}
								</Text>
							</View>
						) : (
							visibleFunctions.map((funcKey, index) => {
								const meta = HOME_FUNCTION_META[funcKey];
								return (
									<View key={funcKey}>
										{index > 0 && (
											<View
												style={[
													settingStyle.separator,
													{marginVertical: 4, marginHorizontal: 16},
												]}
											/>
										)}
										<TouchableOpacity
											testID={"HomeItem-" + funcKey}
											style={{
												flexDirection: "row",
												alignItems: "center",
												paddingHorizontal: 16,
												paddingVertical: 11,
											}}
											onPress={() => {
												dispatch(top5Update(funcKey));
												meta.onTrigger(navigateWithDetail);
											}}>
											<View style={{marginRight: 14}}>
												{meta.renderIcon(26)}
											</View>
											<Text
												style={{
													flex: 1,
													fontSize: 16,
													color: theme.colors.text,
												}}>
												{getStr(meta.titleKey)}
											</Text>
											<Text
												style={{
													fontSize: 12,
													color: theme.colors.fontB3,
													marginRight: 6,
												}}>
												{getStr(meta.groupKey)}
											</Text>
											<IconRight width={18} height={18} />
										</TouchableOpacity>
									</View>
								);
							})
						)}
					</RoundedView>
				</View>
				<View style={{height: 20}} />
			</ScrollView>
		</View>
	);
};

const styles = themedStyles((theme) => ({
	SectionContainer: {
		marginHorizontal: 12,
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
		marginTop: 18,
		marginLeft: 12,
		marginBottom: 8,
		fontWeight: "bold",
		color: theme.colors.text,
	},
}));
