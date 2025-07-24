import { useState, useMemo, useCallback } from 'react';
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.error(error);
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
}
export const useAppData = () => {
    const [transactions, setTransactions] = useLocalStorage('hisab_transactions', []);
    const [contacts, setContacts] = useLocalStorage('hisab_contacts', []);
    const [settlements, setSettlements] = useLocalStorage('hisab_settlements', []);
    const addTransaction = (transaction) => {
        const newTransaction = { ...transaction, id: Date.now().toString() };
        setTransactions(prev => [...prev, newTransaction]);
    };
    const addContact = (contact) => {
        const newContact = { ...contact, id: Date.now().toString() };
        setContacts(prev => [...prev, newContact]);
        return newContact;
    };
    const addSettlement = (settlement) => {
        const newSettlement = { ...settlement, id: Date.now().toString() };
        setSettlements(prev => [...prev, newSettlement]);
    };
    const fullHistory = useMemo(() => {
        const combined = [...transactions, ...settlements];
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, settlements]);
    const creditBalances = useMemo(() => {
        const balances = new Map();
        transactions.forEach(tx => {
            if (tx.paymentMode === 'credit' && tx.contactId) {
                const currentBalance = balances.get(tx.contactId) || 0;
                const amount = tx.type === 'sale' ? tx.amount : -tx.amount;
                balances.set(tx.contactId, currentBalance + amount);
            }
        });
        settlements.forEach(st => {
            const currentBalance = balances.get(st.contactId) || 0;
            const amount = st.type === 'settlement_received' ? -st.amount : st.amount;
            balances.set(st.contactId, currentBalance + amount);
        });
        return Array.from(balances.entries())
            .map(([contactId, balance]) => {
            const contact = contacts.find(c => c.id === contactId);
            if (!contact || Math.abs(balance) < 0.01)
                return null;
            return {
                contact,
                balance: Math.abs(balance),
                type: balance > 0 ? 'receivable' : 'payable',
            };
        })
            .filter((item) => item !== null)
            .sort((a, b) => b.balance - a.balance);
    }, [transactions, settlements, contacts]);
    const totalReceivable = useMemo(() => {
        return creditBalances
            .filter(b => b.type === 'receivable')
            .reduce((sum, b) => sum + b.balance, 0);
    }, [creditBalances]);
    const topSellingItemToday = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todaysSales = transactions.filter(tx => tx.date.startsWith(today) && tx.type === 'sale');
        if (todaysSales.length === 0)
            return null;
        const itemCounts = todaysSales.reduce((acc, tx) => {
            acc[tx.itemName] = (acc[tx.itemName] || 0) + tx.quantity;
            return acc;
        }, {});
        return Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b);
    }, [transactions]);
    const getContactBalance = useCallback((contactId) => {
        const creditTxTotal = transactions
            .filter(tx => tx.contactId === contactId && tx.paymentMode === 'credit')
            .reduce((acc, tx) => acc + (tx.type === 'sale' ? tx.amount : -tx.amount), 0);
        const settlementTotal = settlements
            .filter(st => st.contactId === contactId)
            .reduce((acc, st) => acc + (st.type === 'settlement_received' ? -st.amount : st.amount), 0);
        return creditTxTotal + settlementTotal;
    }, [transactions, settlements]);
    const generateReport = useCallback((period) => {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'this_week':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'last_week':
                endDate = new Date(now.setDate(now.getDate() - now.getDay() - 1));
                endDate.setHours(23, 59, 59, 999);
                startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'this_month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'last_month':
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                endDate.setHours(23, 59, 59, 999);
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'last_30_days':
                startDate = new Date();
                startDate.setDate(now.getDate() - 30);
                startDate.setHours(0, 0, 0, 0);
                break;
        }
        const filteredTx = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= startDate && txDate <= endDate;
        });
        if (filteredTx.length === 0)
            return null;
        let totalSales = 0;
        let totalPurchases = 0;
        const productSales = {};
        filteredTx.forEach(tx => {
            if (tx.type === 'sale') {
                totalSales += tx.amount;
                productSales[tx.itemName] = (productSales[tx.itemName] || 0) + tx.amount;
            }
            else {
                totalPurchases += tx.amount;
            }
        });
        const topProductsByValue = Object.entries(productSales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
        return {
            period,
            totalSales,
            totalPurchases,
            netProfit: totalSales - totalPurchases,
            topProductsByValue,
        };
    }, [transactions]);
    return {
        transactions,
        contacts,
        settlements,
        addTransaction,
        addContact,
        addSettlement,
        fullHistory,
        creditBalances,
        generateReport,
        getContactBalance,
        totalReceivable,
        topSellingItemToday,
    };
};
