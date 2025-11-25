'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import AddPostForm from '../AddPostForm';
import Image from 'next/image';
import './style.css';

interface Props {
    avatar?: string;
    postCreated: () => void;
}

const AddPost = ({ avatar, postCreated }: Props) => {
    const { theme } = useTheme();
    const [showForm, setShowForm] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <div id="addPost" data-theme={theme}>
                <div>
                    <Image
                        data-testid="user-avatar"
                        className="avatar"
                        src={avatar || '/imgs/default-avatar.jpg'}
                        width={64}
                        height={64}
                        alt="User avatar"
                    />
                    <p data-testid="whats-happening">{t('whatsHappening')}</p>
                </div>
                <button data-testid="tell-everyone" onClick={() => setShowForm(true)}>{t('tellEveryone')}</button>
            </div>

            {showForm && <AddPostForm data-testid="add-post-form" close={() => setShowForm(false)} postCreated={postCreated} />}
        </>
    );
};

export default AddPost;