
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppData, useLocalStorage } from './hooks/useAppData';
import { Transaction, Contact, Settlement, HistoryItem, TransactionType, PaymentMode, Language, ReportPeriod, ReportData, CreditBalance, BusinessType, Unit } from './types';
import { ICONS, t, BUSINESS_ITEMS } from './Constant';
import { generateReportSummary } from './services/geminiServices';

type AppView = 'main';
type MainAppView = 'dashboard' | 'history' | 'credit' | 'reports' | 'profile' | 'settings' | 'about';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    }).format(amount);
};

// #region Helper & Common Components

const LanguageSelector: React.FC<{ lang: Language; onLangChange: (l: Language) => void; }> = ({ lang, onLangChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

    return (
        <div ref={menuRef} className="relative">
            <button onClick={() => setIsOpen(prev => !prev)} className="h-9 px-3 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-semibold border border-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm space-x-1">
                <span>{lang.toUpperCase()}</span>
                {React.cloneElement(ICONS.chevron_down, { className: "w-4 h-4 text-gray-500"})}
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 origin-top-right animate-fadeInUp" style={{animationDuration: '0.2s'}}>
                    <div className="p-1">
                        {languages.map(l => (
                            <a
                                key={l.code}
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    onLangChange(l.code as Language);
                                    setIsOpen(false);
                                }}
                                className={`block px-3 py-2 text-sm rounded-lg text-center ${lang === l.code ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                {l.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<{
    title: string;
    onNavigate: (view: MainAppView) => void;
    lang: Language;
    onLangChange: (l: Language) => void;
}> = ({ title, onNavigate, lang, onLangChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {ICONS.logo}
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h1>
                </div>

                <div className="flex items-center space-x-2">
                    <LanguageSelector lang={lang} onLangChange={onLangChange} />
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(prev => !prev)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            {React.cloneElement(ICONS.user_avatar, {className: "w-6 h-6"})}
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 ring-1 ring-black ring-opacity-5 origin-top-right animate-fadeInUp" style={{animationDuration: '0.2s'}}>
                                <div className="p-2">
                                    {menuItems.map(item => (
                                        <a
                                            key={item.label}
                                            href="#"
                                            onClick={e => { e.preventDefault(); item.action(); setIsMenuOpen(false); }}
                                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {item.icon}
                                            {item.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const BottomNav: React.FC<{ activeView: MainAppView; onViewChange: (view: MainAppView) => void; lang: Language }> = ({ activeView, onViewChange, lang }) => {
  const navItems = [
    { id: 'dashboard', label: t('dashboard', lang), icon: ICONS.home, activeIcon: ICONS.home_solid },
    { id: 'history', label: t('history', lang), icon: ICONS.history, activeIcon: ICONS.history_solid },
    { id: 'credit', label: t('credit', lang), icon: ICONS.credit, activeIcon: ICONS.credit_solid },
    { id: 'reports', label: t('reports', lang), icon: ICONS.reports, activeIcon: ICONS.reports_solid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-20">
      <div className="max-w-4xl mx-auto grid grid-cols-4 gap-1 p-2">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as MainAppView)}
              className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-lg transition-all duration-200 transform active:scale-95 ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="w-6 h-6 mb-0.5">{isActive ? item.activeIcon : item.icon}</span>
              <span className="text-xs tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 animate-fadeIn" style={{animationDuration: '0.3s'}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-auto animate-fadeInUp" style={{animationDuration: '0.3s'}}>
                <header className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        {ICONS.close}
                    </button>
                </header>
                <div className="p-4 sm:p-6">{children}</div>
            </div>
        </div>
    );
};

// #endregion

// #region Main App Screen Components

const DashboardScreen: React.FC<{ data: ReturnType<typeof useAppData>; onAddTransaction: (type: TransactionType) => void; lang: Language }> = ({ data, onAddTransaction, lang }) => {
    const { totalReceivable, topSellingItemToday } = data;
    const dailySummary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todaysTransactions = data.transactions.filter(tx => tx.date.startsWith(today));
        
        const sales = todaysTransactions.filter(tx => tx.type === 'sale').reduce((sum, tx) => sum + tx.amount, 0);
        const purchases = todaysTransactions.filter(tx => tx.type === 'purchase').reduce((sum, tx) => sum + tx.amount, 0);
        
        return { sales, purchases, profit: sales - purchases };
    }, [data.transactions]);
    
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onAddTransaction(TransactionType.Sale)} className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-3 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0">
                    {ICONS.add}
                    <span className="text-lg font-semibold">{t('add_sale', lang)}</span>
                </button>
                <button onClick={() => onAddTransaction(TransactionType.Purchase)} className="bg-white text-gray-800 border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0">
                    {ICONS.subtract}
                    <span className="text-lg font-semibold">{t('add_purchase', lang)}</span>
                </button>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-4">{t('today_summary', lang)}</h3>
                <div className="grid grid-cols-3">
                    <div className="text-center px-2">
                        <p className="text-sm text-gray-500 mb-1">{t('total_sales', lang)}</p>
                        <p className="text-xl font-bold text-green-600 font-mono tracking-tight">{formatCurrency(dailySummary.sales)}</p>
                    </div>
                     <div className="text-center px-2 border-x border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">{t('total_purchases', lang)}</p>
                        <p className="text-xl font-bold text-red-500 font-mono tracking-tight">{formatCurrency(dailySummary.purchases)}</p>
                    </div>
                    <div className="text-center px-2">
                        <p className="text-sm text-gray-500 mb-1">{t('profit_loss', lang)}</p>
                        <p className={`text-xl font-bold font-mono tracking-tight ${dailySummary.profit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{formatCurrency(dailySummary.profit)}</p>
                    </div>
                </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
                        <div className="bg-indigo-50 rounded-full p-2">
                            {React.cloneElement(ICONS.trending_up, {className: "w-8 h-8 text-indigo-500"})}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('top_selling_item_today', lang)}</p>
                            <p className="font-bold text-gray-800 text-base">{topSellingItemToday ? t(topSellingItemToday, lang) : 'N/A'}</p>
                        </div>
                    </div>
                     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
                         <div className="bg-amber-50 rounded-full p-2">
                            {ICONS.cash_icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('pending_credit_udhaar', lang)}</p>
                            <p className="font-bold text-gray-800 text-base font-mono tracking-tight">{formatCurrency(totalReceivable)}</p>
                        </div>
                    </div>
                </div>

        </div>
    );
};

const HistoryScreen: React.FC<{ data: ReturnType<typeof useAppData>; lang: Language }> = ({ data, lang }) => {
    const [filter, setFilter] = useState('all');
    const contactsMap = useMemo(() => new Map(data.contacts.map(c => [c.id, c.name])), [data.contacts]);

    const filteredHistory = useMemo(() => {
        return data.fullHistory.filter(item => {
            if (filter === 'all') return true;
            if ('type' in item && (item.type === 'sale' || item.type === 'purchase')) {
                if (filter === 'sales' && item.type === 'sale') return true;
                if (filter === 'purchases' && item.type === 'purchase') return true;
                if (filter === 'cash' && item.paymentMode === 'cash') return true;
                if (filter === 'credit' && item.paymentMode === 'credit') return true;
            }
            return false;
        });
    }, [data.fullHistory, filter]);
    
    const renderHistoryItem = (item: HistoryItem) => {
        const date = new Date(item.date).toLocaleDateString(lang, { day: 'numeric', month: 'short' });
        const time = new Date(item.date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: true });

        if ('paymentMode' in item) { // Transaction
            const isSale = item.type === 'sale';
            const contactName = item.contactId ? contactsMap.get(item.contactId) : null;
            const paymentInfo = item.paymentMode === 'cash' 
                ? t('cash_payment', lang) 
                : `${t('on_credit_to', lang)} ${contactName ? `(${contactName})` : ''}`;

            return (
                <div key={item.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150">
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{t(item.itemName, lang)}</p>
                        <p className="text-sm text-gray-500">
                             {`${item.quantity} ${t(item.unit, lang)}`}
                             <span className="mx-1.5 text-gray-300">|</span>
                             {paymentInfo}
                        </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className={`flex items-center justify-end space-x-1 font-bold font-mono text-lg tracking-tight ${isSale ? 'text-green-600' : 'text-red-500'}`}>
                            {isSale ? ICONS.arrow_up_right : ICONS.arrow_down_left}
                            <span>{formatCurrency(item.amount)}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{date}, {time}</p>
                    </div>
                </div>
            )
        } else { // Settlement
             const isReceived = item.type === 'settlement_received';
             const contactName = contactsMap.get(item.contactId);
             return (
                <div key={item.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                       {ICONS.tx_settle}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{isReceived ? t('settlement_received', lang) : t('settlement_paid', lang)}</p>
                        <p className="text-sm text-gray-500">
                           {isReceived ? t('from', lang) : t('to', lang)} {contactName}
                        </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className={`font-bold font-mono text-lg tracking-tight text-blue-600`}>
                            {formatCurrency(item.amount)}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{date}, {time}</p>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 custom-scrollbar">
                {['all', 'sales', 'purchases', 'cash', 'credit_filter'].map(f => (
                    <button key={f} onClick={() => setFilter(f === 'credit_filter' ? 'credit' : f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${filter === (f === 'credit_filter' ? 'credit' : f) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                        {t(f, lang)}
                    </button>
                ))}
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 min-h-[calc(100vh-18rem)] flex flex-col">
                {filteredHistory.length > 0 ? (
                    <div className="space-y-1 custom-scrollbar overflow-y-auto">{filteredHistory.map(renderHistoryItem)}</div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
                        {ICONS.empty_box}
                        <h3 className="text-lg font-semibold text-gray-700 mt-2">{t('no_transactions_title', lang)}</h3>
                        <p className="text-sm max-w-xs mx-auto">{data.fullHistory.length > 0 ? t('no_transactions_for_filter', lang) : t('no_transactions', lang)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CreditScreen: React.FC<{ data: ReturnType<typeof useAppData>; onSettle: (balance: CreditBalance) => void; lang: Language }> = ({ data, onSettle, lang }) => {
    const [activeTab, setActiveTab] = useState('receivable');
    const { creditBalances } = data;

    const receivables = creditBalances.filter(b => b.type === 'receivable');
    const payables = creditBalances.filter(b => b.type === 'payable');

    const renderBalanceList = (balances: CreditBalance[]) => {
        if (balances.length === 0) return <p className="text-center text-gray-500 py-16">{t('no_credit_accounts', lang)}</p>;
        return (
            <div className="max-h-[calc(100vh-19rem)] overflow-y-auto custom-scrollbar -mr-3 pr-3">
                <div className="space-y-3">
                    {balances.map(b => (
                        <div key={b.contact.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center transition-colors hover:bg-gray-100">
                            <div>
                                <p className="font-semibold text-gray-800">{b.contact.name}</p>
                                <p className="text-xl font-bold text-gray-700 font-mono tracking-tight">{formatCurrency(b.balance)}</p>
                            </div>
                            <button onClick={() => onSettle(b)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm active:scale-95">
                               {b.type === 'receivable' ? t('receive_payment', lang) : t('make_payment', lang)}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <div className="flex bg-gray-100 rounded-xl p-1">
                <button onClick={() => setActiveTab('receivable')} className={`w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'receivable' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>{t('to_receive', lang)}</button>
                <button onClick={() => setActiveTab('payable')} className={`w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'payable' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>{t('to_pay', lang)}</button>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100">
                {activeTab === 'receivable' ? renderBalanceList(receivables) : renderBalanceList(payables)}
            </div>
        </div>
    );
};

// #endregion

// #region Report Components
const BarChartCard: React.FC<{ sales: number, purchases: number, lang: Language }> = ({ sales, purchases, lang }) => {
    const maxValue = Math.max(sales, purchases, 1);
    const salesHeight = (sales / maxValue) * 100;
    const purchasesHeight = (purchases / maxValue) * 100;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{t('sales_vs_purchases', lang)}</h3>
            <div className="h-48 flex items-end justify-around space-x-4">
                <div className="w-16 flex flex-col items-center">
                    <div className="font-bold text-green-600 text-sm font-mono">{formatCurrency(sales)}</div>
                    <div className="w-full h-full flex items-end">
                        <div className="w-full bg-green-500/80 rounded-t-md" style={{ height: `${salesHeight}%`, transition: 'height 0.5s ease-out' }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{t('sales', lang)}</div>
                </div>
                <div className="w-16 flex flex-col items-center">
                    <div className="font-bold text-red-500 text-sm font-mono">{formatCurrency(purchases)}</div>
                     <div className="w-full h-full flex items-end">
                        <div className="w-full bg-red-500/80 rounded-t-md" style={{ height: `${purchasesHeight}%`, transition: 'height 0.5s ease-out' }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{t('purchases', lang)}</div>
                </div>
            </div>
        </div>
    );
};

const PieChartCard: React.FC<{ data: { name: string, value: number }[], lang: Language }> = ({ data, lang }) => {
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
    
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{t('top_products_by_value', lang)}</h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div 
                    className="w-32 h-32 rounded-full flex-shrink-0"
                    style={{ background: `conic-gradient(${gradient})`}}
                    role="img"
                    aria-label={t('top_products_by_value', lang)}
                ></div>
                <div className="w-full">
                    <ul className="space-y-2 text-sm">
                        {chartData.map((item, index) => (
                            <li key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="text-gray-700">{t(item.name, lang)}</span>
                                </div>
                                <span className="font-semibold text-gray-800 font-mono">{((item.value / totalValue) * 100).toFixed(1)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

const ReportsScreen: React.FC<{ data: ReturnType<typeof useAppData>; lang: Language; }> = ({ data, lang }) => {
    const [period, setPeriod] = useState<ReportPeriod | null>(null);
    const [report, setReport] = useState<ReportData | null>(null);

    const handleGenerateReport = (p: ReportPeriod) => {
        setPeriod(p);
        const generatedReport = data.generateReport(p);
        setReport(generatedReport);
    };

    const reportPeriods: { key: ReportPeriod, label: string }[] = [
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
             return (
                <div className="text-center py-20 px-4 animate-fadeIn">
                    {React.cloneElement(ICONS.chart_no_data, {className: "w-20 h-20 text-gray-300 mx-auto mb-4"})}
                    <h3 className="text-lg font-semibold text-gray-700">{t('no_report_data_title_v2', lang)}</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">{t('no_report_data_desc_v2', lang)}</p>
                </div>
            )
        }
        
        return (
            <div className="animate-fadeInUp space-y-6">
                <BarChartCard sales={report.totalSales} purchases={report.totalPurchases} lang={lang} />
                {report.topProductsByValue.length > 0 && <PieChartCard data={report.topProductsByValue} lang={lang} />}
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 custom-scrollbar">
                {reportPeriods.map(p => (
                     <button 
                        key={p.key} 
                        onClick={() => handleGenerateReport(p.key)} 
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${period === p.key ? 'bg-blue-600 text-white shadow-md font-bold' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 font-semibold'}`}
                     >
                        {p.label}
                    </button>
                ))}
            </div>
            
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};
// #endregion

// #region Menu Screens
const GenericSubScreen: React.FC<{title:string, onBack: () => void; children: React.ReactNode}> = ({title, onBack, children}) => (
    <div className="p-4 sm:p-6 animate-fadeInUp">
        <button onClick={onBack} className="flex items-center text-gray-600 font-semibold mb-6 hover:text-blue-600 transition-colors group">
            <span className="p-1.5 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">{React.cloneElement(ICONS.arrow_left, {className: "w-5 h-5"})}</span>
            <span className="ml-2">{title}</span>
        </button>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {children}
        </div>
    </div>
);

const ProfileScreen: React.FC<{onBack: () => void; lang: Language}> = ({onBack, lang}) => (
    <GenericSubScreen title={t('back', lang)} onBack={onBack}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('profile', lang)}</h2>
        <p className="text-gray-600">This is where you can manage your user profile, update your email, or change your password. This feature is coming soon!</p>
    </GenericSubScreen>
);

const SettingsScreen: React.FC<{onBack: () => void; lang: Language;}> = ({onBack, lang}) => (
    <GenericSubScreen title={t('back', lang)} onBack={onBack}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('settings', lang)}</h2>
        <div className="space-y-4">
             <p className="text-gray-600">More settings will be available here in the future.</p>
        </div>
    </GenericSubScreen>
);

const AboutScreen: React.FC<{onBack: () => void; lang: Language}> = ({onBack, lang}) => (
    <GenericSubScreen title={t('back', lang)} onBack={onBack}>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('welcome_message', lang)}</h2>
            <p className="text-gray-500 mb-4">Version 2.3.0</p>
            <p className="text-gray-600">
                The simplest way to manage your business finances.
                Built for small business owners everywhere.
            </p>
        </div>
    </GenericSubScreen>
);
// #endregion

// #region Main App Modal Components

const AddTransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (tx: Omit<Transaction, 'id'>) => void;
    contacts: Contact[];
    onAddContact: (name: string) => Contact;
    initialType: TransactionType;
    lang: Language;
    businessType: BusinessType;
}> = ({ isOpen, onClose, onSave, contacts, onAddContact, initialType, lang, businessType }) => {
    const [type, setType] = useState<TransactionType>(initialType);
    const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.Cash);
    const [amount, setAmount] = useState('');
    const [contactId, setContactId] = useState('');
    const [newContactName, setNewContactName] = useState('');
    const [itemName, setItemName] = useState('');
    const [customItemName, setCustomItemName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState<Unit>(Unit.Piece);

    useEffect(() => {
        if(isOpen) {
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
    
    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();
        let finalContactId = contactId;
        const finalItemName = itemName === 'other' ? customItemName.trim() : itemName;

        if (!finalItemName) {
            alert('Please provide an item name.');
            return;
        }

        if (paymentMode === PaymentMode.Credit) {
            if(contactId === 'new') {
                if(!newContactName.trim()) {
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('new_transaction', lang)}>
            <form onSubmit={handleSave} className="space-y-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button type="button" onClick={() => setType(TransactionType.Sale)} className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${type === 'sale' ? 'bg-white shadow text-green-600' : 'text-gray-600'}`}>{t('sale', lang)}</button>
                    <button type="button" onClick={() => setType(TransactionType.Purchase)} className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${type === 'purchase' ? 'bg-white shadow text-red-600' : 'text-gray-600'}`}>{t('purchase', lang)}</button>
                </div>
                
                <div className="space-y-2">
                    {showItemDropdown ? (
                        <>
                            <select value={itemName} onChange={e => setItemName(e.target.value)} required className={selectStyle}>
                                <option value="" disabled>{t('select_item', lang)}</option>
                                {itemPresets.map((item: string) => <option key={item} value={item}>{t(item, lang)}</option>)}
                                <option value="other">{t('other_item', lang)}</option>
                            </select>
                            {itemName === 'other' && (
                                <input type="text" value={customItemName} onChange={e => setCustomItemName(e.target.value)} placeholder={t('itemName', lang)} required className={`${inputStyle} mt-2`} />
                            )}
                        </>
                    ) : (
                        <input type="text" value={itemName === 'other' ? customItemName : itemName} onChange={e => { setItemName(e.target.value); setCustomItemName(e.target.value);}} placeholder={t('itemName', lang)} required className={inputStyle} />
                    )}
                </div>

                <div className="grid grid-cols-5 gap-3">
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder={t('quantity', lang)} required className={`${inputStyle} col-span-2`} min="0" step="any"/>
                    <select value={unit} onChange={e => setUnit(e.target.value as Unit)} className={`${selectStyle} col-span-3`}>
                         {Object.values(Unit).map(u => <option key={u} value={u}>{t(u, lang)}</option>)}
                    </select>
                </div>

                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`${t('amount', lang)} (₹)`} required className={inputStyle} min="0" step="any"/>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button type="button" onClick={() => setPaymentMode(PaymentMode.Cash)} className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${paymentMode === 'cash' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>{t('cash', lang)}</button>
                    <button type="button" onClick={() => setPaymentMode(PaymentMode.Credit)} className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${paymentMode === 'credit' ? 'bg-white shadow text-purple-600' : 'text-gray-600'}`}>{t('credit_filter', lang)}</button>
                </div>

                {paymentMode === PaymentMode.Credit && (
                    <div className="space-y-2 animate-fadeIn" style={{animationDuration: '0.3s'}}>
                        <select 
                            value={contactId} 
                            onChange={e => setContactId(e.target.value)} 
                            required={paymentMode === PaymentMode.Credit}
                            className={selectStyle}
                        >
                            <option value="" disabled>{type === 'sale' ? t('select_customer', lang) : t('select_supplier', lang)}</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            <option value="new">{t('add_new_contact', lang)}</option>
                        </select>
                        {contactId === 'new' && <input type="text" value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder={t('contact_name', lang)} required className={`${inputStyle} mt-2`}/>}
                    </div>
                )}
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors">{t('cancel', lang)}</button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg text-white bg-blue-500 hover:bg-blue-600 font-semibold shadow-sm transition-colors">{t('save', lang)}</button>
                </div>
            </form>
        </Modal>
    );
};


const SettleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (settlement: Omit<Settlement, 'id'>) => void;
    balanceData: CreditBalance | null;
    lang: Language;
}> = ({ isOpen, onClose, onSave, balanceData, lang }) => {
    const [amount, setAmount] = useState('');
    const outstandingBalance = balanceData ? balanceData.balance : 0;
    
    useEffect(() => {
        if(isOpen) {
            setAmount(outstandingBalance.toFixed(0));
        }
    }, [isOpen, outstandingBalance]);

    if (!balanceData) return null;

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${title} - ${balanceData.contact.name}`}>
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-gray-500">Outstanding Balance</p>
                    <p className="text-4xl font-bold text-gray-800 font-mono tracking-tight">{formatCurrency(outstandingBalance)}</p>
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`${t('amount', lang)} (₹)`} className="w-full p-3 text-center text-xl bg-gray-100 border-0 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:bg-white transition-colors"/>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors">{t('cancel', lang)}</button>
                    <button onClick={handleSave} className="px-5 py-2.5 rounded-lg text-white bg-blue-500 hover:bg-blue-600 font-semibold shadow-sm transition-colors">{t('save', lang)}</button>
                </div>
            </div>
        </Modal>
    );
}

// #endregion


const MainApp: React.FC<{ lang: Language; onLangChange: (l: Language) => void; businessType: BusinessType | null }> = ({ lang, onLangChange, businessType }) => {
  const data = useAppData();
  const [activeView, setActiveView] = useState<MainAppView>('dashboard');
  
  const [isAddTxModalOpen, setAddTxModalOpen] = useState(false);
  const [initialTxType, setInitialTxType] = useState<TransactionType>(TransactionType.Sale);

  const [isSettleModalOpen, setSettleModalOpen] = useState(false);
  const [settleTarget, setSettleTarget] = useState<CreditBalance | null>(null);

  const handleAddTransactionClick = (type: TransactionType) => {
      setInitialTxType(type);
      setAddTxModalOpen(true);
  };

  const handleSettleClick = (balance: CreditBalance) => {
      setSettleTarget(balance);
      setSettleModalOpen(true);
  }
  
  const pageTitles: Record<MainAppView, string> = {
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
      case 'dashboard': return <DashboardScreen data={data} onAddTransaction={handleAddTransactionClick} lang={lang} />;
      case 'history': return <HistoryScreen data={data} lang={lang} />;
      case 'credit': return <CreditScreen data={data} onSettle={handleSettleClick} lang={lang} />;
      case 'reports': return <ReportsScreen data={data} lang={lang} />;
      case 'profile': return <ProfileScreen onBack={() => setActiveView('dashboard')} lang={lang} />;
      case 'settings': return <SettingsScreen onBack={() => setActiveView('dashboard')} lang={lang} />;
      case 'about': return <AboutScreen onBack={() => setActiveView('dashboard')} lang={lang} />;
      default: return <DashboardScreen data={data} onAddTransaction={handleAddTransactionClick} lang={lang} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-50 min-h-screen pb-28">
      <Header 
        title={pageTitles[activeView]} 
        onNavigate={setActiveView} 
        lang={lang}
        onLangChange={onLangChange}
      />
      <main>
        {renderActiveView()}
      </main>
      {isMainView && <BottomNav activeView={activeView} onViewChange={setActiveView} lang={lang} />}
      <AddTransactionModal 
        isOpen={isAddTxModalOpen} 
        onClose={() => setAddTxModalOpen(false)}
        onSave={data.addTransaction}
        contacts={data.contacts}
        onAddContact={(name) => data.addContact({name})}
        initialType={initialTxType}
        lang={lang}
        businessType={businessType || BusinessType.Other}
      />
      <SettleModal 
        isOpen={isSettleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        onSave={data.addSettlement}
        balanceData={settleTarget}
        lang={lang}
      />
    </div>
  );
}


function App() {
  const [lang, setLang] = useLocalStorage<Language>('hisab_language', 'en');
  const [businessType, setBusinessType] = useLocalStorage<BusinessType | null>('hisab_business_type', BusinessType.Other);

  return (
    <MainApp lang={lang} onLangChange={setLang} businessType={businessType} />
  );
}

export default App;
