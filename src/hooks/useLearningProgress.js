/**
 * 학습 진행 상태 관리 Hook
 * - 과정별 진행률 추적
 * - 학습 기록 저장
 * - 약점 단어 관리
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useLearningProgress(userId) {
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);

    /**
     * 사용자의 전체 진행 상태 가져오기
     */
    const fetchProgress = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_course_progress')
                .select(`
                    *,
                    courses (
                        course_code,
                        course_name,
                        subject,
                        total_items
                    )
                `)
                .eq('user_id', userId);

            if (error) throw error;

            // course_code를 키로 하는 객체로 변환
            const progressMap = {};
            data?.forEach(item => {
                if (item.courses) {
                    progressMap[item.courses.course_code] = {
                        ...item,
                        courseName: item.courses.course_name,
                        totalItems: item.courses.total_items
                    };
                }
            });

            setProgress(progressMap);
            return progressMap;
        } catch (err) {
            console.error('fetchProgress error:', err);
            return {};
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchProgress();
        }
    }, [userId, fetchProgress]);

    /**
     * 게임 세션 시작
     */
    const startSession = useCallback(async (courseCode, gameMode) => {
        if (!userId) return null;

        try {
            // course_id 조회
            const { data: course } = await supabase
                .from('courses')
                .select('id')
                .eq('course_code', courseCode)
                .single();

            if (!course) {
                console.warn('Course not found:', courseCode);
                return null;
            }

            const { data: session, error } = await supabase
                .from('game_sessions')
                .insert({
                    user_id: userId,
                    course_id: course.id,
                    game_mode: gameMode,
                    started_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            setCurrentSession(session);
            return session;
        } catch (err) {
            console.error('startSession error:', err);
            return null;
        }
    }, [userId]);

    /**
     * 게임 세션 종료
     */
    const endSession = useCallback(async (stats) => {
        if (!currentSession) return;

        const { totalQuestions, correctCount, wrongCount, score } = stats;
        const accuracy = totalQuestions > 0
            ? (correctCount / totalQuestions * 100).toFixed(2)
            : 0;

        try {
            await supabase
                .from('game_sessions')
                .update({
                    ended_at: new Date().toISOString(),
                    duration_seconds: Math.floor((Date.now() - new Date(currentSession.started_at)) / 1000),
                    total_questions: totalQuestions,
                    correct_count: correctCount,
                    wrong_count: wrongCount,
                    score: score,
                    accuracy: parseFloat(accuracy)
                })
                .eq('id', currentSession.id);

            // 과정 진행률 업데이트
            await updateCourseProgress(currentSession.course_id, stats);

            setCurrentSession(null);
        } catch (err) {
            console.error('endSession error:', err);
        }
    }, [currentSession]);

    /**
     * 개별 답안 기록
     */
    const recordAnswer = useCallback(async (wordId, isCorrect, userAnswer = null, timeSpentMs = null) => {
        if (!userId || !currentSession) return;

        try {
            // 학습 기록 저장
            await supabase
                .from('learning_records')
                .insert({
                    user_id: userId,
                    word_id: wordId,
                    course_id: currentSession.course_id,
                    game_mode: currentSession.game_mode,
                    is_correct: isCorrect,
                    user_answer: userAnswer,
                    time_spent_ms: timeSpentMs,
                    session_id: currentSession.id
                });

            // 오답이면 weak_words 업데이트
            if (!isCorrect) {
                await addWeakWord(wordId);
            } else {
                // 정답이면 weak_words에서 correct_count 증가
                await updateWeakWordCorrect(wordId);
            }
        } catch (err) {
            console.error('recordAnswer error:', err);
        }
    }, [userId, currentSession]);

    /**
     * 약점 단어 추가/업데이트
     */
    const addWeakWord = useCallback(async (wordId) => {
        if (!userId) return;

        try {
            // 기존 레코드 확인
            const { data: existing } = await supabase
                .from('weak_words')
                .select('id, wrong_count')
                .eq('user_id', userId)
                .eq('word_id', wordId)
                .maybeSingle();

            if (existing) {
                await supabase
                    .from('weak_words')
                    .update({
                        wrong_count: existing.wrong_count + 1,
                        last_wrong_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('weak_words')
                    .insert({
                        user_id: userId,
                        word_id: wordId,
                        wrong_count: 1,
                        last_wrong_at: new Date().toISOString()
                    });
            }
        } catch (err) {
            console.error('addWeakWord error:', err);
        }
    }, [userId]);

    /**
     * 약점 단어 정답 시 업데이트
     */
    const updateWeakWordCorrect = useCallback(async (wordId) => {
        if (!userId) return;

        try {
            const { data: existing } = await supabase
                .from('weak_words')
                .select('id, correct_count')
                .eq('user_id', userId)
                .eq('word_id', wordId)
                .maybeSingle();

            if (existing) {
                await supabase
                    .from('weak_words')
                    .update({
                        correct_count: existing.correct_count + 1,
                        last_correct_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);
            }
        } catch (err) {
            // 없으면 무시
        }
    }, [userId]);

    /**
     * 약점 단어 목록 가져오기
     */
    const getWeakWords = useCallback(async (limit = 20) => {
        if (!userId) return [];

        try {
            const { data, error } = await supabase
                .from('weak_words')
                .select(`
                    *,
                    words (content, course_code)
                `)
                .eq('user_id', userId)
                .order('wrong_count', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data?.map(item => ({
                ...item.words?.content,
                _wordId: item.word_id,
                _wrongCount: item.wrong_count,
                _correctCount: item.correct_count
            })) || [];
        } catch (err) {
            console.error('getWeakWords error:', err);
            return [];
        }
    }, [userId]);

    /**
     * 약점 단어 삭제 (마스터함)
     */
    const removeWeakWord = useCallback(async (wordId) => {
        if (!userId) return;

        try {
            await supabase
                .from('weak_words')
                .delete()
                .eq('user_id', userId)
                .eq('word_id', wordId);
        } catch (err) {
            console.error('removeWeakWord error:', err);
        }
    }, [userId]);

    /**
     * 과정 진행률 업데이트
     */
    const updateCourseProgress = async (courseId, stats) => {
        if (!userId) return;

        const { correctCount, wrongCount, score } = stats;

        try {
            // 기존 진행 상태 확인
            const { data: existing } = await supabase
                .from('user_course_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .maybeSingle();

            const now = new Date().toISOString();

            if (existing) {
                await supabase
                    .from('user_course_progress')
                    .update({
                        status: 'in_progress',
                        total_attempts: existing.total_attempts + 1,
                        correct_count: existing.correct_count + correctCount,
                        wrong_count: existing.wrong_count + wrongCount,
                        best_score: Math.max(existing.best_score || 0, score || 0),
                        last_studied_at: now
                    })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('user_course_progress')
                    .insert({
                        user_id: userId,
                        course_id: courseId,
                        status: 'in_progress',
                        total_attempts: 1,
                        correct_count: correctCount,
                        wrong_count: wrongCount,
                        best_score: score || 0,
                        started_at: now,
                        last_studied_at: now
                    });
            }

            // 진행 상태 갱신
            await fetchProgress();
        } catch (err) {
            console.error('updateCourseProgress error:', err);
        }
    };

    /**
     * 특정 과정의 진행 상태 가져오기
     */
    const getCourseProgress = useCallback((courseCode) => {
        return progress[courseCode] || null;
    }, [progress]);

    /**
     * 과정 상태 아이콘 반환
     */
    const getStatusIcon = useCallback((courseCode) => {
        const p = progress[courseCode];
        if (!p) return '⚪'; // not_started
        if (p.status === 'completed') return '✅';
        if (p.status === 'in_progress') return '🔵';
        return '⚪';
    }, [progress]);

    return {
        progress,
        loading,
        currentSession,
        fetchProgress,
        startSession,
        endSession,
        recordAnswer,
        getWeakWords,
        removeWeakWord,
        getCourseProgress,
        getStatusIcon
    };
}

export default useLearningProgress;
