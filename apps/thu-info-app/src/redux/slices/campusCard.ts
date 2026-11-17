import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import type {ExpenditureCategory} from "../../utils/expenditureAnalysis";

export interface CampusCardState {
	balance: number;
	updatedAt: number;
	paymentMethod: string;
	todayRechargeAmount: number;
	lastRechargeDate: string;
	merchantCategoryOverrides?: Record<string, ExpenditureCategory>;
}

const initialState: CampusCardState = {
	balance: 0,
	updatedAt: 0,
	paymentMethod: "bank",
	todayRechargeAmount: 0,
	lastRechargeDate: "",
	merchantCategoryOverrides: {},
};

export const defaultCampusCard = initialState;

export const campusCardSlice = createSlice({
	name: "campusCard",
	initialState,
	reducers: {
		setBalance: (state, {payload}: PayloadAction<number>) => {
			state.balance = payload;
			state.updatedAt = Date.now();
		},
		setPaymentMethod: (state, {payload}: PayloadAction<string>) => {
			state.paymentMethod = payload;
		},
		updateRechargeAmount: (
			state,
			{payload}: PayloadAction<{amount: number; date: string}>,
		) => {
			if (state.lastRechargeDate === payload.date) {
				state.todayRechargeAmount += payload.amount;
			} else {
				state.todayRechargeAmount = payload.amount;
				state.lastRechargeDate = payload.date;
			}
		},
		setMerchantCategoryOverride: (
			state,
			{
				payload,
			}: PayloadAction<{
				merchant: string;
				category: ExpenditureCategory | undefined;
			}>,
		) => {
			if (!state.merchantCategoryOverrides) {
				state.merchantCategoryOverrides = {};
			}
			if (payload.category === undefined) {
				delete state.merchantCategoryOverrides[payload.merchant];
			} else {
				state.merchantCategoryOverrides[payload.merchant] = payload.category;
			}
		},
	},
});

export const {
	setBalance,
	setPaymentMethod,
	updateRechargeAmount,
	setMerchantCategoryOverride,
} = campusCardSlice.actions;

export const campusCardReducer = campusCardSlice.reducer;
