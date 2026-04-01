import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import api from '../api/axios';
import '../css/AnalyticsDashboard.css';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        background: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        padding: '12px',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
      }}>
        <p className="label" style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
        <p className="intro" style={{ color: payload[0].stroke || payload[0].fill || '#0f172a' }}>
          {`${payload[0].name === 'value' ? 'Total' : payload[0].name}: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/feedback/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="spinner" />;
  if (!data) return <div>Failed to load analytics data.</div>;

  return (
    <div className="analytics-container fade-in">
      <div className="analytics-grid">
        {/* Monthly Trends - Area Chart (Full Width) */}
        <div className="analytics-card full-width">
          <h3 className="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#6366f1'}}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Feedback Volume Trends (Last 6 Months)
          </h3>
          <div className="chart-wrapper-large">
            <ResponsiveContainer>
              <AreaChart data={data.monthlyTrends}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints per Department - Bar Chart */}
        <div className="analytics-card">
          <h3 className="chart-title">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#10b981'}}><path d="M12 20V10 M18 20V4 M6 20v-6"/></svg>
             Department-wise Feedback
          </h3>
          <div className="chart-wrapper-medium">
            <ResponsiveContainer>
              <BarChart data={data.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} hide={true}/>
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} cursor={{fill: gridColor}} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {data.departmentStats.map((entry, index) => (
                <div key={entry.name} style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: axisColor}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '2px', background: COLORS[index % COLORS.length]}} />
                    {entry.name}
                </div>
            ))}
          </div>
        </div>

        {/* Feedback Types - Pie Chart */}
        <div className="analytics-card">
          <h3 className="chart-title">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#f59e0b'}}><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
             Feedback Categories
          </h3>
          <div className="chart-wrapper-medium">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Common Complaints */}
        <div className="analytics-card full-width" style={{minHeight: 'auto'}}>
            <h3 className="chart-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#ef4444'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
                Frequent Complaint Topics
            </h3>
            <div className="complaint-list">
                {data.commonComplaints.length > 0 ? (
                    data.commonComplaints.map((item, idx) => (
                        <div key={idx} className="complaint-item">
                            <span className="complaint-title">{item.title}</span>
                            <span className="complaint-count">{item.count} Reports</span>
                        </div>
                    ))
                ) : (
                    <div style={{color: '#94a3b8', padding: '2rem', textAlign: 'center'}}>No frequent complaints found yet.</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
