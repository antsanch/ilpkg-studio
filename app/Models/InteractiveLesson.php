<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InteractiveLesson extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'chapter_id',
        'slug',
        'title',
        'description',
        'current_release_id',
    ];

    public function releases(): HasMany
    {
        return $this->hasMany(LessonPackageRelease::class, 'interactive_lesson_id');
    }

    public function currentRelease(): BelongsTo
    {
        return $this->belongsTo(LessonPackageRelease::class, 'current_release_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(LessonAttempt::class, 'interactive_lesson_id');
    }

    public function versionHistories(): MorphMany
    {
        return $this->morphMany(EntityVersionHistory::class, 'versionable');
    }

    public function shareTokens(): MorphMany
    {
        return $this->morphMany(QrShareToken::class, 'shareable');
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->orWhere('slug', $value)->firstOrFail();
    }
}
