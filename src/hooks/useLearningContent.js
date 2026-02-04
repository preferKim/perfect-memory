/**
 * 학습 콘텐츠 관리 Hook
 * - Supabase에서 단어/문제 데이터 가져오기
 * - 학습 기록 저장
 */

import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * 과정(course)의 문제/단어 가져오기
 */
export function useLearningContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * 특정 과정의 문제 가져오기
     * @param {string} courseCode - 과정 코드 (예: 'english_easy')
     * @param {object} options - 옵션
     * @returns {Promise<Array>} 문제 배열
     */
    const getQuestions = useCallback(async (courseCode, options = {}) => {
        const { limit = 20, shuffle = true, level = null } = options;

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('words')
                .select('*')
                .eq('course_code', courseCode)
                .eq('is_active', true);

            if (level !== null) {
                query = query.eq('level', level);
            }

            query = query.order('display_order');

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // content 필드 추출 및 id 포함
            let questions = data?.map(item => ({
                ...item.content,
                _wordId: item.id,
                _level: item.level
            })) || [];

            // 셔플
            if (shuffle && questions.length > 0) {
                questions = questions.sort(() => Math.random() - 0.5);
            }

            return questions;
        } catch (err) {
            setError(err.message);
            console.error('getQuestions error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 과목별 전체 문제 가져오기 (레벨별 분류)
     */
    const getQuestionsBySubject = useCallback(async (subject, difficulty) => {
        setLoading(true);
        setError(null);

        try {
            const courseCode = `${subject}_${difficulty}`;

            const { data, error: fetchError } = await supabase
                .from('words')
                .select('*')
                .eq('course_code', courseCode)
                .eq('is_active', true)
                .order('level', { ascending: true })
                .order('display_order');

            if (fetchError) throw fetchError;

            // 레벨별 그룹화
            const byLevel = {};
            data?.forEach(item => {
                const level = item.level || 1;
                if (!byLevel[level]) byLevel[level] = [];
                byLevel[level].push({
                    ...item.content,
                    _wordId: item.id
                });
            });

            return byLevel;
        } catch (err) {
            setError(err.message);
            return {};
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 과정 목록 가져오기
     */
    const getCourses = useCallback(async (subject = null) => {
        try {
            let query = supabase
                .from('courses')
                .select('*')
                .order('display_order');

            if (subject) {
                query = query.eq('subject', subject);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            return data || [];
        } catch (err) {
            console.error('getCourses error:', err);
            return [];
        }
    }, []);

    return {
        loading,
        error,
        getQuestions,
        getQuestionsBySubject,
        getCourses
    };
}

/**
 * Fallback: JSON 파일에서 데이터 가져오기 (DB 연결 실패 시)
 */
export async function fetchFromJson(subject, difficulty) {
    try {
        const response = await fetch(`/words/${subject}_${difficulty}.json`);
        if (!response.ok) throw new Error('JSON fetch failed');
        return await response.json();
    } catch (err) {
        console.error('fetchFromJson error:', err);
        return [];
    }
}

export default useLearningContent;
