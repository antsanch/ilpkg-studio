<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonPackageRelease extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'interactive_lesson_id',
        'version',
        'checksum',
        'package_path',
        'manifest_snapshot',
        'lesson_snapshot',
        'status',
        'change_summary',
    ];

    protected function casts(): array
    {
        return [
            'manifest_snapshot' => 'array',
            'lesson_snapshot' => 'array',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(InteractiveLesson::class, 'interactive_lesson_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(LessonAttempt::class, 'lesson_package_release_id');
    }
}
