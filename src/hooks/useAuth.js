/**
 * useAuth Hook - Supabase 인증 상태 관리
 * 
 * 사용법:
 *   const { user, loading, signIn, signOut, signUp } = useAuth();
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 초기 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 인증 상태 변경 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // 이메일/비밀번호 로그인
    const signIn = useCallback(async (email, password) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        setLoading(false);
        if (error) throw error;
        return data;
    }, []);

    // OAuth 로그인 (Google, GitHub 등)
    const signInWithOAuth = useCallback(async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    }, []);

    // 회원가입
    const signUp = useCallback(async (email, password, metadata = {}) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        setLoading(false);
        if (error) throw error;
        return data;
    }, []);

    // 로그아웃
    const signOut = useCallback(async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        setLoading(false);
        if (error) throw error;
        setUser(null);
    }, []);

    // 비밀번호 재설정 이메일 발송
    const resetPassword = useCallback(async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        signInWithOAuth,
        signUp,
        signOut,
        resetPassword
    };
}

export default useAuth;
