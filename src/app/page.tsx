"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, ArrowRightLeft, Calculator } from "lucide-react";
import { toast } from "sonner";

// 支持的货币列表
const currencies = [
	{ code: "CNY", name: "人民币", symbol: "¥" },
	{ code: "USD", name: "美元", symbol: "$" },
	{ code: "EUR", name: "欧元", symbol: "€" },
	{ code: "JPY", name: "日元", symbol: "¥" },
	{ code: "GBP", name: "英镑", symbol: "£" },
	{ code: "AUD", name: "澳元", symbol: "A$" },
	{ code: "CAD", name: "加元", symbol: "C$" },
	{ code: "CHF", name: "瑞士法郎", symbol: "CHF" },
	{ code: "HKD", name: "港币", symbol: "HK$" },
	{ code: "KRW", name: "韩元", symbol: "₩" },
	{ code: "SGD", name: "新加坡元", symbol: "S$" },
	{ code: "THB", name: "泰铢", symbol: "฿" },
	{ code: "INR", name: "印度卢比", symbol: "₹" },
	{ code: "RUB", name: "俄罗斯卢布", symbol: "₽" },
	{ code: "BRL", name: "巴西雷亚尔", symbol: "R$" },
	{ code: "MXN", name: "墨西哥比索", symbol: "$" },
];

// 模拟汇率数据
const mockRates = {
	CNY: 1,
	USD: 0.138,
	EUR: 0.127,
	JPY: 20.5,
	GBP: 0.109,
	AUD: 0.208,
	CAD: 0.189,
	CHF: 0.123,
	HKD: 1.08,
	KRW: 185.2,
	SGD: 0.186,
	THB: 4.85,
	INR: 11.45,
	RUB: 12.34,
	BRL: 0.68,
	MXN: 2.34,
};

