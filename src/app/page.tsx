"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface ExchangeRate {
	currency: string;
	rate: number;
	name: string;
}

const currencies: ExchangeRate[] = [
	{ currency: "USD", rate: 0, name: "美元" },
	{ currency: "EUR", rate: 0, name: "欧元" },
	{ currency: "JPY", rate: 0, name: "日元" },
	{ currency: "GBP", rate: 0, name: "英镑" },
	{ currency: "AUD", rate: 0, name: "澳元" },
	{ currency: "CAD", rate: 0, name: "加元" },
	{ currency: "CHF", rate: 0, name: "瑞士法郎" },
	{ currency: "HKD", rate: 0, name: "港币" },
	{ currency: "KRW", rate: 0, name: "韩元" },
	{ currency: "SGD", rate: 0, name: "新加坡元" },
];

export default function HomePage() {
	const [amount, setAmount] = useState<string>("100");
	const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
	const [rates, setRates] = useState<ExchangeRate[]>(currencies);
	const [loading, setLoading] = useState<boolean>(false);
	const [lastUpdate, setLastUpdate] = useState<string>("");
	const [rateHistory, setRateHistory] = useState<{ [key: string]: number[] }>({});

	const fetchExchangeRates = async () => {
		setLoading(true);
		try {
			// 使用更可靠的免费汇率API
			const response = await fetch("https://open.er-api.com/v6/latest/CNY");
			const data = await response.json();
			
			if (data.rates && data.result === "success") {
				const updatedRates = currencies.map(currency => ({
					...currency,
					rate: data.rates[currency.currency] || 0
				}));
				setRates(updatedRates);
				setLastUpdate(new Date().toLocaleString("zh-CN"));
				
				// 更新历史记录
				const newHistory = { ...rateHistory };
				currencies.forEach(currency => {
					if (!newHistory[currency.currency]) {
						newHistory[currency.currency] = [];
					}
					const rate = data.rates[currency.currency] || 0;
					newHistory[currency.currency]!.push(rate);
					// 只保留最近10次记录
					if (newHistory[currency.currency]!.length > 10) {
						newHistory[currency.currency]!.shift();
					}
				});
				setRateHistory(newHistory);
				
				toast.success("汇率更新成功！");
			} else {
				throw new Error("API返回数据格式错误");
			}
		} catch (error) {
			console.error("获取汇率失败:", error);
			toast.error("获取汇率失败，使用模拟数据");
			
			// 使用更真实的模拟数据作为备用
			const mockRates = [
				{ currency: "USD", rate: 0.138, name: "美元" },
				{ currency: "EUR", rate: 0.127, name: "欧元" },
				{ currency: "JPY", rate: 20.85, name: "日元" },
				{ currency: "GBP", rate: 0.109, name: "英镑" },
				{ currency: "AUD", rate: 0.211, name: "澳元" },
				{ currency: "CAD", rate: 0.189, name: "加元" },
				{ currency: "CHF", rate: 0.122, name: "瑞士法郎" },
				{ currency: "HKD", rate: 1.08, name: "港币" },
				{ currency: "KRW", rate: 185.6, name: "韩元" },
				{ currency: "SGD", rate: 0.186, name: "新加坡元" },
			];
			setRates(mockRates);
			setLastUpdate(new Date().toLocaleString("zh-CN") + " (模拟数据)");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExchangeRates();
		
		// 设置自动刷新，每5分钟更新一次
		const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
		
		return () => clearInterval(interval);
	}, []);

	const selectedRate = rates.find(r => r.currency === selectedCurrency)?.rate || 0;
	const convertedAmount = parseFloat(amount) * selectedRate;

	const formatCurrency = (value: number, currency: string) => {
		return new Intl.NumberFormat("zh-CN", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 4
		}).format(value);
	};

	const getRateTrend = (currency: string) => {
		const history = rateHistory[currency];
		if (!history || history.length < 2) return null;
		
		const current = history[history.length - 1];
		const previous = history[history.length - 2];
		if (current === undefined || previous === undefined) return null;
		
		const change = current - previous;
		const changePercent = (change / previous) * 100;
		
		return {
			change,
			changePercent,
			isUp: change > 0,
			isDown: change < 0
		};
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">人民币汇率查询</h1>
					<p className="text-gray-600">实时查询人民币兑换外币汇率</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{/* 汇率查询卡片 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-green-600" />
								汇率查询
							</CardTitle>
							<CardDescription>
								输入人民币金额，选择目标货币查看实时汇率
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="amount">人民币金额</Label>
								<Input
									id="amount"
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="请输入金额"
									className="text-lg"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="currency">目标货币</Label>
								<Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
									<SelectTrigger>
										<SelectValue placeholder="选择货币" />
									</SelectTrigger>
									<SelectContent>
										{rates.map((currency) => (
											<SelectItem key={currency.currency} value={currency.currency}>
												{currency.currency} - {currency.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Button 
								onClick={fetchExchangeRates} 
								disabled={loading}
								className="w-full"
							>
								{loading ? (
									<>
										<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
										更新中...
									</>
								) : (
									<>
										<RefreshCw className="h-4 w-4 mr-2" />
										刷新汇率
									</>
								)}
							</Button>

							{lastUpdate && (
								<p className="text-sm text-gray-500 text-center">
									最后更新: {lastUpdate}
								</p>
							)}
						</CardContent>
					</Card>

					{/* 转换结果卡片 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingDown className="h-5 w-5 text-blue-600" />
								转换结果
							</CardTitle>
							<CardDescription>
								当前汇率下的转换结果
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center p-6 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-gray-900 mb-2">
									{formatCurrency(convertedAmount, selectedCurrency)}
								</div>
								<div className="text-sm text-gray-600">
									{amount} 人民币 = {convertedAmount.toFixed(4)} {selectedCurrency}
								</div>
							</div>

							<div className="space-y-2">
								<Label>当前汇率</Label>
								<div className="text-lg font-semibold text-green-600">
									1 CNY = {selectedRate.toFixed(4)} {selectedCurrency}
									{(() => {
										const trend = getRateTrend(selectedCurrency);
										if (trend) {
											return (
												<span className={`ml-2 text-sm ${trend.isUp ? 'text-red-500' : 'text-blue-500'}`}>
													{trend.isUp ? '↗' : '↘'} {Math.abs(trend.changePercent).toFixed(2)}%
												</span>
											);
										}
										return null;
									})()}
								</div>
								<div className="text-sm text-gray-500">
									1 {selectedCurrency} = {(1 / selectedRate).toFixed(4)} CNY
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* 所有货币汇率表 */}
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>所有货币汇率</CardTitle>
						<CardDescription>
							人民币对主要货币的实时汇率
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{rates.map((currency) => (
								<div
									key={currency.currency}
									className={`p-4 border rounded-lg cursor-pointer transition-colors ${
										selectedCurrency === currency.currency
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
									onClick={() => setSelectedCurrency(currency.currency)}
								>
									<div className="flex justify-between items-center mb-2">
										<span className="font-semibold">{currency.name}</span>
										<Badge variant="secondary">{currency.currency}</Badge>
									</div>
									<div className="text-lg font-bold text-green-600">
										{currency.rate.toFixed(4)}
										{(() => {
											const trend = getRateTrend(currency.currency);
											if (trend) {
												return (
													<span className={`ml-2 text-sm ${trend.isUp ? 'text-red-500' : 'text-blue-500'}`}>
														{trend.isUp ? '↗' : '↘'} {Math.abs(trend.changePercent).toFixed(2)}%
													</span>
												);
											}
											return null;
										})()}
									</div>
									<div className="text-sm text-gray-500">
										1 CNY = {currency.rate.toFixed(4)} {currency.currency}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
