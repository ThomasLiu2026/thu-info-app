import {useState} from "react";
import {getStr} from "../../utils/i18n";
import {State} from "../../redux/store";
import {
	Platform,
	ScrollView,
	Switch,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import themes from "../../assets/themes/themes";
import {configSet} from "../../redux/slices/config";
import {RoundedView} from "../../components/views";
import {styles} from "./settings";
import {HOME_FUNCTION_META} from "../home/home";
import {top5Set} from "../../redux/slices/top5";
import {
	HomeFunction,
	isFunctionSupportedOnPlatform,
	ManagedHomeFunction,
} from "../../utils/homeOrder";
import {RootNav} from "../../components/Root";
import IconRight from "../../assets/icons/IconRight";

type FunctionGroupKey =
	| "functionManagementTip"
	| "seasonalFeatures"
	| "reservation"
	| "campusFinance"
	| "dorm"
	| "network";

// Synchronized with Home: physicalExam ("体测成绩") and dormScore ("卫生成绩") removed.
const FUNCTION_GROUPS: {[key in FunctionGroupKey]: ManagedHomeFunction[]} = {
	functionManagementTip: ["report", "classroomState", "cr", "schoolCalendar"],
	seasonalFeatures: ["teachingEvaluation"],
	reservation: ["library", "sportsBook", "libRoomBook"],
	campusFinance: ["campusCard", "bankPayment", "invoice", "income"],
	dorm: ["electricity", "washer", "qzyq"],
	network: ["networkDetail", "onlineDevices"],
};

const EMPTY_DISABLED: HomeFunction[] = [];

const FunctionItem = ({
	func,
	needSeparator,
	value,
	onValueChange,
}: {
	func: ManagedHomeFunction;
	value: boolean;
	needSeparator: boolean;
	onValueChange: (value: boolean) => void;
}) => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);
	const style = styles(themeName);
	const meta = HOME_FUNCTION_META[func];
	return (
		<>
			{needSeparator && <View style={style.separator} />}
			<View style={style.touchable}>
				<View style={{flexDirection: "row", alignItems: "center", flex: 1}}>
					<View style={{marginRight: 12}}>{meta.renderIcon(22)}</View>
					<Text style={style.text}>{getStr(meta.titleKey)}</Text>
				</View>
				<Switch
					thumbColor={colors.contentBackground}
					trackColor={{true: colors.themePurple}}
					value={value}
					onValueChange={onValueChange}
				/>
			</View>
		</>
	);
};

export const FunctionManagementScreen = ({
	navigation,
}: {
	navigation: RootNav;
}) => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);
	const style = styles(themeName);

	const homeFunctionDisabled = useSelector(
		(s: State) => s.config.homeFunctionDisabled ?? EMPTY_DISABLED,
	);
	const top5 = useSelector((s: State) => s.top5.top5Functions);
	const dispatch = useDispatch();

	const [disabledFuncList, setDisabledFuncList] =
		useState<HomeFunction[]>(homeFunctionDisabled);

	const handleValueChange = (f: ManagedHomeFunction, value: boolean) => {
		if (value) {
			if (disabledFuncList.includes(f)) {
				const payload = disabledFuncList.filter((i) => i !== f);
				setDisabledFuncList(payload);
				dispatch(configSet({key: "homeFunctionDisabled", value: payload}));
			}
		} else {
			if (!disabledFuncList.includes(f)) {
				const payload = disabledFuncList.concat([f]);
				setDisabledFuncList(payload);
				dispatch(configSet({key: "homeFunctionDisabled", value: payload}));
				if (top5.includes(f)) {
					dispatch(top5Set(top5.filter((i) => i !== f)));
				}
			}
		}
	};

	const renderGroup = (name: FunctionGroupKey) => {
		const supportedItems = FUNCTION_GROUPS[name].filter((f) =>
			isFunctionSupportedOnPlatform(f, Platform.OS),
		);
		if (supportedItems.length === 0) {
			return null;
		}
		return (
			<View key={name}>
				<Text style={{marginLeft: 8, color: colors.fontB2, marginTop: 12}}>
					{getStr(name)}
				</Text>
				<RoundedView style={[style.rounded, {marginTop: 8}]}>
					{supportedItems.map((f, index) => (
						<FunctionItem
							key={f}
							func={f}
							needSeparator={index !== 0}
							value={!disabledFuncList.includes(f)}
							onValueChange={(value) => {
								handleValueChange(f, value);
							}}
						/>
					))}
				</RoundedView>
			</View>
		);
	};

	return (
		<ScrollView style={{flex: 1, padding: 12}}>
			<RoundedView style={[style.rounded, {marginTop: 4}]}>
				<TouchableOpacity
					style={style.touchable}
					onPress={() => navigation.navigate("HomeFunctionOrder")}>
					<Text style={style.text}>{getStr("homeFunctionOrder")}</Text>
					<IconRight height={20} width={20} />
				</TouchableOpacity>
			</RoundedView>
			{(Object.keys(FUNCTION_GROUPS) as FunctionGroupKey[]).map(renderGroup)}
			<View style={{height: 32}} />
		</ScrollView>
	);
};
