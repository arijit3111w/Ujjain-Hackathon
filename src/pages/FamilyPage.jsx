import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, deleteField, runTransaction } from 'firebase/firestore';
import { User, Users, LogIn, PlusCircle, Copy, Check, LogOut, ShieldCheck, Crown, Loader2 } from 'lucide-react';

// It's best practice to define the appId once and use it throughout.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// A helper component for loading states to avoid repetition.
const FullPageLoader = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="mt-4 text-lg text-gray-600">{message}</p>
    </div>
);

const FamilyPage = () => {
    // Auth context provides user state.
    const { currentUser, userId, username, userRole, familyId, setFamilyId, isAuthReady } = useAuth();
    
    // State for family data, loading, errors, and UI interactions.
    const [familyData, setFamilyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [joinId, setJoinId] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // Effect to subscribe to family data changes in real-time.
    useEffect(() => {
        if (!isAuthReady || !currentUser || currentUser.isAnonymous) {
            setIsLoading(false);
            return;
        }

        if (familyId) {
            setIsLoading(true);
            const familyDocRef = doc(db, `artifacts/${appId}/families`, familyId);
            const unsubscribe = onSnapshot(familyDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setFamilyData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // If the family doc is deleted, reset the local state.
                    setFamilyId(null);
                    setFamilyData(null);
                    console.warn("Family document not found, resetting state.");
                }
                setIsLoading(false);
            }, (err) => {
                console.error("Error listening to family data:", err);
                setError("Could not load family data. Please refresh the page.");
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            // If there's no familyId, no need to listen.
            setFamilyData(null);
            setIsLoading(false);
        }
    }, [isAuthReady, currentUser, familyId, setFamilyId]);

    // Generic function to handle submissions and errors
    const handleSubmit = async (action, successMessage, failureMessage) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError('');
        try {
            await action();
            // Success messages can be added here if needed.
        } catch (err) {
            console.error(failureMessage, err);
            setError(err.message || failureMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateFamily = () => {
        if (!familyName.trim()) {
            setError("Family name cannot be empty.");
            return;
        }
        handleSubmit(async () => {
            const newFamilyRef = doc(collection(db, `artifacts/${appId}/families`));
            const userDocRef = doc(db, `artifacts/${appId}/registeredUsers`, userId);

            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (userDoc.data()?.familyId) {
                    throw new Error("You are already in a family.");
                }

                const memberData = { uid: userId, username, role: userRole };
                transaction.set(newFamilyRef, {
                    name: familyName.trim(),
                    creatorId: userId,
                    createdAt: new Date(),
                    members: { [userId]: memberData },
                });
                transaction.update(userDocRef, { familyId: newFamilyRef.id });
            });
            setFamilyId(newFamilyRef.id); // Update auth context state
            setFamilyName('');
        }, "Failed to create family. You might already be in one.");
    };

    const handleJoinFamily = () => {
        const trimmedJoinId = joinId.trim();
        if (!trimmedJoinId) {
            setError("Please enter a Family ID.");
            return;
        }
        handleSubmit(async () => {
            const familyDocRef = doc(db, `artifacts/${appId}/families`, trimmedJoinId);
            const userDocRef = doc(db, `artifacts/${appId}/registeredUsers`, userId);

            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (userDoc.data()?.familyId) {
                    throw new Error("You are already in a family.");
                }
                
                const familyDoc = await transaction.get(familyDocRef);
                if (!familyDoc.exists()) {
                    throw new Error("Family not found. Please check the ID.");
                }

                const memberData = { uid: userId, username, role: userRole };
                transaction.update(familyDocRef, { [`members.${userId}`]: memberData });
                transaction.update(userDocRef, { familyId: trimmedJoinId });
            });
            setFamilyId(trimmedJoinId); // Update auth context state
            setJoinId('');
        }, "Failed to join family. Please check the ID and try again.");
    };

    // ✅ CHANGED: Now deletes the family doc if the last member leaves.
    const handleLeaveFamily = () => {
        if (!familyId) return;
        handleSubmit(async () => {
            const familyDocRef = doc(db, `artifacts/${appId}/families`, familyId);
            const userDocRef = doc(db, `artifacts/${appId}/registeredUsers`, userId);

            await runTransaction(db, async (transaction) => {
                const familyDoc = await transaction.get(familyDocRef);
                if (!familyDoc.exists()) {
                    // Family already deleted, just update user doc
                    transaction.update(userDocRef, { familyId: null });
                    return;
                }

                const familyMembers = familyDoc.data()?.members || {};
                
                // If user is the last member, delete the family document.
                if (Object.keys(familyMembers).length === 1 && familyMembers[userId]) {
                    console.log("Last member leaving. Deleting the family document.");
                    transaction.delete(familyDocRef);
                } else {
                    // Otherwise, just remove the user from the members list.
                    transaction.update(familyDocRef, { [`members.${userId}`]: deleteField() });
                }
                
                // In both cases, update the user's document to remove their familyId.
                transaction.update(userDocRef, { familyId: null });
            });
            setFamilyId(null); // Update auth context state
        }, "Failed to leave family.");
    };

    const copyToClipboard = () => {
        if (!familyData?.id) return;
        const textToCopy = familyData.id;
        
        const textArea = document.createElement("textarea");
        textArea.style.position = 'fixed';
        textArea.style.opacity = 0;
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setError("Could not copy ID. Please copy it manually.");
        }
        
        document.body.removeChild(textArea);
    };

    if (isLoading) return <FullPageLoader message="Loading Family Data..." />;
    
    if (!currentUser || currentUser.isAnonymous) {
        return (
            <div className="text-center py-20 px-4">
                <User className="h-12 w-12 mx-auto text-gray-400" />
                <h2 className="mt-4 text-2xl font-bold">Access Denied</h2>
                <p className="mt-2 text-gray-600">Please sign in to create or view a family group.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 font-inter">
            <div className="max-w-4xl mx-auto px-4">
                {familyData ? (
                    // VIEW WHEN USER IS IN A FAMILY
                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-md border text-center">
                            <h1 className="text-3xl font-bold text-gray-800">{familyData.name}</h1>
                            <p className="text-gray-500 mt-2">Share this ID with your family to invite them.</p>
                            <div className="mt-4 flex justify-center items-center gap-2 bg-gray-100 p-3 rounded-lg max-w-sm mx-auto">
                                <span className="font-mono text-lg text-violet-700 truncate">{familyData.id}</span>
                                <button onClick={copyToClipboard} className="p-2 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50" disabled={isSubmitting}>
                                    {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-500" />}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users /> Members ({familyData.members ? Object.keys(familyData.members).length : 0})</h2>
                            <div className="bg-white rounded-lg shadow-md border divide-y">
                                {familyData.members && Object.values(familyData.members).sort((a,b) => a.username.localeCompare(b.username)).map(member => (
                                    <div key={member.uid} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {member.role === 'admin' ? <ShieldCheck className="h-6 w-6 text-slate-500" /> : member.role === 'vip' ? <Crown className="h-6 w-6 text-amber-500" /> : <User className="h-6 w-6 text-gray-400" />}
                                            <span className="font-medium">{member.username || 'Unnamed User'}</span>
                                        </div>
                                        {member.uid === familyData.creatorId && <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-1 rounded-full">CREATOR</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button onClick={handleLeaveFamily} disabled={isSubmitting} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2 mx-auto disabled:bg-red-300">
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                                Leave Family
                            </button>
                        </div>
                    </div>
                ) : (
                    // VIEW WHEN USER IS NOT IN A FAMILY
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><PlusCircle className="text-violet-500"/> Create a Family</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleCreateFamily(); }} className="space-y-4">
                                <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Enter a name for your family" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-400" disabled={isSubmitting} />
                                <button type="submit" disabled={isSubmitting} className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 flex justify-center items-center gap-2 disabled:bg-violet-400">
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create'}
                                </button>
                            </form>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><LogIn className="text-green-500"/> Join a Family</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleJoinFamily(); }} className="space-y-4">
                                <input type="text" value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Enter Family ID" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" disabled={isSubmitting} />
                                <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex justify-center items-center gap-2 disabled:bg-green-400">
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Join'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {error && <p className="text-red-500 mt-6 md:col-span-2 text-center bg-red-100 p-3 rounded-lg">{error}</p>}
            </div>
        </div>
    );
};

export default FamilyPage;
