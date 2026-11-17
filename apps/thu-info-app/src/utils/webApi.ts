import {currState, helper} from "../redux/store";

export enum FunctionType {
	PhysicalExam,
	TeachingEvaluation,
	Report,
	Classrooms,
	Library,
	GymnasiumReg,
	PrivateRooms,
	Expenditures,
	Bank,
	Invoice,
	WasherInfo,
	QZYQ,
	DormScore,
	Electricity,
	NetworkDetail,
	OnlineDevices,
	SchoolCalendar,
	CampusCard,
	Income,
	DeepSeek,
	Home,
	News,
	Schedule,
	DeepSeekCreate,
	DeepSeekSend,
	DeepSeekSendRAG,
	DeepSeekCopy,
	DeepSeekRetry,
	DeepSeekJump,
}

export const addUsageStat = async (func: FunctionType) => {
	helper.appUsageStat(func.valueOf(), currState().config.uuid).catch(() => {});
};
