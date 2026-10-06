<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttemptResponse extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'lesson_attempt_id',
        'checkpoint_id',
        'prompt_snapshot',
        'selected_option_id',
        'selected_option_text',
        'is_correct',
        'points_awarded',
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'points_awarded' => 'integer',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(LessonAttempt::class, 'lesson_attempt_id');
    }
}
