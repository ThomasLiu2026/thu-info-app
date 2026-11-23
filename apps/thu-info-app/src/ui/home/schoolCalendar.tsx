import {
	ActivityIndicator,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {helper, State} from "../../redux/store";
import {useEffect, useState} from "react";
import themes from "../../assets/themes/themes";
import {getStr} from "../../utils/i18n";
import {BottomPopupTriggerView, RoundedView} from "../../components/views";
import IconRight from "../../assets/icons/IconRight";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import ImageViewer from "react-native-image-zoom-viewer";
import {saveImg} from "../../utils/saveImg";
import {useSelector} from "react-redux";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export const SchoolCalendar = () => {
	const semesterDescription = useSelector(
		(s: State) => s.config.semesterId,
	).split("-");

	const currentYear = parseInt(semesterDescription[1], 10);
	const [semester, setSemester] = useState(
		(semesterDescription[2] === "1" || semesterDescription[2] === "W"
			? "autumn"
			: "spring") as "autumn" | "spring",
	);

	const [src, setSrc] = useState("");
	const [year, setYear] = useState(currentYear);
	const [latestYear, setLatestYear] = useState(currentYear);
	const firstYear = latestYear - 3;
	const [yearSelection, setYearSelection] = useState(currentYear);
	const [semesterSelection, setSemesterSelection] = useState(
		semester === "autumn" ? 0 : 1,
	);
	const semesterOptions = [getStr("autumn"), getStr("spring")];
	const appLang = getStr("mark") === "CH" ? "zh" : "en";
	const [lang, setLang] = useState(appLang as "zh" | "en");
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(true);
	const [reloadKey, setReloadKey] = useState(0);

	const themeName = useColorScheme();
	const {colors} = themes(themeName);
	const insets = useSafeAreaInsets();

	useEffect(() => {
		let cancelled = false;
		helper
			.getCalendarYear()
			.then((r) => {
				if (!cancelled) {
					setLatestYear(r + 1);
				}
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(false);
		helper
			.getCalendarImageUrl(year - 1, semester, lang)
			.then((r) => {
				if (!cancelled) {
					setSrc(r);
					setLoading(false);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setError(true);
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [year, semester, lang, reloadKey]);

	return (
		<View style={{flex: 1, padding: 16, paddingBottom: 16 + insets.bottom}}>
			<RoundedView style={{marginVertical: 16, flex: 1}}>
				{loading ? (
					<View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
						<ActivityIndicator size="large" color={colors.primary} />
					</View>
				) : error ? (
					<TouchableOpacity
						style={{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							padding: 24,
						}}
						onPress={() => setReloadKey((k) => k + 1)}>
						<Text style={{color: colors.fontB2, fontSize: 15}}>
							{getStr("loadFail")}
						</Text>
					</TouchableOpacity>
				) : src !== "" ? (
					<ImageViewer
						imageUrls={[{url: src}]}
						style={{marginHorizontal: 10, borderRadius: 8}}
						backgroundColor={colors.contentBackground}
						onSave={saveImg}
						menuContext={{
							saveToLocal: getStr("saveImage"),
							cancel: getStr("cancel"),
						}}
						renderIndicator={() => <View />}
					/>
				) : null}
			</RoundedView>

			<RoundedView style={{padding: 16, marginVertical: 16}}>
				<BottomPopupTriggerView
					popupTitle={getStr("selectSemester")}
					popupContent={
						<View style={{flexDirection: "row"}}>
							<ScrollPicker
								dataSource={Array.from(
									new Array(latestYear - firstYear + 1),
									(_, k) => `${k + firstYear - 1}-${k + firstYear}`,
								)}
								selectedIndex={year - firstYear}
								renderItem={(data) => (
									<Text style={{color: colors.fontB1, fontSize: 20}} key={data}>
										{data}
									</Text>
								)}
								onValueChange={(_, index) => {
									setYearSelection(index + firstYear);
								}}
								wrapperHeight={200}
								wrapperBackground={colors.contentBackground}
								itemHeight={48}
								highlightColor={colors.themeGrey}
								highlightBorderWidth={1}
							/>
							<ScrollPicker
								dataSource={semesterOptions}
								selectedIndex={semesterSelection}
								renderItem={(_, index) => (
									<Text
										style={{color: colors.fontB1, fontSize: 20}}
										key={index}>
										{semesterOptions[index]}
									</Text>
								)}
								onValueChange={(_, index) => {
									setSemesterSelection(index);
								}}
								wrapperHeight={200}
								wrapperBackground={colors.contentBackground}
								itemHeight={48}
								highlightColor={colors.themeGrey}
								highlightBorderWidth={1}
							/>
						</View>
					}
					popupCanFulfill={true}
					popupOnFulfilled={() => {
						setYear(yearSelection);
						setSemester(semesterSelection === 0 ? "autumn" : "spring");
						setLang(appLang);
						setSrc("");
						setError(false);
					}}
					popupOnCancelled={() => {}}>
					<View style={{flexDirection: "row", alignItems: "center"}}>
						<Text style={{color: colors.fontB1, fontSize: 16, flex: 0}}>
							{getStr("selectSemester")}
						</Text>
						<View style={{flex: 1}} />
						<Text
							style={{color: colors.fontB3, fontSize: 16, flex: 0}}
							numberOfLines={1}>
							{year - 1} - {year} {getStr(semester)}
						</Text>
						<IconRight height={24} width={24} />
					</View>
				</BottomPopupTriggerView>
			</RoundedView>
		</View>
	);
};
