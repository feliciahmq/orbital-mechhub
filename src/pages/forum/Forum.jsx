import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth';
import { db } from '../../lib/firebaseConfig';

import './Forum.css';

function ForumPage() {
    const { currentUser } = useAuth();

    return (
        <div>
        
        </div>
    );

}

export default ForumPage;