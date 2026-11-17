import {AES, enc, mode, pad} from "crypto-js";
import {roam, roamingWrapperWithMocks} from "./core";
import {InfoHelper} from "../index";
import {uFetch} from "../utils/network";
import {
    CARD_CANCEL_LOSS_URL,
    CARD_CHANGE_PWD_URL,
    CARD_I_VERSION_URL,
    CARD_INFO_BY_USER_URL,
    CARD_MOD_MAX_CONSUME_URL,
    CARD_PHOTO_URL, CARD_RECHARGE_FROM_ALIPAY_URL,
    CARD_RECHARGE_FROM_BANK_URL,
    CARD_REPORT_LOSS_URL,
    CARD_TRANSACTION_URL,
    CARD_USER_BY_TOKEN_URL,
    CONTENT_TYPE_JSON,
} from "../constants/strings";
import {CardInfo} from "../models/card/info";
import {CardTransaction, CardTransactionType} from "../models/card/transaction";
import {MOCK_CARD_INFO} from "../mocks/card";
import {LibError, LoginError} from "../utils/error";

const CARD_API_VERSION = 2;

const accountBaseInfo = {
    user: "",
    cardId: "",
};

// Hermes strictly rejects non-ISO SQL timestamps like "YYYY-MM-DD HH:mm:ss" in `new Date(...)` (returning Invalid Date).
// Construct local Date via numeric components so timestamps remain valid across Hermes, JSC, and V8.
export const parseCardTimestamp = (raw: unknown): Date => {
    if (raw instanceof Date) {
        return raw;
    }
    if (typeof raw === "number") {
        return new Date(raw);
    }
    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (/^\d{10,13}$/.test(trimmed)) {
            const num = Number(trimmed);
            return new Date(trimmed.length === 10 ? num * 1000 : num);
        }
        // If explicit ISO timezone (Z or +/-HH:mm) is present, delegate to standard ISO parser
        if (/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) {
            return new Date(trimmed);
        }
        const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.\d+)?)?$/.exec(trimmed);
        if (m) {
            return new Date(
                Number(m[1]),
                Number(m[2]) - 1,
                Number(m[3]),
                m[4] ? Number(m[4]) : 0,
                m[5] ? Number(m[5]) : 0,
                m[6] ? Number(m[6]) : 0,
            );
        }
        const compact = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(trimmed);
        if (compact) {
            return new Date(
                Number(compact[1]),
                Number(compact[2]) - 1,
                Number(compact[3]),
                Number(compact[4]),
                Number(compact[5]),
                Number(compact[6]),
            );
        }
        return new Date(trimmed);
    }
    return new Date(NaN);
};

const fetchWithParse = async (url: string, jsonStruct: any = {}) => {
    const response = await uFetch(url, JSON.stringify(jsonStruct) as any, undefined, undefined, true, CONTENT_TYPE_JSON);
    const {data, success, resultData} = JSON.parse(response);
    if (success) {
        return resultData;
    }
    const decrypt = AES.decrypt(data.substring(16), enc.Utf8.parse(data.substring(0, 16)), {mode: mode.ECB, padding: pad.Pkcs7});
    const decString = enc.Utf8.stringify(decrypt).toString();
    const result = JSON.parse(decString);
    if (result.success !== true) {
        throw new Error(result.message);
    }
    return result.resultData;
};

const assureLoginValid = async (helper: InfoHelper) => {
    if (helper.userId === "") {
        const e = new LoginError("Please login.");
        helper.loginErrorHook && helper.loginErrorHook(e);
        throw e;
    }
    try {
        if ((await fetchWithParse(CARD_USER_BY_TOKEN_URL)).loginuser !== accountBaseInfo.user) {
            await cardLogin(helper);
        }
    }
    catch {
        await cardLogin(helper);
    }
};

export const cardLogin = async (helper: InfoHelper): Promise<void> => {
    if (helper.mocked()) {
        return;
    }
    await roam(helper, "card", "eea30cbedcaf97c69d28b2d92f22a259/0?/userindex");
    accountBaseInfo.user = (await fetchWithParse(CARD_USER_BY_TOKEN_URL)).loginuser;
};

export const cardGetInfo = async (helper: InfoHelper): Promise<CardInfo> => {
    if (helper.mocked()) {
        return MOCK_CARD_INFO;
    }
    await assureLoginValid(helper);

    const rawInfoStruct = await fetchWithParse(CARD_INFO_BY_USER_URL, {idserial: accountBaseInfo.user});

    const info: CardInfo = {
        userId: rawInfoStruct.idserial,
        userName: rawInfoStruct.username,
        userNameEn: rawInfoStruct.engname,
        departmentName: rawInfoStruct.departname,
        departmentNameEn: rawInfoStruct.engdepartname,
        departmentId: rawInfoStruct.departid,
        photoFileName: rawInfoStruct.photofile,
        phoneNumber: rawInfoStruct.tel,
        userGender: rawInfoStruct.sex,
        effectiveTimestamp: parseCardTimestamp(rawInfoStruct.identifyeffectdate),
        validTimestamp: parseCardTimestamp(rawInfoStruct.validatevalue),
        balance: rawInfoStruct.baseAccount.balance / 100,
        cardId: rawInfoStruct.cardInfos[0].cardid,
        cardStatus: rawInfoStruct.cardInfos[0].accstatus,
        lastTransactionTimestamp: parseCardTimestamp(rawInfoStruct.cardInfos[0].lasttxdate),
        maxDailyTransactionAmount: rawInfoStruct.cardInfos[0].maxconstolamt / 100,
        maxOneTimeTransactionAmount: rawInfoStruct.cardInfos[0].maxconsamt / 100,
    };

    accountBaseInfo.cardId = info.cardId;
    return info;
};