export default function CurrencyConverter() {
	const [sourceCurrency, setSourceCurrency] = useState("CNY");
	const [targetCurrency, setTargetCurrency] = useState("USD");
	const [sourceAmount, setSourceAmount] = useState("100");
	const [targetAmount, setTargetAmount] = useState("");
	const [rates, setRates] = useState(mockRates);
	const [loading, setLoading] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(new Date());

	// 计算转换结果
	const calculateConversion = (amount: string, from: string, to: string) => {
		if (!amount || isNaN(Number(amount))) return "";
		const numAmount = parseFloat(amount);
		const fromRate = rates[from as keyof typeof rates] || 1;
		const toRate = rates[to as keyof typeof rates] || 1;
		const result = (numAmount / fromRate) * toRate;
		return result.toFixed(4);
	};

	// 自动转换
	useEffect(() => {
		const result = calculateConversion(sourceAmount, sourceCurrency, targetCurrency);
		setTargetAmount(result);
	}, [sourceAmount, sourceCurrency, targetCurrency, rates]);

	// 交换货币
	const swapCurrencies = () => {
		setSourceCurrency(targetCurrency);
		setTargetCurrency(sourceCurrency);
	};

	// 刷新汇率
	const refreshRates = async () => {
		setLoading(true);
		try {
			// 模拟API调用
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// 生成新的模拟汇率（稍微变化）
			const newRates = { ...mockRates };
			Object.keys(newRates).forEach(key => {
				if (key !== "CNY") {
					const variation = 0.95 + Math.random() * 0.1; // ±5% 变化
					newRates[key as keyof typeof mockRates] = Number((mockRates[key as keyof typeof mockRates] * variation).toFixed(3));
				}
			});
			
			setRates(newRates);
			setLastUpdated(new Date());
			toast.success("汇率已更新");
		} catch (error) {
			toast.error("更新汇率失败");
		} finally {
			setLoading(false);
		}
	};

	// 格式化金额显示
	const formatAmount = (amount: string, currencyCode: string) => {
		const currency = currencies.find(c => c.code === currencyCode);
		if (!currency) return amount;
		return `${currency.symbol}${amount}`;
	};

	// 获取汇率显示
	const getRateDisplay = (from: string, to: string) => {
		const fromRate = rates[from as keyof typeof rates] || 1;
		const toRate = rates[to as keyof typeof rates] || 1;
		const rate = toRate / fromRate;
		return rate.toFixed(4);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
			<div className="max-w-md mx-auto">
				{/* 标题区域 */}
				<div className="text-center mb-6">
					<div className="flex items-center justify-center gap-2 mb-2">
						<Calculator className="h-8 w-8 text-blue-600" />
						<h1 className="text-2xl font-bold text-gray-900">汇率转换器</h1>
					</div>
					<p className="text-sm text-gray-600">实时汇率，双向转换</p>
				</div>

				{/* 主要转换卡片 */}
				<Card className="mb-4 shadow-lg">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<ArrowRightLeft className="h-5 w-5 text-blue-600" />
							货币转换
						</CardTitle>
						<CardDescription>选择货币并输入金额进行转换</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* 源货币输入 */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">从</Label>
							<div className="flex gap-2">
								<Select value={sourceCurrency} onValueChange={setSourceCurrency}>
									<SelectTrigger className="w-24">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{currencies.map((currency) => (
											<SelectItem key={currency.code} value={currency.code}>
												{currency.code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									type="number"
									value={sourceAmount}
									onChange={(e) => setSourceAmount(e.target.value)}
									placeholder="0.00"
									className="flex-1 text-lg"
								/>
							</div>
							<div className="text-xs text-gray-500">
								{currencies.find(c => c.code === sourceCurrency)?.name}
							</div>
						</div>

						{/* 交换按钮 */}
						<div className="flex justify-center">
							<Button
								variant="outline"
								size="sm"
								onClick={swapCurrencies}
								className="rounded-full w-10 h-10 p-0"
							>
								<ArrowRightLeft className="h-4 w-4" />
							</Button>
						</div>

						{/* 目标货币显示 */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">到</Label>
							<div className="flex gap-2">
								<Select value={targetCurrency} onValueChange={setTargetCurrency}>
									<SelectTrigger className="w-24">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{currencies.map((currency) => (
											<SelectItem key={currency.code} value={currency.code}>
												{currency.code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<div className="flex-1 bg-gray-50 rounded-md px-3 py-2 text-lg font-semibold text-gray-900">
									{formatAmount(targetAmount, targetCurrency)}
								</div>
							</div>
							<div className="text-xs text-gray-500">
								{currencies.find(c => c.code === targetCurrency)?.name}
							</div>
						</div>

						{/* 汇率信息 */}
						<div className="bg-blue-50 rounded-lg p-3">
							<div className="text-sm text-blue-800">
								<div className="font-medium mb-1">当前汇率</div>
								<div>1 {sourceCurrency} = {getRateDisplay(sourceCurrency, targetCurrency)} {targetCurrency}</div>
								<div>1 {targetCurrency} = {getRateDisplay(targetCurrency, sourceCurrency)} {sourceCurrency}</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 刷新按钮 */}
				<div className="flex justify-center mb-4">
					<Button
						onClick={refreshRates}
						disabled={loading}
						className="w-full max-w-xs"
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
						{loading ? '更新中...' : '刷新汇率'}
					</Button>
				</div>

				{/* 常用货币快速转换 */}
				<Card className="shadow-lg">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">常用货币</CardTitle>
						<CardDescription>点击快速查看汇率</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-3">
							{currencies.slice(1, 9).map((currency) => (
								<div
									key={currency.code}
									className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
									onClick={() => {
										setSourceCurrency("CNY");
										setTargetCurrency(currency.code);
										setSourceAmount("100");
									}}
								>
									<div className="flex justify-between items-center mb-1">
										<span className="font-medium text-sm">{currency.name}</span>
										<Badge variant="secondary" className="text-xs">
											{currency.code}
										</Badge>
									</div>
									<div className="text-lg font-bold text-green-600">
										{formatAmount(getRateDisplay("CNY", currency.code), currency.code)}
									</div>
									<div className="text-xs text-gray-500">
										100 CNY = {getRateDisplay("CNY", currency.code)} {currency.code}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* 更新时间 */}
				<div className="text-center mt-4 text-xs text-gray-500">
					最后更新: {lastUpdated.toLocaleString('zh-CN')}
				</div>
			</div>
		</div>
	);
}
