import {
	ScrollView,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import themes from "../../assets/themes/themes";
import {RootNav} from "../../components/Root";
import {RoundedView} from "../../components/views";
import {getStr} from "../../utils/i18n";
import {useSelector} from "react-redux";
import {State} from "../../redux/store";
import {useNavigation} from "@react-navigation/native";

export const SportsReservationCard = () => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);

	const activeSportsReservationRecords =
		useSelector((s: State) => s.reservation.activeSportsReservationRecords) ??
		[];

	const firstRecord = activeSportsReservationRecords[0];

	const navigation = useNavigation<RootNav>();

	return (
		<RoundedView
			style={{
				alignItems: "center",
				justifyContent: "center",
			}}>
			{firstRecord === undefined ? (
				<Text style={{color: colors.text}}>
					{getStr("noActiveSportsReservationRecord")}
				</Text>
			) : (
				<>
					<Text style={{color: colors.text}}>{firstRecord.name}</Text>
					<View
						style={{
							padding: 10,
							flexDirection: "row",
							alignItems: "center",
						}}>
						<Text
							style={{
								fontSize: 20,
								fontWeight: "600",
								color: colors.text,
							}}>
							{firstRecord.field}
						</Text>
					</View>
					<Text style={{textAlign: "center", color: colors.text}}>
						{firstRecord.time}
					</Text>
					{firstRecord.payId && (
						<TouchableOpacity
							style={{
								minHeight: 44,
								paddingHorizontal: 16,
								justifyContent: "center",
							}}
							onPress={() =>
								firstRecord.payId &&
								navigation.navigate("SportsSelectTitle", {
									payId: firstRecord.payId,
								})
							}>
							<Text style={{textAlign: "center", color: colors.statusWarning}}>
								{getStr("pay")}
							</Text>
						</TouchableOpacity>
					)}
				</>
			)}
		</RoundedView>
	);
};

export const SportsScreen = () => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);

	return (
		<ScrollView style={{flex: 1}}>
			<View style={{margin: 16}}>
				<Text
					style={{
						fontWeight: "bold",
						color: colors.text,
						marginBottom: 8,
					}}>
					{getStr("alreadyReserved")}
				</Text>
				<SportsReservationCard />
			</View>
		</ScrollView>
	);
};