export const cardGetPhotoUrl = () => CARD_PHOTO_URL + accountBaseInfo.cardId;

export const cardGetTransactions = async (
    helper: InfoHelper,
    start: string,  // YYYY-MM-DD
    end: string,    // YYYY-MM-DD
    type: CardTransactionType = CardTransactionType.Any)
    : Promise<CardTransaction[]> => {
    if (helper.mocked()) {
        return [];
    }
    await assureLoginValid(helper);

    const rawTransactionsData = await fetchWithParse(CARD_TRANSACTION_URL,
        {
            idserial: accountBaseInfo.user,
            starttime: start,
            endtime: end,
            tradetype: type,
            pageSize: 10000,
            pageNumber: 0,
        });

    return rawTransactionsData.rows.map((rawTransaction: any) => ({
        id: rawTransaction.id,
        summary: rawTransaction.summary,
        timestamp: parseCardTimestamp(rawTransaction.txdate),
        balance: rawTransaction.balance / 100,
        amount: rawTransaction.txamt / 100,
        address: rawTransaction.meraddr,
        name: rawTransaction.mername,
        txName: rawTransaction.txname,
    } as CardTransaction));
};

export const cardChangeTransactionPassword = async (helper: InfoHelper, oldPassword: string, newPassword: string) => {
    if (helper.mocked()) {
        return;
    }
    await assureLoginValid(helper);

    await fetchWithParse(CARD_CHANGE_PWD_URL,
        {
            idserial: accountBaseInfo.user,
            oldpassword: oldPassword,
            txpassword: newPassword,
            authOldPwd: true,
        });
};

export const cardModifyMaxTransactionAmount = async (
    helper: InfoHelper,
    transactionPassword: string,
    maxDailyTranscationAmount: number,
    maxOneTimeTranscationAmount: number) => {
    if (helper.mocked()) {
        return;
    }
    await assureLoginValid(helper);

    if (accountBaseInfo.cardId === "") {
        await cardGetInfo(helper);
    }

    await fetchWithParse(CARD_MOD_MAX_CONSUME_URL, {
        maxconsamt: Math.floor(maxDailyTranscationAmount * 100),
        maxconstolamt: Math.floor(maxOneTimeTranscationAmount * 100),
        txpassword: transactionPassword,
        cardid: accountBaseInfo.cardId,
    });
};

export const cardReportLoss = async (helper: InfoHelper, transactionPassword: string) => {
    if (helper.mocked()) {
        return;
    }
    await assureLoginValid(helper);

    await fetchWithParse(CARD_REPORT_LOSS_URL,
        {
            idserial: accountBaseInfo.user,
            txpasswd: transactionPassword,
        });
};

export const cardCancelLoss = async (helper: InfoHelper, transactionPassword: string) => {
    if (helper.mocked()) {
        return;
    }
    await assureLoginValid(helper);

    await fetchWithParse(CARD_CANCEL_LOSS_URL,
        {
            idserial: accountBaseInfo.user,
            txpasswd: transactionPassword,
        });
};

export const canRechargeCampusCard = async (helper: InfoHelper) =>
    roamingWrapperWithMocks(
        helper,
        undefined,
        "",
        async () => {
            try {
                const {version} = await uFetch(CARD_I_VERSION_URL).then(JSON.parse);
                return version <= CARD_API_VERSION;
            } catch {
                throw new Error("Failed to query card API version.");
            }
        },
        false,
    );

export const cardRechargeFromBank = async (helper: InfoHelper, transactionPassword: string, amount: number) => {
    if (helper.mocked()) {
        return;
    }
    await assureLoginValid(helper);

    const {returncode} = await fetchWithParse(CARD_RECHARGE_FROM_BANK_URL,
        {
            idserial: accountBaseInfo.user,
            txamt: Math.floor(amount * 100),
        });
    if (returncode === "ERROR") {
        throw new LibError("圈存失败。请使用其他支付方式，或在 6:00~20:40 进行银行卡圈存。");
    }
};

const enum CardRechargeType {
    Wechat = "综合服务微信扫码充值",
    Alipay = "综合服务支付宝扫码充值",
}

export const cardRechargeFromWechatAlipay = async (helper: InfoHelper, amount: number, alipay: boolean)
    : Promise<string> => {
    if (helper.mocked()) {
        return "";
    }
    await assureLoginValid(helper);

    if (alipay) {
        const rawResponse = await fetchWithParse(CARD_RECHARGE_FROM_ALIPAY_URL,
            {
                idserial: accountBaseInfo.user,
                transamt: amount,
                paytype: 3,
                txcode: "2493",
                productdesc: CardRechargeType.Alipay,
                method: "trade.pay.qrcode",
                tradetype: "alipay.qrcode",
            });

        if (rawResponse.success !== true) {
            throw new Error(rawResponse.message);
        }

        const paymentUrl = JSON.parse(rawResponse.response).bizContent.webUrl;

        const payCode = paymentUrl.substring(paymentUrl.lastIndexOf("/") + 1);

        return "alipayqr://platformapi/startapp?saId=10000007&qrcode=https%3A%2F%2Fqr.alipay.com%2F" + payCode;
    }

    else {
        const rawResponse = await fetchWithParse(CARD_RECHARGE_FROM_ALIPAY_URL,
            {
                idserial: accountBaseInfo.user,
                transamt: amount,
                txamt: amount,
                openid: "",
                orgid: 2,
                paytype: 2,
                txcode: "1824",
                productdesc: CardRechargeType.Wechat,
                method: "trade.pay.qrcode",
                tradetype: "weixin.qrcode",
            });

        if (rawResponse.success !== true) {
            throw new Error(rawResponse.message);
        }

        return JSON.parse(rawResponse.response).bizContent.webUrl;
    }
};
