import {useEffect, useMemo, useRef, useState} from "react";
import {
	Animated,
	LayoutAnimation,
	PanResponder,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	UIManager,
	useColorScheme,
	View,
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {getStr} from "../../utils/i18n";
import {State} from "../../redux/store";
import themes from "../../assets/themes/themes";
import {RoundedView} from "../../components/views";
import {styles} from "./settings";
import {configSet} from "../../redux/slices/config";
import {HOME_FUNCTION_META} from "../home/home";
import IconHamburgerMenu from "../../assets/icons/IconHamburgerMenu";
import {
	DEFAULT_HOME_FUNCTION_ORDER,
	getVisibleHomeFunctions,
	HomeFunction,
	ManagedHomeFunction,
	moveVisibleHomeFunction,
	reorderVisibleHomeFunction,
} from "../../utils/homeOrder";

if (
	Platform.OS === "android" &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EMPTY_DISABLED: HomeFunction[] = [];
const ROW_HEIGHT = 52;

const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(max, value));

interface DraggableRowProps {
	funcKey: ManagedHomeFunction;
	index: number;
	totalCount: number;
	dragIndex: number | null;
	hoverIndex: number | null;
	dragY: Animated.Value;
	onDragStart: (index: number) => void;
	onDragMove: (index: number, dy: number) => void;
	onDragEnd: () => void;
	onButtonMove: (
		func: ManagedHomeFunction,
		action: "up" | "down" | "top",
	) => void;
}

const DraggableOrderRow = ({
	funcKey,
	index,
	totalCount,
	dragIndex,
	hoverIndex,
	dragY,
	onDragStart,
	onDragMove,
	onDragEnd,
	onButtonMove,
}: DraggableRowProps) => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);
	const meta = HOME_FUNCTION_META[funcKey];

	const callbacksRef = useRef({
		index,
		onDragStart,
		onDragMove,
		onDragEnd,
	});

	useEffect(() => {
		callbacksRef.current = {
			index,
			onDragStart,
			onDragMove,
			onDragEnd,
		};
	}, [index, onDragStart, onDragMove, onDragEnd]);

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				onPanResponderTerminationRequest: () => false,
				onShouldBlockNativeResponder: () => true,
				onPanResponderGrant: () => {
					callbacksRef.current.onDragStart(callbacksRef.current.index);
				},
				onPanResponderMove: (_evt, gestureState) => {
					callbacksRef.current.onDragMove(
						callbacksRef.current.index,
						gestureState.dy,
					);
				},
				onPanResponderRelease: () => {
					callbacksRef.current.onDragEnd();
				},
				onPanResponderTerminate: () => {
					callbacksRef.current.onDragEnd();
				},
			}),
		[],
	);

	const isDraggingThis = dragIndex === index;
	const isAnyDragging = dragIndex !== null && hoverIndex !== null;

	let siblingShiftY = 0;
	let displayRank = index + 1;
	if (isAnyDragging && dragIndex !== null && hoverIndex !== null) {
		if (isDraggingThis) {
			displayRank = hoverIndex + 1;
		} else if (index > dragIndex && index <= hoverIndex) {
			siblingShiftY = -ROW_HEIGHT;
			displayRank = index;
		} else if (index < dragIndex && index >= hoverIndex) {
			siblingShiftY = ROW_HEIGHT;
			displayRank = index + 2;
		}
	}

	const isFirst = index === 0;
	const isLast = index === totalCount - 1;

	return (
		<Animated.View
			style={[
				{
					height: ROW_HEIGHT,
					flexDirection: "row",
					alignItems: "center",
					paddingRight: 12,
					backgroundColor: isDraggingThis
						? colors.themeBackground
						: colors.contentBackground,
					borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
					borderBottomColor: colors.themeGrey,
					zIndex: isDraggingThis ? 100 : 1,
				},
				isDraggingThis
					? {
							transform: [{translateY: dragY}, {scale: 1.02}],
							...Platform.select({
								ios: {
									shadowColor: "#000000",
									shadowOffset: {width: 0, height: 4},
									shadowOpacity: 0.18,
									shadowRadius: 8,
								},
								android: {elevation: 6},
							}),
					  }
					: siblingShiftY !== 0
					? {transform: [{translateY: siblingShiftY}]}
					: undefined,
			]}>
			{/* Drag Handle */}
			<View
				{...panResponder.panHandlers}
				style={{
					height: ROW_HEIGHT,
					paddingLeft: 14,
					paddingRight: 10,
					justifyContent: "center",
					alignItems: "center",
				}}>
				<View style={{opacity: isDraggingThis ? 1 : 0.5}}>
					<IconHamburgerMenu width={18} height={18} />
				</View>
			</View>

			<Text
				style={{
					width: 22,
					fontSize: 13,
					color: isDraggingThis ? colors.themePurple : colors.fontB3,
					fontWeight: isDraggingThis ? "600" : "400",
					fontVariant: ["tabular-nums"],
				}}>
				{displayRank}
			</Text>
			<View style={{marginRight: 10}}>{meta.renderIcon(22)}</View>
			<Text
				style={{
					flex: 1,
					fontSize: 15,
					color: colors.text,
					fontWeight: isDraggingThis ? "600" : "400",
				}}
				numberOfLines={1}>
				{getStr(meta.titleKey)}
			</Text>

			{!isFirst && (
				<TouchableOpacity
					disabled={isAnyDragging}
					onPress={() => onButtonMove(funcKey, "top")}
					style={{
						paddingHorizontal: 8,
						paddingVertical: 5,
						borderRadius: 6,
						backgroundColor: colors.themeBackground,
						marginRight: 6,
						opacity: isAnyDragging ? 0.3 : 1,
					}}>
					<Text
						style={{
							fontSize: 12,
							color: colors.themePurple,
							fontWeight: "500",
						}}>
						{getStr("pinToTop")}
					</Text>
				</TouchableOpacity>
			)}
			<TouchableOpacity
				disabled={isFirst || isAnyDragging}
				onPress={() => onButtonMove(funcKey, "up")}
				style={{
					paddingHorizontal: 9,
					paddingVertical: 5,
					borderRadius: 6,
					backgroundColor: colors.themeBackground,
					marginRight: 6,
					opacity: isFirst || isAnyDragging ? 0.3 : 1,
				}}>
				<Text style={{fontSize: 13, color: colors.text}}>↑</Text>
			</TouchableOpacity>
			<TouchableOpacity
				disabled={isLast || isAnyDragging}
				onPress={() => onButtonMove(funcKey, "down")}
				style={{
					paddingHorizontal: 9,
					paddingVertical: 5,
					borderRadius: 6,
					backgroundColor: colors.themeBackground,
					opacity: isLast || isAnyDragging ? 0.3 : 1,
				}}>
				<Text style={{fontSize: 13, color: colors.text}}>↓</Text>
			</TouchableOpacity>
		</Animated.View>
	);
};

