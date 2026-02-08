import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';

const VendorPayouts = () => {
    const [payouts, setPayouts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3001/api/vendor/payouts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayouts(res.data);
            } catch (error) {
                console.error("Error fetching payouts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayouts();
    }, []);

    if (loading) return <div className="text-center p-8 text-gray-400">Loading Wallet...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white">Earnings & Payouts</h2>

            {/* Wallet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-blue-200 text-sm font-medium mb-1">Available Balance</p>
                        <h3 className="text-4xl font-bold mb-6">₹{payouts?.availableBalance?.toLocaleString() || '0'}</h3>

                        <button className="px-6 py-2 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                            Request Payout
                        </button>
                    </div>
                    <Wallet className="absolute right-[-20px] bottom-[-20px] text-white/10 w-48 h-48" />
                </div>

                <div className="glass-card p-8 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-2">Next Scheduled Payout</p>
                    <h3 className="text-3xl font-bold text-white mb-4">₹{payouts?.nextPayout?.toLocaleString() || '0'}</h3>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <ArrowUpRight size={16} />
                        <span>Processing on Feb 15, 2024</span>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Payout History</h3>
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Trans. ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payouts?.history?.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-gray-300">{item.date}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">PY_{item.id}2938</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium uppercase">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-white">
                                        ₹{item.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorPayouts;
