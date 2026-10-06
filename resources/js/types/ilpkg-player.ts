import { IlpkgLesson } from './ilpkg-lesson';
import { IlpkgManifest } from './ilpkg-manifest';

export type ReleaseLifecycleStatus = 'active' | 'deprecated' | 'archived';

export interface StudentAttemptSummary {
    id: string;
    attemptNumber: number;
    isFirstAttempt: boolean;
    scoreObtained: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    completedAt?: string;
}

export interface PlayerCheckpointAnswer {
    checkpointId: string;
    promptSnapshot: string;
    selectedOptionId?: string;
    selectedOptionText?: string;
    isCorrect: boolean;
    pointsAwarded: number;
}

export interface PlayerProps {
    lesson: {
        id: string;
        title: string;
        slug: string;
        isDeleted?: boolean;
    };
    release: {
        id: string;
        version: string;
        status: ReleaseLifecycleStatus;
        has3dAssets: boolean;
        packagePath?: string;
        manifest: IlpkgManifest;
        lessonData: IlpkgLesson;
    };
    attempt?: StudentAttemptSummary | null;
    historicalAnswers?: PlayerCheckpointAnswer[];
    latestActiveRelease?: {
        id: string;
        version: string;
    };
}