export const HomeFunctionOrderScreen = () => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);
	const style = styles(themeName);
	const dispatch = useDispatch();

	const homeFunctionOrder = useSelector(
		(s: State) => s.config.homeFunctionOrder,
	);
	const disabledList = useSelector(
		(s: State) => s.config.homeFunctionDisabled ?? EMPTY_DISABLED,
	);

	const visibleOrder = useMemo(
		() =>
			getVisibleHomeFunctions(homeFunctionOrder, disabledList, Platform.OS),
		[homeFunctionOrder, disabledList],
	);

	const scrollViewRef = useRef<ScrollView | null>(null);
	const dragY = useRef(new Animated.Value(0)).current;
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const dragSessionRef = useRef<{
		fromIndex: number | null;
		toIndex: number | null;
		count: number;
		homeFunctionOrder: HomeFunction[] | undefined;
		disabledList: HomeFunction[];
	}>({
		fromIndex: null,
		toIndex: null,
		count: visibleOrder.length,
		homeFunctionOrder,
		disabledList,
	});

	useEffect(() => {
		dragSessionRef.current.count = visibleOrder.length;
		dragSessionRef.current.homeFunctionOrder = homeFunctionOrder;
		dragSessionRef.current.disabledList = disabledList;
	}, [visibleOrder.length, homeFunctionOrder, disabledList]);

	const handleDragStart = (startIdx: number) => {
		scrollViewRef.current?.setNativeProps({scrollEnabled: false});
		dragSessionRef.current.fromIndex = startIdx;
		dragSessionRef.current.toIndex = startIdx;
		dragY.setValue(0);
		setDragIndex(startIdx);
		setHoverIndex(startIdx);
	};

	const handleDragMove = (startIdx: number, dy: number) => {
		const count = dragSessionRef.current.count;
		if (count <= 1) {
			return;
		}
		const minDy = -startIdx * ROW_HEIGHT;
		const maxDy = (count - 1 - startIdx) * ROW_HEIGHT;
		const clampedDy = clamp(dy, minDy, maxDy);
		dragY.setValue(clampedDy);

		const targetIdx = clamp(
			startIdx + Math.round(clampedDy / ROW_HEIGHT),
			0,
			count - 1,
		);
		if (dragSessionRef.current.toIndex !== targetIdx) {
			dragSessionRef.current.toIndex = targetIdx;
			setHoverIndex(targetIdx);
		}
	};

	const handleDragEnd = () => {
		scrollViewRef.current?.setNativeProps({scrollEnabled: true});
		const {
			fromIndex,
			toIndex,
			homeFunctionOrder: saved,
			disabledList: disabled,
		} = dragSessionRef.current;

		dragSessionRef.current.fromIndex = null;
		dragSessionRef.current.toIndex = null;
		dragY.setValue(0);
		setDragIndex(null);
		setHoverIndex(null);

		if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
			const nextOrder = reorderVisibleHomeFunction(
				saved,
				disabled,
				Platform.OS,
				fromIndex,
				toIndex,
			);
			dispatch(configSet({key: "homeFunctionOrder", value: nextOrder}));
		}
	};

	const handleButtonMove = (
		func: ManagedHomeFunction,
		action: "up" | "down" | "top",
	) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const nextOrder = moveVisibleHomeFunction(
			homeFunctionOrder,
			disabledList,
			Platform.OS,
			func,
			action,
		);
		dispatch(configSet({key: "homeFunctionOrder", value: nextOrder}));
	};

	const handleReset = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		dispatch(
			configSet({
				key: "homeFunctionOrder",
				value: [...DEFAULT_HOME_FUNCTION_ORDER],
			}),
		);
	};

	return (
		<ScrollView
			ref={scrollViewRef}
			scrollEnabled={dragIndex === null}
			style={{flex: 1, padding: 12}}>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					marginHorizontal: 8,
					marginTop: 4,
				}}>
				<Text style={{color: colors.fontB2, fontSize: 12, flex: 1}}>
					{getStr("homeFunctionOrderTip")}
				</Text>
				<TouchableOpacity
					onPress={handleReset}
					style={{paddingVertical: 4, paddingLeft: 8}}>
					<Text
						style={{
							color: colors.themePurple,
							fontSize: 13,
							fontWeight: "500",
						}}>
						{getStr("resetDefaultOrder")}
					</Text>
				</TouchableOpacity>
			</View>

			<RoundedView
				style={[
					style.rounded,
					{marginTop: 8, paddingVertical: 4, overflow: "hidden"},
				]}>
				{visibleOrder.length === 0 ? (
					<View style={{paddingVertical: 24, alignItems: "center"}}>
						<Text style={{color: colors.fontB2}}>{getStr("emptyList")}</Text>
					</View>
				) : (
					visibleOrder.map((funcKey, index) => (
						<DraggableOrderRow
							key={funcKey}
							funcKey={funcKey}
							index={index}
							totalCount={visibleOrder.length}
							dragIndex={dragIndex}
							hoverIndex={hoverIndex}
							dragY={dragY}
							onDragStart={handleDragStart}
							onDragMove={handleDragMove}
							onDragEnd={handleDragEnd}
							onButtonMove={handleButtonMove}
						/>
					))
				)}
			</RoundedView>
			<View style={{height: 32}} />
		</ScrollView>
	);
};
