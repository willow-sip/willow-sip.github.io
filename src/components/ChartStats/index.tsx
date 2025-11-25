'use client';

import { StatsData } from '../Statistics';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';

import './style.css';
import React from 'react';

interface Props {
    stats: StatsData;
}

const ChartStats = React.memo(({ stats }: Props) => {
    const { t } = useTranslation();

    return (
        <div className="statsChart" data-testid="chart-stats"> 
            <div className="chartBlock">
                <h3>{t('likesStat')}</h3>
                <div>
                    <ResponsiveContainer width="100%" height={448}>
                        <LineChart data={stats.likes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid vertical={false} stroke="var(--chart-color)" strokeDasharray="0" />
                            <XAxis dataKey="month"
                                tick={{ fill: 'var(--gray-100)', fontSize: 14 }}
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 'auto']} />
                            <YAxis
                                tick={{ fill: 'var(--gray-100)', fontSize: 14 }}
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 'auto']}
                            />
                            <Tooltip
                                cursor={{ stroke: 'var(--gray-400)', strokeWidth: 2 }}
                                contentStyle={{
                                    backgroundColor: 'var(--gray-900)',
                                    border: '1px solid var(--gray-400)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    color: 'var(--text-color)',
                                    fontSize: '14px',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: 'var(--text-color)' }}
                                formatter={(value: number) => [value, 'Likes']}
                                labelStyle={{ fontWeight: '600', color: 'var(--text-color)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="var(--chart-color)"
                                strokeWidth={3}
                                dot={{ r: 5, stroke: 'var(--chart-dot)', strokeWidth: 2, fill: 'var(--chart-dot)' }}
                                activeDot={{ r: 6, stroke: `rgba(var(--chart-dot-rgb), 0.5)`, strokeWidth: 0, fill: 'var(--chart-dot)' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>

            <div className="chartBlock">
                <h3>{t('commentsStat')}</h3>
                <div>
                <ResponsiveContainer  width="100%" height={448}>
                    <BarChart data={stats.comments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid vertical={false} stroke="var(--chart-color)" strokeDasharray="0" />
                        <XAxis dataKey="month"
                            tick={{ fill: 'var(--gray-100)', fontSize: 14 }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 'auto']} />
                        <YAxis
                            tick={{ fill: 'var(--gray-100)', fontSize: 14 }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--gray-400)', opacity: 0.2 }}
                            contentStyle={{
                                backgroundColor: 'var(--gray-900)',
                                border: '1px solid var(--gray-400)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                color: 'var(--text-color)',
                                fontSize: '14px',
                                padding: '12px'
                            }}
                            itemStyle={{ color: 'var(--text-color)' }}
                            formatter={(value: number) => [value, 'Comments']}
                            labelStyle={{ fontWeight: '600', color: 'var(--text-color)' }}
                        />
                        <Bar dataKey="count" fill="var(--chart-color)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        </div>
    );
});

export default ChartStats;
