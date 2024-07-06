import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth';
import { db } from '../../lib/firebaseConfig';

import Format from '../../components/format/Format';
import './ForumPost.css';

function ForumPostPage() {
    const { currentUser } = useAuth();

    return (
        <Format content={
            <div>
            
            </div>
        } />
    );

}

export default ForumPostPage;