import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { studioTheme } from '../../Theme/studioTheme';
import { StaticAuditView as AuditComponent } from '../../Components/Player/StaticAuditView';

export default function StaticAuditViewPage({ audit }: { audit: any }) {
    return (
        <ThemeProvider theme={studioTheme}>
            <CssBaseline />
            <AuditComponent
                lessonTitle={audit?.lesson_title || 'Lección Anatómica'}
                version={audit?.version_applied || '1.0.0'}
                attempt={{
                    passed: audit?.passed,
                    scoreObtained: audit?.final_score,
                    maxScore: 100,
                    percentage: audit?.final_score,
                    completedAt: audit?.completed_at,
                }}
                answers={audit?.audit_trail || []}
            />
        </ThemeProvider>
    );
}
