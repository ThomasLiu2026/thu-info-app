import {RootNav} from "../../components/Root";
import {useColorScheme, View} from "react-native";
import {SecondaryItem, styles} from "../../components/home/secondaryItems";
import IconWasher from "../../assets/icons/IconWasher";
import IconWater from "../../assets/icons/IconWater";
import IconEleRecharge from "../../assets/icons/IconEleRecharge";
import {addUsageStat, FunctionType} from "../../utils/webApi";
import {currState} from "../../redux/store";

export const DormScreen = ({navigation}: {navigation: RootNav}) => {
	const themeName = useColorScheme();
	const style = styles(themeName);
	const disabledFunction = currState().config.homeFunctionDisabled;
	return (
		<View style={style.SecondaryRootView}>
			<View style={style.SecondaryContentView}>
				{!disabledFunction.includes("washer") && (
					<SecondaryItem
						title="washer"
						destKey="washer"
						icon={<IconWasher />}
						onPress={() => {
							addUsageStat(FunctionType.WasherInfo);
							navigation.navigate("Washer");
						}}
					/>
				)}
				{!disabledFunction.includes("qzyq") && (
					<SecondaryItem
						title="qzyq"
						destKey="qzyq"
						icon={<IconWater />}
						onPress={() => {
							addUsageStat(FunctionType.QZYQ);
							navigation.navigate("Qzyq", {ticketNumber: 0});
						}}
					/>
				)}
				{!disabledFunction.includes("electricity") && (
					<SecondaryItem
						title="electricity"
						destKey="electricity"
						icon={<IconEleRecharge />}
						onPress={() => {
							addUsageStat(FunctionType.Electricity);
							navigation.navigate("Electricity");
						}}
					/>
				)}
			</View>
		</View>
	);
};
