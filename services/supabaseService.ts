import { supabase } from '../lib/supabase';
import { Transaction, SavingsGoal, Loan, Subscription, ScheduledTransaction, Investment } from '../types';

export const dbService = {
    async getIncome(userId: string): Promise<Transaction[]> {
        const { data, error } = await supabase.from('income').select('*').eq('user_id', userId);
        if (error) throw error;
        return data as Transaction[];
    },
    async addIncome(userId: string, item: Omit<Transaction, 'id'> & { id: string }) {
        const { error } = await supabase.from('income').insert({ ...item, user_id: userId });
        if (error) throw error;
    },
    async deleteIncome(userId: string, id: string) {
        const { error } = await supabase.from('income').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    },

    async getExpenses(userId: string): Promise<Transaction[]> {
        const { data, error } = await supabase.from('expenses').select('*').eq('user_id', userId);
        if (error) throw error;
        return data as Transaction[];
    },
    async addExpense(userId: string, item: Omit<Transaction, 'id'> & { id: string }) {
        const { error } = await supabase.from('expenses').insert({ ...item, user_id: userId });
        if (error) throw error;
    },
    async deleteExpense(userId: string, id: string) {
        const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    },

    async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
        const { data: goalsData, error: goalsError } = await supabase.from('savings_goals').select('*').eq('user_id', userId);
        if (goalsError) throw goalsError;
        
        const { data: extraData, error: extraError } = await supabase.from('extra_contributions').select('*').eq('user_id', userId);
        if (extraError) throw extraError;

        return goalsData.map(g => {
            const camelGoal = {
                id: g.id,
                name: g.name,
                targetAmount: Number(g.target_amount),
                deadline: g.deadline,
                startingBalance: Number(g.starting_balance),
                monthlyContribution: Number(g.monthly_contribution),
                interestRate: Number(g.interest_rate),
                compoundingFrequency: g.compounding_frequency,
                extraContributions: extraData.filter(e => e.savings_goal_id === g.id).map(e => ({
                    id: e.id,
                    amount: Number(e.amount),
                    date: e.date
                }))
            };
            return camelGoal as unknown as SavingsGoal;
        });
    },
    async addSavingsGoal(userId: string, item: Omit<SavingsGoal, 'id'> & { id: string }) {
        const { error } = await supabase.from('savings_goals').insert({
            id: item.id,
            user_id: userId,
            name: item.name,
            target_amount: item.targetAmount,
            deadline: item.deadline,
            starting_balance: item.startingBalance,
            monthly_contribution: item.monthlyContribution,
            interest_rate: item.interestRate,
            compounding_frequency: item.compoundingFrequency
        });
        if (error) throw error;
    },
    async updateSavingsGoal(userId: string, item: SavingsGoal) {
        // This is complex due to nested extra contributions, but for simple updates:
        const { error } = await supabase.from('savings_goals').update({
            name: item.name,
            target_amount: item.targetAmount,
            deadline: item.deadline,
            starting_balance: item.startingBalance,
            monthly_contribution: item.monthlyContribution,
            interest_rate: item.interestRate,
            compounding_frequency: item.compoundingFrequency
        }).eq('id', item.id).eq('user_id', userId);
        if (error) throw error;
        
        // Handle new extra contributions (simplified: delete all and insert, or just insert missing)
        // Since we don't have a reliable way to know what's new without tracking, let's just delete and re-insert for now
        await supabase.from('extra_contributions').delete().eq('savings_goal_id', item.id);
        if (item.extraContributions && item.extraContributions.length > 0) {
            await supabase.from('extra_contributions').insert(
                item.extraContributions.map(e => ({
                    id: e.id,
                    user_id: userId,
                    savings_goal_id: item.id,
                    amount: e.amount,
                    date: e.date
                }))
            );
        }
    },
    async deleteSavingsGoal(userId: string, id: string) {
        const { error } = await supabase.from('savings_goals').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    },

    async getLoans(userId: string): Promise<Loan[]> {
        const { data: loansData, error: loansError } = await supabase.from('loans').select('*').eq('user_id', userId);
        if (loansError) throw loansError;
        
        const { data: repData, error: repError } = await supabase.from('repayments').select('*').eq('user_id', userId);
        if (repError) throw repError;

        return loansData.map(l => ({
            id: l.id,
            type: l.type,
            person: l.person,
            totalAmount: Number(l.total_amount),
            outstandingAmount: Number(l.outstanding_amount),
            interestRate: Number(l.interest_rate),
            interestType: l.interest_type,
            date: l.date,
            dueDate: l.due_date,
            repaymentSchedule: l.repayment_schedule,
            notes: l.notes,
            repayments: repData.filter(r => r.loan_id === l.id).map(r => ({
                id: r.id,
                amount: Number(r.amount),
                date: r.date
            }))
        })) as unknown as Loan[];
    },
    async addLoan(userId: string, item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'> & { id: string, outstandingAmount: number, repayments: any[] }) {
        const { error } = await supabase.from('loans').insert({
            id: item.id,
            user_id: userId,
            type: item.type,
            person: item.person,
            total_amount: item.totalAmount,
            outstanding_amount: item.outstandingAmount,
            interest_rate: item.interestRate,
            interest_type: item.interestType,
            date: item.date,
            due_date: item.dueDate,
            repayment_schedule: item.repaymentSchedule,
            notes: item.notes
        });
        if (error) throw error;
    },
    async updateLoan(userId: string, item: Loan) {
        const { error } = await supabase.from('loans').update({
            outstanding_amount: item.outstandingAmount,
            notes: item.notes // other fields can be updated as needed
        }).eq('id', item.id).eq('user_id', userId);
        if (error) throw error;
        
        // Handle repayments
        await supabase.from('repayments').delete().eq('loan_id', item.id);
        if (item.repayments && item.repayments.length > 0) {
            await supabase.from('repayments').insert(
                item.repayments.map(r => ({
                    id: r.id,
                    user_id: userId,
                    loan_id: item.id,
                    amount: r.amount,
                    date: r.date
                }))
            );
        }
    },
    async deleteLoan(userId: string, id: string) {
        const { error } = await supabase.from('loans').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    },

    async getSubscriptions(userId: string): Promise<Subscription[]> {
        const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId);
        if (error) throw error;
        return data.map(s => ({
            id: s.id,
            name: s.name,
            type: s.type,
            amount: Number(s.amount),
            frequency: s.frequency,
            renewalDate: s.renewal_date,
            category: s.category,
            cancellationUrl: s.cancellation_url,
            isVariable: s.is_variable,
            health: s.health
        })) as unknown as Subscription[];
    },
    async addSubscription(userId: string, item: Subscription) {
        const { error } = await supabase.from('subscriptions').insert({
            id: item.id,
            user_id: userId,
            name: item.name,
            type: item.type,
            amount: item.amount,
            frequency: item.frequency,
            renewal_date: item.renewalDate,
            category: item.category,
            cancellation_url: item.cancellationUrl,
            is_variable: item.isVariable,
            health: item.health
        });
        if (error) throw error;
    },
    async updateSubscription(userId: string, item: Subscription) {
        const { error } = await supabase.from('subscriptions').update({
            name: item.name,
            type: item.type,
            amount: item.amount,
            frequency: item.frequency,
            renewal_date: item.renewalDate,
            category: item.category,
            cancellation_url: item.cancellationUrl,
            is_variable: item.isVariable,
            health: item.health
        }).eq('id', item.id).eq('user_id', userId);
        if (error) throw error;
    },
    async deleteSubscription(userId: string, id: string) {
        const { error } = await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    },

    async getScheduledTransactions(userId: string): Promise<ScheduledTransaction[]> {
        const { data, error } = await supabase.from('scheduled_transactions').select('*').eq('user_id', userId);
        if (error) throw error;
        return data.map(s => ({
            id: s.id,
            name: s.name,
            amount: Number(s.amount),
            category: s.category,
            type: s.type,
            frequency: s.frequency,
            startDate: s.start_date,
            endDate: s.end_date,
            nextDueDate: s.next_due_date,
            notes: s.notes,
            variance: s.variance ? Number(s.variance) : undefined
        })) as unknown as ScheduledTransaction[];
    },
    async addScheduledTransaction(userId: string, item: ScheduledTransaction) {
        const { error } = await supabase.from('scheduled_transactions').insert({
            id: item.id,
            user_id: userId,
            name: item.name,
            amount: item.amount,
            category: item.category,
            type: item.type,
            frequency: item.frequency,
            start_date: item.startDate,
            end_date: item.endDate,
            next_due_date: item.nextDueDate,
            notes: item.notes,
            variance: item.variance
        });
        if (error) throw error;
    },
    async updateScheduledTransaction(userId: string, item: ScheduledTransaction) {
        const { error } = await supabase.from('scheduled_transactions').update({
            name: item.name,
            amount: item.amount,
            category: item.category,
            type: item.type,
            frequency: item.frequency,
            start_date: item.startDate,
            end_date: item.endDate,
            next_due_date: item.nextDueDate,
            notes: item.notes,
            variance: item.variance
        }).eq('id', item.id).eq('user_id', userId);
        if (error) throw error;
    },
    async deleteScheduledTransaction(userId: string, id: string) {
        const { error } = await supabase.from('scheduled_transactions').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    },

    async getInvestments(userId: string): Promise<Investment[]> {
        const { data, error } = await supabase.from('investments').select('*').eq('user_id', userId);
        if (error) throw error;
        return data.map(i => ({
            id: i.id,
            name: i.name,
            type: i.type,
            quantity: Number(i.quantity),
            purchasePrice: Number(i.purchase_price),
            purchaseDate: i.purchase_date,
            currentPrice: Number(i.current_price),
            notes: i.notes
        })) as unknown as Investment[];
    },
    async addInvestment(userId: string, item: Investment) {
        const { error } = await supabase.from('investments').insert({
            id: item.id,
            user_id: userId,
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            purchase_price: item.purchasePrice,
            purchase_date: item.purchaseDate,
            current_price: item.currentPrice,
            notes: item.notes
        });
        if (error) throw error;
    },
    async updateInvestment(userId: string, item: Investment) {
        const { error } = await supabase.from('investments').update({
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            purchase_price: item.purchasePrice,
            purchase_date: item.purchaseDate,
            current_price: item.currentPrice,
            notes: item.notes
        }).eq('id', item.id).eq('user_id', userId);
        if (error) throw error;
    },
    async deleteInvestment(userId: string, id: string) {
        const { error } = await supabase.from('investments').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    }
};
