import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../../src/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { signInWithGoogle } from "../../../src/pages/registration/GoogleAuth";
import { navigate } from "react-router-dom";

jest.mock('firebase/auth');
jest.mock('"../../../src/lib/firebaseConfig', () => ({
    db: {},
}));
jest.mock('firebase/firestore', () => ({
    exists: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
}));
jest.mock('react-hot-toast');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    navigate: jest.fn(),
}));

describe('google auth', () => {
    const provider = new GoogleAuthProvider();

    beforeEach(() => {
        signInWithPopup.mockResolvedValue({
            user: {
                uid: 'tester-uid',
                email: 'tester@eg.com',
            }
        });

        setDoc.mockResolvedValue();

        toast.success = jest.fn();
        toast.error = jest.fn();
        navigate.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('handles signup correctly', async () => {
        getDoc.mockResolvedValue({
            exists: () => false,
        });

        await signInWithGoogle();

        expect(signInWithPopup).toHaveBeenCalledWith(auth, provider);
        expect(getDoc).toHaveBeenCalledWith(doc(db, "Users", "tester-uid"));
        expect(setDoc).toHaveBeenCalledTimes(2); // Users and UserChats
        expect(toast.success).toHaveBeenCalledWith("Account created successfully.");
        expect(navigate).toHaveBeenCalledWith(`/profile/tester-uid`);
    });

    test('handles login correctly', async () => {

    });

    test('renders error notifications', async () => {

    });

})