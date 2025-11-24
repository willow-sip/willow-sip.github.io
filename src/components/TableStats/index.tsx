'use client';

import { useTranslation } from 'react-i18next';
import { StatsData } from '../Statistics';
import './style.css';
import React from 'react';

interface Props {
    stats: StatsData;
}

const TableStats = React.memo(({ stats }: Props) => {
    const { t } = useTranslation();
    return (
        <div className="statsTable" data-testid="table-stats">
            <div className="stat">
                <h3 data-testid="likes-stat-header">{t('likesStat')}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>{t('month')}</th>
                            <th>{t('likesCountStats')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.likes.map((like, i) => (
                            <tr key={i}>
                                <td data-testid="month">{like.month}</td>
                                <td data-testid="likes-count">{like.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="stat">
                <h3 data-testid="comments-stat-header">{t('commentsStat')}</h3>
                <table>
                    <thead><tr><th>{t('month')}</th><th>{t('commentsCountStats')}</th></tr></thead>
                    <tbody>
                        {stats.comments.map((comment, i) => (
                            <tr key={i}>
                                <td data-testid="month">{comment.month}</td>
                                <td data-testid="comments-count">{comment.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>


        </div>

    );
});

export default TableStats;