<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class EntityVersionHistory extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'versionable_type',
        'versionable_id',
        'user_id',
        'action',
        'summary',
        'state_snapshot',
        'diff_payload',
        'version_number',
    ];

    protected function casts(): array
    {
        return [
            'state_snapshot' => 'array',
            'diff_payload' => 'array',
            'version_number' => 'integer',
        ];
    }

    public function versionable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
