import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppData, useLocalStorage } from './hooks/useAppData';
import { TransactionType, PaymentMode, BusinessType, Unit } from './types';
import { ICONS, t, BUSINESS_ITEMS } from './Constant';
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};
// #region Helper & Common Components
const LanguageSelector = ({ lang, onLangChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'as', name: 'অসমীয়া' }
    ];
    return (_jsxs("div", { ref: menuRef, className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(prev => !prev), className: "h-9 px-3 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-semibold border border-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm space-x-1", children: [_jsx("span", { children: lang.toUpperCase() }), React.cloneElement(ICONS.chevron_down, { className: "w-4 h-4 text-gray-500" })] }), isOpen && (_jsx("div", { className: "absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 origin-top-right animate-fadeInUp", style: { animationDuration: '0.2s' }, children: _jsx("div", { className: "p-1", children: languages.map(l => (_jsx("a", { href: "#", onClick: e => {
                            e.preventDefault();
                            onLangChange(l.code);
                            setIsOpen(false);
                        }, className: `block px-3 py-2 text-sm rounded-lg text-center ${lang === l.code ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`, children: l.name }, l.code))) }) }))] }));
};
const Header = ({ title, onNavigate, lang, onLangChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const menuItems = [
        { label: t('profile', lang), icon: ICONS.menu_profile, action: () => onNavigate('profile') },
        { label: t('settings', lang), icon: ICONS.menu_settings, action: () => onNavigate('settings') },
        { label: t('about', lang), icon: ICONS.menu_info, action: () => onNavigate('about') },
    ];
    return (_jsx("header", { className: "bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-gray-200", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [ICONS.logo, _jsx("h1", { className: "text-xl font-bold text-gray-800 tracking-tight", children: title })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(LanguageSelector, { lang: lang, onLangChange: onLangChange }), _jsxs("div", { className: "relative", ref: menuRef, children: [_jsx("button", { onClick: () => setIsMenuOpen(prev => !prev), className: "w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors", children: React.cloneElement(ICONS.user_avatar, { className: "w-6 h-6" }) }), isMenuOpen && (_jsx("div", { className: "absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 ring-1 ring-black ring-opacity-5 origin-top-right animate-fadeInUp", style: { animationDuration: '0.2s' }, children: _jsx("div", { className: "p-2", children: menuItems.map(item => (_jsxs("a", { href: "#", onClick: e => { e.preventDefault(); item.action(); setIsMenuOpen(false); }, className: "flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors", children: [item.icon, item.label] }, item.label))) }) }))] })] })] }) }));
};
const BottomNav = ({ activeView, onViewChange, lang }) => {
    const navItems = [
        { id: 'dashboard', label: t('dashboard', lang), icon: ICONS.home, activeIcon: ICONS.home_solid },
        { id: 'history', label: t('history', lang), icon: ICONS.history, activeIcon: ICONS.history_solid },
        { id: 'credit', label: t('credit', lang), icon: ICONS.credit, activeIcon: ICONS.credit_solid },
        { id: 'reports', label: t('reports', lang), icon: ICONS.reports, activeIcon: ICONS.reports_solid },
    ];
    return (_jsx("nav", { className: "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-20", children: _jsx("div", { className: "max-w-4xl mx-auto grid grid-cols-4 gap-1 p-2", children: navItems.map(item => {
                const isActive = activeView === item.id;
                return (_jsxs("button", { onClick: () => onViewChange(item.id), className: `flex flex-col items-center justify-center w-full py-1 px-1 rounded-lg transition-all duration-200 transform active:scale-95 ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-100'}`, children: [_jsx("span", { className: "w-6 h-6 mb-0.5", children: isActive ? item.activeIcon : item.icon }), _jsx("span", { className: "text-xs tracking-tight", children: item.label })] }, item.id));
            }) }) }));
};
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 animate-fadeIn", style: { animationDuration: '0.3s' }, children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-lg m-auto animate-fadeInUp", style: { animationDuration: '0.3s' }, children: [_jsxs("header", { className: "flex items-center justify-between p-4 border-b border-gray-100", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800", children: title }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors", children: ICONS.close })] }), _jsx("div", { className: "p-4 sm:p-6", children: children })] }) }));
};
// #endregion
// #region Main App Screen Components
const DashboardScreen = ({ data, onAddTransaction, lang }) => {
    const { totalReceivable, topSellingItemToday } = data;
    const dailySummary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todaysTransactions = data.transactions.filter(tx => tx.date.startsWith(today));
        const sales = todaysTransactions.filter(tx => tx.type === 'sale').reduce((sum, tx) => sum + tx.amount, 0);
        const purchases = todaysTransactions.filter(tx => tx.type === 'purchase').reduce((sum, tx) => sum + tx.amount, 0);
        return { sales, purchases, profit: sales - purchases };
    }, [data.transactions]);
    return (_jsxs("div", { className: "p-4 sm:p-6 space-y-6 pb-32", children: [_jsxs("div", { className: "bg-white p-5 rounded-2xl shadow-sm border border-gray-200", children: [_jsx("h3", { className: "text-base font-semibold text-gray-800 mb-4", children: t('today_summary', lang) }), _jsxs("div", { className: "grid grid-cols-3", children: [_jsxs("div", { className: "text-center px-2", children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: t('total_sales', lang) }), _jsx("p", { className: "text-xl font-bold text-green-600 font-mono tracking-tight", children: formatCurrency(dailySummary.sales) })] }), _jsxs("div", { className: "text-center px-2 border-x border-gray-200", children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: t('total_purchases', lang) }), _jsx("p", { className: "text-xl font-bold text-red-500 font-mono tracking-tight", children: formatCurrency(dailySummary.purchases) })] }), _jsxs("div", { className: "text-center px-2", children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: t('profit_loss', lang) }), _jsx("p", { className: `text-xl font-bold font-mono tracking-tight ${dailySummary.profit >= 0 ? 'text-blue-600' : 'text-red-500'}`, children: formatCurrency(dailySummary.profit) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3", children: [_jsx("div", { className: "bg-indigo-50 rounded-full p-2", children: React.cloneElement(ICONS.trending_up, { className: "w-8 h-8 text-indigo-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: t('top_selling_item_today', lang) }), _jsx("p", { className: "font-bold text-gray-800 text-base", children: topSellingItemToday ? t(topSellingItemToday, lang) : 'N/A' })] })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3", children: [_jsx("div", { className: "bg-amber-50 rounded-full p-2", children: ICONS.cash_icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: t('pending_credit_udhaar', lang) }), _jsx("p", { className: "font-bold text-gray-800 text-base font-mono tracking-tight", children: formatCurrency(totalReceivable) })] })] })] })] }));
};
const HistoryScreen = ({ data, lang }) => {
    const [filter, setFilter] = useState('all');
    const contactsMap = useMemo(() => new Map(data.contacts.map(c => [c.id, c.name])), [data.contacts]);
    const filteredHistory = useMemo(() => {
        return data.fullHistory.filter(item => {
            if (filter === 'all')
                return true;
            if ('type' in item && (item.type === 'sale' || item.type === 'purchase')) {
                if (filter === 'sales' && item.type === 'sale')
                    return true;
                if (filter === 'purchases' && item.type === 'purchase')
                    return true;
                if (filter === 'cash' && item.paymentMode === 'cash')
                    return true;
                if (filter === 'credit' && item.paymentMode === 'credit')
                    return true;
            }
            return false;
        });
    }, [data.fullHistory, filter]);
    const renderHistoryItem = (item) => {
        const date = new Date(item.date).toLocaleDateString(lang, { day: 'numeric', month: 'short' });
        const time = new Date(item.date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: true });
        if ('paymentMode' in item) { // Transaction
            const isSale = item.type === 'sale';
            const contactName = item.contactId ? contactsMap.get(item.contactId) : null;
            const paymentInfo = item.paymentMode === 'cash'
                ? t('cash_payment', lang)
                : `${t('on_credit_to', lang)} ${contactName ? `(${contactName})` : ''}`;
            return (_jsxs("div", { className: "flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-gray-800 truncate", children: t(item.itemName, lang) }), _jsxs("p", { className: "text-sm text-gray-500", children: [`${item.quantity} ${t(item.unit, lang)}`, _jsx("span", { className: "mx-1.5 text-gray-300", children: "|" }), paymentInfo] })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsxs("div", { className: `flex items-center justify-end space-x-1 font-bold font-mono text-lg tracking-tight ${isSale ? 'text-green-600' : 'text-red-500'}`, children: [isSale ? ICONS.arrow_up_right : ICONS.arrow_down_left, _jsx("span", { children: formatCurrency(item.amount) })] }), _jsxs("p", { className: "text-xs text-gray-400 font-mono mt-0.5", children: [date, ", ", time] })] })] }, item.id));
        }
        else { // Settlement
            const isReceived = item.type === 'settlement_received';
            const contactName = contactsMap.get(item.contactId);
            return (_jsxs("div", { className: "flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150", children: [_jsx("div", { className: "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600", children: ICONS.tx_settle }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-gray-800 truncate", children: isReceived ? t('settlement_received', lang) : t('settlement_paid', lang) }), _jsxs("p", { className: "text-sm text-gray-500", children: [isReceived ? t('from', lang) : t('to', lang), " ", contactName] })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsx("p", { className: `font-bold font-mono text-lg tracking-tight text-blue-600`, children: formatCurrency(item.amount) }), _jsxs("p", { className: "text-xs text-gray-400 font-mono mt-0.5", children: [date, ", ", time] })] })] }, item.id));
        }
    };
    return (_jsxs("div", { className: "p-4 sm:p-6 space-y-4", children: [_jsx("div", { className: "flex space-x-2 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 custom-scrollbar", children: ['all', 'sales', 'purchases', 'cash', 'credit_filter'].map(f => (_jsx("button", { onClick: () => setFilter(f === 'credit_filter' ? 'credit' : f), className: `px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${filter === (f === 'credit_filter' ? 'credit' : f) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`, children: t(f, lang) }, f))) }), _jsx("div", { className: "bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 min-h-[calc(100vh-18rem)] flex flex-col", children: filteredHistory.length > 0 ? (_jsx("div", { className: "space-y-1 custom-scrollbar overflow-y-auto", children: filteredHistory.map(renderHistoryItem) })) : (_jsxs("div", { className: "flex-grow flex flex-col items-center justify-center text-center text-gray-500", children: [ICONS.empty_box, _jsx("h3", { className: "text-lg font-semibold text-gray-700 mt-2", children: t('no_transactions_title', lang) }), _jsx("p", { className: "text-sm max-w-xs mx-auto", children: data.fullHistory.length > 0 ? t('no_transactions_for_filter', lang) : t('no_transactions', lang) })] })) })] }));
};
const CreditScreen = ({ data, onSettle, lang }) => {
    const [activeTab, setActiveTab] = useState('receivable');
    const { creditBalances } = data;
    const receivables = creditBalances.filter(b => b.type === 'receivable');
    const payables = creditBalances.filter(b => b.type === 'payable');
    const renderBalanceList = (balances) => {
        if (balances.length === 0)
            return _jsx("p", { className: "text-center text-gray-500 py-16", children: t('no_credit_accounts', lang) });
        return (_jsx("div", { className: "max-h-[calc(100vh-19rem)] overflow-y-auto custom-scrollbar -mr-3 pr-3", children: _jsx("div", { className: "space-y-3", children: balances.map(b => (_jsxs("div", { className: "bg-gray-50 p-4 rounded-xl flex justify-between items-center transition-colors hover:bg-gray-100", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: b.contact.name }), _jsx("p", { className: "text-xl font-bold text-gray-700 font-mono tracking-tight", children: formatCurrency(b.balance) })] }), _jsx("button", { onClick: () => onSettle(b), className: "bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm active:scale-95", children: b.type === 'receivable' ? t('receive_payment', lang) : t('make_payment', lang) })] }, b.contact.id))) }) }));
    };
    return (_jsxs("div", { className: "p-4 sm:p-6 space-y-4", children: [_jsxs("div", { className: "flex bg-gray-100 rounded-xl p-1", children: [_jsx("button", { onClick: () => setActiveTab('receivable'), className: `w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'receivable' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`, children: t('to_receive', lang) }), _jsx("button", { onClick: () => setActiveTab('payable'), className: `w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'payable' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`, children: t('to_pay', lang) })] }), _jsx("div", { className: "bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100", children: activeTab === 'receivable' ? renderBalanceList(receivables) : renderBalanceList(payables) })] }));
};
// #endregion
// #region Report Components
const BarChartCard = ({ sales, purchases, lang }) => {
    const maxValue = Math.max(sales, purchases, 1);
    const salesHeight = (sales / maxValue) * 100;
    const purchasesHeight = (purchases / maxValue) * 100;
    return (_jsxs("div", { className: "bg-white p-4 rounded-2xl shadow-sm border border-gray-100", children: [_jsx("h3", { className: "font-semibold text-gray-800 mb-4", children: t('sales_vs_purchases', lang) }), _jsxs("div", { className: "h-48 flex items-end justify-around space-x-4", children: [_jsxs("div", { className: "w-16 flex flex-col items-center", children: [_jsx("div", { className: "font-bold text-green-600 text-sm font-mono", children: formatCurrency(sales) }), _jsx("div", { className: "w-full h-full flex items-end", children: _jsx("div", { className: "w-full bg-green-500/80 rounded-t-md", style: { height: `${salesHeight}%`, transition: 'height 0.5s ease-out' } }) }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: t('sales', lang) })] }), _jsxs("div", { className: "w-16 flex flex-col items-center", children: [_jsx("div", { className: "font-bold text-red-500 text-sm font-mono", children: formatCurrency(purchases) }), _jsx("div", { className: "w-full h-full flex items-end", children: _jsx("div", { className: "w-full bg-red-500/80 rounded-t-md", style: { height: `${purchasesHeight}%`, transition: 'height 0.5s ease-out' } }) }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: t('purchases', lang) })] })] })] }));
};
const PieChartCard = ({ data, lang }) => {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#64748B'];
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const chartData = useMemo(() => {
        const top5 = data.slice(0, 5);
        const otherValue = data.slice(5).reduce((sum, item) => sum + item.value, 0);
        const finalData = [...top5];
        if (otherValue > 0) {
            finalData.push({ name: 'Other', value: otherValue });
        }
        return finalData;
    }, [data]);
    let cumulativePercent = 0;
    const gradient = chartData.map((item, index) => {
        const percent = (item.value / totalValue) * 100;
        const color = COLORS[index % COLORS.length];
        const start = cumulativePercent;
        cumulativePercent += percent;
        const end = cumulativePercent;
        return `${color} ${start}% ${end}%`;
    }).join(', ');
    return (_jsxs("div", { className: "bg-white p-4 rounded-2xl shadow-sm border border-gray-100", children: [_jsx("h3", { className: "font-semibold text-gray-800 mb-4", children: t('top_products_by_value', lang) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6", children: [_jsx("div", { className: "w-32 h-32 rounded-full flex-shrink-0", style: { background: `conic-gradient(${gradient})` }, role: "img", "aria-label": t('top_products_by_value', lang) }), _jsx("div", { className: "w-full", children: _jsx("ul", { className: "space-y-2 text-sm", children: chartData.map((item, index) => (_jsxs("li", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "w-3 h-3 rounded-full mr-2", style: { backgroundColor: COLORS[index % COLORS.length] } }), _jsx("span", { className: "text-gray-700", children: t(item.name, lang) })] }), _jsxs("span", { className: "font-semibold text-gray-800 font-mono", children: [((item.value / totalValue) * 100).toFixed(1), "%"] })] }, item.name))) }) })] })] }));
};
const ReportsScreen = ({ data, lang }) => {
    const [period, setPeriod] = useState(null);
    const [report, setReport] = useState(null);
    const handleGenerateReport = (p) => {
        setPeriod(p);
        const generatedReport = data.generateReport(p);
        setReport(generatedReport);
    };
    const reportPeriods = [
        { key: 'this_week', label: t('this_week', lang) },
        { key: 'last_week', label: t('last_week', lang) },
        { key: 'this_month', label: t('this_month', lang) },
        { key: 'last_month', label: t('last_month', lang) },
    ];
    useEffect(() => {
        // Generate report for 'this_week' on initial load
        handleGenerateReport('this_week');
    }, []);
    const renderContent = () => {
        if (!report) {
            return (_jsxs("div", { className: "text-center py-20 px-4 animate-fadeIn", children: [React.cloneElement(ICONS.chart_no_data, { className: "w-20 h-20 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-700", children: t('no_report_data_title_v2', lang) }), _jsx("p", { className: "text-sm text-gray-500 max-w-xs mx-auto", children: t('no_report_data_desc_v2', lang) })] }));
        }
        return (_jsxs("div", { className: "animate-fadeInUp space-y-6", children: [_jsx(BarChartCard, { sales: report.totalSales, purchases: report.totalPurchases, lang: lang }), report.topProductsByValue.length > 0 && _jsx(PieChartCard, { data: report.topProductsByValue, lang: lang })] }));
    };
    return (_jsxs("div", { className: "p-4 sm:p-6 space-y-4", children: [_jsx("div", { className: "flex space-x-2 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 custom-scrollbar", children: reportPeriods.map(p => (_jsx("button", { onClick: () => handleGenerateReport(p.key), className: `px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${period === p.key ? 'bg-blue-600 text-white shadow-md font-bold' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 font-semibold'}`, children: p.label }, p.key))) }), _jsx("div", { className: "mt-4", children: renderContent() })] }));
};
// #endregion
// #region Menu Screens
const GenericSubScreen = ({ title, onBack, children }) => (_jsxs("div", { className: "p-4 sm:p-6 animate-fadeInUp", children: [_jsxs("button", { onClick: onBack, className: "flex items-center text-gray-600 font-semibold mb-6 hover:text-blue-600 transition-colors group", children: [_jsx("span", { className: "p-1.5 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors", children: React.cloneElement(ICONS.arrow_left, { className: "w-5 h-5" }) }), _jsx("span", { className: "ml-2", children: title })] }), _jsx("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-gray-100", children: children })] }));
const ProfileScreen = ({ onBack, lang }) => (_jsxs(GenericSubScreen, { title: t('back', lang), onBack: onBack, children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: t('profile', lang) }), _jsx("p", { className: "text-gray-600", children: "This is where you can manage your user profile, update your email, or change your password. This feature is coming soon!" })] }));
const SettingsScreen = ({ onBack, lang }) => (_jsxs(GenericSubScreen, { title: t('back', lang), onBack: onBack, children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: t('settings', lang) }), _jsx("div", { className: "space-y-4", children: _jsx("p", { className: "text-gray-600", children: "More settings will be available here in the future." }) })] }));
const AboutScreen = ({ onBack, lang }) => (_jsx(GenericSubScreen, { title: t('back', lang), onBack: onBack, children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2", children: t('welcome_message', lang) }), _jsx("p", { className: "text-gray-500 mb-4", children: "Version 2.3.0" }), _jsx("p", { className: "text-gray-600", children: "The simplest way to manage your business finances. Built for small business owners everywhere." })] }) }));
// #endregion
// #region Main App Modal Components
const AddTransactionModal = ({ isOpen, onClose, onSave, contacts, onAddContact, initialType, lang, businessType }) => {
    const [type, setType] = useState(initialType);
    const [paymentMode, setPaymentMode] = useState(PaymentMode.Cash);
    const [amount, setAmount] = useState('');
    const [contactId, setContactId] = useState('');
    const [newContactName, setNewContactName] = useState('');
    const [itemName, setItemName] = useState('');
    const [customItemName, setCustomItemName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState(Unit.Piece);
    useEffect(() => {
        if (isOpen) {
            setType(initialType);
            setPaymentMode(PaymentMode.Cash);
            setAmount('');
            setContactId('');
            setNewContactName('');
            setItemName('');
            setCustomItemName('');
            setQuantity('1');
            setUnit(Unit.Piece);
        }
    }, [isOpen, initialType]);
    const handleSave = (event) => {
        event.preventDefault();
        let finalContactId = contactId;
        const finalItemName = itemName === 'other' ? customItemName.trim() : itemName;
        if (!finalItemName) {
            alert('Please provide an item name.');
            return;
        }
        if (paymentMode === PaymentMode.Credit) {
            if (contactId === 'new') {
                if (!newContactName.trim()) {
                    alert('Please enter a contact name.');
                    return;
                }
                const newContact = onAddContact(newContactName);
                finalContactId = newContact.id;
            }
        }
        onSave({
            type,
            paymentMode,
            amount: parseFloat(amount) || 0,
            itemName: finalItemName,
            quantity: parseFloat(quantity) || 1,
            unit,
            contactId: paymentMode === 'credit' ? finalContactId : undefined,
            date: new Date().toISOString()
        });
        onClose();
    };
    const itemPresets = BUSINESS_ITEMS[businessType] || [];
    const showItemDropdown = type === TransactionType.Sale;
    const inputStyle = "block w-full rounded-lg border-0 py-2.5 px-3.5 bg-gray-100 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-colors duration-200";
    const selectStyle = `${inputStyle} appearance-none pr-10 bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3e%3cpath stroke=%22%236b7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22M6 8l4 4 4-4%22/%3e%3c/svg%3e')]`;
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: t('new_transaction', lang), children: _jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [_jsxs("div", { className: "flex bg-gray-100 rounded-lg p-1", children: [_jsx("button", { type: "button", onClick: () => setType(TransactionType.Sale), className: `w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${type === 'sale' ? 'bg-white shadow text-green-600' : 'text-gray-600'}`, children: t('sale', lang) }), _jsx("button", { type: "button", onClick: () => setType(TransactionType.Purchase), className: `w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${type === 'purchase' ? 'bg-white shadow text-red-600' : 'text-gray-600'}`, children: t('purchase', lang) })] }), _jsx("div", { className: "space-y-2", children: showItemDropdown ? (_jsxs(_Fragment, { children: [_jsxs("select", { value: itemName, onChange: e => setItemName(e.target.value), required: true, className: selectStyle, children: [_jsx("option", { value: "", disabled: true, children: t('select_item', lang) }), itemPresets.map((item) => _jsx("option", { value: item, children: t(item, lang) }, item)), _jsx("option", { value: "other", children: t('other_item', lang) })] }), itemName === 'other' && (_jsx("input", { type: "text", value: customItemName, onChange: e => setCustomItemName(e.target.value), placeholder: t('itemName', lang), required: true, className: `${inputStyle} mt-2` }))] })) : (_jsx("input", { type: "text", value: itemName === 'other' ? customItemName : itemName, onChange: e => { setItemName(e.target.value); setCustomItemName(e.target.value); }, placeholder: t('itemName', lang), required: true, className: inputStyle })) }), _jsxs("div", { className: "grid grid-cols-5 gap-3", children: [_jsx("input", { type: "number", value: quantity, onChange: e => setQuantity(e.target.value), placeholder: t('quantity', lang), required: true, className: `${inputStyle} col-span-2`, min: "0", step: "any" }), _jsx("select", { value: unit, onChange: e => setUnit(e.target.value), className: `${selectStyle} col-span-3`, children: Object.values(Unit).map(u => _jsx("option", { value: u, children: t(u, lang) }, u)) })] }), _jsx("input", { type: "number", value: amount, onChange: e => setAmount(e.target.value), placeholder: `${t('amount', lang)} (₹)`, required: true, className: inputStyle, min: "0", step: "any" }), _jsxs("div", { className: "flex bg-gray-100 rounded-lg p-1", children: [_jsx("button", { type: "button", onClick: () => setPaymentMode(PaymentMode.Cash), className: `w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${paymentMode === 'cash' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`, children: t('cash', lang) }), _jsx("button", { type: "button", onClick: () => setPaymentMode(PaymentMode.Credit), className: `w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${paymentMode === 'credit' ? 'bg-white shadow text-purple-600' : 'text-gray-600'}`, children: t('credit_filter', lang) })] }), paymentMode === PaymentMode.Credit && (_jsxs("div", { className: "space-y-2 animate-fadeIn", style: { animationDuration: '0.3s' }, children: [_jsxs("select", { value: contactId, onChange: e => setContactId(e.target.value), required: paymentMode === PaymentMode.Credit, className: selectStyle, children: [_jsx("option", { value: "", disabled: true, children: type === 'sale' ? t('select_customer', lang) : t('select_supplier', lang) }), contacts.map(c => _jsx("option", { value: c.id, children: c.name }, c.id)), _jsx("option", { value: "new", children: t('add_new_contact', lang) })] }), contactId === 'new' && _jsx("input", { type: "text", value: newContactName, onChange: e => setNewContactName(e.target.value), placeholder: t('contact_name', lang), required: true, className: `${inputStyle} mt-2` })] })), _jsxs("div", { className: "flex justify-end space-x-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors", children: t('cancel', lang) }), _jsx("button", { type: "submit", className: "px-5 py-2.5 rounded-lg text-white bg-blue-500 hover:bg-blue-600 font-semibold shadow-sm transition-colors", children: t('save', lang) })] })] }) }));
};
const SettleModal = ({ isOpen, onClose, onSave, balanceData, lang }) => {
    const [amount, setAmount] = useState('');
    const outstandingBalance = balanceData ? balanceData.balance : 0;
    useEffect(() => {
        if (isOpen) {
            setAmount(outstandingBalance.toFixed(0));
        }
    }, [isOpen, outstandingBalance]);
    if (!balanceData)
        return null;
    const handleSave = () => {
        onSave({
            contactId: balanceData.contact.id,
            amount: parseFloat(amount) || 0,
            type: balanceData.type === 'receivable' ? 'settlement_received' : 'settlement_paid',
            date: new Date().toISOString()
        });
        onClose();
    };
    const title = balanceData.type === 'receivable' ? t('receive_payment', lang) : t('make_payment', lang);
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: `${title} - ${balanceData.contact.name}`, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-500", children: "Outstanding Balance" }), _jsx("p", { className: "text-4xl font-bold text-gray-800 font-mono tracking-tight", children: formatCurrency(outstandingBalance) })] }), _jsx("input", { type: "number", value: amount, onChange: e => setAmount(e.target.value), placeholder: `${t('amount', lang)} (₹)`, className: "w-full p-3 text-center text-xl bg-gray-100 border-0 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:bg-white transition-colors" }), _jsxs("div", { className: "flex justify-end space-x-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors", children: t('cancel', lang) }), _jsx("button", { onClick: handleSave, className: "px-5 py-2.5 rounded-lg text-white bg-blue-500 hover:bg-blue-600 font-semibold shadow-sm transition-colors", children: t('save', lang) })] })] }) }));
};
// #endregion
const MainApp = ({ lang, onLangChange, businessType }) => {
    const data = useAppData();
    const [activeView, setActiveView] = useState('dashboard');
    const [isAddTxModalOpen, setAddTxModalOpen] = useState(false);
    const [initialTxType, setInitialTxType] = useState(TransactionType.Sale);
    const [isSettleModalOpen, setSettleModalOpen] = useState(false);
    const [settleTarget, setSettleTarget] = useState(null);
    const handleAddTransactionClick = (type) => {
        setInitialTxType(type);
        setAddTxModalOpen(true);
    };
    const handleSettleClick = (balance) => {
        setSettleTarget(balance);
        setSettleModalOpen(true);
    };
    const pageTitles = {
        dashboard: t('app_name', lang),
        history: t('history', lang),
        credit: t('credit', lang),
        reports: t('reports', lang),
        profile: t('profile', lang),
        settings: t('settings', lang),
        about: t('about', lang),
    };
    const isMainView = ['dashboard', 'history', 'credit', 'reports'].includes(activeView);
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard': return _jsx(DashboardScreen, { data: data, onAddTransaction: handleAddTransactionClick, lang: lang });
            case 'history': return _jsx(HistoryScreen, { data: data, lang: lang });
            case 'credit': return _jsx(CreditScreen, { data: data, onSettle: handleSettleClick, lang: lang });
            case 'reports': return _jsx(ReportsScreen, { data: data, lang: lang });
            case 'profile': return _jsx(ProfileScreen, { onBack: () => setActiveView('dashboard'), lang: lang });
            case 'settings': return _jsx(SettingsScreen, { onBack: () => setActiveView('dashboard'), lang: lang });
            case 'about': return _jsx(AboutScreen, { onBack: () => setActiveView('dashboard'), lang: lang });
            default: return _jsx(DashboardScreen, { data: data, onAddTransaction: handleAddTransactionClick, lang: lang });
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto bg-slate-50 min-h-screen pb-28", children: [_jsx(Header, { title: pageTitles[activeView], onNavigate: setActiveView, lang: lang, onLangChange: onLangChange }), _jsx("main", { children: renderActiveView() }), activeView === 'dashboard' && (_jsx("div", { className: "fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-30", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => handleAddTransactionClick(TransactionType.Sale), className: "bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-3 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0", children: [ICONS.add, _jsx("span", { className: "text-lg font-semibold", children: t('add_sale', lang) })] }), _jsxs("button", { onClick: () => handleAddTransactionClick(TransactionType.Purchase), className: "bg-white text-gray-800 border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0", children: [ICONS.subtract, _jsx("span", { className: "text-lg font-semibold", children: t('add_purchase', lang) })] })] }) })), isMainView && _jsx(BottomNav, { activeView: activeView, onViewChange: setActiveView, lang: lang }), _jsx(AddTransactionModal, { isOpen: isAddTxModalOpen, onClose: () => setAddTxModalOpen(false), onSave: data.addTransaction, contacts: data.contacts, onAddContact: (name) => data.addContact({ name }), initialType: initialTxType, lang: lang, businessType: businessType || BusinessType.Other }), _jsx(SettleModal, { isOpen: isSettleModalOpen, onClose: () => setSettleModalOpen(false), onSave: data.addSettlement, balanceData: settleTarget, lang: lang })] }));
};
function App() {
    const [lang, setLang] = useLocalStorage('hisab_language', 'en');
    const [businessType, setBusinessType] = useLocalStorage('hisab_business_type', BusinessType.Other);
    return (_jsx(MainApp, { lang: lang, onLangChange: setLang, businessType: businessType }));
}
export default App;
