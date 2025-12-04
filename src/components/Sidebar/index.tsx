'use client';

import { Component } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { User, Group } from '@/data/datatypes';
import enableAuth from '../WithAuthAndTranslation';
import { TFunction } from 'i18next';
import { tokenApi } from '@/tokenApi';
import Image from 'next/image';
import styles from './style.module.css';

interface SidebarProps {
    user: User | null;
    userAuth: boolean;
    t: TFunction;
}

interface SidebarState {
    groups: Group[];
    suggestedUsers: User[];
    loading: boolean;
}

const fetchGroups = async (): Promise<Group[]> => {
    const query = `
    query {
      allGroups {
        id
        title
        membersCount
        photo
      }
    }
  `;

    try {
        const data = await tokenApi.post('/graphql', { query });
        return data.data.allGroups;
    } catch (error) {
        console.error('Error fetching groups:', error);
        return [];
    }
};

const fetchSuggestedUsers = async (): Promise<User[]> => {
    try {
        const data = await tokenApi.get('/getSuggested');
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

class Sidebar extends Component<SidebarProps, SidebarState> {
    constructor(props: SidebarProps) {
        super(props);
        this.state = {
            groups: [],
            suggestedUsers: [],
            loading: true,
        };
    }

    componentDidMount() {
        Promise.all([
            fetchGroups(),
            fetchSuggestedUsers()
        ])
            .then(([groups, suggestedUsers]) => {
                this.setState({ groups, suggestedUsers, loading: false });
            })
            .catch(error => {
                console.error('HTTP error!', error);
                this.setState({ loading: false });
            });

    }

    render() {
        const { groups, suggestedUsers } = this.state;
        const t = this.props.t;
        const theme = useTheme.getState().theme;

        return (
            <aside className={styles.sidebar} data-theme={theme}>
                <div className={styles.recPeople}>
                    <h4>{t('sugPeople')}</h4>
                    {this.state.loading ? (
                        <p data-testid="load-sug-people">{t('loadSugPeople')}</p>
                    ) : (
                        <>
                            {suggestedUsers?.map(user => (
                                <div className={styles.person} key={user.id}>
                                    <Image
                                        src={user.profileImage || '/imgs/default-avatar.jpg'}
                                        data-testid="Person avatar"
                                        className={styles.avatar}
                                        alt="Person avatar"
                                        width={48}
                                        height={48}
                                    />
                                    <div className={styles.personalInfo}>
                                        <p>{user.firstName} {user.secondName}</p>
                                        <small>@{user.username}</small>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <div className={styles.recCommunities}>
                    <h4>{t('sugGroups')}</h4>
                    {this.state.loading ? (
                        <p data-testid="load-sug-groups">{t('loadSugGroups')}</p>
                    ) : (
                        <>
                            {groups.map(group => (
                                <div className={styles.community} key={group.id}>
                                    <Image
                                        src={group.photo}
                                        data-testid="Community avatar"
                                        className={styles.avatar}
                                        alt="Community avatar"
                                        width={48}
                                        height={48}
                                    />
                                    <div className={styles.communityInfo}>
                                        <p>{group.title}</p>
                                        <small>{group.membersCount} {t('members')}</small>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </aside>
        );
    }
}

export default enableAuth(Sidebar);
export { Sidebar as UnwrappedSidebar };
