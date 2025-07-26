import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    signInAnonymously, 
    signInWithCustomToken,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [userRole, setUserRole] = useState('pilgrim');
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [familyId, setFamilyId] = useState(null);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    useEffect(() => {
        // ✅ FIXED: The entire useEffect hook is restructured for proper session handling.
        // onAuthStateChanged is the single source of truth for the user's auth state.
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("onAuthStateChanged fired. User:", firebaseUser ? firebaseUser.uid : "null");
            
            if (firebaseUser) {
                // User is signed in (or session was restored)
                setCurrentUser(firebaseUser);
                setUserId(firebaseUser.uid);

                if (!firebaseUser.isAnonymous) {
                    const userDocRef = doc(db, `artifacts/${appId}/registeredUsers`, firebaseUser.uid);
                    try {
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            // Existing registered user
                            const userData = userDocSnap.data();
                            setUsername(userData?.username || firebaseUser.email.split('@')[0]);
                            setUserAddress(userData?.address || null);
                            setUserRole(userData?.role || 'pilgrim');
                            setFamilyId(userData?.familyId || null);
                            await updateDoc(userDocRef, { lastLoginAt: new Date() });
                        } else {
                            // This is a new registered user (e.g., first login after registration)
                            // or a user whose document was deleted. Create their document.
                            console.warn(`Registered user doc not found for ${firebaseUser.uid}. Creating with defaults.`);
                            const newUserDoc = {
                                email: firebaseUser.email,
                                username: firebaseUser.email.split('@')[0],
                                role: 'pilgrim',
                                createdAt: new Date(),
                                lastLoginAt: new Date(),
                                address: null,
                                familyId: null, // ✅ FIXED: Ensure familyId is initialized
                            };
                            await setDoc(userDocRef, newUserDoc);
                            
                            // Set state from the new document
                            setUsername(newUserDoc.username);
                            setUserAddress(newUserDoc.address);
                            setUserRole(newUserDoc.role);
                            setFamilyId(newUserDoc.familyId);
                        }
                    } catch (error) {
                        console.error("Error managing registered user doc:", error);
                        // Set fallback state on error to prevent crashes
                        setUsername(firebaseUser.email.split('@')[0]);
                        setUserRole('pilgrim');
                        setFamilyId(null);
                    }
                } else {
                    // Handle anonymous user state
                    setUsername(null);
                    setUserAddress(null);
                    setUserRole('pilgrim');
                    setFamilyId(null);
                }
            } else {
                // User is signed out or no session exists.
                // Now we can safely attempt a default sign-in.
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Default sign-in failed:", error);
                    // If default sign-in fails, ensure state is cleared
                    setCurrentUser(null);
                    setUserId(null);
                    setUsername(null);
                    setUserAddress(null);
                    setUserRole('pilgrim');
                    setFamilyId(null);
                }
            }
            // Mark auth as ready only after all logic has run
            setIsAuthReady(true);
        });

        return () => unsubscribe(); // Cleanup the listener on component unmount
    }, [appId, initialAuthToken]);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email, password, role = 'pilgrim') => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, `artifacts/${appId}/registeredUsers`, result.user.uid);
        
        // This part is correct and ensures new registrations have familyId set to null.
        await setDoc(userDocRef, {
            email,
            username: email.split('@')[0],
            role: role,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            address: null,
            familyId: null,
        });
        return result;
    };

    const logout = () => {
        // Signing out will trigger onAuthStateChanged, which will then handle anonymous sign-in
        return signOut(auth);
    };

    const updateProfile = async (profileData) => {
        if (currentUser && userId && !currentUser.isAnonymous) {
            const userDocRef = doc(db, `artifacts/${appId}/registeredUsers`, userId);
            try {
                const dataToUpdate = { ...profileData };
                delete dataToUpdate.role;

                await updateDoc(userDocRef, dataToUpdate);
                if (profileData.username !== undefined) setUsername(profileData.username);
                if (profileData.address !== undefined) setUserAddress(profileData.address);
            } catch (error) {
                console.error("Error updating user profile:", error);
                throw error;
            }
        } else {
            throw new Error("Authentication required to update profile.");
        }
    };
    
    const value = {
        currentUser,
        userId,
        username,
        userAddress,
        userRole,
        familyId,
        setFamilyId,
        login,
        register,
        logout,
        updateProfile,
        isAuthReady
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
