'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import TableStats from '../TableStats';
import ChartStats from '../ChartStats';
import { useTranslation } from 'react-i18next';
import './style.css';

import { genStats } from '@/data/dummyStats';
import { Like, Comment } from '@/data/datatypes';
import { tokenApi } from '@/tokenApi';

export interface StatsData {
    likes: { month: string; count: number }[];
    comments: { month: string; count: number }[];
}

const Statistics = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
    const [likes, setLikes] = useState<Like[] | null>(null);
    const [comments, setComments] = useState<Comment[] | null>(null);
    const [location, setLocation] = useState<"profile" | "statistics">("statistics");
    const router = useRouter();
    const { t } = useTranslation();

    const handleToggle = () => {
        setActiveTab(prev => (prev === 'table' ? 'chart' : 'table'));
    };

    const stats = React.useMemo(() => {
        if (!likes || !comments) return null;
        return {
            likes: transformData(likes),
            comments: transformData(comments),
        };
    }, [likes, comments]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [likesRes, commentsRes] = await Promise.all([
                    tokenApi.get(`/me/likes`),
                    tokenApi.get(`/me/comments`),
                ]);
                setLikes(likesRes);
                setComments(commentsRes);
            } catch (err) {
                console.error(err);
            }
        };

        fetchStats();
    }, []);

    function transformData(data: Like[] | Comment[]): { month: string; count: number }[] {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const result: { month: string; count: number }[] = [];
        const monthCounts: { [key: string]: number } = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const date = new Date(item.creationDate);
            const monthIndex = date.getMonth();
            const monthName = monthNames[monthIndex];

            if (monthCounts[monthName] === undefined) {
                monthCounts[monthName] = 1;
            } else {
                monthCounts[monthName] += 1;
            }
        }

        for (let i = 0; i < monthNames.length; i++) {
            const name = monthNames[i];
            if (monthCounts[name] !== undefined) {
                result.push({
                    month: name,
                    count: monthCounts[name]
                });
            }
        }

        return result;
    }

    return (
        <>
            <div className="page-switch">
                <button data-testid="profile-link" className={location === "profile" ? "active" : ""} onClick={() => { router.push('/profile'); setLocation("profile") }}>{t('profileLink')}</button>
                <button data-testid="statistics-link" className={location === "statistics" ? "active" : ""} onClick={() => { router.push('/statistics'); setLocation("statistics") }}>{t('statsLink')}</button>
            </div>
            <div className="general-stats" data-theme={theme}>
                {genStats.map((stat, index) => (
                    <div className="stat" key={index} data-testid="stat">
                        <p>{stat.title}</p>
                        <h1>{stat.stat}</h1>
                        <small>{stat.percent >= 0 ? `+${stat.percent}` : `${stat.percent}`}{t('percentStats')}</small>
                    </div>
                ))}
            </div>
            <div className="stats" data-theme={theme}>
                <div className="view">
                    <p>{t('tableView')}</p>
                    <label className="tabSwitch">
                        <input
                            data-testid="view-toggle"
                            type="checkbox"
                            checked={activeTab === 'chart'}
                            onChange={handleToggle}
                        />
                        <span className="slider" />
                    </label>
                    <p>{t('chartView')}</p>
                </div>

                {activeTab === 'table' && stats && <TableStats data-testid="table-stats" stats={stats} />}
                {activeTab === 'chart' && stats && <ChartStats data-testid="chart-stats" stats={stats} />}
            </div>
        </>
    );
};

export default Statistics;