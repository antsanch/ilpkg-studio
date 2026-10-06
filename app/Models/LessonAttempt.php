<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonAttempt extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'interactive_lesson_id',
        'lesson_package_release_id',
        'attempt_number',
        'is_first_attempt',
        'score_obtained',
        'max_score',
        'percentage',
        'passed',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_first_attempt' => 'boolean',
            'passed' => 'boolean',
            'percentage' => 'float',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(InteractiveLesson::class, 'interactive_lesson_id');
    }

    public function release(): BelongsTo
    {
        return $this->belongsTo(LessonPackageRelease::class, 'lesson_package_release_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(AttemptResponse::class, 'lesson_attempt_id');
    }
}
