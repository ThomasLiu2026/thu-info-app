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
	otherSubcategories?: string[];
	otherMerchantSubcategories?: Record<string, string>;
}

const initialState: CampusCardState = {
	balance: 0,
	updatedAt: 0,
	paymentMethod: "bank",
	todayRechargeAmount: 0,
	lastRechargeDate: "",
	merchantCategoryOverrides: {},
	otherSubcategories: [],
	otherMerchantSubcategories: {},
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
		addOtherSubcategory: (state, {payload}: PayloadAction<string>) => {
			const trimmed = payload.trim();
			if (!trimmed) {
				return;
			}
			if (!state.otherSubcategories) {
				state.otherSubcategories = [];
			}
			if (!state.otherSubcategories.includes(trimmed)) {
				state.otherSubcategories.push(trimmed);
			}
		},
		removeOtherSubcategory: (state, {payload}: PayloadAction<string>) => {
			state.otherSubcategories = (state.otherSubcategories ?? []).filter(
				(item) => item !== payload,
			);
			if (state.otherMerchantSubcategories) {
				for (const merchant of Object.keys(state.otherMerchantSubcategories)) {
					if (state.otherMerchantSubcategories[merchant] === payload) {
						delete state.otherMerchantSubcategories[merchant];
					}
				}
			}
		},
		setOtherMerchantSubcategory: (
			state,
			{
				payload,
			}: PayloadAction<{
				merchant: string;
				subCategory: string | undefined;
			}>,
		) => {
			if (!state.otherMerchantSubcategories) {
				state.otherMerchantSubcategories = {};
			}
			if (!payload.subCategory) {
				delete state.otherMerchantSubcategories[payload.merchant];
			} else {
				state.otherMerchantSubcategories[payload.merchant] =
					payload.subCategory;
			}
		},
	},
});

export const {
	setBalance,
	setPaymentMethod,
	updateRechargeAmount,
	setMerchantCategoryOverride,
	addOtherSubcategory,
	removeOtherSubcategory,
	setOtherMerchantSubcategory,
} = campusCardSlice.actions;

export const campusCardReducer = campusCardSlice.reducer;
