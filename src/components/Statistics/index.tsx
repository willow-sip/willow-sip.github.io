'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import TableStats from '../TableStats';
import ChartStats from '../ChartStats';
import './style.css';

import { genStats } from '@/data/dummyStats';
import { Like, Comment } from '@/data/datatypes';
import { tokenApi } from '@/tokenApi';
import { transformStatisticsData } from '@/utils';

export interface StatsData {
    likes: { month: string; count: number }[];
    comments: { month: string; count: number }[];
}

const Statistics = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
    const [likes, setLikes] = useState<Like[] | null>(null);
    const [comments, setComments] = useState<Comment[] | null>(null);
    const { t } = useTranslation();

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

    const stats = useMemo(() => {
        if (!likes || !comments) return null;
        return {
            likes: transformStatisticsData(likes),
            comments: transformStatisticsData(comments),
        };
    }, [likes, comments]);

    const handleToggle = () => {
        setActiveTab(prev => (prev === 'table' ? 'chart' : 'table'));
    };

    return (
        <div className='stats-page'>
            <div className="general-stats" data-theme={theme}>
                {genStats.map((stat, index) => (
                    <div className="stat" key={index} data-testid="stat">
                        <p>{stat.title.includes("views") ? t("totalViews") :
                            (stat.title.includes("likes") ? t("totalLikes") : t("totalComments"))}</p>
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

                <div className="formated-stats">
                    {activeTab === 'table' && stats && <TableStats data-testid="table-stats" stats={stats} />}
                    {activeTab === 'chart' && stats && <ChartStats data-testid="chart-stats" stats={stats} />}
                </div>
            </div>
        </div>
    );
};

export default Statistics;